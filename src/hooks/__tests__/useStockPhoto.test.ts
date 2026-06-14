import { describe, it, expect } from "vitest";
import useStockPhoto from "../useStockPhoto";

describe("useStockPhoto", () => {
	it("returns a non-empty URL for every known category", () => {
		const categories = ["tops", "bottoms", "dresses", "coats", "sweaters", "athleisure", "lingerie", "socks", "underwear"] as const;
		categories.forEach((cat) => {
			const url = useStockPhoto(cat);
			expect(url, `expected a URL for category "${cat}"`).toBeTruthy();
			expect(url).toMatch(/^https:\/\//);
		});
	});

	it("returns empty string for null (no category selected)", () => {
		expect(useStockPhoto(null)).toBe("");
	});
});
