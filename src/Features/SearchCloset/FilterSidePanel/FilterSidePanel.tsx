import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { FilterDimension, FilterOptions, FilterState } from "../../../hooks/useClosetFilters";
import FilterAccordion from "../FilterAccordion/FilterAccordion";
import "../EntireCloset.css";

interface FilterSidePanelProps {
	open: boolean;
	onClose: () => void;
	filters: FilterState;
	filterOptions: FilterOptions;
	activeFilterCount: number;
	onToggle: (dim: FilterDimension, value: string) => void;
	onClearAll: () => void;
}

const DIM_LABELS: Record<FilterDimension, string> = {
	category: "Category",
	color: "Color",
	brand: "Brand",
	material: "Material",
	occasion: "Occasion",
	care: "Care",
};

const DIMENSIONS: FilterDimension[] = ["category", "color", "brand", "material", "occasion", "care"];

const FilterSidePanel = ({
	open,
	onClose,
	filters,
	filterOptions,
	activeFilterCount,
	onToggle,
	onClearAll,
}: FilterSidePanelProps) => {
	// Close on Escape key while open
	useEffect(() => {
		if (!open) return;
		const handleKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};
		window.addEventListener("keydown", handleKey);
		return () => window.removeEventListener("keydown", handleKey);
	}, [open, onClose]);

	return createPortal(
		<>
			{/* Backdrop — click to close */}
			<div
				className={`filter-panel-backdrop${open ? " filter-panel-backdrop--open" : ""}`}
				onClick={onClose}
				aria-hidden="true"
			/>

			{/* Slide-in panel from the left */}
			<aside
				className={`filter-side-panel${open ? " filter-side-panel--open" : ""}`}
				role="dialog"
				aria-modal="true"
				aria-label="Filter options"
				aria-hidden={!open}
			>
				<div className="filter-side-panel__header">
					<h2 className="filter-side-panel__title">Filters</h2>
					<button
						type="button"
						className="filter-side-panel__close"
						onClick={onClose}
						aria-label="Close filters"
					>
						<X size={18} />
					</button>
				</div>

				<div className="filter-side-panel__body">
					{DIMENSIONS.map((dim) => (
						<FilterAccordion
							key={dim}
							label={DIM_LABELS[dim]}
							options={filterOptions[dim]}
							selected={filters[dim]}
							onToggle={(value) => onToggle(dim, value)}
						/>
					))}
				</div>

				<div className="filter-side-panel__footer">
					<button
						type="button"
						className="filter-side-panel__clear"
						onClick={onClearAll}
						disabled={activeFilterCount === 0}
					>
						Clear all{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
					</button>
					<button
						type="button"
						className="filter-side-panel__apply"
						onClick={onClose}
					>
						Done
					</button>
				</div>
			</aside>
		</>,
		document.body,
	);
};

export default FilterSidePanel;
