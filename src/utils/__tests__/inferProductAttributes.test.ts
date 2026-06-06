import { describe, it, expect } from "vitest";
import { inferProductAttributes } from "../inferProductAttributes";

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

describe("inferProductAttributes — fit", () => {
	it.each([
		["Aritzia Contour Squareneck Longsleeve Mini Dress", "bodycon"],
		["Aritzia Teal Long-Sleeve Square Neck Bodycon Dress", "bodycon"],
		["Casual Solid Color High Waist Straight Leg Trousers", "straight leg"],
		["High Waist Wide Leg Trousers", "wide leg"],
		["Flared Midi Skirt", "flare"],
		["Skinny Jeans", "skinny"],
		["Slim Fit Chinos", "slim"],
		["Relaxed Linen Trousers", "relaxed"],
		["Oversized Hoodie", "oversized"],
		["Fitted Blazer", "fitted"],
	] as [string, string][])('"%s" → fit="%s"', (name, expected) => {
		expect(inferProductAttributes(name).fit).toBe(expected);
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

describe("inferProductAttributes — multiple attributes from one name", () => {
	it("extracts all 5 attributes from Aritzia example", () => {
		const result = inferProductAttributes("Aritzia Contour Squareneck Longsleeve Mini Dress in burgundy size M");
		expect(result.sleeveLength).toBe("long sleeve");
		expect(result.hemLength).toBe("mini");
		expect(result.neckline).toBe("square neck");
		expect(result.fit).toBe("bodycon");
	});

	it("extracts attributes from SHEIN trousers example", () => {
		const result = inferProductAttributes("High Waist Straight Leg Trousers");
		expect(result.rise).toBe("high waist");
		expect(result.fit).toBe("straight leg");
	});
});
