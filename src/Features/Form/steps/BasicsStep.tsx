import { Dispatch, SetStateAction } from "react";
import PillGroup from "../PillGroup/PillGroup";
import TextPillField from "../TextInput/TextPillField";
import { colorOptions, sizeOptions } from "../../../utils/constants";

// Two tappable rows: letter sizes, then numeric sizes.
const LETTER_SIZES = sizeOptions.filter((s) => Number.isNaN(Number(s)));
const NUMERIC_SIZES = sizeOptions.filter((s) => !Number.isNaN(Number(s)));
import { getColorSwatchFill } from "../../../utils/colorSwatches";
import type { ItemFormData } from "../../../utils/types";

interface BasicsStepProps {
	data: ItemFormData;
	onToggle: (value: string, field: keyof ItemFormData) => void;
	brandOptions: string[];
	setBrandOptions: Dispatch<SetStateAction<string[]>>;
}

/** Step 3: color + size + brand on one screen — all optional. Category is
 *  chosen on the prior step, so it isn't repeated here. */
const BasicsStep = ({ data, onToggle, brandOptions, setBrandOptions }: BasicsStepProps) => {
	return (
		<div className="form-step basics-step">
			<PillGroup
				label="Color"
				fieldName="color"
				options={colorOptions}
				formData={data}
				onToggle={onToggle}
				getSwatch={getColorSwatchFill}
			/>

			<PillGroup
				label="Size"
				fieldName="size"
				options={sizeOptions}
				rows={[LETTER_SIZES, NUMERIC_SIZES]}
				formData={data}
				onToggle={onToggle}
			/>

			<TextPillField
				label="brand"
				name="brand"
				className="string"
				placeholder="add more options"
				pillArray={brandOptions}
				onPillsChange={setBrandOptions}
				handleFormUpdate={onToggle}
				formData={data}
			/>
		</div>
	);
};

export default BasicsStep;
