import { useMemo, useState } from "react";
import { ClothingItem } from "../utils/types";

export type SortKey = "dateAdded" | "priceAsc" | "priceDesc" | "ageNewest" | "ageOldest" | "nameAZ" | "nameZA";

export const SORT_LABELS: Record<SortKey, string> = {
	dateAdded: "Date Added",
	priceAsc: "Price: Low → High",
	priceDesc: "Price: High → Low",
	ageNewest: "Condition: Best First",
	ageOldest: "Condition: Worst First",
	nameAZ: "Name: A → Z",
	nameZA: "Name: Z → A",
};

// Condition ranking, best → worst. Includes the canonical 5 options plus a few
// legacy free-text values from older items (stored under `age`) for graceful fallback.
const AGE_ORDER: Record<string, number> = {
	"brand new": 0,
	new: 0,
	"like new": 1,
	excellent: 2,
	good: 3,
	fair: 4,
	"needs repair": 5,
	poor: 5,
};

const parsePrice = (price?: string): number => {
	if (!price) return 0;
	const num = parseFloat(price.replace(/[^0-9.]/g, ""));
	return isNaN(num) ? 0 : num;
};

// Rank by subjective condition, falling back to the legacy `age` string for older items.
const parseCondition = (item: ClothingItem): number => {
	const value = item.condition ?? item.age;
	if (!value) return 999;
	return AGE_ORDER[value.toLowerCase().trim()] ?? 999;
};

export const useClosetSort = (defaultSort: SortKey = "dateAdded") => {
	const [sortKey, setSortKey] = useState<SortKey>(defaultSort);

	const sortedItems = useMemo(
		() =>
			(items: ClothingItem[]): ClothingItem[] => {
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
					case "nameAZ":
						return copy.sort((a, b) => a.name.localeCompare(b.name));
					case "nameZA":
						return copy.sort((a, b) => b.name.localeCompare(a.name));
					case "dateAdded":
					default:
						return copy;
				}
			},
		[sortKey]
	);

	return { sortKey, setSortKey, sortedItems };
};
