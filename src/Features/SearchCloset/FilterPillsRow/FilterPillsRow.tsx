import { X } from "lucide-react";
import { FilterDimension, FilterState, visibleFilterDimensions } from "../../../hooks/useClosetFilters";
import "../EntireCloset.css";

interface FilterPillsRowProps {
	filters: FilterState;
	activeFilterCount: number;
	onRemove: (dim: FilterDimension, value: string) => void;
	onClearAll: () => void;
}

// Abbreviated for the compact pill row — deliberately distinct from
// FILTER_DIMENSION_LABELS (used for full accordion headers).
// TODO: Consider renaming to FILTER_PILL_DIM_LABELS for clarity.
const PILL_DIM_LABELS: Record<FilterDimension, string> = {
	category: "type",
	color: "color",
	brand: "brand",
	material: "mat",
	occasion: "scene",
	care: "care",
	status: "status",
	location: "site",
};

const FilterPillsRow = ({ filters, activeFilterCount, onRemove, onClearAll }: FilterPillsRowProps) => {
	if (activeFilterCount === 0) return null;

	return (
		<div className="filter-pills-row" aria-label="Active filters">
			{visibleFilterDimensions().flatMap((dim) =>
				(filters[dim] ?? []).map((value) => (
					<span key={`${dim}:${value}`} className="filter-pill">
						<span className="filter-pill__dim">{PILL_DIM_LABELS[dim]}:</span>
						{value}
						<button
							className="filter-pill__remove"
							onClick={() => onRemove(dim, value)}
							aria-label={`Remove ${value} filter`}
						>
							<X size={10} />
						</button>
					</span>
				)),
			)}
			<button className="filter-pills-row__clear-all" onClick={onClearAll}>
				Clear all
			</button>
		</div>
	);
};

export default FilterPillsRow;
