import { describe, it, expect } from "vitest";
import { condenseName } from "../condenseName";

describe("condenseName", () => {
	it("passes short names through unchanged", () => {
		expect(condenseName("Knit Mini Dress")).toBe("Knit Mini Dress");
	});

	it("takes only the first comma segment (Amazon/Temu SEO repetition)", () => {
		expect(condenseName("High Waist Flare Leg Jeans,Ladies Casual Button,Pocket,Zipper High Waist Flare Leg")).toBe(
			"High Waist Flare Leg Jeans",
		);
	});

	it("caps at 7 words for long non-comma names", () => {
		const result = condenseName("Womens Summer Linen Shirts Casual Button Down 2026 Long Sleeve Cotton Top Blouse Shirt with Pocket");
		const words = result.split(" ");
		expect(words.length).toBeLessThanOrEqual(7);
	});

	it("strips gender prefix", () => {
		expect(condenseName("Womens Colorblock Short Sleeve T-Shirt")).toBe("Colorblock Short Sleeve T-Shirt");
		expect(condenseName("Ladies Casual Wrap Midi Dress")).toBe("Casual Wrap Midi Dress");
		expect(condenseName("Men's Classic Chino Pants")).toBe("Classic Chino Pants");
	});

	it("strips Poshmark condition tokens (NWT, NWOT, EUC)", () => {
		expect(condenseName("Contour Scoop Cami Mini Dress NWT")).toBe("Contour Scoop Cami Mini Dress");
		expect(condenseName("Silk Slip Skirt NWOT")).toBe("Silk Slip Skirt");
	});

	it("strips year tokens", () => {
		expect(condenseName("Long Sleeve Cotton Top 2026 Spring")).toBe("Long Sleeve Cotton Top Spring");
	});

	it("strips trailing size tokens", () => {
		expect(condenseName("Deep Taupe Contour Scoop Cami Mini Dress Medium")).toBe(
			"Deep Taupe Contour Scoop Cami Mini Dress",
		);
		expect(condenseName("Ribbed Knit Midi Skirt XL")).toBe("Ribbed Knit Midi Skirt");
	});

	it("strips brand prefix when brand is provided", () => {
		expect(condenseName("Babaton Deep Taupe Contour Scoop Cami Mini Dress", "Babaton")).toBe(
			"Deep Taupe Contour Scoop Cami Mini Dress",
		);
		expect(condenseName("SHEIN Sports Slogan Graphic Tank Top", "SHEIN")).toBe("Sports Slogan Graphic Tank Top");
	});

	it("strips trailing filler phrases", () => {
		expect(condenseName("Flare Leg Jeans with Pocket")).toBe("Flare Leg Jeans");
		expect(condenseName("Linen Button Down Shirt for Women")).toBe("Linen Button Down Shirt");
	});

	it("returns raw input if stripping leaves an empty string", () => {
		expect(condenseName("NWT")).toBe("NWT");
	});

	it("handles empty / whitespace input", () => {
		expect(condenseName("")).toBe("");
		expect(condenseName("  ")).toBe("  ");
	});

	it("real Temu example stays under 7 words", () => {
		const result = condenseName(
			"Selianne Women's Collar Colorblock Short Sleeve Business Casual T-Shirt",
		);
		expect(result.split(" ").length).toBeLessThanOrEqual(7);
		expect(result).not.toMatch(/women's/i);
	});
});
