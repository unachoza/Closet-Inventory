/**
 * The onboarding flow's step vocabulary. Four value-tour screens, then the
 * account steps: sign-in (skippable to local mode), name confirm, install card.
 */
export const TOUR_STEPS = ["welcome", "email", "care", "search"] as const;

export const FLOW_STEPS = [...TOUR_STEPS, "signin", "name", "install"] as const;

export type TourStep = (typeof TOUR_STEPS)[number];
export type FlowStep = (typeof FLOW_STEPS)[number];

/**
 * Persisted mid-flow position. "awaiting-auth" is written synchronously before
 * the full-page Google OAuth redirect so the flow can resume on return;
 * "install" survives a reload during the final steps. Cleared on completion.
 * (Completion itself is the separate, long-standing closetly-onboarding-complete
 * flag owned by App.tsx.)
 */
export const ONBOARDING_STAGE_KEY = "closetly-onboarding-stage";

export type OnboardingStage = "awaiting-auth" | "install";

export function isOnboardingStage(value: string | null): value is OnboardingStage {
	return value === "awaiting-auth" || value === "install";
}
