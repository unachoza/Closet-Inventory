import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Fuse from "fuse.js";
import { ClothingItem } from "../utils/types";
import { normalizeColorGroups } from "../Features/FashionParser/normalizers/normalizeColor";
import normalizeCategory from "../Features/FashionParser/normalizers/normalizeCategory";

const DEBOUNCE_MS = 300;

// Internal, search-only fields that mirror the filter's color/category grouping so
// searching "brown" also surfaces chocolate/beige/tan items, and "dress" finds "dresses".
type SearchableItem = ClothingItem & { _colorGroups: string; _category: string };

const GROUP_KEY_LABELS: Record<string, string> = {
	_colorGroups: "color",
	_category: "category",
};

const FUSE_OPTIONS = {
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

	// Build the Fuse index once per `items` reference and reuse it across every
	// keystroke (both getters), instead of rebuilding it on each query change.
	// The index is the expensive part; `items` only changes when the closet does.
	const indexRef = useRef<{ items: ClothingItem[]; fuse: Fuse<SearchableItem>; byId: Map<string, ClothingItem> } | null>(null);
	const getIndex = useCallback((items: ClothingItem[]) => {
		if (!indexRef.current || indexRef.current.items !== items) {
			indexRef.current = {
				items,
				fuse: new Fuse(toSearchable(items), FUSE_OPTIONS),
				byId: new Map(items.map((item) => [item.id, item])),
			};
		}
		return indexRef.current;
	}, []);

	// Returns filtered items; also returns match data for highlighting
	const searchResults = useMemo(
		() =>
			(items: ClothingItem[]): ClothingItem[] => {
				if (!debouncedQuery.trim()) return items;
				const { fuse, byId } = getIndex(items);
				return fuse.search(debouncedQuery).map((res) => byId.get(res.item.id)!);
			},
		[debouncedQuery, getIndex],
	);

	// Separate getter for match metadata (used by FilterMatchPills)
	const getMatchKeys = useMemo(
		() =>
			(items: ClothingItem[]): Map<string, string[]> => {
				if (!debouncedQuery.trim()) return new Map();
				const { fuse } = getIndex(items);
				const results = fuse.search(debouncedQuery);
				const map = new Map<string, string[]>();
				for (const result of results) {
					// Map internal group keys back to their user-facing field names and dedupe.
					const keys = (result.matches ?? []).map((m) => GROUP_KEY_LABELS[m.key ?? ""] ?? m.key ?? "").filter(Boolean);
					map.set(result.item.id, Array.from(new Set(keys)));
				}
				return map;
			},
		[debouncedQuery, getIndex],
	);

	return { searchQuery, setSearchQuery, searchResults, getMatchKeys, debouncedQuery };
};
