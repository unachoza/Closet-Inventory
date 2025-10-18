import { useState, FormEvent, Dispatch, SetStateAction } from "react";
import { motion } from "framer-motion";
import DropDownSelect from "./DropDownSelect/DropDownSelect";
import CheckboxCollection from "./CheckboxCollection/CheckboxCollection";
import TextInput from "./TextInput/TextInput";
import { ItemFormData, ViewType } from "../../utils/types";
import { colorOptions, sizeOptions, categoryOptions, clothesAgesOptions, formItem } from "../../utils/constants";
import { useLocalStorageCloset } from "../../hooks/useLocalCloset";

import "./Form.css";

// MULTI-STEP(8) FORM
export interface FormProps {
	setView: Dispatch<SetStateAction<ViewType>>;
}

const MultiStepForm = ({ setView }: FormProps) => {
	// Manage step-based progression
	const [step, setStep] = useState(1);
	const { addItem } = useLocalStorageCloset();

	const [formData, setFormData] = useState<ItemFormData>(formItem);

	const toggleValue = (value: string, label: string) => {
		setFormData((prev) => {
			return { ...prev, [label]: value };
		});
	};

	const handleNext = () => {
		setStep((prev) => prev + 1);
	};

	const handleBack = () => {
		setStep((prev) => prev - 1);
	};

	const handleSubmit = (e: FormEvent) => {
		e.preventDefault();

		addItem(formData);

		setFormData(formItem);
		setStep(1);
		setTimeout(() => {
			setView("overview");
		}, 0);
	};

	return (
		<div className="form">
			<motion.form
				layout
				onSubmit={handleSubmit}
				initial={{ opacity: 0, scale: 0.8 }}
				animate={{ opacity: 1, scale: 1 }}
				transition={{ duration: 0.5 }}
			>
				{/* STEP 1: CATEGORY */}
				{step === 1 && (
					<div className="field-label">
						<label>Clothing Category</label>

						<DropDownSelect options={categoryOptions} formField="category" setFormData={setFormData} />
					</div>
				)}

				{/* STEP 2: COLOR */}
				{step === 2 && (
					<CheckboxCollection label="color" detailOptions={colorOptions} onToggleDetail={toggleValue} formData={formData} />
				)}

				{/* STEP 3: SIZE */}
				{step === 3 && (
					<CheckboxCollection label="size" detailOptions={sizeOptions} onToggleDetail={toggleValue} formData={formData} />
				)}

				{/* STEP 4: BRAND */}
				{step === 4 && (
					<div className="form-step">
						<TextInput
							label="brand"
							name="brand"
							type="text"
							className="string"
							value={formData.brand}
							handleChange={(e: { target: { value: any } }) => setFormData((p) => ({ ...p, brand: e.target.value }))}
							placeholder="e.g. Gucci, Zara..."
						/>
					</div>
				)}

				{/* STEP 5: MATERIAL */}
				{step === 5 && (
					<TextInput
						label="material"
						name="material"
						type="text"
						className="string"
						value={formData.material}
						handleChange={(e: { target: { value: any } }) => setFormData((p) => ({ ...p, material: e.target.value }))}
						placeholder="e.g. Cotton, Silk..."
					/>
				)}

				{/* STEP 6: OCCASION */}
				{step === 6 && (
					<TextInput
						label="occasion"
						name="occasion"
						type="text"
						className="string"
						value={formData.occasion}
						handleChange={(e: any) => setFormData((p) => ({ ...p, occasion: e.target.value }))}
						placeholder="e.g. Casual, Formal..."
					/>
				)}

				{/* STEP 7: AGE */}
				{step === 7 && (
					<CheckboxCollection label="age" detailOptions={clothesAgesOptions} onToggleDetail={toggleValue} formData={formData} />
				)}

				{/* STEP 8: CARE */}
				{step === 8 && (
					<div className="form-step">
						<label>Care Instructions</label>
						<input
							value={formData.care}
							onChange={(e: any) => setFormData((p) => ({ ...p, care: e.target.value }))}
							placeholder="e.g. Dry clean only"
						/>
					</div>
				)}

				{/* NAVIGATION bUTTONS */}
				<div className="form-controls">
					{step > 1 && (
						<button
							className="back-button"
							onClick={(e: any) => {
								e.preventDefault();
								handleBack();
							}}
						>
							Back
						</button>
					)}
					{step < 8 && (
						<button
							className="next-button"
							onClick={(e: any) => {
								e.preventDefault();
								handleNext();
							}}
						>
							Next
						</button>
					)}
					{step === 8 && (
						<button type="submit" className="submit" onClick={handleSubmit}>
							Submit
						</button>
					)}
				</div>
			</motion.form>
		</div>
	);
};

export default MultiStepForm;

// https://examples.motion.dev/react/modal
// https://examples.motion.dev/react/warp-overlay
// https://examples.motion.dev/react/shared-layout-animation
// https://examples.motion.dev/react/exit-animation
