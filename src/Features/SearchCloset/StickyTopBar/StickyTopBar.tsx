import { useState } from "react";
import { FilterDimension, FilterOptions, FilterState } from "../../../hooks/useClosetFilters";
import { SortKey } from "../../../hooks/useClosetSort";
import { BorderMode } from "../../../utils/borderMode";
import SearchSortBar from "../SearchSortBar/SearchSortBar";
import { BorderLegend } from "../BorderLegend/BorderLegend";
import FilterPillsRow from "../FilterPillsRow/FilterPillsRow";
import FilterSidePanel from "../FilterSidePanel/FilterSidePanel";
import "../EntireCloset.css";

interface StickyTopBarProps {
	sortKey: SortKey;
	onSortChange: (key: SortKey) => void;
	filters: FilterState;
	filterOptions: FilterOptions;
	activeFilterCount: number;
	onToggleFilter: (dim: FilterDimension, value: string) => void;
	onClearAll: () => void;
	borderMode: BorderMode;
	onCycleBorderMode: () => void;
	/** Beta gate: hides the Status/Location border toggle when off. Defaults visible. */
	showBorderToggle?: boolean;
}

const StickyTopBar = ({
	sortKey,
	onSortChange,
	filters,
	filterOptions,
	activeFilterCount,
	onToggleFilter,
	onClearAll,
	borderMode,
	onCycleBorderMode,
	showBorderToggle = true,
}: StickyTopBarProps) => {
	const [showFilters, setShowFilters] = useState(false);

	return (
		<div className="entire-closet__sticky">
			<SearchSortBar
				sortKey={sortKey}
				onSortChange={onSortChange}
				showFilters={showFilters}
				onToggleFilters={() => setShowFilters((v) => !v)}
				activeFilterCount={activeFilterCount}
				borderMode={borderMode}
				onCycleBorderMode={onCycleBorderMode}
				showBorderToggle={showBorderToggle}
			/>
			{/* P1-10: legend shows mapping of border colors/styles + status dots (P1-10.1) */}
			<BorderLegend borderMode={borderMode} />
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
