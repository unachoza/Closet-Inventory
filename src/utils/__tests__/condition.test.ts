import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { matchedCondition, defaultConditionForPurchaseDate } from "../condition";

const NOW = new Date("2026-06-07T12:00:00.000Z");

function yearsAgo(years: number): string {
	return new Date(NOW.getTime() - years * 365.25 * 24 * 60 * 60 * 1000).toISOString();
}

describe("matchedCondition", () => {
	it("returns the condition when it is a known option", () => {
		expect(matchedCondition("good", undefined)).toBe("good");
	});

	it("falls back to a legacy age value only when it is a valid condition", () => {
		expect(matchedCondition(undefined, "like new")).toBe("like new");
	});

	it("returns undefined for a legacy free-text age that isn't a condition", () => {
		expect(matchedCondition(undefined, "one year")).toBeUndefined();
	});

	it("returns undefined when nothing valid is provided", () => {
		expect(matchedCondition(undefined, undefined)).toBeUndefined();
	});
});

describe("defaultConditionForPurchaseDate", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(NOW);
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('defaults to "new" when no date is given', () => {
		expect(defaultConditionForPurchaseDate(undefined)).toBe("new");
	});

	it('defaults to "new" for an unparseable date', () => {
		expect(defaultConditionForPurchaseDate("not-a-date")).toBe("new");
	});

	it('defaults to "new" for a future date', () => {
		expect(defaultConditionForPurchaseDate(yearsAgo(-1))).toBe("new");
	});

	it('returns "new" for a purchase under a year old', () => {
		expect(defaultConditionForPurchaseDate(yearsAgo(0.5))).toBe("new");
	});

	it('returns "like new" for a purchase 1–3 years old', () => {
		expect(defaultConditionForPurchaseDate(yearsAgo(2))).toBe("like new");
	});

	it('returns "like new" right at the 1-year boundary', () => {
		expect(defaultConditionForPurchaseDate(yearsAgo(1))).toBe("like new");
	});

	it('returns "good" for a purchase over 3 years old', () => {
		expect(defaultConditionForPurchaseDate(yearsAgo(4))).toBe("good");
	});

	it('returns "good" for a very old purchase (2018-era email)', () => {
		expect(defaultConditionForPurchaseDate("2018-06-21T12:00:00.000Z")).toBe("good");
	});
});
