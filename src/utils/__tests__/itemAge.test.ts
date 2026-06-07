import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { formatItemAge } from "../itemAge";

// Freeze "now" so age math is deterministic.
const NOW = new Date("2026-06-07T12:00:00.000Z");

// Build an ISO string for a date `n` days before NOW.
function daysAgo(n: number): string {
	return new Date(NOW.getTime() - n * 24 * 60 * 60 * 1000).toISOString();
}

describe("formatItemAge", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(NOW);
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	describe("invalid / edge inputs", () => {
		it("returns empty string for undefined", () => {
			expect(formatItemAge(undefined)).toBe("");
		});

		it("returns empty string for an empty string", () => {
			expect(formatItemAge("")).toBe("");
		});

		it("returns empty string for an unparseable date", () => {
			expect(formatItemAge("not-a-date")).toBe("");
		});

		it("returns empty string for a future date", () => {
			expect(formatItemAge(daysAgo(-10))).toBe("");
		});
	});

	describe("day tier", () => {
		it('returns "today" for a same-day purchase', () => {
			expect(formatItemAge(daysAgo(0))).toBe("today");
		});

		it('returns "1 day" (singular) for yesterday', () => {
			expect(formatItemAge(daysAgo(1))).toBe("1 day");
		});

		it('returns "20 days" for 20 days ago (user example)', () => {
			expect(formatItemAge(daysAgo(20))).toBe("20 days");
		});
	});

	describe("month tier", () => {
		it('shows "5 months" for a ~5-month-old item', () => {
			// 2026-01-07 → 5 calendar months before NOW
			expect(formatItemAge("2026-01-07T12:00:00.000Z")).toBe("5 months");
		});

		it('uses singular "1 month" just past the day tier', () => {
			// ~40 days ago crosses into the month tier as a single month
			expect(formatItemAge("2026-04-25T12:00:00.000Z")).toBe("1 month");
		});
	});

	describe("year tier", () => {
		it('returns "1 year" (singular, whole)', () => {
			expect(formatItemAge("2025-06-07T12:00:00.000Z")).toBe("1 year");
		});

		it('returns "1.5 years" for 18 months (user example)', () => {
			expect(formatItemAge("2024-12-07T12:00:00.000Z")).toBe("1.5 years");
		});

		it('drops the trailing .0 → "3 years" (user example)', () => {
			expect(formatItemAge("2023-06-07T12:00:00.000Z")).toBe("3 years");
		});

		it("keeps one decimal for fractional years", () => {
			// ~2 years 6 months → 2.5 years
			expect(formatItemAge("2023-12-07T12:00:00.000Z")).toBe("2.5 years");
		});
	});
});
