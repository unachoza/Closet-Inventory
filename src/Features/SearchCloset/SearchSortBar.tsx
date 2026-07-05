import { SlidersHorizontal, Search, X, MapPin } from "lucide-react";
import { SortKey, SORT_LABELS } from "../../hooks/useClosetSort";
import { useSearch } from "../../context/SearchContext";
import { BorderMode, BORDER_MODE_LABELS } from "../../utils/borderMode";
import "./EntireCloset.css";

interface SearchSortBarProps {
	sortKey: SortKey;
	onSortChange: (key: SortKey) => void;
	showFilters: boolean;
	onToggleFilters: () => void;
	activeFilterCount: number;
	borderMode: BorderMode;
	onCycleBorderMode: () => void;
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
	borderMode,
	onCycleBorderMode,
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

			{/* Border-mode toggle — cycles Off → Location → Location + Status. Colors
			    the card borders (and adds a status dot in the combined mode) so the
			    closet grid surfaces inventory truth at a glance. */}
			<button
				className={`search-sort-bar__border-btn${borderMode !== "off" ? " search-sort-bar__border-btn--active" : ""}`}
				onClick={onCycleBorderMode}
				aria-label={`Card borders: ${BORDER_MODE_LABELS[borderMode]}. Click to change.`}
				title="Toggle location / status borders"
			>
				<MapPin size={15} />
				{BORDER_MODE_LABELS[borderMode]}
			</button>

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
