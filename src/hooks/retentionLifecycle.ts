/**
 * Retention horizon lifecycle (pure decision logic).
 *
 * Generalizes demoLifecycle.ts's show-once pattern: each named horizon
 * (Day 0 Reveal, Day 2-3 Care Note, Day 14 Quiet Addition, Day 30 Seasonal)
 * shows in-app, once, ever, and remembers that it did. Day 7 ("Your
 * Fabrics") isn't a horizon here — it's a persistent tab default
 * (InteractiveGuide.tsx), not a one-time interruption, so it never needed
 * this scheduler.
 *
 * This module only tracks "has this horizon fired." It does NOT decide
 * *when* a horizon's own trigger condition is met (e.g. the Reveal's
 * idle timer, or a future Day-14 "N days since import" check) — that
 * condition lives with the surface itself. A component calls
 * `hasShown(state, horizon)` only once its own trigger has already fired,
 * then `markShown` so it never fires again.
 */

export type RetentionHorizon = "day0" | "day2_3" | "day14" | "day30";

export const RETENTION_HORIZONS: RetentionHorizon[] = ["day0", "day2_3", "day14", "day30"];

/** `null` = never shown; an ISO datetime = shown once, at that time. */
export type RetentionLifecycleState = Record<RetentionHorizon, string | null>;

export const INITIAL_RETENTION_STATE: RetentionLifecycleState = {
	day0: null,
	day2_3: null,
	day14: null,
	day30: null,
};

/** Has this horizon ever fired? */
export function hasShown(state: RetentionLifecycleState, horizon: RetentionHorizon): boolean {
	return state[horizon] !== null;
}

/** Records a horizon as shown right now. Pure — returns a new state object. */
export function markShown(state: RetentionLifecycleState, horizon: RetentionHorizon, shownAt: string = new Date().toISOString()): RetentionLifecycleState {
	return { ...state, [horizon]: shownAt };
}
