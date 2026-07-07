import { useMemo, useState } from "react";
import { ClothingItem } from "../utils/types";
import { canonicalizeMaterial, normalizeMaterial } from "../utils/materialUtils";

export type SortKey =
	| "dateAdded"
	| "priceAsc"
	| "priceDesc"
	| "ageNewest"
	| "ageOldest"
	| "purchasedNewest"
	| "purchasedOldest"
	| "nameAZ"
	| "nameZA"
	| "materialPct";

export const SORT_LABELS: Record<SortKey, string> = {
	dateAdded: "Date Added",
	priceAsc: "Price: Low → High",
	priceDesc: "Price: High → Low",
	ageNewest: "Condition: Best First",
	ageOldest: "Condition: Worst First",
	purchasedNewest: "Purchased: Newest First",
	purchasedOldest: "Purchased: Oldest First",
	nameAZ: "Name: A → Z",
	nameZA: "Name: Z → A",
	materialPct: "Material: Highest %",
};

// Condition ranking, best → worst. Includes the canonical 5 options plus a few
// legacy free-text values from older items (stored under `age`) for graceful fallback.
const AGE_ORDER: Record<string, number> = {
	"brand new": 0,
	new: 0,
	like_new: 1,
	needs_repair: 5,
	// …plus legacy space-form values still stored under the free-text `age` field.
	"like new": 1,
	excellent: 2,
	good: 3,
	fair: 4,
	"needs repair": 5,
	poor: 5,
};

const parsePrice = (price?: number): number => {
	return price ?? 0;
};

// Rank by subjective condition, falling back to the legacy `age` string for older items.
const parseCondition = (item: ClothingItem): number => {
	const value = item.condition ?? item.age;
	if (!value) return 999;
	return AGE_ORDER[value.toLowerCase().trim()] ?? 999;
};

// Parse the ISO purchaseDate to a timestamp; null when missing or unparseable.
const parsePurchaseDate = (item: ClothingItem): number | null => {
	if (!item.purchaseDate) return null;
	const t = Date.parse(item.purchaseDate);
	return isNaN(t) ? null : t;
};

// E0-2.3: rank an item by its material blend percentage. When a material filter
// is active, `selected` holds the canonicalized selected fibers and the rank is
// the highest percentage among *those* fibers (so 100% cotton outranks a 60%
// cotton blend). With no selection it falls back to the item's dominant fiber.
// Items with no material blend sink to the bottom via -Infinity.
//
// Note: the closet is normalized to MaterialBlend[] upstream (useCloudCloset),
// so a legacy bare string like "cotton" arrives as 100% and ranks accordingly —
// it is not treated as unknown.
const materialPercentage = (item: ClothingItem, selected: Set<string>): number => {
	const blend = normalizeMaterial(item.material);
	if (blend.length === 0) return -Infinity;
	const relevant = selected.size > 0 ? blend.filter((b) => selected.has(canonicalizeMaterial(b.material).toLowerCase())) : blend;
	if (relevant.length === 0) return -Infinity;
	return Math.max(...relevant.map((b) => b.percentage));
};

// Sort by purchaseDate; items with no/invalid date always sink to the bottom,
// regardless of direction, so they don't masquerade as the newest or oldest.
const byPurchaseDate =
	(direction: "newest" | "oldest") =>
	(a: ClothingItem, b: ClothingItem): number => {
		const ta = parsePurchaseDate(a);
		const tb = parsePurchaseDate(b);
		if (ta === null && tb === null) return 0;
		if (ta === null) return 1;
		if (tb === null) return -1;
		return direction === "newest" ? tb - ta : ta - tb;
	};

export const useClosetSort = (defaultSort: SortKey = "dateAdded") => {
	const [sortKey, setSortKey] = useState<SortKey>(defaultSort);

	const sortedItems = useMemo(
		() =>
			(items: ClothingItem[], selectedMaterials: string[] = []): ClothingItem[] => {
				const copy = [...items];
				switch (sortKey) {
					case "priceAsc":
						return copy.sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
					case "priceDesc":
						return copy.sort((a, b) => parsePrice(b.price) - parsePrice(a.price));
					case "ageNewest":
						return copy.sort((a, b) => parseCondition(a) - parseCondition(b));
					case "ageOldest":
						return copy.sort((a, b) => parseCondition(b) - parseCondition(a));
					case "purchasedNewest":
						return copy.sort(byPurchaseDate("newest"));
					case "purchasedOldest":
						return copy.sort(byPurchaseDate("oldest"));
					case "nameAZ":
						return copy.sort((a, b) => a.name.localeCompare(b.name));
					case "nameZA":
						return copy.sort((a, b) => b.name.localeCompare(a.name));
					case "materialPct": {
						const selected = new Set(selectedMaterials.map((m) => canonicalizeMaterial(m).toLowerCase()));
						return copy.sort((a, b) => materialPercentage(b, selected) - materialPercentage(a, selected));
					}
					case "dateAdded":
					default:
						return copy;
				}
			},
		[sortKey]
	);

	return { sortKey, setSortKey, sortedItems };
};
