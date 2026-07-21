import { Dispatch, SetStateAction } from "react";
import ColorSwatchGrid from "./ColorSwatchGrid";
import TextPillField from "../TextInput/TextPillField";
import { colorOptions, sizeOptions } from "../../../utils/constants";
import type { ItemFormData } from "../../../utils/types";

interface BasicsStepProps {
	data: ItemFormData;
	onChange: (patch: Partial<ItemFormData>) => void;
	brandOptions: string[];
	setBrandOptions: Dispatch<SetStateAction<string[]>>;
	onBrandUpdate: (value: string | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, label?: string) => void;
}

/** Step 3: color + size + brand on one screen — all optional. */
const BasicsStep = ({ data, onChange, brandOptions, setBrandOptions, onBrandUpdate }: BasicsStepProps) => {
	return (
		<div className="form-step basics-step">
			<div className="basics-section">
				<span className="option-label">Color</span>
				<ColorSwatchGrid options={colorOptions} selected={data.color} onSelect={(color) => onChange({ color })} />
			</div>

			<div className="basics-section">
				<span className="option-label">Size</span>
				<div className="size-chip-row" role="group" aria-label="Size">
					{sizeOptions.map((size) => {
						const isSelected = data.size === size;
						return (
							<button
								key={size}
								type="button"
								className={`category-chip size-chip${isSelected ? " category-chip--selected" : ""}`}
								aria-pressed={isSelected}
								onClick={() => onChange({ size: isSelected ? "" : size })}
							>
								{size}
							</button>
						);
					})}
				</div>
			</div>

			<div className="basics-section">
				<TextPillField
					label="brand"
					name="brand"
					className="string"
					placeholder="add more options"
					pillArray={brandOptions}
					onPillsChange={setBrandOptions}
					handleFormUpdate={onBrandUpdate}
					formData={data}
				/>
			</div>
		</div>
	);
};

export default BasicsStep;
