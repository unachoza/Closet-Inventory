import { renderHook, act } from "@testing-library/react";
import { describe, it, expect } from "vitest";
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
	material: [{ material: "cotton", percentage: 100 }],
	occasion: "casual",
	age: "new",
	care: "machine wash",
	...overrides,
});

const CLOSET: ClothingItem[] = [
	makeItem({ id: "1", category: "tops", color: "black", brand: "Nike", material: [{ material: "cotton", percentage: 100 }], occasion: "casual" }),
	makeItem({ id: "2", category: "bottoms", color: "blue", brand: "Levi's", material: [{ material: "denim", percentage: 100 }], occasion: "casual" }),
	makeItem({ id: "3", category: "tops", color: "white", brand: "Zara", material: [{ material: "cotton", percentage: 100 }], occasion: "formal" }),
	makeItem({ id: "4", category: "dresses", color: "red", brand: "Zara", material: [{ material: "silk", percentage: 100 }], occasion: "formal" }),
	makeItem({ id: "5", category: "bottoms", color: "black", brand: "Nike", material: [{ material: "polyester", percentage: 100 }], occasion: "active" }),
];

describe("useClosetFilters", () => {
	// Care is free-text; the filter indexes canonical labels and must match
	// compound entries that list multiple instructions.
	const CARE_CLOSET: ClothingItem[] = [
		makeItem({ id: "dc", care: "Dry clean only" }),
		makeItem({ id: "mw", care: "machine wash cold" }),
		makeItem({ id: "both", care: "machine wash, dry clean acceptable" }),
		makeItem({ id: "hw", care: "hand wash" }),
	];

	describe("care dimension", () => {
		it("offers canonical care labels as filter options", () => {
			const { result } = renderHook(() => useClosetFilters(CARE_CLOSET));
			const labels = result.current.filterOptions.care.map((o) => o.value);
			expect(labels).toContain("Dry clean");
			expect(labels).toContain("Machine wash");
			expect(labels).toContain("Hand wash");
		});

		it("filtering by 'Dry clean' keeps dry-clean items, including compound-care entries", () => {
			const { result } = renderHook(() => useClosetFilters(CARE_CLOSET));
			act(() => {
				result.current.toggleFilter("care", "Dry clean");
			});
			const ids = result.current.filteredItems.map((i) => i.id).sort();
			expect(ids).toEqual(["both", "dc"]); // pure dry-clean + the compound one
		});
	});

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
});

describe("useClosetFilters — material (MaterialBlend[])", () => {
	const blend = (material: string, percentage: number) => ({ material, percentage });

	const items: ClothingItem[] = [
		makeItem({ id: "m1", material: [blend("cotton", 95), blend("elastane", 5)] }),
		makeItem({ id: "m2", material: [blend("cotton", 60), blend("modal", 35), blend("elastane", 5)] }),
		makeItem({ id: "m3", material: [blend("silk", 100)] }),
		makeItem({ id: "m4", material: [blend("polyester", 61), blend("nylon", 30), blend("elastane", 9)] }),
	];

	it("shows material names without percentages in filterOptions", () => {
		const { result } = renderHook(() => useClosetFilters(items));
		const matValues = result.current.filterOptions.material.map((o) => o.value);
		// Should be clean names, not "Cotton 95" or "Elastane 5"
		expect(matValues).toContain("Cotton");
		expect(matValues).toContain("Silk");
		expect(matValues).not.toContain("Cotton 95");
		expect(matValues).not.toContain("Elastane 5");
	});

	it("skips fibers at or below 6% when no item has them above threshold", () => {
		// Items where spandex appears only at 4% — below threshold, should never surface
		const lowItems: ClothingItem[] = [
			makeItem({ id: "low1", material: [{ material: "cotton", percentage: 96 }, { material: "spandex", percentage: 4 }] }),
			makeItem({ id: "low2", material: [{ material: "modal", percentage: 96 }, { material: "spandex", percentage: 4 }] }),
		];
		const { result } = renderHook(() => useClosetFilters(lowItems));
		const matValues = result.current.filterOptions.material.map((o) => o.value);
		expect(matValues).not.toContain("Spandex");
		expect(matValues).toContain("Cotton");
		expect(matValues).toContain("Modal");
	});

	it("includes fibers above 6% and maps to canonical name (9% elastane → Spandex)", () => {
		const { result } = renderHook(() => useClosetFilters(items));
		const matValues = result.current.filterOptions.material.map((o) => o.value);
		// item m4 has 9% elastane — above threshold; elastane → canonical "Spandex"
		expect(matValues).toContain("Spandex");
		expect(matValues).not.toContain("Elastane");
	});

	it("filtering by cotton returns items that have cotton > 6%", () => {
		const { result } = renderHook(() => useClosetFilters(items));
		act(() => result.current.toggleFilter("material", "Cotton"));
		const ids = result.current.filteredItems.map((i) => i.id);
		expect(ids).toContain("m1"); // 95% cotton
		expect(ids).toContain("m2"); // 60% cotton
		expect(ids).not.toContain("m3"); // silk only
		expect(ids).not.toContain("m4"); // no cotton
	});

	it("counts reflect how many items contain that material above threshold", () => {
		const { result } = renderHook(() => useClosetFilters(items));
		const cottonOption = result.current.filterOptions.material.find((o) => o.value === "Cotton");
		expect(cottonOption?.count).toBe(2); // m1 and m2
	});

	it("filters correctly when items have MaterialBlend[]", () => {
		const items: ClothingItem[] = [
			makeItem({ id: "l1", material: [{ material: "silk", percentage: 100 }] }),
			makeItem({ id: "l2", material: [{ material: "cotton", percentage: 100 }] }),
		];
		const { result } = renderHook(() => useClosetFilters(items));
		act(() => result.current.toggleFilter("material", "Silk"));
		expect(result.current.filteredItems.map((i) => i.id)).toEqual(["l1"]);
	});
});

