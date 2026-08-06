import { describe, it, expect } from "vitest";
import { computeRevealStats } from "../revealStats";
import type { ClothingItem } from "../../../utils/types";

const makeItem = (overrides: Partial<ClothingItem>): ClothingItem => ({
	id: crypto.randomUUID(),
	imageURL: "",
	name: "Test Item",
	category: "tops",
	color: "black",
	size: "M",
	brand: "Aritzia",
	material: [],
	occasion: "",
	age: "new",
	care: "",
	...overrides,
});

describe("computeRevealStats", () => {
	it("counts pieces and distinct brands, excluding demo items", () => {
		const closet = [
			makeItem({ brand: "Aritzia" }),
			makeItem({ brand: "Aritzia" }),
			makeItem({ brand: "Zara" }),
			makeItem({ brand: "Zara", isDemo: true }),
		];

		const stats = computeRevealStats(closet);

		expect(stats.pieceCount).toBe(3);
		expect(stats.brandCount).toBe(2);
	});

	it("ignores empty/whitespace brands when counting", () => {
		const closet = [makeItem({ brand: "Aritzia" }), makeItem({ brand: "" }), makeItem({ brand: "   " })];

		expect(computeRevealStats(closet).brandCount).toBe(1);
	});

	it("sums price across priced items and flags an incomplete total", () => {
		const closet = [makeItem({ price: 40 }), makeItem({ price: 60 }), makeItem({ price: undefined })];

		const stats = computeRevealStats(closet);

		expect(stats.totalValue).toBe(100);
		expect(stats.hasCompleteValue).toBe(false);
	});

	it("reports a complete value when every item has a price", () => {
		const closet = [makeItem({ price: 40 }), makeItem({ price: 60 })];

		expect(computeRevealStats(closet).hasCompleteValue).toBe(true);
	});

	it("reports no complete value on an empty (non-demo) closet", () => {
		expect(computeRevealStats([]).hasCompleteValue).toBe(false);
	});

	it("computes the earliest/latest purchaseDate across items", () => {
		const closet = [
			makeItem({ purchaseDate: "2024-05-01T00:00:00.000Z" }),
			makeItem({ purchaseDate: "2026-06-15T00:00:00.000Z" }),
			makeItem({ purchaseDate: "2025-01-01T00:00:00.000Z" }),
		];

		const stats = computeRevealStats(closet);

		expect(stats.dateRange).toEqual({
			earliest: "2024-05-01T00:00:00.000Z",
			latest: "2026-06-15T00:00:00.000Z",
		});
	});

	it("returns a null date range when no item has one", () => {
		const closet = [makeItem({ purchaseDate: undefined })];

		expect(computeRevealStats(closet).dateRange).toBeNull();
	});

	it("skips unparseable purchaseDate strings instead of throwing", () => {
		const closet = [makeItem({ purchaseDate: "not-a-date" }), makeItem({ purchaseDate: "2025-01-01T00:00:00.000Z" })];

		const stats = computeRevealStats(closet);

		expect(stats.dateRange).toEqual({
			earliest: "2025-01-01T00:00:00.000Z",
			latest: "2025-01-01T00:00:00.000Z",
		});
	});
});
