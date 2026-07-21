import type { ItemFormData } from "../../utils/types";

const titleCase = (word: string) => word.charAt(0).toUpperCase() + word.slice(1);

/**
 * Auto-generate a display name from what the wizard already knows,
 * e.g. { color: "blue", brand: "levi's", category: "bottoms" } → "Blue Levi's Bottoms".
 * Empty parts are skipped; with nothing to go on, falls back to "New item".
 */
export function generateItemName(data: Pick<ItemFormData, "color" | "brand" | "category">): string {
	const parts = [data.color, data.brand, data.category]
		.map((part) => (part ?? "").trim())
		.filter(Boolean)
		.map(titleCase);

	return parts.length > 0 ? parts.join(" ") : "New item";
}
