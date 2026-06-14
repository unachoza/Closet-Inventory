import { describe, it, expect } from "vitest";
import { inferCare } from "../inferCare";

describe("inferCare", () => {
	it("merges material care with name/color care, deduped", () => {
		const care = inferCare("Cotton Sleeveless T-Shirt", "White", [{ material: "cotton", percentage: 100 }]);
		// Material (cotton) wash/dry guidance…
		expect(care.some((c) => c.toLowerCase().includes("wash"))).toBe(true);
		// …plus the white color rule.
		expect(care).toContain("Wash with like colors");
		// No duplicates.
		expect(new Set(care).size).toBe(care.length);
	});

	it("fires the white rule from the resolved color even when the name has no color word", () => {
		// Regression: the Zara card lists "Color: White" but the name doesn't —
		// passing the resolved color here is what makes the rule fire.
		const care = inferCare("Cotton Sleeveless T-Shirt", "White", []);
		expect(care).toContain("Wash with like colors");
	});

	it("returns an empty list when nothing matches", () => {
		expect(inferCare("Plain Tee", "Brown", [])).toEqual([]);
	});
});
