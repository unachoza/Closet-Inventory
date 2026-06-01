import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { FilterOption } from "../../hooks/useClosetFilters";
import "./EntireCloset.css";
import AnimatedContainer from "../../Components/AnimatedContainer/AnimatedContainer";

interface FilterAccordionProps {
	label: string;
	options: FilterOption[];
	selected: string[];
	onToggle: (value: string) => void;
	defaultOpen?: boolean;
}

const FilterAccordion = ({ label, options, selected, onToggle, defaultOpen = false }: FilterAccordionProps) => {
	const [expanded, setExpanded] = useState(defaultOpen);

	if (options.length === 0) return null;

	const sectionId = `accordion-panel-${label.toLowerCase()}`;

	return (
		<div className="filter-accordion">
			<button
				type="button"
				className="filter-accordion__header"
				onClick={() => setExpanded((v) => !v)}
				aria-expanded={expanded}
				aria-controls={sectionId}
			>
				<span className="filter-accordion__label">
					{label}
					{selected.length > 0 && <span className="filter-accordion__count-badge">{selected.length}</span>}
				</span>
				<ChevronDown
					size={16}
					className={`filter-accordion__chevron${expanded ? " filter-accordion__chevron--open" : ""}`}
					aria-hidden="true"
				/>
			</button>

			{expanded && (
				<AnimatedContainer
					className="filter-accordion__body"
					id={sectionId}
					role="group"
					aria-label={label}
					direction="fromTop"
					mode="sync"
					cacheKey={label}
				>
					{options.map(({ value, count }) => {
						const checked = selected.includes(value);
						const optionId = `filter-${label}-${value}`;
						return (
							<label key={value} htmlFor={optionId} className="filter-accordion__option">
								<input id={optionId} type="checkbox" checked={checked} onChange={() => onToggle(value)} />
								<span className="filter-accordion__option-value">{value}</span>
								<span className="filter-accordion__option-count">({count})</span>
							</label>
						);
					})}
				</AnimatedContainer>
			)}
		</div>
	);
};

export default FilterAccordion;
