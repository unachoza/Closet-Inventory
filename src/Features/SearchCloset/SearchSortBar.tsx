import { SlidersHorizontal } from "lucide-react";
import { SortKey, SORT_LABELS } from "../../hooks/useClosetSort";
import "./EntireCloset.css";

interface SearchSortBarProps {
	sortKey: SortKey;
	onSortChange: (key: SortKey) => void;
	showFilters: boolean;
	onToggleFilters: () => void;
	activeFilterCount: number;
}

const SORT_OPTIONS: SortKey[] = [
	"dateAdded",
	"priceAsc",
	"priceDesc",
	"ageNewest",
	"ageOldest",
	"purchasedNewest",
	"purchasedOldest",
	"nameAZ",
	"nameZA",
];

const SearchSortBar = ({
	sortKey,
	onSortChange,
	showFilters,
	onToggleFilters,
	activeFilterCount,
}: SearchSortBarProps) => {
	return (
		<div className="search-sort-bar">
			{/* Search lives in the NavBar (single source of truth) — this row
			    only carries the filter toggle and sort control. */}

			{/* Filter toggle */}
			<button
				className={`search-sort-bar__filter-btn${showFilters ? " search-sort-bar__filter-btn--active" : ""}`}
				onClick={onToggleFilters}
				aria-expanded={showFilters}
				aria-controls="filter-dropdown-panel"
			>
				<SlidersHorizontal size={15} />
				Filters
				{activeFilterCount > 0 && (
					<span className="search-sort-bar__badge" aria-label={`${activeFilterCount} active`}>
						{activeFilterCount}
					</span>
				)}
			</button>

			{/* Sort select */}
			<select
				className="search-sort-bar__sort-select"
				value={sortKey}
				onChange={(e) => onSortChange(e.target.value as SortKey)}
				aria-label="Sort items"
			>
				{SORT_OPTIONS.map((key) => (
					<option key={key} value={key}>
						{SORT_LABELS[key]}
					</option>
				))}
			</select>
		</div>
	);
};

export default SearchSortBar;
