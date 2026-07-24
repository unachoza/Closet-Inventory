import { categoryOptions } from "../../../utils/constants";

interface CategoryStepProps {
	selected: string;
	onSelect: (category: string) => void;
}

/** Step 2: required category, as large tappable chips (no dropdown popover).
 *  A second-level category refinement is planned to hang off this step. */
const CategoryStep = ({ selected, onSelect }: CategoryStepProps) => {
	return (
		<div className="form-step">
			<label className="step-label">What is it?</label>
			<p className="step-hint">Pick a category to keep your closet organized.</p>
			<div className="category-chip-grid" role="group" aria-label="Clothing Category">
				{categoryOptions.map(({ value, label }) => {
					const isSelected = selected === value;
					return (
						<button
							key={value}
							type="button"
							className={`category-chip${isSelected ? " category-chip--selected" : ""}`}
							aria-pressed={isSelected}
							onClick={() => onSelect(value)}
						>
							{label}
						</button>
					);
				})}
			</div>
		</div>
	);
};

export default CategoryStep;
