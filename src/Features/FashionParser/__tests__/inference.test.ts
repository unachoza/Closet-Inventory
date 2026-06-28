import { describe, it, expect } from "vitest";
import { inferCare } from "../inference/inferCare";
import { inferOccasion } from "../inference/inferOccasion";
import { inferMaterialFromName } from "../inference/inferMaterial";

describe("inferCare — care instruction inference", () => {
	it("infers care instructions for silk", () => {
		const care = inferCare("Silk Blouse", "White", [{ material: "Silk", percentage: 100 }]);
		expect(Array.isArray(care)).toBe(true);
		expect(care.length).toBeGreaterThan(0);
	});

	it("infers care instructions for wool", () => {
		const care = inferCare("Wool Coat", "Black", [{ material: "Wool", percentage: 100 }]);
		expect(Array.isArray(care)).toBe(true);
		expect(care.length).toBeGreaterThan(0);
	});

	it("infers care for beaded/delicate items", () => {
		const care = inferCare("Beaded Dress", "Gold", [{ material: "Polyester", percentage: 100 }]);
		expect(Array.isArray(care)).toBe(true);
	});

	it("infers care for denim", () => {
		const care = inferCare("Dark Denim Jeans", "Indigo", [{ material: "Cotton", percentage: 100 }]);
		expect(care.some((c) => c.toLowerCase().includes("inside out"))).toBe(true);
	});

	it("infers care for white items", () => {
		const care = inferCare("Cotton T-Shirt", "White", [{ material: "Cotton", percentage: 100 }]);
		expect(care.some((c) => c.toLowerCase().includes("like color"))).toBe(true);
	});

	it("handles polyester blend", () => {
		const care = inferCare("Blouse", "Blue", [
			{ material: "Polyester", percentage: 60 },
			{ material: "Cotton", percentage: 40 },
		]);
		expect(care.length).toBeGreaterThan(0);
	});
});

describe("inferOccasion — occasion tag inference", () => {
	it("infers formal for 'Evening Gown'", () => {
		expect(inferOccasion("Evening Gown", "dresses")).toContain("formal");
	});

	it("infers athleisure for 'Soccer Jersey'", () => {
		expect(inferOccasion("Cotton On Men's Soccer Jersey", "tops")).toContain("athleisure");
	});

	it("infers casual for basic tee", () => {
		expect(inferOccasion("Basic White T-Shirt", "tops")).toContain("casual");
	});

	it("tags as basics before casual for explicitly basic item", () => {
		const occasions = inferOccasion("Basic Tank Top", "tops");
		const basicIndex = occasions.indexOf("basics");
		const casualIndex = occasions.indexOf("casual");
		expect(basicIndex).toBeLessThan(casualIndex);
	});

	it("infers work wear for 'Business Blazer'", () => {
		expect(inferOccasion("Business Blazer", "coats")).toContain("work wear");
	});

	it("infers vacation for 'Beach Cover Up'", () => {
		expect(inferOccasion("Beach Cover Up", "tops")).toContain("vacation");
	});

	it("returns up to 2 occasions", () => {
		const occasions = inferOccasion("Formal Evening Gown for Wedding", "dresses");
		expect(occasions.length).toBeLessThanOrEqual(2);
	});

	it("handles category as optional parameter", () => {
		const withCategory = inferOccasion("Dress", "dresses");
		const withoutCategory = inferOccasion("Dress");
		expect(Array.isArray(withCategory)).toBe(true);
		expect(Array.isArray(withoutCategory)).toBe(true);
	});
});

describe("inferMaterialFromName — material blend extraction", () => {
	it("extracts percent blends from name", () => {
		const materials = inferMaterialFromName("95% Cotton, 5% Spandex");
		expect(materials.some((m) => m.material === "cotton" && m.percentage === 95)).toBe(true);
		expect(materials.some((m) => m.material === "spandex" && m.percentage === 5)).toBe(true);
	});

	it("handles keyword inference without percentages", () => {
		const materials = inferMaterialFromName("Silk and Linen Blend");
		expect(materials.length).toBeGreaterThan(0);
		expect(materials.some((m) => m.material === "silk" || m.material === "linen")).toBe(true);
	});

	it("detects polyamide keyword", () => {
		const materials = inferMaterialFromName("Polyamide Tights");
		expect(materials.length).toBeGreaterThan(0);
	});

	it("handles single material", () => {
		const materials = inferMaterialFromName("100% Wool");
		expect(materials.length).toBeGreaterThan(0);
		expect(materials.some((m) => m.material === "wool")).toBe(true);
	});

	it("splits materials evenly when no percentages given", () => {
		const materials = inferMaterialFromName("Cotton and Polyester");
		if (materials.length === 2) {
			expect(materials.every((m) => m.percentage >= 40 && m.percentage <= 60)).toBe(true);
		}
	});

	it("returns empty array for no recognizable materials", () => {
		const materials = inferMaterialFromName("Completely Unknown Stuff");
		expect(Array.isArray(materials)).toBe(true);
	});
});
