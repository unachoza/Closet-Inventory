import { describe, it, expect } from "vitest";
import { inferCare, inferCareFromMaterial } from "../inference/inferCare";
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

	// A care tag becomes a pill on the card (CardDetails.tsx). A long tag —
	// several used to be full sentences pulled from the Fabric Guide's prose —
	// forces horizontal scroll on mobile. Every material/name/color combination
	// this function can produce must stay within 3 words.
	it("never emits a tag longer than 3 words, across every material group and rule", () => {
		const materials = ["wool", "cashmere", "silk", "cotton", "linen", "viscose", "rayon", "modal", "polyester", "nylon"];
		const colors = ["White", "Black", "Red", "Blue"];
		const names = ["Beaded Gown", "Denim Jeans", "Leather Boots", "Fleece Jacket", "Studded Belt", "Distressed Skirt", "Blazer"];

		for (const material of materials) {
			for (const color of colors) {
				for (const name of names) {
					const tags = inferCare(name, color, [{ material, percentage: 100 }]);
					for (const tag of tags) {
						expect(tag.trim().split(/\s+/).length, `"${tag}" (material=${material}, color=${color}, name=${name})`).toBeLessThanOrEqual(3);
					}
				}
			}
		}
	});

	// Regression: the Viscose/Rayon/Modal/TENCEL care group's items are labeled
	// "Viscose / Rayon" / "Modal & TENCEL™", not "Washing"/"Drying" like every
	// other group — the old CARE_GROUPS-prose lookup silently produced zero
	// instructions for these materials.
	it("produces care instructions for viscose, rayon, and modal (previously a coverage gap)", () => {
		for (const material of ["viscose", "rayon", "modal", "lyocell", "bamboo"]) {
			const care = inferCareFromMaterial([{ material, percentage: 100 }]);
			expect(care.length, `material=${material}`).toBeGreaterThan(0);
		}
	});

	// White items get the same tag from two independent rule paths (material's
	// isWhite check, and the color-keyword rule) — they must be the identical
	// string so inferCare()'s Set dedupes them into one pill, not two.
	it("dedupes the white-item tag between inferCareFromMaterial and inferCareFromAttributes", () => {
		const care = inferCare("Cotton Tee", "White", [{ material: "cotton", percentage: 100 }]);
		const likeColorsMatches = care.filter((c) => c.toLowerCase().includes("like color"));
		expect(likeColorsMatches).toHaveLength(1);
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
