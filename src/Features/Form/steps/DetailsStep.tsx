import { ChangeEvent, Dispatch, SetStateAction } from "react";
import MaterialBlendInput from "../../../Components/MaterialBlendInput/MaterialBlendInput";
import PillGroup from "../PillGroup/PillGroup";
import TextPillField from "../TextInput/TextPillField";
import PurchasedField from "../PurchasedField/PurchasedField";
import { conditionOptions, occasionExamples } from "../../../utils/constants";
import { normalizeMaterial } from "../../../utils/materialUtils";
import { humanizeCondition } from "../../../utils/condition";
import type { ItemFormData, MaterialBlend } from "../../../utils/types";

interface DetailsStepProps {
	data: ItemFormData;
	onChange: (patch: Partial<ItemFormData>) => void;
	/** Matches TextPillField's handleFormUpdate so the same handler covers pills and text inputs. */
	onToggle: (value: string | ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, label?: string) => void;
	careOptions: string[];
	setCareOptions: Dispatch<SetStateAction<string[]>>;
	/** Auto-generated suggestion shown until the user edits the name themselves. */
	displayName: string;
	onNameEdit: (name: string) => void;
}

/** Step 4: everything optional on one scrollable screen. */
const DetailsStep = ({ data, onChange, onToggle, careOptions, setCareOptions, displayName, onNameEdit }: DetailsStepProps) => {
	const handlePriceChange = (e: ChangeEvent<HTMLInputElement>) => {
		const raw = e.target.value;
		if (raw === "") {
			onChange({ price: undefined });
			return;
		}
		const parsed = Number(raw);
		if (!Number.isNaN(parsed) && parsed >= 0) onChange({ price: parsed });
	};

	const purchasedDate = data.purchaseDate ? new Date(data.purchaseDate) : undefined;

	return (
		<div className="form-step details-step">
			<label className="step-label">Details</label>
			<p className="step-hint">All optional — skip anything you don't know.</p>

			<div className="details-row">
				<div className="form-subsection">
					<label className="step-label" htmlFor="item-name">
						Name
					</label>
					<input
						id="item-name"
						type="text"
						className="details-text-input"
						aria-label="Item name"
						value={displayName}
						onChange={(e) => onNameEdit(e.target.value)}
					/>
				</div>

				<div className="form-subsection">
					<label className="step-label" htmlFor="item-price">
						Price
					</label>
					<input
						id="item-price"
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

				<PurchasedField selectedDate={purchasedDate} onSelectDate={(date) => onChange({ purchaseDate: date.toISOString() })} />
			</div>

			<PillGroup
				label="Condition"
				fieldName="condition"
				options={conditionOptions}
				formData={data}
				onToggle={onToggle}
				getLabel={humanizeCondition}
			/>

			<PillGroup
				label="Occasion"
				fieldName="occasion"
				options={occasionExamples}
				formData={data}
				onToggle={onToggle}
				multiSelect
			/>

			<div className="form-subsection">
				<label className="step-label">Material Composition</label>
				<p className="step-hint">Add each fiber and its percentage. Total must equal 100%.</p>
				<MaterialBlendInput
					value={normalizeMaterial(data.material)}
					onChange={(blend: MaterialBlend[]) => onChange({ material: blend })}
				/>
			</div>

			<div className="form-subsection">
				<TextPillField
					label="care"
					name="Care Instructions"
					className="string"
					placeholder="add more options"
					pillArray={careOptions}
					onPillsChange={setCareOptions}
					handleFormUpdate={onToggle}
					formData={data}
					multiSelect={true}
				/>
			</div>
		</div>
	);
};

export default DetailsStep;
