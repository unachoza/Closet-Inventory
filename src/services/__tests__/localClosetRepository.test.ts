import { beforeEach, describe, expect, it } from "vitest";
import { LocalClosetRepository } from "../localClosetRepository";
import type { ClothingItem } from "../../utils/types";

const STORAGE_KEY = "my_closet_key";

function makeItem(overrides: Partial<ClothingItem> = {}): ClothingItem {
	return {
		id: crypto.randomUUID(),
		imageURL: "",
		name: "Test Top",
		category: "tops",
		color: "black",
		size: "M",
		brand: "Acme",
		material: [{ material: "cotton", percentage: 100 }],
		occasion: "casual",
		care: "machine wash",
		...overrides,
	};
}

describe("LocalClosetRepository", () => {
	let repo: LocalClosetRepository;

	beforeEach(() => {
		localStorage.clear();
		repo = new LocalClosetRepository();
	});

	it("returns an empty closet when storage is empty", async () => {
		expect(await repo.getAll()).toEqual([]);
	});

	it("adds an item and reads it back", async () => {
		const item = makeItem({ name: "Blue Jeans" });
		await repo.add(item);
		const all = await repo.getAll();
		expect(all).toHaveLength(1);
		expect(all[0].name).toBe("Blue Jeans");
	});

	it("getById finds an existing item and returns null otherwise", async () => {
		const item = makeItem();
		await repo.add(item);
		expect(await repo.getById(item.id)).not.toBeNull();
		expect(await repo.getById("missing")).toBeNull();
	});

	it("updates an item immutably and persists the change", async () => {
		const item = makeItem({ brand: "Acme" });
		await repo.add(item);
		const updated = await repo.update(item.id, { brand: "Beta" });
		expect(updated?.brand).toBe("Beta");
		expect((await repo.getById(item.id))?.brand).toBe("Beta");
	});

	it("returns null when updating a missing item", async () => {
		expect(await repo.update("missing", { brand: "X" })).toBeNull();
	});

	it("removes an item", async () => {
		const item = makeItem();
		await repo.add(item);
		await repo.remove(item.id);
		expect(await repo.getAll()).toEqual([]);
	});

	it("imports in replace mode, swapping the whole closet", async () => {
		await repo.add(makeItem({ name: "Old" }));
		const incoming = [makeItem({ name: "New A" }), makeItem({ name: "New B" })];
		await repo.importItems(incoming, "replace");
		const names = (await repo.getAll()).map((i) => i.name);
		expect(names).toEqual(["New A", "New B"]);
	});

	it("imports in merge mode, appending to the closet", async () => {
		await repo.add(makeItem({ name: "Existing" }));
		await repo.importItems([makeItem({ name: "Added" })], "merge");
		const names = (await repo.getAll()).map((i) => i.name);
		expect(names).toEqual(["Existing", "Added"]);
	});

	it("normalizes legacy string material on read", async () => {
		// Simulate legacy data written directly as a string material.
		const legacy = { ...makeItem(), material: "100% cotton" } as unknown as ClothingItem;
		localStorage.setItem(STORAGE_KEY, JSON.stringify([legacy]));
		const [item] = await repo.getAll();
		expect(Array.isArray(item.material)).toBe(true);
	});

	it("clears the closet", async () => {
		await repo.add(makeItem());
		await repo.clear();
		expect(await repo.getAll()).toEqual([]);
	});
});
