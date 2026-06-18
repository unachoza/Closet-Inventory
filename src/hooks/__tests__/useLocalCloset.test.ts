import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import { useLocalStorageCloset as useLocalStorageClosetBase } from "../useLocalCloset";
import type { ClothingItem } from "../../utils/types";

const STORAGE_KEY = "my_closet_key";

const makeItem = (overrides: Partial<ClothingItem> = {}): ClothingItem => ({
	id: "test-id",
	imageURL: "",
	name: "Nike Tops",
	category: "tops",
	color: "black",
	size: "M",
	brand: "Nike",
	material: [{ material: "cotton", percentage: 100 }],
	occasion: "casual",
	age: "1 year",
	care: "machine wash",
	...overrides,
});

beforeEach(() => {
	// Start each test with an empty closet so MY_CLOSET_DATA seed data doesn't interfere
	localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
});

describe("useLocalStorageClosetBase", () => {
	it("addFullItem appends an item and persists it", () => {
		const { result } = renderHook(() => useLocalStorageClosetBase());
		const item = makeItem({ id: "a1" });

		act(() => result.current.addFullItem(item));

		expect(result.current.closet).toHaveLength(1);
		expect(result.current.closet[0].id).toBe("a1");
		expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toHaveLength(1);
	});

	it("addItem assigns a new UUID and appends the item", () => {
		const { result } = renderHook(() => useLocalStorageClosetBase());

		act(() => {
			result.current.addItem({
				id: "",
				category: "dresses",
				color: "red",
				size: "S",
				brand: "Zara",
				material: [{ material: "silk", percentage: 100 }],
				occasion: "formal",
				age: "new",
				care: "dry clean",
			});
		});

		expect(result.current.closet).toHaveLength(1);
		expect(result.current.closet[0].id).toBeTruthy();
		expect(result.current.closet[0].category).toBe("dresses");
	});

	it("removeItem deletes the item by id and persists the change", () => {
		const { result } = renderHook(() => useLocalStorageClosetBase());
		act(() => result.current.addFullItem(makeItem({ id: "del-1" })));
		act(() => result.current.addFullItem(makeItem({ id: "del-2" })));

		act(() => result.current.removeItem("del-1"));

		expect(result.current.closet).toHaveLength(1);
		expect(result.current.closet[0].id).toBe("del-2");
		expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toHaveLength(1);
	});

	it("updateItem merges partial data onto the target item", () => {
		const { result } = renderHook(() => useLocalStorageClosetBase());
		act(() => result.current.addFullItem(makeItem({ id: "upd-1", color: "black" })));

		act(() => result.current.updateItem("upd-1", { color: "white", brand: "Levi's" }));

		const updated = result.current.closet.find((i) => i.id === "upd-1");
		expect(updated?.color).toBe("white");
		expect(updated?.brand).toBe("Levi's");
		// other fields unchanged
		expect(updated?.category).toBe("tops");
	});

	it("updateItem does not affect other items in the closet", () => {
		const { result } = renderHook(() => useLocalStorageClosetBase());
		act(() => result.current.addFullItem(makeItem({ id: "a" })));
		act(() => result.current.addFullItem(makeItem({ id: "b", color: "blue" })));

		act(() => result.current.updateItem("a", { color: "pink" }));

		const itemB = result.current.closet.find((i) => i.id === "b");
		expect(itemB?.color).toBe("blue");
	});

	it("clearCloset empties state and removes the localStorage key", () => {
		const { result } = renderHook(() => useLocalStorageClosetBase());
		act(() => result.current.addFullItem(makeItem({ id: "c1" })));

		act(() => result.current.clearCloset());

		expect(result.current.closet).toHaveLength(0);
		// useLocalStorage's effect re-writes the key with [] after removal — check the value is empty
		const stored = localStorage.getItem(STORAGE_KEY);
		expect(stored === null || stored === "[]").toBe(true);
	});

	it("getCloset reads directly from localStorage, independent of state", () => {
		const items = [makeItem({ id: "direct" })];
		localStorage.setItem(STORAGE_KEY, JSON.stringify(items));

		const { result } = renderHook(() => useLocalStorageClosetBase());
		const direct = result.current.getCloset();

		expect(direct).toHaveLength(1);
		expect(direct[0].id).toBe("direct");
	});

	it("normalises legacy string material fields to MaterialBlend[] on read", () => {
		const legacyItem = { ...makeItem({ id: "legacy" }), material: "cotton" } as any;
		localStorage.setItem(STORAGE_KEY, JSON.stringify([legacyItem]));

		const { result } = renderHook(() => useLocalStorageClosetBase());

		expect(result.current.closet[0].material).toEqual([{ material: "cotton", percentage: 100 }]);
	});

	describe("reorderItems", () => {
		const seedThree = (result: { current: ReturnType<typeof useLocalStorageClosetBase> }) => {
			act(() => result.current.addFullItem(makeItem({ id: "a" })));
			act(() => result.current.addFullItem(makeItem({ id: "b" })));
			act(() => result.current.addFullItem(makeItem({ id: "c" })));
		};

		it("moves an item to a later position and persists the new order", () => {
			const { result } = renderHook(() => useLocalStorageClosetBase());
			seedThree(result);

			// Drag "a" onto "c" → a slides after b (arrayMove semantics: [b, c, a]).
			act(() => result.current.reorderItems("a", "c"));

			expect(result.current.closet.map((i) => i.id)).toEqual(["b", "c", "a"]);
			expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!).map((i: ClothingItem) => i.id)).toEqual(["b", "c", "a"]);
		});

		it("moves an item to an earlier position", () => {
			const { result } = renderHook(() => useLocalStorageClosetBase());
			seedThree(result);

			// Drag "c" onto "a" → [c, a, b].
			act(() => result.current.reorderItems("c", "a"));

			expect(result.current.closet.map((i) => i.id)).toEqual(["c", "a", "b"]);
		});

		it("is a no-op when active and over ids are the same", () => {
			const { result } = renderHook(() => useLocalStorageClosetBase());
			seedThree(result);

			act(() => result.current.reorderItems("b", "b"));

			expect(result.current.closet.map((i) => i.id)).toEqual(["a", "b", "c"]);
		});

		it("is a no-op when either id is not in the closet", () => {
			const { result } = renderHook(() => useLocalStorageClosetBase());
			seedThree(result);

			act(() => result.current.reorderItems("a", "missing"));
			expect(result.current.closet.map((i) => i.id)).toEqual(["a", "b", "c"]);

			act(() => result.current.reorderItems("missing", "a"));
			expect(result.current.closet.map((i) => i.id)).toEqual(["a", "b", "c"]);
		});

		it("does not mutate the previous closet array (immutability)", () => {
			const { result } = renderHook(() => useLocalStorageClosetBase());
			seedThree(result);
			const before = result.current.closet;

			act(() => result.current.reorderItems("a", "c"));

			// Original reference still holds the original order.
			expect(before.map((i) => i.id)).toEqual(["a", "b", "c"]);
			expect(result.current.closet).not.toBe(before);
		});
	});
});
