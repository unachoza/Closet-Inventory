import { useEffect, useMemo, useState } from "react";
import Fuse from "fuse.js";
import { ClothingItem } from "../utils/types";

const DEBOUNCE_MS = 300;

const FUSE_OPTIONS: Fuse.IFuseOptions<ClothingItem> = {
	keys: ["name", "brand", "category", "color", "notes", "material", "occasion"],
	threshold: 0.4,
	ignoreLocation: true,
	includeMatches: true,
};

export type FuseMatch = {
	key: string;
	indices: readonly [number, number][];
};

export const useFuzzySearch = () => {
	const [searchQuery, setSearchQuery] = useState<string>("");
	const [debouncedQuery, setDebouncedQuery] = useState<string>("");

	useEffect(() => {
		const timer = setTimeout(() => setDebouncedQuery(searchQuery), DEBOUNCE_MS);
		return () => clearTimeout(timer);
	}, [searchQuery]);

	// Returns filtered items; also returns match data for highlighting
	const searchResults = useMemo(
		() =>
			(items: ClothingItem[]): ClothingItem[] => {
				if (!debouncedQuery.trim()) return items;
				console.log({ debouncedQuery });
				const fuse = new Fuse(items, FUSE_OPTIONS);
				return fuse.search(debouncedQuery).map((res) => res.item);
			},
		[debouncedQuery],
	);

	// Separate getter for match metadata (used by FilterMatchPills)
	const getMatchKeys = useMemo(
		() =>
			(items: ClothingItem[]): Map<string, string[]> => {
				if (!debouncedQuery.trim()) return new Map();
				const fuse = new Fuse(items, FUSE_OPTIONS);
				const results = fuse.search(debouncedQuery);
				const map = new Map<string, string[]>();
				for (const result of results) {
					const keys = (result.matches ?? []).map((m) => m.key ?? "").filter(Boolean);
					map.set(result.item.id, keys);
				}
				return map;
			},
		[debouncedQuery],
	);

	return { searchQuery, setSearchQuery, searchResults, getMatchKeys, debouncedQuery };
};