// P1-8 — status + location filter dimensions.
describe("status dimension", () => {
	const STATUS_CLOSET: ClothingItem[] = [
		makeItem({ id: "s1", status: "clean" }),
		makeItem({ id: "s2", status: "dirty" }),
		makeItem({ id: "s3", status: "at_cleaner" }),
		makeItem({ id: "s4" }), // absent status → treated as clean, per statusTransitions convention
	];

	it("offers humanized status labels ('at_cleaner' → 'At cleaner')", () => {
		const { result } = renderHook(() => useClosetFilters(STATUS_CLOSET));
		const labels = result.current.filterOptions.status.map((o) => o.value);
		expect(labels).toContain("Clean");
		expect(labels).toContain("Dirty");
		expect(labels).toContain("At cleaner");
	});

	it("an item with no status counts under 'Clean'", () => {
		const { result } = renderHook(() => useClosetFilters(STATUS_CLOSET));
		const cleanOption = result.current.filterOptions.status.find((o) => o.value === "Clean");
		expect(cleanOption?.count).toBe(2); // s1 + s4 (absent)
	});

	it("filtering by 'Dirty' returns only dirty items", () => {
		const { result } = renderHook(() => useClosetFilters(STATUS_CLOSET));
		act(() => result.current.toggleFilter("status", "Dirty"));
		expect(result.current.filteredItems.map((i) => i.id)).toEqual(["s2"]);
	});
});

describe("location dimension", () => {
	const LOCATION_CLOSET: ClothingItem[] = [
		makeItem({ id: "l1", locationId: "home" }),
		makeItem({ id: "l2", locationId: "suitcase" }),
		makeItem({ id: "l3" }), // absent locationId → primary/home, per locations.ts convention
	];

	it("offers location labels resolved via the default registry", () => {
		const { result } = renderHook(() => useClosetFilters(LOCATION_CLOSET));
		const labels = result.current.filterOptions.location.map((o) => o.value);
		expect(labels).toContain("Home");
		expect(labels).toContain("Suitcase");
	});

	it("an item with no locationId counts under 'Home' (primary default)", () => {
		const { result } = renderHook(() => useClosetFilters(LOCATION_CLOSET));
		const homeOption = result.current.filterOptions.location.find((o) => o.value === "Home");
		expect(homeOption?.count).toBe(2); // l1 + l3 (absent)
	});

	it("filtering by 'Suitcase' returns only suitcase items", () => {
		const { result } = renderHook(() => useClosetFilters(LOCATION_CLOSET));
		act(() => result.current.toggleFilter("location", "Suitcase"));
		expect(result.current.filteredItems.map((i) => i.id)).toEqual(["l2"]);
	});

	it("accepts an optional resolver so a live per-user locations context can override labels", () => {
		const customResolver = (id?: string) => (id === "custom-uuid" ? "Aspen house" : "Home");
		const items: ClothingItem[] = [makeItem({ id: "c1", locationId: "custom-uuid" })];
		const { result } = renderHook(() => useClosetFilters(items, customResolver));
		expect(result.current.filterOptions.location.map((o) => o.value)).toEqual(["Aspen house"]);
	});
});
