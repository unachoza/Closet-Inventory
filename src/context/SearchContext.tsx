import { createContext, useContext, useState, ReactNode } from "react";

interface SearchContextType {
	searchQuery: string;
	setSearchQuery: (query: string) => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

/**
 * Holds the closet search query so the NavBar's search input and the
 * (future) results view can share a single source of truth.
 *
 * NOTE: For now this is a thin standalone store. When the fuzzy-search work
 * lands on this branch, swap the internals to wrap `useFuzzySearch()` and
 * re-expose its richer return value (searchResults, getMatchKeys, etc.)
 * without changing this provider's public shape.
 */
export function SearchProvider({ children }: { children: ReactNode }) {
	const [searchQuery, setSearchQuery] = useState<string>("");
	return <SearchContext.Provider value={{ searchQuery, setSearchQuery }}>{children}</SearchContext.Provider>;
}

export const useSearch = (): SearchContextType => {
	const ctx = useContext(SearchContext);
	if (!ctx) {
		throw new Error("useSearch must be used within a SearchProvider");
	}
	return ctx;
};
