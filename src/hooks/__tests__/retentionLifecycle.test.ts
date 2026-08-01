import { describe, it, expect } from "vitest";
import { shouldShowReveal, markRevealShown, INITIAL_RETENTION_STATE, REVEAL_THRESHOLD, type RetentionLifecycleState } from "../retentionLifecycle";

describe("retention lifecycle decision", () => {
	it("does not show below the reveal threshold", () => {
		expect(shouldShowReveal(REVEAL_THRESHOLD - 1, false, INITIAL_RETENTION_STATE)).toBe(false);
	});

	it("shows once the own-item count crosses the threshold", () => {
		expect(shouldShowReveal(REVEAL_THRESHOLD, false, INITIAL_RETENTION_STATE)).toBe(true);
	});

	it("never shows for a demo-only closet, regardless of count", () => {
		expect(shouldShowReveal(REVEAL_THRESHOLD, true, INITIAL_RETENTION_STATE)).toBe(false);
	});

	it("does not show again once already shown", () => {
		const shown = markRevealShown(INITIAL_RETENTION_STATE, "2026-08-01T00:00:00.000Z");
		expect(shouldShowReveal(REVEAL_THRESHOLD + 50, false, shown)).toBe(false);
	});

	it("records the shown timestamp immutably", () => {
		const before: RetentionLifecycleState = INITIAL_RETENTION_STATE;
		const after = markRevealShown(before, "2026-08-01T00:00:00.000Z");
		expect(before.revealShownAt).toBeUndefined();
		expect(after.revealShownAt).toBe("2026-08-01T00:00:00.000Z");
	});
});
