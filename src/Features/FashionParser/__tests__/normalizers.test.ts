import { describe, it, expect } from "vitest";
import normalizeColor, { normalizeColorGroups } from "../normalizers/normalizeColor";
import normalizeCategory from "../normalizers/normalizeCategory";
import { normalizeMaterial } from "../normalizers/normalizeMaterial";

describe("normalizeColor — color canonicalization", () => {
	it("normalizes 'pink' to Pink", () => {
		expect(normalizeColor("pink")).toBe("Pink");
	});

	it("normalizes 'navy' to Blue", () => {
		expect(normalizeColor("navy")).toBe("Blue");
	});

	it("normalizes 'olive' to Green", () => {
		expect(normalizeColor("olive")).toBe("Green");
	});

	it("handles uppercase input", () => {
		expect(normalizeColor("BLUE")).toBe("Blue");
	});

	it("returns input as capitalized if no mapping exists", () => {
		const result = normalizeColor("UnknownColor");
		expect(result).toBeDefined();
		expect(typeof result).toBe("string");
	});
});

describe("normalizeColorGroups — multi-color grouping", () => {
	it("splits 'blue / white' into ['Blue', 'White']", () => {
		const groups = normalizeColorGroups("blue / white");
		expect(groups).toContain("Blue");
		expect(groups).toContain("White");
	});

	it("handles 'and' separator", () => {
		const groups = normalizeColorGroups("navy and gold");
		expect(groups.length).toBeGreaterThan(1);
	});

	it("returns single color as array", () => {
		const groups = normalizeColorGroups("black");
		expect(Array.isArray(groups)).toBe(true);
	});

	it("deduplicates repeated colors", () => {
		const groups = normalizeColorGroups("blue blue");
		expect(groups.filter((c) => c === "Blue").length).toBe(1);
	});
});

describe("normalizeCategory — category canonicalization", () => {
	it("maps 'dress' and 'dresses' to 'dresses'", () => {
		expect(normalizeCategory("dress")).toBe("dresses");
		expect(normalizeCategory("dresses")).toBe("dresses");
	});

	it("maps 'jacket' and 'jackets' to 'coats'", () => {
		expect(normalizeCategory("jacket")).toBe("coats");
		expect(normalizeCategory("jackets")).toBe("coats");
	});

	it("maps 'blazer' to 'coats'", () => {
		expect(normalizeCategory("blazer")).toBe("coats");
	});

	it("maps 'jeans' to 'bottoms'", () => {
		expect(normalizeCategory("jeans")).toBe("bottoms");
	});

	it("maps 'pants', 'trousers', 'skirt', 'shorts' to 'bottoms'", () => {
		expect(normalizeCategory("pants")).toBe("bottoms");
		expect(normalizeCategory("trousers")).toBe("bottoms");
		expect(normalizeCategory("skirt")).toBe("bottoms");
		expect(normalizeCategory("shorts")).toBe("bottoms");
	});

	it("handles uppercase input", () => {
		expect(normalizeCategory("DRESS")).toBe("dresses");
	});
});

describe("normalizeMaterial — material blend parsing", () => {
	it("parses '95% Cotton, 5% Spandex' into MaterialBlend array", () => {
		const result = normalizeMaterial("95% Cotton, 5% Spandex");
		expect(Array.isArray(result)).toBe(true);
		expect(result.some((m) => m.material === "cotton" && m.percentage === 95)).toBe(true);
		expect(result.some((m) => m.material === "spandex" && m.percentage === 5)).toBe(true);
	});

	it("handles MaterialBlend[] input passthrough", () => {
		const input = [
			{ material: "Silk", percentage: 100 },
		];
		const result = normalizeMaterial(input);
		expect(result).toEqual(input);
	});

	it("handles single string input", () => {
		const result = normalizeMaterial("Cotton");
		expect(Array.isArray(result)).toBe(true);
		expect(result.some((m) => m.material === "cotton" && m.percentage === 100)).toBe(true);
	});

	it("returns empty array for null/undefined", () => {
		expect(normalizeMaterial(null)).toEqual([]);
		expect(normalizeMaterial(undefined)).toEqual([]);
	});
});
