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

const AGE_ORDER: Record<string, number> = {
	"brand new": 0,
	new: 0,
	"like new": 1,
	excellent: 2,
	good: 3,
	fair: 4,
	poor: 5,
};

const parsePrice = (price?: string): number => {
	if (!price) return 0;
	const num = parseFloat(price.replace(/[^0-9.]/g, ""));
	return isNaN(num) ? 0 : num;
};

const parseAge = (age?: string): number => {
	if (!age) return 999;
	return AGE_ORDER[age.toLowerCase().trim()] ?? 999;
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
						return copy.sort((a, b) => parseAge(a.age) - parseAge(b.age));
					case "ageOldest":
						return copy.sort((a, b) => parseAge(b.age) - parseAge(a.age));
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
