import { describe, it, expect } from "vitest";
import getStockPhoto from "../getStockPhoto";

describe("getStockPhoto", () => {
	it("returns a non-empty URL for every known category", () => {
		const categories = ["tops", "bottoms", "dresses", "coats", "sweaters", "athleisure", "intimates", "socks", "underwear"] as const;
		categories.forEach((cat) => {
			const url = getStockPhoto(cat);
			expect(url, `expected a URL for category "${cat}"`).toBeTruthy();
			expect(url).toMatch(/^https:\/\//);
		});
	});

	it("returns empty string for null (no category selected)", () => {
		expect(getStockPhoto(null)).toBe("");
	});
});
