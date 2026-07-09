/**
 * Analytics/error-tracking consent state. Kept separate from `monitoring.ts` so
 * the banner and the SDK init can each depend on just the state, not each other.
 *
 * Default is "undecided" — Sentry/PostHog never fire until the user explicitly
 * accepts. There's no privacy-policy link in the banner yet (LEGAL-1 hasn't
 * shipped); this is deliberately just the plumbing, not the full consent UX.
 */

export type ConsentState = "granted" | "declined" | "undecided";

const CONSENT_KEY = "closetly-analytics-consent";

export function getConsent(): ConsentState {
	const stored = localStorage.getItem(CONSENT_KEY);
	return stored === "granted" || stored === "declined" ? stored : "undecided";
}

export function setConsent(state: "granted" | "declined"): void {
	localStorage.setItem(CONSENT_KEY, state);
}
