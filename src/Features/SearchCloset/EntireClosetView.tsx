import { useMemo, useState, useCallback } from "react";
import { ClothingItem } from "../../utils/types";
import { useLocalStorageCloset } from "../../hooks/useLocalCloset";
import { useClosetFilters } from "../../hooks/useClosetFilters";
import { useClosetSort } from "../../hooks/useClosetSort";
import { useSearch } from "../../context/SearchContext";
import StickyTopBar from "./StickyTopBar";
import FilteredItemGrid from "./FilteredItemGrid";
import "./EntireCloset.css";

interface EntireClosetViewProps {
	onEditItem?: (item: ClothingItem) => void;
}

const DENSITY_KEY = "closet_density";

const EntireClosetView = ({ onEditItem }: EntireClosetViewProps) => {
	const { closet, removeItem } = useLocalStorageCloset();

	const [compact, setCompact] = useState(() => localStorage.getItem(DENSITY_KEY) === "compact");
	const toggleDensity = useCallback(() => {
		setCompact((prev) => {
			const next = !prev;
			localStorage.setItem(DENSITY_KEY, next ? "compact" : "comfortable");
			return next;
		});
	}, []);

	// 1. Filter by dimension checkboxes
	const { filters, filterOptions, filteredItems, activeFilterCount, toggleFilter, clearAll } = useClosetFilters(closet);

	// 2. Fuzzy search over filtered items — driven by the single NavBar search
	// box via SearchContext (shared source of truth).
	const { searchResults, getMatchKeys, debouncedQuery } = useSearch();

	// 3. Sort the search results
	const { sortKey, setSortKey, sortedItems } = useClosetSort();

	// Pipeline: closet → filter → search → sort. The material-% sort (E0-2.3)
	// ranks by the selected material's blend percentage, so it needs the active
	// material selection.
	const searched = useMemo(() => searchResults(filteredItems), [searchResults, filteredItems]);
	const displayed = useMemo(() => sortedItems(searched, filters.material), [sortedItems, searched, filters.material]);

	// Match metadata for highlighting which fields were hit
	const matchKeysById = useMemo(() => getMatchKeys(filteredItems), [getMatchKeys, filteredItems]);

	// Replay the grid's stagger when the *query shape* changes (filters / search /
	// sort) — but NOT when an item is simply removed. Keying on this signature
	// (instead of item count) lets removals animate in place via popLayout, the
	// same way the carousel view shifts cards over. See FilteredItemGrid.
	const gridKey = useMemo(
		() => `${JSON.stringify(filters)}|${debouncedQuery}|${sortKey}`,
		[filters, debouncedQuery, sortKey],
	);

	return (
		<main className="entire-closet" aria-label="Entire closet view">
			<StickyTopBar
				sortKey={sortKey}
				onSortChange={setSortKey}
				filters={filters}
				filterOptions={filterOptions}
				activeFilterCount={activeFilterCount}
				onToggleFilter={toggleFilter}
				onClearAll={clearAll}
			/>
			<FilteredItemGrid
				items={displayed}
				matchKeysById={matchKeysById}
				totalCount={closet.length}
				gridKey={gridKey}
				compact={compact}
				onToggleDensity={toggleDensity}
				onEditItem={onEditItem}
				onRemoveItem={removeItem}
			/>
		</main>
	);
};

export default EntireClosetView;
