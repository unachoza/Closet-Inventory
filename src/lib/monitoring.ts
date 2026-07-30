import { getConsent } from "./consent";

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
			// Text inputs are masked by default; keep it that way for a closet's
			// personal data. Only records for consented, identified users.
			disable_session_recording: false,
		});
		posthog.register({ app_version: APP_VERSION });
	}
}

/**
 * Tie subsequent events to a specific person (call on sign-in). No-ops without
 * consent or a configured key. `traits` are optional person properties.
 */
export async function identify(userId: string, traits?: Record<string, unknown>): Promise<void> {
	if (!consented() || !import.meta.env.VITE_POSTHOG_KEY) return;
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
	if (!consented() || !import.meta.env.VITE_POSTHOG_KEY) return;
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
