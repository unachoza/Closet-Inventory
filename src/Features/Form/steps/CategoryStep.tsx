import { categoryOptions } from "../../../utils/constants";

interface CategoryStepProps {
	selected: string;
	onSelect: (category: string) => void;
}

/** Step 2: required category, as large tappable chips (no dropdown popover). */
const CategoryStep = ({ selected, onSelect }: CategoryStepProps) => {
	return (
		<div className="form-step">
			<label className="step-label">What is it?</label>
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
