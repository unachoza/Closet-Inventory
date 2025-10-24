import { useState, FormEvent, ChangeEvent, Dispatch, SetStateAction } from "react";
import { motion } from "framer-motion";
import * as Dialog from "@radix-ui/react-dialog";
import DropDownSelect from "./DropDownSelect/DropDownSelect";
import CheckboxCollection from "./CheckboxCollection/CheckboxCollection";
import TextInput from "./TextInput/TextInput";
import TextPillField from "./TextInput/TextPillField";
import { ItemFormData, ViewType } from "../../utils/types";
import { colorOptions, sizeOptions, categoryOptions, clothesAgesOptions, formItem, materialExamples, brandExamples } from "../../utils/constants";
import { useLocalStorageCloset } from "../../hooks/useLocalCloset";
import { useLocalStorage } from "../../hooks/uselocalStorage";
import "./FormAnnimated.css";

const MATERIAL_OPTIONS_KEY = "my_material_key";
const BRAND_OPTIONS_KEY = "my_brands_key";

// MULTI-STEP(8) FORM
export interface FormProps {
	setView: Dispatch<SetStateAction<ViewType>>;
	onClose: () => void;
}

const MultiStepFormDialog = ({ setView, onClose }: FormProps) => {
	const [step, setStep] = useState(1);
	const [formData, setFormData] = useState<ItemFormData>(formItem);
	const [materialOptions, setMaterialOptions] = useLocalStorage(MATERIAL_OPTIONS_KEY, materialExamples);
	const [brandOptions, setBrandOptions] = useLocalStorage(BRAND_OPTIONS_KEY, brandExamples);
	const { addItem } = useLocalStorageCloset();

	const toggleValue = (value: string, label: string) => {
		setFormData((prev) => ({ ...prev, [label]: value }));
	};

	const handleInputChange = (e: ChangeEvent<HTMLInputElement>, label: string) => {
		setFormData((prev) => ({ ...prev, [label]: e.target.value }));
	};

	const handleSubmit = (e: FormEvent) => {
		e.preventDefault();
		addItem(formData);
		setFormData(formItem);
		setStep(1);
		onClose();
		setView("overview");
	};

	return (
		<motion.form
			onSubmit={handleSubmit}
			className="form"
			initial={{ opacity: 0, scale: 0.9 }}
			animate={{ opacity: 1, scale: 1 }}
			transition={{ duration: 0.4 }}
		>
			<form onSubmit={handleSubmit} className="form">
				{/* Step 1 */}
				{step === 1 && (
					<div className="form-step">
						<label>Clothing Category</label>
						<DropDownSelect options={categoryOptions} formField="category" setFormData={setFormData} />
					</div>
				)}

				{/* Step 2 */}
				{step === 2 && (
					<CheckboxCollection label="color" detailOptions={colorOptions} onToggleDetail={toggleValue} formData={formData} />
				)}

				{/* Step 3 */}
				{step === 3 && (
					<CheckboxCollection label="size" detailOptions={sizeOptions} onToggleDetail={toggleValue} formData={formData} />
				)}

				{/* Step 4 */}
				{step === 4 && (
					<TextPillField
						label="brand"
						name="brand"
						placeholder="... Gucci, Zara..."
						pillArray={brandOptions}
						onPillsChange={setBrandOptions}
						handleFormUpdate={toggleValue}
						formData={formData}
					/>
				)}

				{/* Step 5 */}
				{step === 5 && (
					<TextPillField
						label="material"
						name="material"
						placeholder="... Cotton, Silk..."
						pillArray={materialOptions}
						onPillsChange={setMaterialOptions}
						handleFormUpdate={toggleValue}
						formData={formData}
						multiSelect={true}
					/>
				)}

				{/* Step 6 */}
				{step === 6 && (
					<TextInput
						label="occasion"
						name="occasion"
						type="text"
						value={formData.occasion}
						handleFormUpdate={handleInputChange}
						placeholder="e.g. Casual, Formal..."
					/>
				)}

				{/* Step 7 */}
				{step === 7 && (
					<CheckboxCollection label="age" detailOptions={clothesAgesOptions} onToggleDetail={toggleValue} formData={formData} />
				)}

				{/* Step 8 */}
				{step === 8 && (
					<div className="form-step">
						<label>Care Instructions</label>
						<input
							value={formData.care}
							onChange={(e) => setFormData((p) => ({ ...p, care: e.target.value }))}
							placeholder="e.g. Dry clean only"
						/>
					</div>
				)}

				{/* Navigation */}
				<div className="form-controls">
					{step > 1 && (
						<button type="button" className="back-button" onClick={() => setStep((s) => s - 1)}>
							Back
						</button>
					)}

					{step < 8 && (
						<button type="button" className="next-button" onClick={() => setStep((s) => s + 1)}>
							Next
						</button>
					)}

					{step === 8 && (
						<button type="submit" className="submit">
							Submit
						</button>
					)}
				</div>
			</form>
		</motion.form>
	);
};

export default MultiStepFormDialog;
