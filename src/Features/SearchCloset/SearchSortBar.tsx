import { Search, SlidersHorizontal, X } from "lucide-react";
import { SortKey, SORT_LABELS } from "../../hooks/useClosetSort";
import "./EntireCloset.css";

interface SearchSortBarProps {
	searchQuery: string;
	onSearchChange: (q: string) => void;
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
	"nameAZ",
	"nameZA",
];

const SearchSortBar = ({
	searchQuery,
	onSearchChange,
	sortKey,
	onSortChange,
	showFilters,
	onToggleFilters,
	activeFilterCount,
}: SearchSortBarProps) => {
	return (
		<div className="search-sort-bar">
			{/* Search input */}
			<div className="search-sort-bar__search-wrap">
				<Search size={16} className="search-sort-bar__icon" aria-hidden="true" />
				<input
					type="text"
					className="search-sort-bar__input"
					placeholder="Search by name, brand, color…"
					value={searchQuery}
					onChange={(e) => onSearchChange(e.target.value)}
					aria-label="Search closet items"
				/>
				{searchQuery && (
					<button
						className="search-sort-bar__clear-btn"
						onClick={() => onSearchChange("")}
						aria-label="Clear search"
					>
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
