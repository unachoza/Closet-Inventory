import { describe, it, expect } from "vitest";
import { FIBER_ROWS, MAX_COMPARE, sortRows, togglePick } from "../fiberCompare";

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

describe("fiberCompare — togglePick", () => {
	it("adds a fiber immutably", () => {
		const start: string[] = [];
		const next = togglePick(start, "Cotton");
		expect(next).toEqual(["Cotton"]);
		expect(start).toEqual([]);
	});

	it("removes a fiber already selected", () => {
		expect(togglePick(["Cotton", "Linen"], "Cotton")).toEqual(["Linen"]);
	});

	it("caps selection at MAX_COMPARE (adding beyond is a no-op)", () => {
		const full = ["Cotton", "Linen", "Hemp"];
		expect(full.length).toBe(MAX_COMPARE);
		const next = togglePick(full, "Silk");
		expect(next).toEqual(full);
		expect(next).not.toBe(full); // returns a new array, still immutable
	});

	it("can always deselect even when at the cap", () => {
		expect(togglePick(["Cotton", "Linen", "Hemp"], "Linen")).toEqual(["Cotton", "Hemp"]);
	});
});
