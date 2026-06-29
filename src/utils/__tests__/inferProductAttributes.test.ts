import { describe, it, expect } from "vitest";
import { inferProductAttributes } from "../../Features/FashionParser";
import { matchAll } from "../../Features/FashionParser/utils";
import { PATTERN_MAP } from "../../Features/FashionParser/maps/pattern";

describe("inferProductAttributes — sleeve length", () => {
	it.each([
		["Aritzia Contour Squareneck Longsleeve Mini Dress", "long sleeve"],
		["Long-Sleeve Square Neck Bodycon Dress", "long sleeve"],
		["Short Sleeve Business Casual T-Shirt", "short sleeve"],
		["Sleeveless Halter Midi Dress", "sleeveless"],
		["Strapless Satin Gown", "sleeveless"],
		["Cap Sleeve Wrap Dress", "cap sleeve"],
		["3/4 Sleeve Blazer", "3/4 sleeve"],
		["Flutter Sleeve Blouse", "flutter sleeve"],
	] as [string, string][])('"%s" → sleeveLength="%s"', (name, expected) => {
		expect(inferProductAttributes(name).sleeveLength).toBe(expected);
	});

	it("returns undefined when no sleeve keyword found", () => {
		expect(inferProductAttributes("Ribbed Knit Midi Dress").sleeveLength).toBeUndefined();
	});
});

describe("inferProductAttributes — hem length", () => {
	it.each([
		["Squareneck Longsleeve Mini Dress", "mini"],
		["Floral Midi Wrap Dress", "midi"],
		["Bohemian Maxi Skirt", "maxi"],
		["Cropped Denim Jacket", "crop"],
	] as [string, string][])('"%s" → hemLength="%s"', (name, expected) => {
		expect(inferProductAttributes(name).hemLength).toBe(expected);
	});

	it("returns undefined when no hem keyword found", () => {
		expect(inferProductAttributes("Classic Blazer").hemLength).toBeUndefined();
	});
});

describe("inferProductAttributes — neckline", () => {
	it.each([
		["Squareneck Longsleeve Mini Dress", "square neck"],
		["Aritzia Teal Long-Sleeve Square Neck Bodycon Dress", "square neck"],
		["V-Neck Wrap Blouse", "v-neck"],
		["Vneck Ribbed Top", "v-neck"],
		["Crew Neck Sweater", "crew neck"],
		["Mock Neck Bodysuit", "mock neck"],
		["Turtleneck Knit Top", "turtleneck"],
		["Off-Shoulder Midi Dress", "off-shoulder"],
		["Halter Neck Maxi Dress", "halter"],
		["Scoop Neck Tank", "scoop neck"],
		["Boat Neck Blouse", "boat neck"],
		["Cowl Neck Draped Dress", "cowl neck"],
	] as [string, string][])('"%s" → neckline="%s"', (name, expected) => {
		expect(inferProductAttributes(name).neckline).toBe(expected);
	});
});

describe("inferProductAttributes — silhouette", () => {
	it.each([
		["Aritzia Teal Long-Sleeve Square Neck Bodycon Dress", "bodycon"],
		["Fit and Flare Midi Dress", "fit & flare"],
		["A-Line Skirt", "a-line"],
		["Sheath Dress", "sheath"],
		["Wrap Blouse", "wrap"],
		["Pencil Skirt", "pencil"],
		["Mermaid Gown", "mermaid"],
	] as [string, string][])('"%s" → silhouette="%s"', (name, expected) => {
		expect(inferProductAttributes(name).silhouette).toBe(expected);
	});
});

describe("inferProductAttributes — fit", () => {
	it.each([
		["Oversized Hoodie", "oversized"],
		["Relaxed Linen Trousers", "relaxed"],
		["Fitted Blazer", "fitted"],
		["Slim Fit Chinos", "slim"],
		["Skinny Jeans", "skinny"],
		["Tailored Wool Trousers", "tailored"],
		["Boyfriend Jeans", "boyfriend"],
	] as [string, string][])('"%s" → fit="%s"', (name, expected) => {
		expect(inferProductAttributes(name).fit).toBe(expected);
	});
});

describe("inferProductAttributes — leg shape", () => {
	it.each([
		["Casual Solid Color High Waist Straight Leg Trousers", "straight leg"],
		["High Waist Wide Leg Trousers", "wide leg"],
		["Bootcut Jeans", "bootcut"],
		["Tapered Chinos", "tapered"],
	] as [string, string][])('"%s" → legShape="%s"', (name, expected) => {
		expect(inferProductAttributes(name).legShape).toBe(expected);
	});
});

