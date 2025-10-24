import { useState, FormEvent, Dispatch, SetStateAction, ChangeEvent } from "react";
import { motion } from "framer-motion";
import DropDownSelect from "./DropDownSelect/DropDownSelect";
import CheckboxCollection from "./CheckboxCollection/CheckboxCollection";
import TextInput from "./TextInput/TextInput";
import TextPillField from "./TextInput/TextPillField";
import { ItemFormData, ViewType } from "../../utils/types";
import {
	colorOptions,
	sizeOptions,
	categoryOptions,
	clothesAgesOptions,
	formItem,
	materialExamples,
	brandExamples,
	careExamples,
} from "../../utils/constants";
import { useLocalStorageCloset } from "../../hooks/useLocalCloset";
import { useLocalStorage } from "../../hooks/uselocalStorage";
import "./Form.css";

// MULTI-STEP(8) FORM
export interface FormProps {
	setView: Dispatch<SetStateAction<ViewType>>;
}

const MATERIAL_OPTIONS_KEY = "my_material_key";
const BRAND_OPTIONS_KEY = "my_brands_key";
const CARE_OPTIONS_KEY = "my_care_key";

const MultiStepForm = ({ setView }: FormProps) => {
	const [step, setStep] = useState(1);
	const [formData, setFormData] = useState<ItemFormData>(formItem);

	const [materialoptions, setMaterialOptions] = useLocalStorage(MATERIAL_OPTIONS_KEY, materialExamples);
	const [brandOptions, setBrandOptions] = useLocalStorage(BRAND_OPTIONS_KEY, brandExamples);
	const [careOptions, setCareOptions] = useLocalStorage(CARE_OPTIONS_KEY, careExamples);

	const { addItem } = useLocalStorageCloset();

	const toggleValue = (value: string, label: string) => {
		setFormData((prev) => ({ ...prev, [label]: value }));
	};

	const handleInputChange = (e: ChangeEvent<HTMLInputElement>, label: string) => {
		setFormData((previousValues) => ({ ...previousValues, [label]: e.target.value }));
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
	console.log({ formData });
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
						<TextPillField
							label="brand"
							name="brand"
							className="string"
							placeholder="add more options"
							pillArray={brandOptions}
							onPillsChange={setBrandOptions}
							handleFormUpdate={toggleValue}
							formData={formData}
						/>
					</div>
				)}

				{/* STEP 5: MATERIAL */}
				{step === 5 && (
					<TextPillField
						label="material"
						name="material"
						className="string"
						placeholder="add more options"
						pillArray={materialoptions}
						onPillsChange={setMaterialOptions}
						handleFormUpdate={toggleValue}
						formData={formData}
						multiSelect={true}
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
						handleFormUpdate={handleInputChange}
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
						<TextPillField
							label="Care Instructions"
							name="Care Instructions"
							className="string"
							placeholder="add more options"
							pillArray={careOptions}
							onPillsChange={setCareOptions}
							handleFormUpdate={toggleValue}
							formData={formData}
							multiSelect={true}
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
