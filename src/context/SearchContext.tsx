import { createContext, useContext, useEffect, useRef, ReactNode } from "react";
import { ClothingItem } from "../utils/types";
import { useFuzzySearch } from "../hooks/useFuzzySearch";
import { track } from "../lib/analytics";

interface SearchContextType {
	searchQuery: string;
	setSearchQuery: (query: string) => void;
	debouncedQuery: string;
	// Apply the active query to a list of items (filter pipeline stage).
	searchResults: (items: ClothingItem[]) => ClothingItem[];
	// Per-item match metadata for highlighting which fields were hit.
	getMatchKeys: (items: ClothingItem[]) => Map<string, string[]>;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

/**
 * Single source of truth for the closet search query.
 *
 * The NavBar's search input and the EntireCloset results view both read from
 * here, so there is exactly one search box driving the experience. Internals
 * wrap `useFuzzySearch()` and re-expose its richer return value (searchResults,
 * getMatchKeys, debouncedQuery) without changing the provider's public shape.
 */
export function SearchProvider({ children }: { children: ReactNode }) {
	const { searchQuery, setSearchQuery, debouncedQuery, searchResults, getMatchKeys } = useFuzzySearch();

	// One event per meaningful search, not per keystroke — keyed off the
	// debounced query and fired only when it becomes non-empty (or changes).
	const lastTrackedQuery = useRef("");
	useEffect(() => {
		const q = debouncedQuery.trim();
		if (q && q !== lastTrackedQuery.current) {
			track("search_used", { length: q.length });
		}
		lastTrackedQuery.current = q;
	}, [debouncedQuery]);

	return (
		<SearchContext.Provider value={{ searchQuery, setSearchQuery, debouncedQuery, searchResults, getMatchKeys }}>
			{children}
		</SearchContext.Provider>
	);
}

export const useSearch = (): SearchContextType => {
	const ctx = useContext(SearchContext);
	if (!ctx) {
		throw new Error("useSearch must be used within a SearchProvider");
	}
	return ctx;
};
