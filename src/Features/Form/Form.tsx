import React, { useState, useMemo, FormEvent, Dispatch, SetStateAction, MouseEvent } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import Modal from "../../Components/Modal/Modal";
import DropDownSelect from "./DropDownSelect/DropDownSelect";
import PillGroup from "./PillGroup/PillGroup";
import TextPillField from "./TextInput/TextPillField";
import MaterialBlendInput from "../../Components/MaterialBlendInput/MaterialBlendInput";
import { CategoryType, ItemFormData, MaterialBlend, ViewType } from "../../utils/types";
import {
	colorOptions,
	sizeOptions,
	categoryOptions,
	conditionOptions,
	formItem,
	brandExamples,
	careExamples,
	occasionExamples,
} from "../../utils/constants";
import { getColorSwatchFill } from "../../utils/colorSwatches";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import { useCloset } from "../../context/ClosetContext";
import { normalizeMaterial } from "../../utils/materialUtils";
import "./Form.css";
import "../../Components/ProgressionTracker/ProgressionTracker.css";
import StepTabsTracker from "../../Components/ProgressionTracker/ProgressionTracker";
import PurchasedField from "./PurchasedField/PurchasedField";
import ImageUploaderInput from "./ImageUploader/ImageUploader";
import getStockPhoto from "../../utils/getStockPhoto";
import { useToast } from "../../Components/Toast/Toast";

// MULTI-STEP(3) FORM: Basics (category/color/size/brand) → Details (material/care/occasion/condition/date) → Photo
export interface FormProps {
	setView: Dispatch<SetStateAction<ViewType>>;
	initialData?: Partial<ItemFormData>;
}

const BRAND_OPTIONS_KEY = "my_brands_key";
const CARE_OPTIONS_KEY = "my_care_key";

const MultiStepForm = ({ setView, initialData }: FormProps) => {
	const [step, setStep] = useState(1);
	const [formData, setFormData] = useState<ItemFormData>({
		...formItem,
		...initialData,
	});

	const [brandOptions, setBrandOptions] = useLocalStorage(BRAND_OPTIONS_KEY, brandExamples);
	const [careOptions, setCareOptions] = useLocalStorage(CARE_OPTIONS_KEY, careExamples);

	const { addItem } = useCloset();
	const { showToast } = useToast();

	// The wizard's one true dead end was the nav bar: tapping any tab discarded
	// all steps with no warning. The ✕ below is the intended exit; it only asks
	// for confirmation when there's actual progress to lose (dirty check against
	// the initial/prefilled baseline).
	const initialData_json = useMemo(() => JSON.stringify({ ...formItem, ...initialData }), [initialData]);
	const isDirty = JSON.stringify(formData) !== initialData_json;
	const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

	const handleExit = () => {
		if (isDirty) {
			setShowDiscardConfirm(true);
			return;
		}
		setView("overview");
	};

	const discardAndLeave = () => {
		setShowDiscardConfirm(false);
		setView("overview");
	};

	const toggleValue = (value: string | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, label?: string) => {
		const str = typeof value === "string" ? value : value.target.value;
		if (!label) return;
		setFormData((prev) => ({ ...prev, [label]: str }));
	};

	// Capture only the purchase date — factual age is derived from it at display time
	// (see formatItemAge / the Card), so we no longer write a frozen age string here.
	const handleDateSelect = (date: Date) => {
		setFormData((prev) => ({ ...prev, purchaseDate: date.toISOString() }));
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
	return (
		<div className="form" data-testid="multistep-form">
			<button type="button" className="form-close-btn" onClick={handleExit} aria-label="Close and discard this item">
				<X size={20} />
			</button>
			<motion.form
				layout
				onSubmit={handleSubmit}
				initial={{ opacity: 0, scale: 0.8 }}
				animate={{ opacity: 1, scale: 1 }}
				transition={{ duration: 0.5 }}
			>
				{/* <StepProgressTracker currentStep={step} onStepClick={setStep} /> */}
				<StepTabsTracker currentStep={step} onStepClick={setStep} />

				{/* STEP 1: PHOTO */}
				{step === 1 && (
					<div className="form-step two-option-step">
						<label className="step-label">Photo</label>
						<div className="double-options">
							<ImageUploaderInput
								image={formData.imageURL}
								onImageSelect={(base64) => setFormData((prev) => ({ ...prev, imageURL: base64 }))}
								onImageRemove={() => setFormData((prev) => ({ ...prev, imageURL: "" }))}
							/>
							<div className="image-uploader">
								<label className="step-label">or use default image?</label>
								<div className="image-uploader-box">
									<img
										src={getStockPhoto(formData.category as CategoryType)}
										className="image-preview"
										alt="preview"
									/>
								</div>
							</div>
						</div>
					</div>
				)}
				{/* STEP 2: BASICS — category (required), color, size, brand */}
				{step === 2 && (
					<div className="form-step-group">
						<div className="field-label">
							<label>Clothing Category</label>
							<DropDownSelect options={categoryOptions} formField="category" setFormData={setFormData} />
						</div>

						<PillGroup
							label="Color"
							fieldName="color"
							options={colorOptions}
							formData={formData}
							onToggle={toggleValue}
							getSwatch={getColorSwatchFill}
						/>

						<PillGroup label="Size" fieldName="size" options={sizeOptions} formData={formData} onToggle={toggleValue} />

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

				{/* STEP 3: DETAILS — material, care, occasion, condition, purchase date (all optional) */}
				{step === 3 && (
					<div className="form-step-group">
						<div className="form-subsection">
							<label className="step-label">Material Composition</label>
							<p className="step-hint">Add each fiber and its percentage. Total must equal 100%.</p>
							<MaterialBlendInput
								value={normalizeMaterial(formData.material)}
								onChange={(blend: MaterialBlend[]) => setFormData((prev) => ({ ...prev, material: blend }))}
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
								handleFormUpdate={toggleValue}
								formData={formData}
								multiSelect={true}
							/>
						</div>

						<PillGroup
							label="Occasion"
							fieldName="occasion"
							options={occasionExamples}
							formData={formData}
							onToggle={toggleValue}
						/>

						<PillGroup
							label="Condition"
							fieldName="condition"
							options={conditionOptions}
							formData={formData}
							onToggle={toggleValue}
						/>

						<PurchasedField
							selectedDate={formData.purchaseDate ? new Date(formData.purchaseDate) : undefined}
							onSelectDate={handleDateSelect}
						/>
					</div>
				)}

				{/* NAVIGATION BUTTONS */}
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
					{step < 3 && (
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
					{step === 3 && (
						<button type="submit" className="submit">
							Submit
						</button>
					)}
				</div>
			</motion.form>

			<Modal
				isOpen={showDiscardConfirm}
				onClose={() => setShowDiscardConfirm(false)}
				title="Discard this item?"
				maxWidth={400}
				footer={
					<>
						<button className="btn btn--ghost" type="button" onClick={() => setShowDiscardConfirm(false)}>
							Keep editing
						</button>
						<button className="btn btn--primary" type="button" onClick={discardAndLeave}>
							Discard
						</button>
					</>
				}
			>
				<p>You haven't added this item yet. Leaving now will lose what you've filled in.</p>
			</Modal>
		</div>
	);
};

export default MultiStepForm;

// https://examples.motion.dev/react/modal
// https://examples.motion.dev/react/warp-overlay
// https://examples.motion.dev/react/shared-layout-animation
// https://examples.motion.dev/react/exit-animation
