import { getConsent } from "./consent";

/**
 * Error tracking (Sentry) + product analytics (PostHog) init, gated behind
 * consent (`consent.ts`) and presence of the relevant env var. Neither SDK is
 * even fetched until the user opts in — `import()` is deferred, not top-level,
 * so a declined/undecided visitor never loads either bundle.
 *
 * Minimal by design: no custom event taxonomy yet, no session-replay config —
 * just "is it on" plumbing. Expand once there's an actual event schema to track.
 */

let initialized = false;

export async function initMonitoring(): Promise<void> {
	if (initialized || getConsent() !== "granted") return;
	initialized = true;

	const dsn = import.meta.env.VITE_SENTRY_DSN;
	if (dsn) {
		const Sentry = await import("@sentry/react");
		Sentry.init({ dsn, sendDefaultPii: false });
	}

	const posthogKey = import.meta.env.VITE_POSTHOG_KEY;
	if (posthogKey) {
		const { default: posthog } = await import("posthog-js");
		posthog.init(posthogKey, {
			api_host: import.meta.env.VITE_POSTHOG_HOST || "https://us.i.posthog.com",
			person_profiles: "identified_only",
		});
	}
}

/** Report a caught error to Sentry. No-ops without consent or a configured DSN. */
export async function captureException(error: unknown): Promise<void> {
	if (getConsent() !== "granted" || !import.meta.env.VITE_SENTRY_DSN) return;
	const Sentry = await import("@sentry/react");
	Sentry.captureException(error);
}
