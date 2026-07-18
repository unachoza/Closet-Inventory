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
	// Inventory
	| "item_added"
	| "item_edited"
	| "item_deleted"
	// Discovery
	| "search_used"
	| "filter_used"
	| "care_guide_opened"
	// Navigation
	| "screen_viewed"
	// Feedback
	| "feedback_submitted";

/** Typed event capture. Delegates to the consent-gated PostHog plumbing. */
export function track(event: AnalyticsEvent, properties?: Record<string, unknown>): void {
	void trackEvent(event, properties);
}
