import { FilterDimension, FilterOptions, FilterState } from "../../hooks/useClosetFilters";
import "./EntireCloset.css";

interface FilterDropdownProps {
	filters: FilterState;
	filterOptions: FilterOptions;
	onToggle: (dim: FilterDimension, value: string) => void;
}

const DIM_LABELS: Record<FilterDimension, string> = {
	category: "Category",
	color: "Color",
	brand: "Brand",
	material: "Material",
	occasion: "Occasion",
};

const DIMENSIONS: FilterDimension[] = ["category", "color", "brand", "material", "occasion"];

const FilterDropdown = ({ filters, filterOptions, onToggle }: FilterDropdownProps) => {
	return (
		<div className="filter-dropdown" role="group" aria-label="Filter options">
			{DIMENSIONS.map((dim) => {
				const options = filterOptions[dim];
				if (options.length === 0) return null;

				return (
					<div key={dim} className="filter-dropdown__group">
						<span className="filter-dropdown__label">{DIM_LABELS[dim]}</span>
						{options.map(({ value, count }) => {
							const checked = filters[dim].includes(value);
							const id = `filter-${dim}-${value}`;
							return (
								<label key={value} htmlFor={id} className="filter-dropdown__option">
									<input
										id={id}
										type="checkbox"
										checked={checked}
										onChange={() => onToggle(dim, value)}
									/>
									{value}
									<span className="filter-dropdown__count">({count})</span>
								</label>
							);
						})}
					</div>
				);
			})}
		</div>
	);
};

export default FilterDropdown;
