import { trackEvent } from "./monitoring";

/**
 * The closed set of product-analytics events. Keeping the taxonomy in one typed
 * union (not free-form strings scattered across components) means the events you
 * see in PostHog match the events the code can emit — greppable, refactor-safe,
 * and no accidental "search_used" vs "searchUsed" drift.
 *
 * These answer the launch question: testers *say* they love Search — do they
 * actually use it? Every event no-ops until the user grants analytics consent.
 */

export type AnalyticsEvent =
	// Auth
	| "account_created"
	| "signed_in"
	// Email (Gmail) import funnel — the headline feature
	| "import_started"
	| "import_results_shown"
	| "import_finished"
	| "import_failed"
	// Every Gmail search that actually hits the API, described by
	// `searchQueryShape.ts`. `repeat_index` counts how many times the *same*
	// query has been run unchanged this session: a rising number is the signal
	// that the advanced-search syntax is too opaque to iterate on.
	| "gmail_search_run"
	// Import blocked because there's no account (ImportAccountGate). Makes the
	// signed-out bounce visible instead of a silent funnel dead end.
	| "import_gate_shown"
	| "import_gate_signin_clicked"
	// Local-only capacity: nudges shown as the closet grows, and the hard stop.
	| "local_capacity_nudge_shown"
	| "local_capacity_blocked"
	// Inventory
	| "item_added"
	| "item_edited"
	| "item_deleted"
	// Discovery
	| "search_used"
	| "filter_used"
	| "care_guide_opened"
	// Retention
	| "closet_fabrics_viewed"
	// Navigation
	| "screen_viewed"
	// Onboarding funnel
	| "onboarding_step_viewed"
	| "onboarding_completed"
	| "onboarding_skipped"
	| "signin_skipped"
	| "install_prompt_result"
	// Profile
	| "profile_name_confirmed"
	// Feedback
	| "feedback_submitted"
	// Release comms — is the "what's changed" card worth keeping, and is anyone
	// actually using the update-available prompt? shown minus dismissed/clicked
	// is the read on both.
	| "whats_changed_shown"
	| "whats_changed_dismissed"
	| "app_update_prompt_shown"
	| "app_update_refresh_clicked"
	// A real "this became an installed PWA" signal — install_prompt_result only
	// records that a prompt was shown/dismissed, not that install completed.
	// Chrome/Android only; appinstalled never fires on iOS Safari.
	| "pwa_installed";

/** Typed event capture. Delegates to the consent-gated PostHog plumbing. */
export function track(event: AnalyticsEvent, properties?: Record<string, unknown>): void {
	void trackEvent(event, properties);
}
