/**
 * Retention loop lifecycle (pure decision logic).
 *
 * Day 0 — The Reveal fires once, ever, the first time the user's own (non-demo)
 * item count crosses REVEAL_THRESHOLD. It does not hook the Gmail import queue
 * drain directly: single-item import and manual adds never reach that drain
 * branch, so gating on the closet's own-item count catches every path that
 * grows the closet, not just "Import All".
 *
 * Shape mirrors demoLifecycle.ts (pure functions + a small persisted state
 * blob), the existing "shown once / re-prompt later / never again" precedent
 * in this codebase.
 */

/** Below this many of her own items, there isn't yet a "closet" to reveal. */
export const REVEAL_THRESHOLD = 5;

export interface RetentionLifecycleState {
	/** ISO timestamp of when the Reveal was shown, or undefined if never. */
	revealShownAt?: string;
}

export const INITIAL_RETENTION_STATE: RetentionLifecycleState = {};

/**
 * Whether the Reveal should show right now.
 *
 * @param ownCount count of the user's own (non-demo) items
 * @param isDemoOnly true when every item in the closet is a demo sample —
 *   suppresses the Reveal entirely so it never announces sample data as the
 *   user's own closet (the same leak class the launch audit flagged).
 */
export function shouldShowReveal(ownCount: number, isDemoOnly: boolean, state: RetentionLifecycleState): boolean {
	if (state.revealShownAt) return false;
	if (isDemoOnly) return false;
	return ownCount >= REVEAL_THRESHOLD;
}

/** State transition once the Reveal has been shown and acknowledged. */
export function markRevealShown(state: RetentionLifecycleState, shownAt: string = new Date().toISOString()): RetentionLifecycleState {
	return { ...state, revealShownAt: shownAt };
}
