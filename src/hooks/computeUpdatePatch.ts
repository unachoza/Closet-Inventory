import type { CategoryType, ClothingItem } from "../utils/types";
import getStockPhoto from "../utils/getStockPhoto";

/**
 * BUG-1 — build the patch persisted by an item update without ever clobbering
 * the existing photo.
 *
 * The previous logic injected a generic stock photo whenever the patch carried
 * `category` but omitted `imageURL`, silently replacing a real (often
 * user-uploaded) photo. The rule now keys off the *resulting* item:
 *
 * - if the patch omits `imageURL`, it is left out of the patch entirely, so the
 *   stored photo is untouched (the repo only writes `primary_photo_url` when
 *   `imageURL` is present in the patch);
 * - a stock photo is backfilled ONLY when the item would otherwise have none.
 *
 * Pure + immutable: returns a new patch, never mutates its inputs.
 */
export function computeUpdatePatch(existing: ClothingItem, updatedData: Partial<ClothingItem>): Partial<ClothingItem> {
	const patch: Partial<ClothingItem> = { ...updatedData };

	const resultingPhoto = updatedData.imageURL ?? existing.imageURL;
	const resultingCategory = updatedData.category ?? existing.category;

	// Only invent a photo when the item genuinely has none — never to "refresh"
	// an existing one on a category change.
	if (!resultingPhoto && resultingCategory) {
		patch.imageURL = getStockPhoto(resultingCategory as CategoryType);
	}

	return patch;
}
