import { describe, it, expect } from "vitest";
import { computeUpdatePatch } from "../computeUpdatePatch";
import type { ClothingItem } from "../../utils/types";

const baseItem = (over: Partial<ClothingItem> = {}): ClothingItem =>
	({
		id: "1",
		imageURL: "https://cdn.example.com/real-photo.jpg",
		name: "Silk blouse",
		category: "tops",
		color: "white",
		size: "M",
		brand: "Test",
		material: [{ material: "silk", percentage: 100 }],
		occasion: "work",
		age: "new",
		care: "dry clean",
		...over,
	}) as ClothingItem;

/**
 * BUG-1 — a partial update must never clobber an existing photo.
 *
 * The old `updateItem` injected a generic stock photo whenever a patch carried
 * `category` but omitted `imageURL`, silently replacing the item's real photo.
 * A stock photo may only be backfilled when the item genuinely has none.
 */
describe("computeUpdatePatch (BUG-1 photo clobber)", () => {
	it("does NOT touch imageURL when the patch omits it and the item has a photo", () => {
		const patch = computeUpdatePatch(baseItem(), { category: "dress" });
		expect(patch.imageURL).toBeUndefined(); // absent → repo leaves the stored photo alone
	});

	it("does NOT overwrite the photo even when only the category changes", () => {
		const patch = computeUpdatePatch(baseItem(), { category: "outerwear", status: "clean" });
		expect(patch).not.toHaveProperty("imageURL");
	});

	it("honors an explicitly provided new photo", () => {
		const patch = computeUpdatePatch(baseItem(), { imageURL: "https://cdn.example.com/new.jpg" });
		expect(patch.imageURL).toBe("https://cdn.example.com/new.jpg");
	});

	it("backfills a stock photo only when the item genuinely has none", () => {
		const patch = computeUpdatePatch(baseItem({ imageURL: "" }), { category: "tops" });
		expect(patch.imageURL).toBeTruthy();
		expect(patch.imageURL).not.toBe("");
	});

	it("does not invent a photo for a photoless item when no category is known", () => {
		const patch = computeUpdatePatch(baseItem({ imageURL: "", category: undefined }), { color: "blue" });
		expect(patch.imageURL).toBeFalsy();
	});

	it("passes through non-photo fields unchanged", () => {
		const patch = computeUpdatePatch(baseItem(), { status: "dirty", color: "navy" });
		expect(patch.status).toBe("dirty");
		expect(patch.color).toBe("navy");
	});
});
