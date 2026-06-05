import { describe, it, expect } from "vitest";
import {
	normalizeMaterial,
	blendToDisplayString,
	primaryMaterial,
	blendTotal,
	getMaterialColor,
	MATERIAL_COLORS,
} from "../materialUtils";
import type { MaterialBlend } from "../types";

describe("normalizeMaterial", () => {
	// ── Plain string → 100% blend ─────────────────────────────────────────────
	it("converts a plain material string to a 100% blend array", () => {
		expect(normalizeMaterial("cotton")).toEqual([{ material: "cotton", percentage: 100 }]);
	});

	it("lowercases the material name", () => {
		expect(normalizeMaterial("COTTON")).toEqual([{ material: "cotton", percentage: 100 }]);
	});

	it("trims whitespace from plain string", () => {
		expect(normalizeMaterial("  silk  ")).toEqual([{ material: "silk", percentage: 100 }]);
	});

	// ── Percentage blend strings ───────────────────────────────────────────────
	it("parses '95% Cotton, 5% Spandex'", () => {
		expect(normalizeMaterial("95% Cotton, 5% Spandex")).toEqual([
			{ material: "cotton", percentage: 95 },
			{ material: "spandex", percentage: 5 },
		]);
	});

	it("parses a four-component blend", () => {
		const result = normalizeMaterial("61% recycled polyester, 26% viscose, 7% cotton, 6% elastane");
		expect(result).toHaveLength(4);
		expect(result[0]).toEqual({ material: "recycled polyester", percentage: 61 });
		expect(result[1]).toEqual({ material: "viscose", percentage: 26 });
		expect(result[2]).toEqual({ material: "cotton", percentage: 7 });
		expect(result[3]).toEqual({ material: "elastane", percentage: 6 });
	});

	it("rounds float percentages", () => {
		const result = normalizeMaterial("98.5% Cotton, 1.5% Elastane");
		expect(result[0].percentage).toBe(99);
		expect(result[1].percentage).toBe(2);
	});

	it("handles semicolon separator", () => {
		const result = normalizeMaterial("80% cotton; 20% polyester");
		expect(result).toHaveLength(2);
		expect(result[0]).toEqual({ material: "cotton", percentage: 80 });
		expect(result[1]).toEqual({ material: "polyester", percentage: 20 });
	});

	// ── Already MaterialBlend[] passthrough ───────────────────────────────────
	it("returns an already-valid MaterialBlend[] unchanged", () => {
		const input: MaterialBlend[] = [
			{ material: "cotton", percentage: 80 },
			{ material: "polyester", percentage: 20 },
		];
		expect(normalizeMaterial(input)).toEqual(input);
	});

	it("filters out invalid entries from an array", () => {
		const input = [
			{ material: "cotton", percentage: 80 },
			{ material: 123, percentage: 20 }, // invalid — material is not string
			"not an object",
		];
		expect(normalizeMaterial(input)).toEqual([{ material: "cotton", percentage: 80 }]);
	});

	it("returns empty array for a fully invalid array", () => {
		expect(normalizeMaterial([1, 2, 3])).toEqual([]);
	});

	// ── Edge / null cases ─────────────────────────────────────────────────────
	it("returns empty array for empty string", () => {
		expect(normalizeMaterial("")).toEqual([]);
	});

	it("returns empty array for null", () => {
		expect(normalizeMaterial(null)).toEqual([]);
	});

	it("returns empty array for undefined", () => {
		expect(normalizeMaterial(undefined)).toEqual([]);
	});

	it("returns empty array for a number", () => {
		expect(normalizeMaterial(42)).toEqual([]);
	});

	it("returns empty array for a plain object", () => {
		expect(normalizeMaterial({ material: "cotton" })).toEqual([]);
	});
});

describe("blendToDisplayString", () => {
	it("formats a single material blend", () => {
		expect(blendToDisplayString([{ material: "cotton", percentage: 100 }])).toBe("100% Cotton");
	});

	it("formats a two-material blend", () => {
		expect(
			blendToDisplayString([
				{ material: "cotton", percentage: 80 },
				{ material: "polyester", percentage: 20 },
			]),
		).toBe("80% Cotton, 20% Polyester");
	});

	it("capitalizes each material name", () => {
		expect(blendToDisplayString([{ material: "cashmere", percentage: 100 }])).toBe("100% Cashmere");
	});

	it('returns "—" for an empty blend', () => {
		expect(blendToDisplayString([])).toBe("—");
	});
});

describe("primaryMaterial", () => {
	it("returns the material with the highest percentage", () => {
		expect(
			primaryMaterial([
				{ material: "polyester", percentage: 20 },
				{ material: "cotton", percentage: 80 },
			]),
		).toBe("Cotton");
	});

	it("returns empty string for an empty blend", () => {
		expect(primaryMaterial([])).toBe("");
	});

	it("returns the only material when blend has one entry", () => {
		expect(primaryMaterial([{ material: "silk", percentage: 100 }])).toBe("Silk");
	});
});

describe("blendTotal", () => {
	it("sums all percentages", () => {
		expect(
			blendTotal([
				{ material: "cotton", percentage: 80 },
				{ material: "spandex", percentage: 20 },
			]),
		).toBe(100);
	});

	it("returns 0 for an empty blend", () => {
		expect(blendTotal([])).toBe(0);
	});

	it("handles a blend that doesn't add to 100", () => {
		expect(
			blendTotal([
				{ material: "cotton", percentage: 60 },
				{ material: "polyester", percentage: 30 },
			]),
		).toBe(90);
	});
});

describe("getMaterialColor", () => {
	it("returns a known color for cotton", () => {
		expect(getMaterialColor("cotton")).toBe(MATERIAL_COLORS["cotton"]);
	});

	it("is case-insensitive", () => {
		expect(getMaterialColor("COTTON")).toBe(MATERIAL_COLORS["cotton"]);
	});

	it("returns a deterministic HSL string for an unknown material", () => {
		const result = getMaterialColor("bamboosilk");
		expect(result).toMatch(/^hsl\(\d+, 60%, 70%\)$/);
	});

	it("returns the same color every time for the same unknown material", () => {
		expect(getMaterialColor("tencel™")).toBe(getMaterialColor("tencel™"));
	});
});
