import { useMemo } from "react";
import { ClothingItem } from "../../utils/types";
import { useLocalStorageCloset } from "../../hooks/useLocalCloset";
import { useClosetFilters } from "../../hooks/useClosetFilters";
import { useClosetSort } from "../../hooks/useClosetSort";
import { useFuzzySearch } from "../../hooks/useFuzzySearch";
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

	// 2. Fuzzy search over filtered items
	const { searchQuery, setSearchQuery, searchResults, getMatchKeys } = useFuzzySearch();

	// 3. Sort the search results
	const { sortKey, setSortKey, sortedItems } = useClosetSort();

	// Pipeline: closet → filter → search → sort
	const searched = useMemo(() => searchResults(filteredItems), [searchResults, filteredItems]);
	console.log(searched.length, { searched }, "reight here for real ");
	const displayed = useMemo(() => sortedItems(searched), [sortedItems, searched]);
	console.log(displayed.length, { displayed }, "after the query and after the filter");

	// Match metadata for highlighting which fields were hit
	console.log({ filteredItems }, filteredItems.length);
	const matchKeysById = useMemo(() => getMatchKeys(filteredItems), [getMatchKeys, filteredItems]);

	console.log("this is the closet", { closet });

	return (
		<main className="entire-closet" aria-label="Entire closet view">
			<StickyTopBar
				searchQuery={searchQuery}
				onSearchChange={setSearchQuery}
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
