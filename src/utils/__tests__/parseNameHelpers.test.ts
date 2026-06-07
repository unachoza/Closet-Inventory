import { describe, it, expect } from "vitest";
import { parseInlineColorSize, parseSHEINSizeField, stripBrandFromName } from "../parseNameHelpers";

describe("parseInlineColorSize — Poshmark / ThredUp inline color+size suffixes", () => {
	it.each([
		["Aritzia Contour Squareneck Longsleeve Mini Dress in burgundy size M", { color: "burgundy", size: "M" }],
		["Silk Slip Dress in ivory size S", { color: "ivory", size: "S" }],
		["Linen Shorts in navy size 28", { color: "navy", size: "28" }],
		["Black Wrap Dress size XS", { color: "", size: "XS" }],
		["Floral Midi Dress in dusty pink", { color: "dusty pink", size: "" }],
	] as [string, { color: string; size: string }][])('"%s"', (input, expected) => {
		const result = parseInlineColorSize(input);
		expect(result.color).toBe(expected.color);
		expect(result.size).toBe(expected.size);
	});

	it("returns empty strings when neither pattern found", () => {
		const result = parseInlineColorSize("Cashmere Ribbed Sweater");
		expect(result.color).toBe("");
		expect(result.size).toBe("");
	});
});

describe("parseSHEINSizeField — COLOR-SIZE combined SIZE field", () => {
	it.each([
		["Dark Grey-Petite S", { color: "dark grey", size: "S" }],
		["Navy Blue-S", { color: "navy blue", size: "S" }],
		["Black-M", { color: "black", size: "M" }],
		["Beige-XL", { color: "beige", size: "XL" }],
		["Dark Green-Plus 2XL", { color: "dark green", size: "2XL" }],
		["Red-Tall L", { color: "red", size: "L" }],
	] as [string, { color: string; size: string }][])('"%s"', (input, expected) => {
		const result = parseSHEINSizeField(input);
		expect(result.color).toBe(expected.color);
		expect(result.size).toBe(expected.size);
	});

	it("returns the raw value as size when no dash separator found", () => {
		const result = parseSHEINSizeField("M");
		expect(result.color).toBe("");
		expect(result.size).toBe("M");
	});
});

describe("stripBrandFromName", () => {
	it.each([
		["Aritzia Contour Squareneck Longsleeve Mini Dress", "aritzia", "Contour Squareneck Longsleeve Mini Dress"],
		["SHEIN PETITE Women Casual Trousers", "shein", "PETITE Women Casual Trousers"],
		["Zara Floral Midi Dress", "zara", "Floral Midi Dress"],
		// Brand not at start → no change
		["Casual Tee by Nike", "nike", "Casual Tee by Nike"],
		// No brand → no change
		["Ribbed Bodysuit", "", "Ribbed Bodysuit"],
	] as [string, string, string][])('strips "%s" → "%s"', (name, brand, expected) => {
		expect(stripBrandFromName(name, brand)).toBe(expected);
	});

	it("is case-insensitive when matching the brand prefix", () => {
		expect(stripBrandFromName("ARITZIA Contour Dress", "aritzia")).toBe("Contour Dress");
	});
});
