import { renderHook, act } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { useClosetSort } from "../useClosetSort";
import { ClothingItem } from "../../utils/types";

const makeItem = (overrides: Partial<ClothingItem>): ClothingItem => ({
	id: crypto.randomUUID(),
	imageURL: "",
	name: "Test Item",
	category: "tops",
	color: "black",
	size: "M",
	brand: "Nike",
	material: [{ material: "cotton", percentage: 100 }],
	occasion: "casual",
	age: "new",
	care: "machine wash",
	...overrides,
});

const ITEMS: ClothingItem[] = [
	makeItem({ id: "1", name: "Blazer", price: "$120", age: "excellent" }),
	makeItem({ id: "2", name: "Jeans", price: "$45", age: "good" }),
	makeItem({ id: "3", name: "Dress", price: "$200", age: "like new" }),
	makeItem({ id: "4", name: "Tee", price: "", age: "fair" }),
	makeItem({ id: "5", name: "Coat", price: "$90", age: "brand new" }),
];

describe("useClosetSort", () => {
	it("defaults to dateAdded which preserves original order", () => {
		const { result } = renderHook(() => useClosetSort());
		const sorted = result.current.sortedItems(ITEMS);
		expect(sorted.map((i) => i.id)).toEqual(["1", "2", "3", "4", "5"]);
	});

	it("does not mutate the original array", () => {
		const { result } = renderHook(() => useClosetSort("priceAsc"));
		const original = [...ITEMS];
		result.current.sortedItems(ITEMS);
		expect(ITEMS.map((i) => i.id)).toEqual(original.map((i) => i.id));
	});

	it("priceAsc: items with no price sort as 0 (first)", () => {
		const { result } = renderHook(() => useClosetSort());
		act(() => {
			result.current.setSortKey("priceAsc");
		});
		const sorted = result.current.sortedItems(ITEMS);
		expect(sorted[0].id).toBe("4"); // price=""  → 0
		expect(sorted[sorted.length - 1].id).toBe("3"); // $200
	});

	it("priceDesc: most expensive first", () => {
		const { result } = renderHook(() => useClosetSort());
		act(() => {
			result.current.setSortKey("priceDesc");
		});
		const sorted = result.current.sortedItems(ITEMS);
		expect(sorted[0].id).toBe("3"); // $200
		expect(sorted[1].id).toBe("1"); // $120
		expect(sorted[2].id).toBe("5"); // $90
	});

	it("nameAZ: alphabetical ascending", () => {
		const { result } = renderHook(() => useClosetSort());
		act(() => {
			result.current.setSortKey("nameAZ");
		});
		const sorted = result.current.sortedItems(ITEMS);
		const names = sorted.map((i) => i.name);
		expect(names).toEqual([...names].sort());
	});

	it("nameZA: alphabetical descending", () => {
		const { result } = renderHook(() => useClosetSort());
		act(() => {
			result.current.setSortKey("nameZA");
		});
		const sorted = result.current.sortedItems(ITEMS);
		const names = sorted.map((i) => i.name);
		expect(names).toEqual([...names].sort().reverse());
	});

	it("ageNewest: 'brand new' comes before 'good'", () => {
		const { result } = renderHook(() => useClosetSort());
		act(() => {
			result.current.setSortKey("ageNewest");
		});
		const sorted = result.current.sortedItems(ITEMS);
		const brandNewIdx = sorted.findIndex((i) => i.age === "brand new");
		const goodIdx = sorted.findIndex((i) => i.age === "good");
		expect(brandNewIdx).toBeLessThan(goodIdx);
	});

	it("ageOldest: 'fair' comes before 'brand new'", () => {
		const { result } = renderHook(() => useClosetSort());
		act(() => {
			result.current.setSortKey("ageOldest");
		});
		const sorted = result.current.sortedItems(ITEMS);
		const fairIdx = sorted.findIndex((i) => i.age === "fair");
		const brandNewIdx = sorted.findIndex((i) => i.age === "brand new");
		expect(fairIdx).toBeLessThan(brandNewIdx);
	});

	const DATED_ITEMS: ClothingItem[] = [
		makeItem({ id: "a", purchaseDate: "2024-01-15" }),
		makeItem({ id: "b", purchaseDate: "2026-03-01" }),
		makeItem({ id: "c", purchaseDate: "2025-06-10" }),
		makeItem({ id: "d", purchaseDate: undefined }), // no date → always last
	];

	it("purchasedNewest: most recent purchaseDate first, missing dates last", () => {
		const { result } = renderHook(() => useClosetSort("purchasedNewest"));
		const sorted = result.current.sortedItems(DATED_ITEMS);
		expect(sorted.map((i) => i.id)).toEqual(["b", "c", "a", "d"]);
	});

	it("purchasedOldest: earliest purchaseDate first, missing dates still last", () => {
		const { result } = renderHook(() => useClosetSort("purchasedOldest"));
		const sorted = result.current.sortedItems(DATED_ITEMS);
		expect(sorted.map((i) => i.id)).toEqual(["a", "c", "b", "d"]);
	});

	it("setSortKey changes the active sort key", () => {
		const { result } = renderHook(() => useClosetSort());
		expect(result.current.sortKey).toBe("dateAdded");
		act(() => {
			result.current.setSortKey("nameAZ");
		});
		expect(result.current.sortKey).toBe("nameAZ");
	});

	it("handles empty array without error", () => {
		const { result } = renderHook(() => useClosetSort("priceAsc"));
		expect(() => result.current.sortedItems([])).not.toThrow();
		expect(result.current.sortedItems([])).toEqual([]);
	});
});
