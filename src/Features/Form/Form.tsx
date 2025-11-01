import { useState, FormEvent, Dispatch, SetStateAction, ChangeEvent, MouseEvent } from "react";
import { motion } from "framer-motion";
import DropDownSelect from "./DropDownSelect/DropDownSelect";
import CheckboxCollection from "./CheckboxCollection/CheckboxCollection";
import TextPillField from "./TextInput/TextPillField";
import { CategoryType, ItemFormData, ViewType } from "../../utils/types";
import {
	colorOptions,
	sizeOptions,
	categoryOptions,
	clothesAgesOptions,
	formItem,
	materialExamples,
	brandExamples,
	careExamples,
	occasionExamples,
} from "../../utils/constants";
import { useLocalStorageCloset } from "../../hooks/useLocalCloset";
import { useLocalStorage } from "../../hooks/uselocalStorage";
import "./Form.css";
import "../../Components/ProgressionTracker/ProgressionTracker.css";
import StepTabsTracker from "../../Components/ProgressionTracker/ProgressionTracker";
import MonthYearPicker from "./DatePicker/MonthYearPicker";
import ImageUploaderInput from "./ImageUploader/ImageUploader";
import useStockPhoto from "../../hooks/useStockPhoto";
import { useToast } from "../../Components/Toast/Toast";

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
	const { showToast } = useToast();

	const toggleValue = (value: string, label: string) => {
		setFormData((prev) => ({ ...prev, [label]: value }));
	};

	const handleInputChange = (e: ChangeEvent<HTMLInputElement>, label: string) => {
		setFormData((previousValues) => ({ ...previousValues, [label]: e.target.value }));
	};

	const handleDateSelect = (date: Date) => {
		const today = new Date();
		let months = (today.getFullYear() - date.getFullYear()) * 12;
		months += today.getMonth() - date.getMonth();

		if (today.getDate() < date.getDate()) {
			months -= 1;
		}

		// If less than 20 months, show in months
		if (months < 20) {
			setFormData((prev) => ({
				...prev,
				age: `${months} month${months > 1 ? "s" : ""}`,
				purchaseDate: date.toISOString(),
			}));
		} else {
			const years = Math.floor(months / 12);
			setFormData((prev) => ({
				...prev,
				age: `${years} year${years > 1 ? "s" : ""}`,
				purchaseDate: date.toISOString(),
			}));
		}
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
		showToast(`${formData.category} added to your closet!`);

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
				{/* <StepProgressTracker currentStep={step} onStepClick={setStep} /> */}
				<StepTabsTracker currentStep={step} onStepClick={setStep} />

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
					<CheckboxCollection
						label="occasion"
						detailOptions={occasionExamples}
						onToggleDetail={toggleValue}
						formData={formData}
					/>
				)}

				{/* STEP 7: AGE */}

				{step === 7 && (
					<div className="form-step two-option-step">
						<label className="step-label">Item Age</label>
						<div className="double-options">
							{/* Left: checkboxes */}
							<div className="age-checkboxes">
								<span className="option-label">Select Age</span>
								<CheckboxCollection
									label="age"
									detailOptions={clothesAgesOptions}
									onToggleDetail={toggleValue}
									formData={formData}
								/>
							</div>
							{/* Right: date picker */}
							<div className="age-datepicker">
								<span className="option-label">Or select purchase date</span>
								<MonthYearPicker
									selectedDate={formData.purchaseDate ? new Date(formData.purchaseDate) : undefined}
									onSelectDate={handleDateSelect}
								/>
							</div>
						</div>
					</div>
				)}

				{/* STEP 8: CARE */}
				{step === 8 && (
					<div className="form-step">
						<label>Care Instructions</label>
						<TextPillField
							label="care"
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
				{/* STEP 8: IMAGE */}
				{step === 9 && (
					<div className="form-step two-option-step">
						<label className="step-label">Photo</label>
						<div className="double-options">
							<ImageUploaderInput
								image={formData.imageURL}
								onImageSelect={(base64) => setFormData((prev) => ({ ...prev, imageURL: base64 }))}
								onImageRemove={() => setFormData((prev) => ({ ...prev, image: "" }))}
							/>
							<div className="image-uploader">
								<label className="step-label">or use default image?</label>
								<div className="image-uploader-box">
									<img
										src={useStockPhoto(formData.category as CategoryType)}
										className="image-preview"
										alt="preview"
									/>
								</div>
							</div>
						</div>
					</div>
				)}

				{/* NAVIGATION bUTTONS */}
				<div className="form-controls">
					{step > 1 && (
						<button
							className="back-button"
							onClick={(e: MouseEvent<HTMLButtonElement>) => {
								e.preventDefault();
								handleBack();
							}}
						>
							Back
						</button>
					)}
					{step < 9 && (
						<button
							className="next-button"
							onClick={(e: MouseEvent<HTMLButtonElement>) => {
								e.preventDefault();
								handleNext();
							}}
						>
							Next
						</button>
					)}
					{step === 9 && (
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
