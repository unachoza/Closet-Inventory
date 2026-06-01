import { useEffect, useMemo, useState } from "react";
import Fuse from "fuse.js";
import { ClothingItem } from "../utils/types";
import { normalizeColorGroups } from "../utils/normalizeColors";
import normalizeCategory from "../utils/normalizeCategories";

const DEBOUNCE_MS = 300;

// Internal, search-only fields that mirror the filter's color/category grouping so
// searching "brown" also surfaces chocolate/beige/tan items, and "dress" finds "dresses".
type SearchableItem = ClothingItem & { _colorGroups: string; _category: string };

const GROUP_KEY_LABELS: Record<string, string> = {
	_colorGroups: "color",
	_category: "category",
};

const FUSE_OPTIONS: Fuse.IFuseOptions<SearchableItem> = {
	keys: ["name", "brand", "category", "color", "notes", "material", "occasion", "_colorGroups", "_category"],
	threshold: 0.4,
	ignoreLocation: true,
	includeMatches: true,
};

const toSearchable = (items: ClothingItem[]): SearchableItem[] =>
	items.map((item) => ({
		...item,
		_colorGroups: normalizeColorGroups(typeof item.color === "string" ? item.color : "").join(" "),
		_category: normalizeCategory(typeof item.category === "string" ? item.category : ""),
	}));

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
				const byId = new Map(items.map((item) => [item.id, item]));
				const fuse = new Fuse(toSearchable(items), FUSE_OPTIONS);
				return fuse.search(debouncedQuery).map((res) => byId.get(res.item.id)!);
			},
		[debouncedQuery],
	);

	// Separate getter for match metadata (used by FilterMatchPills)
	const getMatchKeys = useMemo(
		() =>
			(items: ClothingItem[]): Map<string, string[]> => {
				if (!debouncedQuery.trim()) return new Map();
				const fuse = new Fuse(toSearchable(items), FUSE_OPTIONS);
				const results = fuse.search(debouncedQuery);
				const map = new Map<string, string[]>();
				for (const result of results) {
					// Map internal group keys back to their user-facing field names and dedupe.
					const keys = (result.matches ?? [])
						.map((m) => GROUP_KEY_LABELS[m.key ?? ""] ?? m.key ?? "")
						.filter(Boolean);
					map.set(result.item.id, Array.from(new Set(keys)));
				}
				return map;
			},
		[debouncedQuery],
	);

	return { searchQuery, setSearchQuery, searchResults, getMatchKeys, debouncedQuery };
};