describe("inferProductAttributes — rise", () => {
	it.each([
		["High Waist Straight Leg Trousers", "high waist"],
		["High-Rise Skinny Jeans", "high waist"],
		["Mid Rise Flare Jeans", "mid rise"],
		["Low-Rise Cargo Pants", "low rise"],
	] as [string, string][])('"%s" → rise="%s"', (name, expected) => {
		expect(inferProductAttributes(name).rise).toBe(expected);
	});
});

describe("inferProductAttributes — season", () => {
	it.each([
		["AKEFUN Womens Summer Linen Shirts", "summer"],
		["Spring Floral Midi Dress", "spring"],
		["Fall Flannel Shirt", "fall"],
		["Autumn Wool Coat", "fall"],
		["Winter Puffer Jacket", "winter"],
	] as [string, string][])('"%s" → season="%s"', (name, expected) => {
		expect(inferProductAttributes(name).season).toBe(expected);
	});

	it("returns undefined when no season keyword found", () => {
		expect(inferProductAttributes("Ribbed Knit Top").season).toBeUndefined();
	});
});

describe("inferProductAttributes — closure", () => {
	it("detects zipper from zip keyword", () => {
		const result = inferProductAttributes("Merino 260 Quantum Long Sleeve Zip Hoodie");
		expect(result.closure).toContain("zipper");
	});

	it("detects button-up", () => {
		const result = inferProductAttributes("Button-Up Oxford Shirt");
		expect(result.closure).toContain("button-up");
	});

	it("detects hidden zipper", () => {
		const result = inferProductAttributes("Hidden Zip Midi Dress");
		expect(result.closure).toContain("hidden zipper");
	});
});

describe("inferProductAttributes — shaping", () => {
	it("detects princess seams and boning together", () => {
		const result = inferProductAttributes("Princess Seam Boned Corset Dress");
		expect(result.shaping).toContain("princess seams");
		expect(result.shaping).toContain("boned");
		expect(result.shaping).toContain("corset");
	});

	it("detects darts", () => {
		const result = inferProductAttributes("Darted Wool Blazer");
		expect(result.shaping).toContain("darts");
	});

	it("detects smocked", () => {
		const result = inferProductAttributes("Smocked Bodice Midi Dress");
		expect(result.shaping).toContain("smocked");
	});
});

describe("inferProductAttributes — construction", () => {
	it("detects side slit", () => {
		const result = inferProductAttributes("Side Slit Midi Skirt");
		expect(result.construction).toContain("side slit");
	});

	it("detects distressed", () => {
		const result = inferProductAttributes("Distressed Boyfriend Jeans");
		expect(result.construction).toContain("distressed");
	});
});

describe("inferProductAttributes — multiple attributes from one name", () => {
	it("extracts attributes from Aritzia example", () => {
		const result = inferProductAttributes("Aritzia Contour Squareneck Longsleeve Mini Dress in burgundy size M");
		expect(result.sleeveLength).toBe("long sleeve");
		expect(result.hemLength).toBe("mini");
		expect(result.neckline).toBe("square neck");
	});

	it("extracts attributes from SHEIN trousers example", () => {
		const result = inferProductAttributes("High Waist Straight Leg Trousers");
		expect(result.rise).toBe("high waist");
		expect(result.legShape).toBe("straight leg");
	});

	it("extracts rich metadata from complex product name", () => {
		const result = inferProductAttributes(
			"Princess Seam Corset Midi Dress with Button Front, Hidden Zipper, Side Slit and Rhinestone Trim"
		);
		expect(result.hemLength).toBe("midi");
		expect(result.shaping).toContain("princess seams");
		expect(result.shaping).toContain("corset");
		expect(result.closure).toContain("button front");
		expect(result.closure).toContain("hidden zipper");
		expect(result.construction).toEqual(expect.arrayContaining(["side slit"]));
		expect(result.accents).toContain("rhinestones");
	});
});

describe("inferProductAttributes — pattern", () => {
	it('"graphic" → captured as pattern', () => {
		const name = "Cotton On Everyday Fit Graphic T-Shirt";
		expect(matchAll(name, PATTERN_MAP)).toContain("graphic");
	});
});
