import { describe, it, expect } from "vitest";
import { FIBER_ROWS, sortRows } from "../fiberCompare";

describe("fiberCompare — sortRows", () => {
	it("does not mutate the input array", () => {
		const before = [...FIBER_ROWS];
		sortRows(FIBER_ROWS, "fiber", "asc");
		expect(FIBER_ROWS).toEqual(before);
	});

	it("sorts a string column alphabetically ascending / descending", () => {
		const asc = sortRows(FIBER_ROWS, "fiber", "asc").map((r) => r.fiber);
		const desc = sortRows(FIBER_ROWS, "fiber", "desc").map((r) => r.fiber);
		expect(asc[0]).toBe("Acrylic");
		expect(desc[0]).toBe(asc[asc.length - 1]);
	});

	it("sorts qualitative scales by meaning, not alphabetically", () => {
		// Breathability ascending: 'Very Low' must rank below 'Very High'
		const asc = sortRows(FIBER_ROWS, "breathability", "asc").map((r) => r.breathability);
		expect(asc[0]).toBe("Very Low"); // Spandex
		expect(asc[asc.length - 1]).toBe("Very High"); // Linen
	});

	it("sorts cost by number of $ symbols", () => {
		const asc = sortRows(FIBER_ROWS, "cost", "asc");
		// Cheapest single-$ fibers first, $$$$ last
		expect(asc[0].cost.match(/\$/g)!.length).toBe(1);
		expect(asc[asc.length - 1].cost).toBe("$$$$");
	});
});
