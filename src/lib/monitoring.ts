import { getConsent } from "./consent";
import { detectStandalone } from "../hooks/useInstallPrompt";
import { showStatusLocation, showWhatsChanged } from "../config/features";

/**
 * Error tracking (Sentry) + product analytics (PostHog) init, gated behind
 * consent (`consent.ts`) and presence of the relevant env var. Neither SDK is
 * even fetched until the user opts in — `import()` is deferred, not top-level,
 * so a declined/undecided visitor never loads either bundle.
 *
 * This module is the low-level plumbing (init / identify / capture / track).
 * The typed event taxonomy lives in `analytics.ts` — call `track()` there, not
 * `trackEvent()` here directly, so event names stay a closed, greppable set.
 */

let errorTrackingInitialized = false;
let analyticsInitialized = false;

/**
 * Buffered pre-consent telemetry.
 *
 * The onboarding funnel runs entirely before the consent banner can appear —
 * `ConsentBanner` mounts past the `OnboardingFlow` early-return in `App.tsx`, a
 * deliberate fix for the banner overlapping the tour's CTA. The side effect was
 * that `onboarding_step_viewed`, `onboarding_completed`, `install_prompt_result`
 * and `signin_skipped` could never fire: by the time consent existed, the events
 * were long gone. The entire first-run funnel was dark.
 *
 * So events are held **in memory only** while consent is undecided, then either
 * replayed on grant or dropped on decline. Nothing leaves the device before the
 * user opts in — no network call, no localStorage, no persistence across a
 * reload — so the privacy posture is unchanged and the funnel survives.
 */
type PendingEvent = {
	readonly event: string;
	readonly properties?: Record<string, unknown>;
	/** When it actually happened, so replay doesn't stamp everything at flush time. */
	readonly timestamp: Date;
};

/** Ceiling on the in-memory buffer — an undecided session must not grow forever. */
export const MAX_PENDING_EVENTS = 100;

let pendingEvents: readonly PendingEvent[] = [];
let pendingIdentity: { readonly userId: string; readonly traits?: Record<string, unknown> } | null = null;

/** Build-time version, tagged into both SDKs so reports name the exact build. */
const APP_VERSION = typeof __APP_VERSION__ !== "undefined" ? __APP_VERSION__ : "dev";

/**
 * True once the user has opted in. Gates **product analytics only** — see
 * `initErrorTracking` for why crash reporting is treated differently.
 */
function consented(): boolean {
	return getConsent() === "granted";
}

/**
 * Crash reporting, started regardless of analytics consent.
 *
 * Consent defaults to "undecided", so gating Sentry behind it meant the app
 * reported nothing until someone actively opted in — and nobody did. A real
 * tester was blocked at sign-in for over a month and it produced zero
 * telemetry; that gap is the reason this is split out.
 *
 * Scope is deliberately narrow: `sendDefaultPii: false` (already the case),
 * no session replay, no identify() call. This captures stack traces and build
 * versions, not who the person is or what they did. Behavioural analytics —
 * which *is* about the person — stays opt-in below.
 */
export async function initErrorTracking(): Promise<void> {
	if (errorTrackingInitialized) return;
	const dsn = import.meta.env.VITE_SENTRY_DSN;
	if (!dsn) return;
	errorTrackingInitialized = true;

	const Sentry = await import("@sentry/react");
	Sentry.init({ dsn, sendDefaultPii: false, release: APP_VERSION });
}

/** Product analytics (PostHog). Requires explicit consent. */
export async function initMonitoring(): Promise<void> {
	if (analyticsInitialized || !consented()) return;
	analyticsInitialized = true;

	const posthogKey = import.meta.env.VITE_POSTHOG_KEY;
	if (posthogKey) {
		const { default: posthog } = await import("posthog-js");
		posthog.init(posthogKey, {
			api_host: import.meta.env.VITE_POSTHOG_HOST || "https://us.i.posthog.com",
			person_profiles: "identified_only",
			// Session replay — watch "the import froze" reports instead of guessing.
			// Only records for consented, identified users.
			disable_session_recording: false,
			// `maskAllInputs` is already posthog-js's default, but /privacy.html
			// publishes it as a promise to users ("text you type is masked and is
			// not captured"). Set it explicitly so a library default change can't
			// silently falsify a live privacy policy.
			session_recording: { maskAllInputs: true },
		});
		// `register` (not `register_once`) so these stay current across a session
		// rather than freezing whatever was true at first init — e.g. installing
		// mid-session should make later events read is_standalone: true, even
		// though earlier ones in that same session were captured before install.
		// None of these are person properties: a sticky per-person flag value
		// would misrepresent every session after the flag or install state changes.
		posthog.register({
			app_version: APP_VERSION,
			is_standalone: detectStandalone(window, navigator),
			flag_status_location: showStatusLocation(),
			flag_whats_changed: showWhatsChanged(),
		});
		await flushPendingEvents();
	}
}

