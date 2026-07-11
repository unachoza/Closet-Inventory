import { describe, it, expect } from "vitest";
import {
	nextDemoPrompt,
	declineDemoPrompt,
	clearDemoState,
	INITIAL_DEMO_STATE,
	REPROMPT_AT_OWN_COUNT,
	type DemoLifecycleState,
} from "../demoLifecycle";

describe("demo lifecycle decision", () => {
	it("shows nothing while the closet is demo-only (no real item yet)", () => {
		expect(nextDemoPrompt(0, true, INITIAL_DEMO_STATE)).toBeNull();
	});

	it("celebrates on the first real item", () => {
		expect(nextDemoPrompt(1, true, INITIAL_DEMO_STATE)).toBe("celebrate");
	});

	it("does not celebrate twice", () => {
		const after = declineDemoPrompt(1, INITIAL_DEMO_STATE);
		expect(nextDemoPrompt(2, true, after)).toBeNull();
	});

	it("re-prompts once the user reaches the own-item threshold after declining", () => {
		const declined = declineDemoPrompt(1, INITIAL_DEMO_STATE);
		expect(nextDemoPrompt(REPROMPT_AT_OWN_COUNT, true, declined)).toBe("reprompt");
	});

	it("does not re-prompt again after declining at the threshold", () => {
		let state: DemoLifecycleState = declineDemoPrompt(1, INITIAL_DEMO_STATE);
		state = declineDemoPrompt(REPROMPT_AT_OWN_COUNT, state); // declined the reprompt
		expect(nextDemoPrompt(REPROMPT_AT_OWN_COUNT + 5, true, state)).toBeNull();
	});

	it("never prompts once the samples are cleared", () => {
		const cleared = clearDemoState(INITIAL_DEMO_STATE);
		expect(nextDemoPrompt(1, false, cleared)).toBeNull();
		expect(nextDemoPrompt(50, false, cleared)).toBeNull();
	});

	it("shows nothing when there are no demo items to clear", () => {
		expect(nextDemoPrompt(5, false, INITIAL_DEMO_STATE)).toBeNull();
	});
});
