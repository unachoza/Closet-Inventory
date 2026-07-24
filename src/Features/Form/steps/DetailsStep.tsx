import { ChangeEvent, Dispatch, SetStateAction } from "react";
import MaterialBlendInput from "../../../Components/MaterialBlendInput/MaterialBlendInput";
import CheckboxCollection from "../CheckboxCollection/CheckboxCollection";
import TextPillField from "../TextInput/TextPillField";
import PurchasedField from "./PurchasedField";
import { conditionOptions, occasionExamples } from "../../../utils/constants";
import { normalizeMaterial } from "../../../utils/materialUtils";
import type { ItemFormData, MaterialBlend } from "../../../utils/types";

interface DetailsStepProps {
	data: ItemFormData;
	onChange: (patch: Partial<ItemFormData>) => void;
	onToggleValue: (value: string | ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, label?: string) => void;
	careOptions: string[];
	setCareOptions: Dispatch<SetStateAction<string[]>>;
	/** Auto-generated suggestion shown until the user edits the name themselves. */
	displayName: string;
	onNameEdit: (name: string) => void;
}

/** Step 4: everything optional on one scrollable screen, skippable as a whole. */
const DetailsStep = ({ data, onChange, onToggleValue, careOptions, setCareOptions, displayName, onNameEdit }: DetailsStepProps) => {
	const handlePriceChange = (e: ChangeEvent<HTMLInputElement>) => {
		const raw = e.target.value;
		if (raw === "") {
			onChange({ price: undefined });
			return;
		}
		const parsed = Number(raw);
		if (!Number.isNaN(parsed) && parsed >= 0) onChange({ price: parsed });
	};

	return (
		<div className="form-step details-step">
			<label className="step-label">Details</label>
			<p className="step-hint">All optional — skip anything you don't know.</p>

			<div className="basics-section">
				<span className="option-label">Name</span>
				<input
					type="text"
					className="details-text-input"
					aria-label="Item name"
					value={displayName}
					onChange={(e) => onNameEdit(e.target.value)}
				/>
			</div>

			<div className="basics-section">
				<span className="option-label">Price</span>
				<input
					type="number"
					inputMode="decimal"
					min="0"
					step="0.01"
					className="details-text-input details-price-input"
					aria-label="Price"
					placeholder="$"
					value={data.price ?? ""}
					onChange={handlePriceChange}
				/>
			</div>

			<div className="basics-section">
				<span className="option-label">Purchased</span>
				<PurchasedField value={data.purchaseDate ?? ""} onChange={(purchaseDate) => onChange({ purchaseDate })} />
			</div>

			<div className="basics-section">
				<span className="option-label">Condition</span>
				<CheckboxCollection label="condition" detailOptions={conditionOptions} onToggleDetail={onToggleValue} formData={data} />
			</div>

			<div className="basics-section">
				<span className="option-label">Occasion</span>
				<CheckboxCollection label="occasion" detailOptions={occasionExamples} onToggleDetail={onToggleValue} formData={data} />
			</div>

			<div className="basics-section">
				<span className="option-label">Material</span>
				<p className="step-hint">Add each fiber and its percentage. Total must equal 100%.</p>
				<MaterialBlendInput
					value={normalizeMaterial(data.material)}
					onChange={(blend: MaterialBlend[]) => onChange({ material: blend })}
				/>
			</div>

			<div className="basics-section">
				<TextPillField
					label="care"
					name="Care Instructions"
					className="string"
					placeholder="add more options"
					pillArray={careOptions}
					onPillsChange={setCareOptions}
					handleFormUpdate={onToggleValue}
					formData={data}
					multiSelect={true}
				/>
			</div>
		</div>
	);
};

export default DetailsStep;
