import { describe, it, expect } from "vitest";
import normalizeColor, { normalizeColorGroups } from "../normalizeColors";

describe("normalizeColor — single value", () => {
	// One representative per group proves the mapping works
	it.each([
		["black", "Black"],
		["charcoal", "Black"],   // alias
		["white", "White"],
		["gray", "Grey"],        // US spelling alias
		["heather", "Grey"],     // fabric alias
		["taupe", "Brown"],      // alias
		["beige", "Brown"],      // alias
		["dusty pink", "Pink"],  // compound alias
		["burgundy", "Red"],     // alias
		["olive", "Green"],      // alias
		["midnight", "Blue"],    // alias
		["purple", "Purple"],
		["orange", "Orange"],
		["floral", "Pattern"],
	])('"%s" → "%s"', (input, expected) => {
		expect(normalizeColor(input)).toBe(expected);
	});

	it("is case insensitive", () => {
		expect(normalizeColor("BLACK")).toBe("Black");
		expect(normalizeColor("Burgundy")).toBe("Red");
	});

	it("returns unknown colors as-is (trimmed)", () => {
		expect(normalizeColor("  mauve  ")).toBe("mauve");
	});
});

describe("normalizeColorGroups — multi-color splitting", () => {
	it("returns a single-item array for a plain color", () => {
		expect(normalizeColorGroups("black")).toEqual(["Black"]);
	});

	it("splits on slash and deduplicates same-group aliases", () => {
		// brown and taupe both → Brown, so result is just one entry
		expect(normalizeColorGroups("brown / taupe")).toEqual(["Brown"]);
	});

	it("splits two distinct colors into two groups", () => {
		expect(normalizeColorGroups("blue / white")).toEqual(["Blue", "White"]);
	});

	it("splits on comma", () => {
		expect(normalizeColorGroups("red, black")).toEqual(["Red", "Black"]);
	});

	it("splits on 'and'", () => {
		expect(normalizeColorGroups("blue and white")).toEqual(["Blue", "White"]);
	});

	it("does not split multi-word single colors", () => {
		// "heather dark grey" has no separator — stays as one group
		expect(normalizeColorGroups("heather dark grey")).toEqual(["Grey"]);
	});

	it("is case insensitive", () => {
		expect(normalizeColorGroups("BLUE / WHITE")).toEqual(["Blue", "White"]);
	});
});
