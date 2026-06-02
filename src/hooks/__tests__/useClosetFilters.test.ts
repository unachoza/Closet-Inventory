import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import { useClosetFilters } from "../useClosetFilters";
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

const CLOSET: ClothingItem[] = [
	makeItem({ id: "1", category: "tops", color: "black", brand: "Nike", material: "cotton", occasion: "casual" }),
	makeItem({ id: "2", category: "bottoms", color: "blue", brand: "Levi's", material: "denim", occasion: "casual" }),
	makeItem({ id: "3", category: "tops", color: "white", brand: "Zara", material: "cotton", occasion: "formal" }),
	makeItem({ id: "4", category: "dresses", color: "red", brand: "Zara", material: "silk", occasion: "formal" }),
	makeItem({ id: "5", category: "bottoms", color: "black", brand: "Nike", material: "polyester", occasion: "active" }),
];

describe("useClosetFilters", () => {
	it("returns all items when no filters are active", () => {
		const { result } = renderHook(() => useClosetFilters(CLOSET));
		expect(result.current.filteredItems).toHaveLength(5);
	});

	it("starts with zero active filters", () => {
		const { result } = renderHook(() => useClosetFilters(CLOSET));
		expect(result.current.activeFilterCount).toBe(0);
	});

	it("toggleFilter adds a filter value", () => {
		const { result } = renderHook(() => useClosetFilters(CLOSET));
		act(() => {
			result.current.toggleFilter("category", "tops");
		});
		expect(result.current.filters.category).toContain("tops");
		expect(result.current.activeFilterCount).toBe(1);
	});

	it("toggleFilter removes an already-active filter value", () => {
		const { result } = renderHook(() => useClosetFilters(CLOSET));
		act(() => {
			result.current.toggleFilter("category", "tops");
		});
		act(() => {
			result.current.toggleFilter("category", "tops");
		});
		expect(result.current.filters.category).not.toContain("tops");
		expect(result.current.activeFilterCount).toBe(0);
	});

	it("filters items by a single dimension (category)", () => {
		const { result } = renderHook(() => useClosetFilters(CLOSET));
		act(() => {
			result.current.toggleFilter("category", "tops");
		});
		const ids = result.current.filteredItems.map((i) => i.id);
		expect(ids).toContain("1");
		expect(ids).toContain("3");
		expect(ids).not.toContain("2");
		expect(ids).not.toContain("4");
	});

	it("OR logic within a dimension: selecting two colors returns items of either", () => {
		const { result } = renderHook(() => useClosetFilters(CLOSET));
		act(() => {
			result.current.toggleFilter("color", "black");
			result.current.toggleFilter("color", "white");
		});
		const ids = result.current.filteredItems.map((i) => i.id);
		expect(ids).toContain("1"); // black
		expect(ids).toContain("3"); // white
		expect(ids).toContain("5"); // black
		expect(ids).not.toContain("2"); // blue
	});

	it("AND logic across dimensions: category=tops AND color=black", () => {
		const { result } = renderHook(() => useClosetFilters(CLOSET));
		act(() => {
			result.current.toggleFilter("category", "tops");
			result.current.toggleFilter("color", "black");
		});
		const ids = result.current.filteredItems.map((i) => i.id);
		expect(ids).toContain("1"); // tops + black
		expect(ids).not.toContain("3"); // tops but white
		expect(ids).not.toContain("5"); // black but bottoms
	});

	it("clearDimension removes all selections for that dimension", () => {
		const { result } = renderHook(() => useClosetFilters(CLOSET));
		act(() => {
			result.current.toggleFilter("category", "tops");
			result.current.toggleFilter("category", "bottoms");
		});
		expect(result.current.filters.category).toHaveLength(2);
		act(() => {
			result.current.clearDimension("category");
		});
		expect(result.current.filters.category).toHaveLength(0);
	});

	it("clearAll resets all filters and returns all items", () => {
		const { result } = renderHook(() => useClosetFilters(CLOSET));
		act(() => {
			result.current.toggleFilter("category", "tops");
			result.current.toggleFilter("color", "black");
			result.current.toggleFilter("brand", "Nike");
		});
		expect(result.current.activeFilterCount).toBe(3);
		act(() => {
			result.current.clearAll();
		});
		expect(result.current.activeFilterCount).toBe(0);
		expect(result.current.filteredItems).toHaveLength(5);
	});

	it("filterOptions includes all unique values with correct counts", () => {
		const { result } = renderHook(() => useClosetFilters(CLOSET));
		const catOptions = result.current.filterOptions.category;
		const categoryMap = Object.fromEntries(catOptions.map((o) => [o.value, o.count]));
		expect(categoryMap["tops"]).toBe(2);
		expect(categoryMap["bottoms"]).toBe(2);
		expect(categoryMap["dresses"]).toBe(1);
	});

	it("filterOptions are sorted alphabetically", () => {
		const { result } = renderHook(() => useClosetFilters(CLOSET));
		const brands = result.current.filterOptions.brand.map((o) => o.value);
		expect(brands).toEqual([...brands].sort());
	});

	it("groups color variants under one option (brown / Brown / brown / taupe → Brown)", () => {
		const browns: ClothingItem[] = [
			makeItem({ id: "b1", color: "brown" }),
			makeItem({ id: "b2", color: "Brown" }),
			makeItem({ id: "b3", color: "brown / taupe" }),
		];
		const { result } = renderHook(() => useClosetFilters(browns));
		const colorOptions = result.current.filterOptions.color;
		const brownOption = colorOptions.find((o) => o.value === "Brown");
		expect(brownOption).toBeDefined();
		expect(brownOption?.count).toBe(3);
	});

	it("selecting the Brown color group matches all brown variants regardless of case/wording", () => {
		const browns: ClothingItem[] = [
			makeItem({ id: "b1", color: "brown" }),
			makeItem({ id: "b2", color: "Brown" }),
			makeItem({ id: "b3", color: "brown / taupe" }),
			makeItem({ id: "x", color: "blue" }),
		];
		const { result } = renderHook(() => useClosetFilters(browns));
		act(() => {
			result.current.toggleFilter("color", "Brown");
		});
		const ids = result.current.filteredItems.map((i) => i.id);
		expect(ids).toEqual(["b1", "b2", "b3"]);
	});

	it("matches a multi-color item by either its primary or secondary color", () => {
		const items: ClothingItem[] = [
			makeItem({ id: "m1", color: "blue / white" }),
			makeItem({ id: "m2", color: "red" }),
		];
		const { result } = renderHook(() => useClosetFilters(items));

		act(() => {
			result.current.toggleFilter("color", "Blue");
		});
		expect(result.current.filteredItems.map((i) => i.id)).toEqual(["m1"]);

		act(() => {
			result.current.clearAll();
			result.current.toggleFilter("color", "White");
		});
		expect(result.current.filteredItems.map((i) => i.id)).toEqual(["m1"]);
	});

	it("lists both colors of a multi-color item as separate options", () => {
		const items: ClothingItem[] = [makeItem({ id: "m1", color: "blue / white" })];
		const { result } = renderHook(() => useClosetFilters(items));
		const colorValues = result.current.filterOptions.color.map((o) => o.value);
		expect(colorValues).toContain("Blue");
		expect(colorValues).toContain("White");
	});

	it("groups singular and plural category variants under one option", () => {
		const items: ClothingItem[] = [
			makeItem({ id: "c1", category: "dress" }),
			makeItem({ id: "c2", category: "dresses" }),
			makeItem({ id: "c3", category: "top" }),
			makeItem({ id: "c4", category: "tops" }),
		];
		const { result } = renderHook(() => useClosetFilters(items));
		const counts = Object.fromEntries(result.current.filterOptions.category.map((o) => [o.value, o.count]));
		expect(counts["dresses"]).toBe(2);
		expect(counts["tops"]).toBe(2);
	});

	it("selecting a category matches both its singular and plural items", () => {
		const items: ClothingItem[] = [
			makeItem({ id: "c1", category: "dress" }),
			makeItem({ id: "c2", category: "dresses" }),
			makeItem({ id: "c3", category: "tops" }),
		];
		const { result } = renderHook(() => useClosetFilters(items));
		act(() => {
			result.current.toggleFilter("category", "dresses");
		});
		expect(result.current.filteredItems.map((i) => i.id)).toEqual(["c1", "c2"]);
	});

	it("returns no items when filters match nothing", () => {
		const { result } = renderHook(() => useClosetFilters(CLOSET));
		act(() => {
			result.current.toggleFilter("category", "tops");
			result.current.toggleFilter("color", "red"); // no tops are red
		});
		expect(result.current.filteredItems).toHaveLength(0);
	});

	describe("material dimension", () => {
		it("surfaces bare fiber names without percentages", () => {
			const items: ClothingItem[] = [
				makeItem({ id: "m1", material: "linen 100%" }),
				makeItem({ id: "m2", material: "68% viscose, 32% cotton" }),
			];
			const { result } = renderHook(() => useClosetFilters(items));
			const values = result.current.filterOptions.material.map((o) => o.value);
			expect(values).toContain("Linen");
			expect(values).toContain("Viscose");
			expect(values).toContain("Cotton");
			// No percentage noise like "Linen 100" / "Viscose 68"
			expect(values.some((v) => /\d/.test(v))).toBe(false);
		});

		it("groups a fiber across different blend wordings under one option", () => {
			const items: ClothingItem[] = [
				makeItem({ id: "m1", material: "100% cotton" }),
				makeItem({ id: "m2", material: "80% Cotton, 20% Spandex" }),
			];
			const { result } = renderHook(() => useClosetFilters(items));
			const counts = Object.fromEntries(result.current.filterOptions.material.map((o) => [o.value, o.count]));
			expect(counts["Cotton"]).toBe(2);
			expect(counts["Spandex"]).toBe(1);
		});

		it("filters items by a fiber regardless of its percentage in the blend", () => {
			const items: ClothingItem[] = [
				makeItem({ id: "m1", material: "95% Cotton, 5% Spandex" }),
				makeItem({ id: "m2", material: "100% silk" }),
			];
			const { result } = renderHook(() => useClosetFilters(items));
			act(() => {
				result.current.toggleFilter("material", "Cotton");
			});
			expect(result.current.filteredItems.map((i) => i.id)).toEqual(["m1"]);
		});
	});

	describe("care dimension", () => {
		it("buckets messy care strings into three canonical options", () => {
			const items: ClothingItem[] = [
				makeItem({ id: "1", care: "machine wash cold" }),
				makeItem({ id: "2", care: "wash like colors" }),
				makeItem({ id: "3", care: "hand wash cold" }),
				makeItem({ id: "4", care: "dry clean only" }),
				makeItem({ id: "5", care: ["cold water", "hang dry"] }),
			];
			const { result } = renderHook(() => useClosetFilters(items));
			const counts = Object.fromEntries(result.current.filterOptions.care.map((o) => [o.value, o.count]));
			expect(counts["Machine Wash"]).toBe(3); // items 1, 2, 5 (cold water)
			expect(counts["Hand Wash"]).toBe(1); // item 3
			expect(counts["Dry Clean"]).toBe(1); // item 4
			// "hang dry" alone contributes no stray option
			expect(result.current.filterOptions.care.map((o) => o.value).sort()).toEqual([
				"Dry Clean",
				"Hand Wash",
				"Machine Wash",
			]);
		});

		it("filters items by a bucketed care method", () => {
			const items: ClothingItem[] = [
				makeItem({ id: "1", care: "hand wash cold" }),
				makeItem({ id: "2", care: "machine wash" }),
				makeItem({ id: "3", care: "hand wash" }),
			];
			const { result } = renderHook(() => useClosetFilters(items));
			act(() => {
				result.current.toggleFilter("care", "Hand Wash");
			});
			expect(result.current.filteredItems.map((i) => i.id)).toEqual(["1", "3"]);
		});

		it("ignores empty care values", () => {
			const items: ClothingItem[] = [makeItem({ id: "1", care: "" })];
			const { result } = renderHook(() => useClosetFilters(items));
			expect(result.current.filterOptions.care).toHaveLength(0);
		});
	});
});
