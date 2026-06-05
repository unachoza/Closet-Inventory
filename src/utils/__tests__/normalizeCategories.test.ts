import { describe, it, expect } from "vitest";
import normalizeCategory from "../normalizeCategories";

describe("normalizeCategory", () => {
	// Singular → plural
	it.each([
		["dress", "dresses"],
		["top", "tops"],
		["bottom", "bottoms"],
		["coat", "coats"],
		["sweater", "sweaters"],
		["sock", "socks"],
		["shoe", "shoes"],
	])('"%s" → "%s"', (input, expected) => {
		expect(normalizeCategory(input)).toBe(expected);
	});

	// Already canonical — no change
	it("leaves an already-plural value unchanged", () => {
		expect(normalizeCategory("tops")).toBe("tops");
	});

	// Case insensitive
	it("is case insensitive", () => {
		expect(normalizeCategory("DRESS")).toBe("dresses");
		expect(normalizeCategory("Tops")).toBe("tops");
	});

	// Whitespace
	it("trims surrounding whitespace", () => {
		expect(normalizeCategory("  dress  ")).toBe("dresses");
	});

	// Unknown values
	it("returns unknown values lowercased", () => {
		expect(normalizeCategory("jumpsuit")).toBe("jumpsuit");
		expect(normalizeCategory("JUMPSUIT")).toBe("jumpsuit");
	});

	// Empty / blank
	it("returns empty string for empty input", () => {
		expect(normalizeCategory("")).toBe("");
	});
});
