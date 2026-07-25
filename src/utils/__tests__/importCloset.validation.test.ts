import { describe, it, expect } from "vitest";
import { importClosetFromJSON, finalizeSkippedRow } from "../importCloset";

/**
 * Regression test suite for bug #6 (no import validation).
 * Malformed imports can crash the card on render (e.g. material/notes not arrays).
 * `name` is the only truly required field (app's item identity); rows missing it
 * are skipped and reported rather than failing the whole import. Partial imports
 * with other fields missing are valid (defaults fill in).
 */

async function jsonFile(content: string): Promise<File> {
	return new File([content], "closet.json", { type: "application/json" });
}

describe("importCloset — validation", () => {
	it("skips a row missing name and reports it, importing the rest", async () => {
		const json = JSON.stringify([{ id: "x1", category: "tops", color: "black" }, { name: "Good Item" }]);
		const { items, skipped } = await importClosetFromJSON(await jsonFile(json));
		expect(items).toHaveLength(1);
		expect(items[0].name).toBe("Good Item");
		expect(skipped).toHaveLength(1);
		expect(skipped[0].index).toBe(1);
		expect(skipped[0].id).toBe("x1");
		expect(skipped[0].reason).toMatch(/name/i);
	});

	it("skips a row where name is an empty string", async () => {
		const json = JSON.stringify([{ name: "  ", category: "tops", brand: "Acme" }, { name: "Good Item" }]);
		const { items, skipped } = await importClosetFromJSON(await jsonFile(json));
		expect(items).toHaveLength(1);
		expect(skipped).toHaveLength(1);
		expect(skipped[0].reason).toMatch(/name/i);
	});

	it("succeeds with just a name (other fields optional)", async () => {
		const json = JSON.stringify([{ name: "T-shirt" }]);
		const { items, skipped } = await importClosetFromJSON(await jsonFile(json));
		expect(items).toHaveLength(1);
		expect(items[0].name).toBe("T-shirt");
		expect(skipped).toHaveLength(0);
		// Other fields are not auto-defaulted; they stay undefined (spread behavior)
		expect(items[0].category).toBeUndefined();
	});

	it("coerces material to an array (no crash on render)", async () => {
		// If material isn't an array, the card's `.map(m => ...)` would crash.
		const json = JSON.stringify([
			{ name: "Tee", material: "not an array" },
			{ name: "Shirt", material: null },
			{ name: "Top" }, // missing entirely
		]);
		const { items } = await importClosetFromJSON(await jsonFile(json));
		expect(items[0].material).toEqual([]);
		expect(items[1].material).toEqual([]);
		expect(items[2].material).toEqual([]);
	});

	it("coerces notes: string -> array, null -> undefined", async () => {
		const json = JSON.stringify([
			{ name: "Dress", notes: "single note" },
			{ name: "Skirt", notes: null },
		]);
		const { items } = await importClosetFromJSON(await jsonFile(json));
		// Single string is wrapped in an array
		expect(items[0].notes).toEqual(["single note"]);
		// null or missing stays undefined
		expect(items[1].notes).toBeUndefined();
	});

	it("preserves numeric price on import", async () => {
		const json = JSON.stringify([{ name: "Coat", price: 99.99 }]);
		const { items } = await importClosetFromJSON(await jsonFile(json));
		expect(items[0].price).toBe(99.99);
		expect(typeof items[0].price).toBe("number");
	});

	it("throws when every row is missing a name (nothing to import)", async () => {
		const json = JSON.stringify([{ color: "red" }, { color: "blue" }]);
		await expect(importClosetFromJSON(await jsonFile(json))).rejects.toThrow(/no valid closet items/i);
	});

	it("reports the row index and id for each identifiable skipped row", async () => {
		const json = JSON.stringify([
			{ name: "Good" },
			{ id: "bad-1", category: "tops", brand: "Acme" },
			{ name: "Also Good" },
			{ id: "bad-2", category: "dress", color: "blue" },
		]);
		const { items, skipped } = await importClosetFromJSON(await jsonFile(json));
		expect(items).toHaveLength(2);
		expect(skipped).toEqual([
			{ index: 2, id: "bad-1", reason: expect.stringMatching(/name/i), record: { id: "bad-1", category: "tops", brand: "Acme" } },
			{ index: 4, id: "bad-2", reason: expect.stringMatching(/name/i), record: { id: "bad-2", category: "dress", color: "blue" } },
		]);
	});

	it("silently drops rows with only id/condition/purchaseDate — nothing to identify them by", async () => {
		const json = JSON.stringify([
			{ name: "Good Item" },
			{ id: "bad-1" },
			{ condition: "good", purchaseDate: "2024-01-01" },
			{ category: "tops" }, // category alone still isn't enough to identify the item
		]);
		const { items, skipped } = await importClosetFromJSON(await jsonFile(json));
		expect(items).toHaveLength(1);
		expect(skipped).toHaveLength(0);
	});

	it("shows a row with category + one identifying field (color/size/material/brand/imageURL)", async () => {
		const json = JSON.stringify([
			{ category: "tops", color: "red" },
			{ category: "bottoms", size: "M" },
			{ category: "dress", material: [{ material: "cotton", percentage: 100 }] },
			{ category: "shoes", brand: "Zara" },
			{ category: "coat", imageURL: "http://example.com/a.jpg" },
			{ name: "Good Item" },
		]);
		const { items, skipped } = await importClosetFromJSON(await jsonFile(json));
		expect(items).toHaveLength(1);
		expect(skipped).toHaveLength(5);
	});
});

describe("finalizeSkippedRow", () => {
	it("returns null when the supplied name is blank or whitespace", () => {
		const row = { index: 1, id: "bad-1", reason: "missing a required 'name' field", record: { id: "bad-1", category: "tops" } };
		expect(finalizeSkippedRow(row, "")).toBeNull();
		expect(finalizeSkippedRow(row, "   ")).toBeNull();
	});

	it("normalizes the row into a ClothingItem once given a name", () => {
		const row = {
			index: 1,
			id: "bad-1",
			reason: "missing a required 'name' field",
			record: { id: "bad-1", category: "tops", material: "not an array", notes: "single note" },
		};
		const item = finalizeSkippedRow(row, "  Fixed Name  ");
		expect(item).not.toBeNull();
		expect(item!.name).toBe("Fixed Name");
		expect(item!.id).toBe("bad-1");
		expect(item!.category).toBe("tops");
		// Reuses the same coercion as normal imports.
		expect(item!.material).toEqual([]);
		expect(item!.notes).toEqual(["single note"]);
	});

	it("generates an id when the raw record had none", () => {
		const row = { index: 1, reason: "missing a required 'name' field", record: {} };
		const item = finalizeSkippedRow(row, "New Item");
		expect(item!.id).toBeTruthy();
	});
});
