import { SlidersHorizontal, Search, X } from "lucide-react";
import { SortKey, SORT_LABELS } from "../../hooks/useClosetSort";
import { useSearch } from "../../context/SearchContext";
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
	const { searchQuery, setSearchQuery } = useSearch();

	return (
		<div className="search-sort-bar">
			{/* Search — reads/writes the shared SearchContext, so it stays the single
			    source of truth even though it now lives on the same row as the filter
			    and sort controls. */}
			<div className="search-sort-bar__search-wrap">
				<Search size={16} className="search-sort-bar__icon" />
				<input
					type="text"
					className="search-sort-bar__input"
					placeholder="Search items, brands, colors..."
					aria-label="Search closet"
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
				/>
				{searchQuery && (
					<button className="search-sort-bar__clear-btn" aria-label="Clear search" onClick={() => setSearchQuery("")}>
						<X size={14} />
					</button>
				)}
			</div>

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
