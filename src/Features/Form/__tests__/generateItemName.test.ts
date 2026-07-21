import { describe, it, expect } from "vitest";
import { generateItemName } from "../generateItemName";

describe("generateItemName", () => {
	it("joins color, brand and category in title case", () => {
		expect(generateItemName({ color: "blue", brand: "levi's", category: "bottoms" })).toBe("Blue Levi's Bottoms");
	});

	it("skips empty parts", () => {
		expect(generateItemName({ color: "", brand: "zara", category: "tops" })).toBe("Zara Tops");
		expect(generateItemName({ color: "red", brand: "", category: "dresses" })).toBe("Red Dresses");
		expect(generateItemName({ color: "green", brand: "gap", category: "" })).toBe("Green Gap");
	});

	it("ignores whitespace-only parts", () => {
		expect(generateItemName({ color: "  ", brand: "aritzia", category: "coats" })).toBe("Aritzia Coats");
	});

	it("falls back to 'New item' when everything is empty", () => {
		expect(generateItemName({ color: "", brand: "", category: "" })).toBe("New item");
	});
});
