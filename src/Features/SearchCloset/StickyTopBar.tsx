import { useState } from "react";
import { FilterDimension, FilterOptions, FilterState } from "../../hooks/useClosetFilters";
import { SortKey } from "../../hooks/useClosetSort";
import SearchSortBar from "./SearchSortBar";
import FilterPillsRow from "./FilterPillsRow";
import FilterDropdown from "./FilterDropdown";
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
			{showFilters && (
				<div id="filter-dropdown-panel">
					<FilterDropdown
						filters={filters}
						filterOptions={filterOptions}
						onToggle={onToggleFilter}
					/>
				</div>
			)}
		</div>
	);
};

export default StickyTopBar;
