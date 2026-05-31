import { useState } from "react";
import { FilterDimension, FilterOptions, FilterState } from "../../hooks/useClosetFilters";
import { SortKey } from "../../hooks/useClosetSort";
import SearchSortBar from "./SearchSortBar";
import FilterPillsRow from "./FilterPillsRow";
import FilterSidePanel from "./FilterSidePanel";
import "./EntireCloset.css";

interface StickyTopBarProps {
	searchQuery: string;
	onSearchChange: (q: string) => void;
	sortKey: SortKey;
	onSortChange: (key: SortKey) => void;
	filters: FilterState;
	filterOptions: FilterOptions;
	activeFilterCount: number;
	onToggleFilter: (dim: FilterDimension, value: string) => void;
	onClearAll: () => void;
}

const StickyTopBar = ({
	searchQuery,
	onSearchChange,
	sortKey,
	onSortChange,
	filters,
	filterOptions,
	activeFilterCount,
	onToggleFilter,
	onClearAll,
}: StickyTopBarProps) => {
	const [showFilters, setShowFilters] = useState(false);

	return (
		<div className="entire-closet__sticky">
			<SearchSortBar
				searchQuery={searchQuery}
				onSearchChange={onSearchChange}
				sortKey={sortKey}
				onSortChange={onSortChange}
				showFilters={showFilters}
				onToggleFilters={() => setShowFilters((v) => !v)}
				activeFilterCount={activeFilterCount}
			/>
			<FilterPillsRow
				filters={filters}
				activeFilterCount={activeFilterCount}
				onRemove={onToggleFilter}
				onClearAll={onClearAll}
			/>
			<FilterSidePanel
				open={showFilters}
				onClose={() => setShowFilters(false)}
				filters={filters}
				filterOptions={filterOptions}
				activeFilterCount={activeFilterCount}
				onToggle={onToggleFilter}
				onClearAll={onClearAll}
			/>
		</div>
	);
};

export default StickyTopBar;
