import { describe, it, expect } from "vitest";
import { importClosetFromJSON } from "../importCloset";

/**
 * Regression test suite for bug #6 (no import validation).
 * Malformed imports can crash the card on render (e.g. material/notes not arrays).
 * `name` is the only truly required field (app's item identity); partial imports
 * with other fields missing are valid (defaults fill in).
 */

async function jsonFile(content: string): Promise<File> {
	return new File([content], "closet.json", { type: "application/json" });
}

describe("importCloset — validation", () => {
	it("fails fast when name is missing", async () => {
		const json = JSON.stringify([{ id: "x1", category: "tops", color: "black" }]);
		await expect(importClosetFromJSON(await jsonFile(json))).rejects.toThrow(/name/i);
	});

	it("fails fast when name is empty string", async () => {
		const json = JSON.stringify([{ name: "  ", category: "tops" }]);
		await expect(importClosetFromJSON(await jsonFile(json))).rejects.toThrow(/name/i);
	});

	it("succeeds with just a name (other fields optional)", async () => {
		const json = JSON.stringify([{ name: "T-shirt" }]);
		const items = await importClosetFromJSON(await jsonFile(json));
		expect(items).toHaveLength(1);
		expect(items[0].name).toBe("T-shirt");
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
		const items = await importClosetFromJSON(await jsonFile(json));
		expect(items[0].material).toEqual([]);
		expect(items[1].material).toEqual([]);
		expect(items[2].material).toEqual([]);
	});

	it("coerces notes: string -> array, null -> undefined", async () => {
		const json = JSON.stringify([
			{ name: "Dress", notes: "single note" },
			{ name: "Skirt", notes: null },
		]);
		const items = await importClosetFromJSON(await jsonFile(json));
		// Single string is wrapped in an array
		expect(items[0].notes).toEqual(["single note"]);
		// null or missing stays undefined
		expect(items[1].notes).toBeUndefined();
	});

	it("preserves numeric price on import", async () => {
		const json = JSON.stringify([{ name: "Coat", price: 99.99 }]);
		const items = await importClosetFromJSON(await jsonFile(json));
		expect(items[0].price).toBe(99.99);
		expect(typeof items[0].price).toBe("number");
	});

	it("rejects on first row missing name with clear message", async () => {
		// All rows missing name are processed in order; validate fails on the first one
		const json = JSON.stringify([{ color: "red" }, { color: "blue" }]);
		await expect(importClosetFromJSON(await jsonFile(json))).rejects.toThrow(
			/name/i,
		);
	});
});