/**
 * Replay everything captured before the user opted in. Called only from
 * `initMonitoring`, i.e. only after consent was granted and PostHog started.
 */
async function flushPendingEvents(): Promise<void> {
	const events = pendingEvents;
	const identity = pendingIdentity;
	// Cleared before the await so a concurrent flush can't double-send.
	pendingEvents = [];
	pendingIdentity = null;
	if (events.length === 0 && !identity) return;

	const { default: posthog } = await import("posthog-js");
	// Identity first — otherwise the replayed funnel attaches to an anonymous
	// person and can't be followed through to the same user's later activity.
	if (identity) posthog.identify(identity.userId, identity.traits);
	events.forEach(({ event, properties, timestamp }) => {
		posthog.capture(event, properties, { timestamp });
	});
}

/**
 * Drop everything held pre-consent. Called when the user declines, so a "no"
 * means the buffered events are destroyed rather than merely unsent.
 */
export function discardPendingEvents(): void {
	pendingEvents = [];
	pendingIdentity = null;
}

/**
 * Tie subsequent events to a specific person (call on sign-in). No-ops without
 * consent or a configured key. `traits` are optional person properties.
 */
export async function identify(userId: string, traits?: Record<string, unknown>): Promise<void> {
	if (!import.meta.env.VITE_POSTHOG_KEY) return;
	const consent = getConsent();
	if (consent === "declined") return;
	// Sign-in happens during onboarding, before consent is answerable. Hold the
	// identity so a later grant can attribute the replayed funnel to this user.
	if (consent === "undecided") {
		pendingIdentity = { userId, traits };
		return;
	}
	const { default: posthog } = await import("posthog-js");
	posthog.identify(userId, traits);
}

/** Clear the identified person (call on sign-out) so events don't cross users. */
export async function resetIdentity(): Promise<void> {
	if (!consented() || !import.meta.env.VITE_POSTHOG_KEY) return;
	const { default: posthog } = await import("posthog-js");
	posthog.reset();
}

/**
 * Low-level event capture. Prefer the typed `track()` in `analytics.ts`.
 * No-ops without consent or a configured key.
 */
export async function trackEvent(event: string, properties?: Record<string, unknown>): Promise<void> {
	// No key means the event could never be sent, so there's nothing worth holding.
	if (!import.meta.env.VITE_POSTHOG_KEY) return;
	const consent = getConsent();
	if (consent === "declined") return;
	if (consent === "undecided") {
		// Oldest-wins: the first-run funnel is the reason this buffer exists, so a
		// long undecided session drops its late noise rather than its beginning.
		if (pendingEvents.length >= MAX_PENDING_EVENTS) return;
		pendingEvents = [...pendingEvents, { event, properties, timestamp: new Date() }];
		return;
	}
	const { default: posthog } = await import("posthog-js");
	posthog.capture(event, properties);
}

/**
 * Report a caught error to Sentry. Not consent-gated — see `initErrorTracking`.
 * No-ops without a configured DSN.
 */
export async function captureException(error: unknown): Promise<void> {
	if (!import.meta.env.VITE_SENTRY_DSN) return;
	// A caller may report an error before anything triggered init (e.g. a failure
	// during startup); initializing here means the first crash isn't the one that
	// gets dropped.
	await initErrorTracking();
	const Sentry = await import("@sentry/react");
	Sentry.captureException(error);
}

/** The resolved build version, for display (Settings/About) and bug reports. */
export function appVersion(): string {
	return APP_VERSION;
}

