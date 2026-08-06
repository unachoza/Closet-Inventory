import { describe, it, expect } from "vitest";
import { hasShown, markShown, INITIAL_RETENTION_STATE, RETENTION_HORIZONS, type RetentionLifecycleState } from "../retentionLifecycle";

describe("retention lifecycle decision", () => {
	it("reports every horizon unshown initially", () => {
		for (const horizon of RETENTION_HORIZONS) {
			expect(hasShown(INITIAL_RETENTION_STATE, horizon)).toBe(false);
		}
	});

	it("marks a single horizon shown without affecting the others", () => {
		const next = markShown(INITIAL_RETENTION_STATE, "day0", "2026-08-06T00:00:00.000Z");

		expect(hasShown(next, "day0")).toBe(true);
		expect(next.day0).toBe("2026-08-06T00:00:00.000Z");
		expect(hasShown(next, "day2_3")).toBe(false);
		expect(hasShown(next, "day14")).toBe(false);
		expect(hasShown(next, "day30")).toBe(false);
	});

	it("is pure — never mutates the input state", () => {
		const before: RetentionLifecycleState = { ...INITIAL_RETENTION_STATE };
		markShown(INITIAL_RETENTION_STATE, "day0", "2026-08-06T00:00:00.000Z");
		expect(INITIAL_RETENTION_STATE).toEqual(before);
	});

	it("marking twice keeps the latest timestamp, still shown", () => {
		const first = markShown(INITIAL_RETENTION_STATE, "day30", "2026-08-06T00:00:00.000Z");
		const second = markShown(first, "day30", "2026-08-07T00:00:00.000Z");

		expect(hasShown(second, "day30")).toBe(true);
		expect(second.day30).toBe("2026-08-07T00:00:00.000Z");
	});

	it("defaults shownAt to now when not provided", () => {
		const before = Date.now();
		const next = markShown(INITIAL_RETENTION_STATE, "day14");
		const after = Date.now();

		expect(next.day14).not.toBeNull();
		const shownAtMs = new Date(next.day14 as string).getTime();
		expect(shownAtMs).toBeGreaterThanOrEqual(before);
		expect(shownAtMs).toBeLessThanOrEqual(after);
	});
});
