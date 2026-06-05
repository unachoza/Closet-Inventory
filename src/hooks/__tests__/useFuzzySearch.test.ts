import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { useFuzzySearch } from "../useFuzzySearch";
import { ClothingItem } from "../../utils/types";

const makeItem = (overrides: Partial<ClothingItem>): ClothingItem => ({
	id: crypto.randomUUID(),
	imageURL: "",
	name: "Test Item",
	category: "tops",
	color: "black",
	size: "M",
	brand: "Nike",
	material: "cotton",
	occasion: "casual",
	age: "new",
	care: "machine wash",
	...overrides,
});

const ITEMS: ClothingItem[] = [
	makeItem({ id: "1", name: "Blue Denim Jacket", brand: "Levi's", color: "blue", category: "tops" }),
	makeItem({ id: "2", name: "Red Floral Dress", brand: "Zara", color: "red", category: "dresses" }),
	makeItem({ id: "3", name: "White Cotton Tee", brand: "H&M", color: "white", category: "tops" }),
	makeItem({ id: "4", name: "Black Leather Boots", brand: "Dr. Martens", color: "black", category: "shoes" }),
	makeItem({ id: "5", name: "Green Cargo Pants", brand: "Carhartt", color: "green", category: "bottoms" }),
];

describe("useFuzzySearch", () => {
	afterEach(() => {
		vi.useRealTimers();
	});

	it("returns all items when query is empty", () => {
		const { result } = renderHook(() => useFuzzySearch());
		expect(result.current.searchResults(ITEMS)).toHaveLength(5);
	});

	it("starts with empty search query", () => {
		const { result } = renderHook(() => useFuzzySearch());
		expect(result.current.searchQuery).toBe("");
		expect(result.current.debouncedQuery).toBe("");
	});

	it("setSearchQuery updates searchQuery immediately", () => {
		const { result } = renderHook(() => useFuzzySearch());
		act(() => {
			result.current.setSearchQuery("denim");
		});
		expect(result.current.searchQuery).toBe("denim");
	});

	it("debouncedQuery updates after 300ms", async () => {
		vi.useFakeTimers();
		const { result } = renderHook(() => useFuzzySearch());

		act(() => {
			result.current.setSearchQuery("jacket");
		});
		expect(result.current.debouncedQuery).toBe("");

		await act(async () => {
			vi.advanceTimersByTime(300);
		});

		expect(result.current.debouncedQuery).toBe("jacket");
	});

	it("cancels previous debounce when query changes rapidly", async () => {
		vi.useFakeTimers();
		const { result } = renderHook(() => useFuzzySearch());

		act(() => {
			result.current.setSearchQuery("d");
		});
		act(() => {
			result.current.setSearchQuery("de");
		});
		act(() => {
			result.current.setSearchQuery("den");
		});

		await act(async () => {
			vi.advanceTimersByTime(300);
		});

		// Only the last value should be debounced
		expect(result.current.debouncedQuery).toBe("den");
	});

	it("searchResults finds items matching a name query after debounce", async () => {
		vi.useFakeTimers();
		const { result } = renderHook(() => useFuzzySearch());

		act(() => {
			result.current.setSearchQuery("denim");
		});
		await act(async () => {
			vi.advanceTimersByTime(300);
		});

		const found = result.current.searchResults(ITEMS);
		const ids = found.map((i) => i.id);
		expect(ids).toContain("1"); // "Blue Denim Jacket"
	});

	it("searchResults finds items by brand", async () => {
		vi.useFakeTimers();
		const { result } = renderHook(() => useFuzzySearch());

		act(() => {
			result.current.setSearchQuery("Zara");
		});
		await act(async () => {
			vi.advanceTimersByTime(300);
		});

		const found = result.current.searchResults(ITEMS);
		const ids = found.map((i) => i.id);
		expect(ids).toContain("2"); // Zara dress
	});

	it("searchResults returns empty array when no items match", async () => {
		vi.useFakeTimers();
		const { result } = renderHook(() => useFuzzySearch());

		act(() => {
			result.current.setSearchQuery("zzzzxxx");
		});
		await act(async () => {
			vi.advanceTimersByTime(300);
		});

		expect(result.current.searchResults(ITEMS)).toHaveLength(0);
	});

	it("getMatchKeys returns a map of item id to matched field keys", async () => {
		vi.useFakeTimers();
		const { result } = renderHook(() => useFuzzySearch());

		act(() => {
			result.current.setSearchQuery("Levi");
		});
		await act(async () => {
			vi.advanceTimersByTime(300);
		});

		const map = result.current.getMatchKeys(ITEMS);
		const keysForItem1 = map.get("1");
		expect(keysForItem1).toBeDefined();
		expect(keysForItem1).toContain("brand");
	});

	it("searching a color group surfaces items whose color normalizes to that group", async () => {
		vi.useFakeTimers();
		const items: ClothingItem[] = [
			makeItem({ id: "ch", name: "Coat", color: "chocolate" }),
			makeItem({ id: "be", name: "Scarf", color: "beige" }),
			makeItem({ id: "bl", name: "Tee", color: "blue" }),
		];
		const { result } = renderHook(() => useFuzzySearch());

		act(() => {
			result.current.setSearchQuery("brown");
		});
		await act(async () => {
			vi.advanceTimersByTime(300);
		});

		const ids = result.current.searchResults(items).map((i) => i.id);
		expect(ids).toContain("ch"); // chocolate → Brown
		expect(ids).toContain("be"); // beige → Brown
		expect(ids).not.toContain("bl"); // blue
	});

	it("searching a singular category finds its plural items", async () => {
		vi.useFakeTimers();
		const items: ClothingItem[] = [
			makeItem({ id: "d", name: "Gown", category: "dresses" }),
			makeItem({ id: "t", name: "Shirt", category: "tops" }),
		];
		const { result } = renderHook(() => useFuzzySearch());

		act(() => {
			result.current.setSearchQuery("dress");
		});
		await act(async () => {
			vi.advanceTimersByTime(300);
		});

		const ids = result.current.searchResults(items).map((i) => i.id);
		expect(ids).toContain("d");
	});

	it("getMatchKeys returns empty map for blank query", () => {
		const { result } = renderHook(() => useFuzzySearch());
		const map = result.current.getMatchKeys(ITEMS);
		expect(map.size).toBe(0);
	});

	it("handles empty items array without error", async () => {
		vi.useFakeTimers();
		const { result } = renderHook(() => useFuzzySearch());

		act(() => {
			result.current.setSearchQuery("anything");
		});
		await act(async () => {
			vi.advanceTimersByTime(300);
		});

		expect(() => result.current.searchResults([])).not.toThrow();
		expect(result.current.searchResults([])).toEqual([]);
	});
});
