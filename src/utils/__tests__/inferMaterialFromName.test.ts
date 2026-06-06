import { describe, it, expect } from "vitest";
import { inferMaterialFromName } from "../inferMaterialFromName";

describe("inferMaterialFromName — keyword inference", () => {
	it.each([
		["Silk Blouse", [{ material: "silk", percentage: 100 }]],
		["Cashmere Sweater", [{ material: "cashmere", percentage: 100 }]],
		["Merino Wool Coat", [{ material: "wool", percentage: 100 }]],
		["Linen Shorts", [{ material: "linen", percentage: 100 }]],
		["Cotton Tee", [{ material: "cotton", percentage: 100 }]],
		["Organic Cotton Hoodie", [{ material: "cotton", percentage: 100 }]],
		["Modal Tank Top", [{ material: "modal", percentage: 100 }]],
		["TENCEL Jumpsuit", [{ material: "lyocell", percentage: 100 }]],
		["Lyocell Midi Dress", [{ material: "lyocell", percentage: 100 }]],
		["Viscose Wrap Dress", [{ material: "rayon", percentage: 100 }]],
		["Rayon Slip Skirt", [{ material: "rayon", percentage: 100 }]],
		["Polyester Running Top", [{ material: "polyester", percentage: 100 }]],
		["Nylon Windbreaker", [{ material: "nylon", percentage: 100 }]],
		["Velvet Blazer", [{ material: "velvet", percentage: 100 }]],
		["Denim Jacket", [{ material: "denim", percentage: 100 }]],
		["Fleece Pullover", [{ material: "fleece", percentage: 100 }]],
		["Lace Trim Bodysuit", [{ material: "lace", percentage: 100 }]],
		["Chiffon Maxi Dress", [{ material: "chiffon", percentage: 100 }]],
		["Satin Slip Dress", [{ material: "satin", percentage: 100 }]],
	] as [string, { material: string; percentage: number }[]][])('infers material from "%s"', (name, expected) => {
		expect(inferMaterialFromName(name)).toEqual(expected);
	});

	it("returns empty array when no material keyword is found", () => {
		expect(inferMaterialFromName("Classic Mini Dress")).toEqual([]);
		expect(inferMaterialFromName("Order Confirmed")).toEqual([]);
	});

	it("does not infer from partial word matches", () => {
		// 'satin' should not match 'satisfaction', 'lace' should not match 'place'
		expect(inferMaterialFromName("Customer Satisfaction Guaranteed")).toEqual([]);
		expect(inferMaterialFromName("Marketplace Dress")).toEqual([]);
	});
});

describe("inferMaterialFromName — percentage extraction", () => {
	it("parses '95% Cotton, 5% Spandex' directly", () => {
		const result = inferMaterialFromName("95% Cotton, 5% Spandex Leggings");
		expect(result).toContainEqual({ material: "cotton", percentage: 95 });
		expect(result).toContainEqual({ material: "spandex", percentage: 5 });
	});

	it("parses multi-fiber blends from name", () => {
		const result = inferMaterialFromName("61% Polyester 26% Viscose 13% Nylon Top");
		expect(result).toContainEqual({ material: "polyester", percentage: 61 });
		expect(result).toContainEqual({ material: "viscose", percentage: 26 });
	});

	it("percentage extraction takes priority over keyword inference", () => {
		// "80% Silk" → percentage result, not generic 100% silk
		const result = inferMaterialFromName("80% Silk 20% Cotton Blouse");
		expect(result).toContainEqual({ material: "silk", percentage: 80 });
		expect(result).toContainEqual({ material: "cotton", percentage: 20 });
		expect(result).not.toContainEqual({ material: "silk", percentage: 100 });
	});
});

describe("inferMaterialFromName — multi-material keyword inference (from item name)", () => {
	const materialsOf = (name: string) => inferMaterialFromName(name).map((b) => b.material);

	it.each([
		["The Organic Cotton Crew", ["cotton"]],
		["COTTON MODAL TANK TOP", ["cotton", "modal"]],
		["POLYAMIDE BLEND STRAPPY DRESS", ["polyamide"]],
		["COTTON SLEEVELESS T-SHIRT", ["cotton"]],
		["COTTON MODAL CROP T-SHIRT", ["cotton", "modal"]],
		["LEATHER HEELED SANDALS", ["leather"]],
	] as [string, string[]][])('infers materials from "%s"', (name, expected) => {
		expect(materialsOf(name)).toEqual(expected);
	});

	it("collapses overlapping keywords (organic cotton + cotton) to a single material", () => {
		expect(inferMaterialFromName("Organic Cotton Crew")).toEqual([{ material: "cotton", percentage: 100 }]);
	});

	it("splits the percentage evenly across inferred materials so it sums to 100", () => {
		expect(inferMaterialFromName("Cotton Modal Tank Top")).toEqual([
			{ material: "cotton", percentage: 50 },
			{ material: "modal", percentage: 50 },
		]);
	});

	it("keeps a single inferred material at 100%", () => {
		expect(inferMaterialFromName("Leather Heeled Sandals")).toEqual([{ material: "leather", percentage: 100 }]);
	});
});
