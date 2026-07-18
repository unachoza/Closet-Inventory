import { describe, it, expect } from "vitest";
import { groupItemsByLocation } from "../locationGroups";
import { LOCATIONS } from "../locations";
import { ClothingItem } from "../types";

function makeItem(overrides: Partial<ClothingItem>): ClothingItem {
	return {
		id: overrides.id ?? crypto.randomUUID(),
		imageURL: "",
		name: "item",
		category: "tops",
		color: "blue",
		size: "M",
		brand: "",
		material: [],
		occasion: "",
		age: "",
		condition: "new",
		care: "",
		onSale: false,
		notes: [],
		...overrides,
	};
}

describe("groupItemsByLocation", () => {
	it("returns one group per known location, primary first", () => {
		const groups = groupItemsByLocation([], LOCATIONS);
		expect(groups.map((g) => g.location.id)).toEqual(["home", "other", "storage", "suitcase"]);
	});

	it("counts items into their assigned location group", () => {
		const items = [
			makeItem({ id: "1", locationId: "storage" }),
			makeItem({ id: "2", locationId: "storage" }),
			makeItem({ id: "3", locationId: "suitcase" }),
		];
		const groups = groupItemsByLocation(items, LOCATIONS);
		const byId = new Map(groups.map((g) => [g.location.id, g.items.length]));
		expect(byId.get("storage")).toBe(2);
		expect(byId.get("suitcase")).toBe(1);
		expect(byId.get("home")).toBe(0);
		expect(byId.get("other")).toBe(0);
	});

	it("falls back items with no locationId to the primary group", () => {
		const items = [makeItem({ id: "1" })];
		const groups = groupItemsByLocation(items, LOCATIONS);
		const home = groups.find((g) => g.location.id === "home");
		expect(home?.items.map((i) => i.id)).toEqual(["1"]);
	});

	it("falls back items with an unknown/deleted locationId to the primary group", () => {
		const items = [makeItem({ id: "1", locationId: "no-longer-exists" })];
		const groups = groupItemsByLocation(items, LOCATIONS);
		const home = groups.find((g) => g.location.id === "home");
		expect(home?.items.map((i) => i.id)).toEqual(["1"]);
	});

	it("returns no groups when there are no locations", () => {
		expect(groupItemsByLocation([], [])).toEqual([]);
	});
});
