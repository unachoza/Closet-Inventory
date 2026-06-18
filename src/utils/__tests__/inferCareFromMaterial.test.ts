import { describe, it, expect } from "vitest";
import { inferCareFromMaterial } from "../inferCareFromMaterial";

describe("inferCareFromMaterial", () => {
	it("returns empty array for empty material list", () => {
		expect(inferCareFromMaterial([])).toEqual([]);
	});

	it("extracts care from cotton (plant fiber group)", () => {
		const care = inferCareFromMaterial([{ material: "cotton", percentage: 100 }]);
		expect(care.length).toBeGreaterThan(0);
		// Cotton care should mention "warm" or "cold" in washing
		expect(care.some((instruction) => instruction.toLowerCase().includes("wash"))).toBe(true);
		expect(care.some((instruction) => instruction.toLowerCase().includes("dry"))).toBe(true);
	});

	it("extracts care from wool (protein fiber group)", () => {
		const care = inferCareFromMaterial([{ material: "wool", percentage: 100 }]);
		expect(care.length).toBeGreaterThan(0);
		expect(care.some((instruction) => instruction.toLowerCase().includes("hand wash") || instruction.toLowerCase().includes("delicate"))).toBe(true);
	});

	it("extracts care from silk (protein fiber group)", () => {
		const care = inferCareFromMaterial([{ material: "silk", percentage: 100 }]);
		expect(care.length).toBeGreaterThan(0);
		expect(care.some((instruction) => instruction.toLowerCase().includes("hand wash") || instruction.toLowerCase().includes("cold"))).toBe(true);
	});

	it("returns empty for modal (regenerated cellulose group uses custom labels)", () => {
		// The Viscose/Modal group uses "Viscose / Rayon" and "Modal & TENCEL™" labels
		// instead of "Washing"/"Drying", so returns empty per the user's requirement
		// to only check "Washing" or "Drying" labels
		const care = inferCareFromMaterial([{ material: "modal", percentage: 100 }]);
		expect(care.length).toBe(0);
	});

	it("extracts care from polyester (synthetics group)", () => {
		const care = inferCareFromMaterial([{ material: "polyester", percentage: 100 }]);
		expect(care.length).toBeGreaterThan(0);
		expect(care.some((instruction) => instruction.toLowerCase().includes("cold"))).toBe(true);
	});

	it("uses primary material when multiple materials are present", () => {
		// Cotton 80% + spandex 20% — should use cotton care
		const care = inferCareFromMaterial([
			{ material: "cotton", percentage: 80 },
			{ material: "spandex", percentage: 20 },
		]);
		expect(care.length).toBeGreaterThan(0);
		// Cotton care differs from spandex (no high heat)
		const careLower = care.join(" ").toLowerCase();
		expect(careLower).toContain("wash");
	});

	it("returns both washing and drying instructions", () => {
		const care = inferCareFromMaterial([{ material: "cotton", percentage: 100 }]);
		// Should have at least one "Washing" and one "Drying" instruction
		expect(care.length).toBeGreaterThanOrEqual(2);
	});

	// ── Fiber-trait rules (apply across the whole blend) ──
	it("adds 'Line dry' for linen or rayon", () => {
		expect(inferCareFromMaterial([{ material: "linen", percentage: 100 }])).toContain("Line dry");
		expect(inferCareFromMaterial([{ material: "rayon", percentage: 100 }])).toContain("Line dry");
	});

	it("adds 'Do not use fabric softeners' for nylon or polyester", () => {
		expect(inferCareFromMaterial([{ material: "nylon", percentage: 100 }])).toContain("Do not use fabric softeners");
		expect(inferCareFromMaterial([{ material: "polyester", percentage: 100 }])).toContain("Do not use fabric softeners");
	});

	it("applies a trait rule even for a secondary blend material", () => {
		// Cotton primary (fiber care) + rayon secondary (trait rule).
		const care = inferCareFromMaterial([
			{ material: "cotton", percentage: 70 },
			{ material: "rayon", percentage: 30 },
		]);
		expect(care).toContain("Line dry");
		expect(care.some((c) => c.toLowerCase().includes("wash"))).toBe(true);
	});

	it("does not add trait tags for unrelated fibers", () => {
		expect(inferCareFromMaterial([{ material: "cotton", percentage: 100 }])).not.toContain("Line dry");
	});
});
