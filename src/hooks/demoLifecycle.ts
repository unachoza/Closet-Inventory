/**
 * Demo-data lifecycle (pure decision logic).
 *
 * A new closet is seeded with `isDemo` sample items so it isn't empty. The
 * first time the user adds/imports a real item we celebrate, then offer to
 * clear the samples. If they decline, we ask once more when their own closet
 * has grown to `REPROMPT_AT_OWN_COUNT` real items — then never nag again.
 */

export const REPROMPT_AT_OWN_COUNT = 20;

export type DemoStatus = "pending" | "declined" | "cleared";

export interface DemoLifecycleState {
	status: DemoStatus;
	/** True once the first-real-item celebration has been shown. */
	celebrated: boolean;
	/** Own-item count at the moment the user last declined to clear. */
	declinedAtOwnCount?: number;
}

export const INITIAL_DEMO_STATE: DemoLifecycleState = {
	status: "pending",
	celebrated: false,
};

/** What (if anything) to surface, given the current closet + saved state. */
export type DemoPrompt = "celebrate" | "reprompt" | null;

export function nextDemoPrompt(ownCount: number, hasDemoItems: boolean, state: DemoLifecycleState): DemoPrompt {
	// Nothing to offer once the samples are gone or were never present.
	if (!hasDemoItems || state.status === "cleared") return null;
	// Wait for the first real item.
	if (ownCount < 1) return null;
	// First real item → celebrate + first ask.
	if (!state.celebrated) return "celebrate";
	// Declined earlier → ask once more when they've built up a real closet.
	if (state.status === "declined") {
		const declinedAt = state.declinedAtOwnCount ?? 0;
		if (ownCount >= REPROMPT_AT_OWN_COUNT && declinedAt < REPROMPT_AT_OWN_COUNT) {
			return "reprompt";
		}
	}
	return null;
}

/** State transition when the user dismisses/declines a prompt (keeps samples). */
export function declineDemoPrompt(ownCount: number, state: DemoLifecycleState): DemoLifecycleState {
	return { ...state, status: "declined", celebrated: true, declinedAtOwnCount: ownCount };
}

/** State transition when the user clears the sample items. */
export function clearDemoState(state: DemoLifecycleState): DemoLifecycleState {
	return { ...state, status: "cleared", celebrated: true };
}
