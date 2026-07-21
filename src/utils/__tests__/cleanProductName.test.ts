import { describe, it, expect } from "vitest";
import { cleanProductName } from "../cleanProductName";

describe("cleanProductName — SEO junk removal", () => {
	it.each([
		["Floral Print Midi Dress 2024", "Floral Print Midi Dress"],
		["Silk Blouse 2023 New Arrival", "Silk Blouse"],
		["New Arrival Cotton Tee", "Cotton Tee"],
		["New In Satin Slip Skirt", "Satin Slip Skirt"],
		["Just In Knit Cardigan", "Knit Cardigan"],
		["Oversized Hoodie Best Seller", "Oversized Hoodie"],
		["Hot Sale Linen Shorts", "Linen Shorts"],
		["Flash Sale Velvet Blazer", "Velvet Blazer"],
		["Limited Time Cashmere Sweater", "Cashmere Sweater"],
		["Buy Now Ribbed Bodysuit", "Ribbed Bodysuit"],
		["Shop Now Pleated Trousers", "Pleated Trousers"],
		["Free Shipping Wrap Dress", "Wrap Dress"],
		["Spring Collection Linen Dress", "Linen Dress"],
		["Winter Collection Puffer Coat", "Puffer Coat"],
	] as [string, string][])('strips junk from "%s" → "%s"', (input, expected) => {
		expect(cleanProductName(input)).toBe(expected);
	});
});

describe("cleanProductName — gender prefix stripping", () => {
	it.each([
		["Women's Floral Midi Dress", "Floral Midi Dress"],
		["Womens High Waist Jeans", "High Waist Jeans"],
		["Women Casual Trousers", "Casual Trousers"],
		["Men's Classic Chino", "Classic Chino"],
		["Ladies' Satin Blouse", "Satin Blouse"],  // trailing apostrophe
	] as [string, string][])('strips gender prefix from "%s" → "%s"', (input, expected) => {
		expect(cleanProductName(input)).toBe(expected);
	});
});

describe("cleanProductName — SHEIN / marketplace SEO junk", () => {
	it.each([
		// "Solid Color" is SEO padding
		["Casual Solid Color High Waist Trousers", "Casual High Waist Trousers"],
		// PETITE is a size qualifier SEO prefix; brand stripping (SHEIN) is separate
		["PETITE Women Casual Straight Trousers Fall Cloth For Women", "Casual Straight Trousers"],
		// Untouched: colorblock is meaningful product info
		["Collar Colorblock Short Sleeve Business T-Shirt", "Collar Colorblock Short Sleeve Business T-Shirt"],
		// "Fall Clothes For Women" → both "Fall Clothes" and "For Women" stripped
		["Ribbed Knit Top Fall Clothes For Women", "Ribbed Knit Top"],
		// "Summer Clothes" stripped
		["Floral Print Dress Summer Clothes", "Floral Print Dress"],
	] as [string, string][])('"%s" → "%s"', (input, expected) => {
		expect(cleanProductName(input)).toBe(expected);
	});
});

describe("cleanProductName — inline color/size suffix stripping", () => {
	it("strips ' in {color}' suffix", () => {
		expect(cleanProductName("Contour Squareneck Mini Dress in burgundy")).toBe("Contour Squareneck Mini Dress");
	});

	it("strips ' size {size}' suffix", () => {
		expect(cleanProductName("Silk Slip Dress size M")).toBe("Silk Slip Dress");
	});

	it("strips both ' in {color} size {size}'", () => {
		expect(cleanProductName("Longsleeve Mini Dress in burgundy size M")).toBe("Longsleeve Mini Dress");
	});
});

describe("cleanProductName — whitespace and punctuation cleanup", () => {
	it("trims leading and trailing whitespace", () => {
		expect(cleanProductName("  Cotton Tee  ")).toBe("Cotton Tee");
	});

	it("collapses internal multiple spaces", () => {
		expect(cleanProductName("Silk   Blouse")).toBe("Silk Blouse");
	});

	it("removes trailing comma after stripping junk", () => {
		expect(cleanProductName("Satin Dress, 2024")).toBe("Satin Dress");
	});

	it("removes trailing pipe after stripping junk", () => {
		expect(cleanProductName("Wrap Dress | New Arrival")).toBe("Wrap Dress");
	});

	it("preserves names that have no junk", () => {
		expect(cleanProductName("Ribbed Knit Midi Dress")).toBe("Ribbed Knit Midi Dress");
	});

	it("returns empty string for an all-junk input", () => {
		expect(cleanProductName("New Arrival 2024")).toBe("");
	});

	it("strips '- final sale' suffix from product names", () => {
		expect(cleanProductName("alli top dusty rose - final sale")).toBe("alli top dusty rose");
	});

	it("strips 'final sale' without dash prefix", () => {
		expect(cleanProductName("jesse bottom cinnamon final sale")).toBe("jesse bottom cinnamon");
	});
});
