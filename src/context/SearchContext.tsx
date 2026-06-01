import { createContext, useContext, ReactNode } from "react";
import { ClothingItem } from "../utils/types";
import { useFuzzySearch } from "../hooks/useFuzzySearch";

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
