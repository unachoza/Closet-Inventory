import { useMemo } from "react";
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

const EntireClosetView = ({ onEditItem }: EntireClosetViewProps) => {
	const { closet } = useLocalStorageCloset();

	// 1. Filter by dimension checkboxes
	const { filters, filterOptions, filteredItems, activeFilterCount, toggleFilter, clearAll } = useClosetFilters(closet);

	// 2. Fuzzy search over filtered items — driven by the single NavBar search
	// box via SearchContext (shared source of truth).
	const { searchResults, getMatchKeys } = useSearch();

	// 3. Sort the search results
	const { sortKey, setSortKey, sortedItems } = useClosetSort();

	// Pipeline: closet → filter → search → sort
	const searched = useMemo(() => searchResults(filteredItems), [searchResults, filteredItems]);
	const displayed = useMemo(() => sortedItems(searched), [sortedItems, searched]);

	// Match metadata for highlighting which fields were hit
	const matchKeysById = useMemo(() => getMatchKeys(filteredItems), [getMatchKeys, filteredItems]);

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
			<FilteredItemGrid items={displayed} matchKeysById={matchKeysById} totalCount={closet.length} onEditItem={onEditItem} />
		</main>
	);
};

export default EntireClosetView;
