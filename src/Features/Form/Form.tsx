import React, { useState, useMemo, useEffect, FormEvent, Dispatch, SetStateAction, MouseEvent } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import Modal from "../../Components/Modal/Modal";
import PhotoStep from "./steps/PhotoStep";
import CategoryStep from "./steps/CategoryStep";
import BasicsStep from "./steps/BasicsStep";
import DetailsStep from "./steps/DetailsStep";
import { ItemFormData, ViewType } from "../../utils/types";
import { formItem, brandExamples, careExamples } from "../../utils/constants";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import { useCloset } from "../../context/ClosetContext";
import { useSetNavGuard } from "../../context/ViewContext";
import { generateItemName } from "./generateItemName";
import "./Form.css";
import "../../Components/ProgressionTracker/ProgressionTracker.css";
import StepTabsTracker from "../../Components/ProgressionTracker/ProgressionTracker";
import { useToast } from "../../Components/Toast/Toast";

// MULTI-STEP(4) FORM: Photo → Category → Basics → Details
export interface FormProps {
	setView: Dispatch<SetStateAction<ViewType>>;
	initialData?: Partial<ItemFormData>;
}

const BRAND_OPTIONS_KEY = "my_brands_key";
const CARE_OPTIONS_KEY = "my_care_key";

const STEP_PHOTO = 1;
const STEP_CATEGORY = 2;
const STEP_BASICS = 3;
const STEP_DETAILS = 4;
const TOTAL_STEPS = 4;

const MultiStepForm = ({ setView, initialData }: FormProps) => {
	const [step, setStep] = useState(STEP_PHOTO);
	const [formData, setFormData] = useState<ItemFormData>({
		...formItem,
		...initialData,
	});
	// Explicit "no photo — use a stock image" choice; satisfies the photo
	// requirement, the actual image resolves from category at submit (addItem).
	const [useStockPhoto, setUseStockPhoto] = useState(false);
	// Once the user edits the name themselves, stop auto-generating it.
	const [nameTouched, setNameTouched] = useState(Boolean(initialData?.name));

	const [brandOptions, setBrandOptions] = useLocalStorage(BRAND_OPTIONS_KEY, brandExamples);
	const [careOptions, setCareOptions] = useLocalStorage(CARE_OPTIONS_KEY, careExamples);

	const { addItem } = useCloset();
	const { showToast } = useToast();

	// The wizard's dead ends: the ✕ below asks for confirmation when there's
	// progress to lose, and the same dirty state is registered as a nav guard so
	// bottom-nav / drawer taps can't silently discard the wizard either.
	const initialData_json = useMemo(() => JSON.stringify({ ...formItem, ...initialData }), [initialData]);
	const isDirty = JSON.stringify(formData) !== initialData_json;
	const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

	const setNavGuard = useSetNavGuard();
	useEffect(() => {
		setNavGuard(() => isDirty);
		return () => setNavGuard(null);
	}, [setNavGuard, isDirty]);

	const handleExit = () => {
		if (isDirty) {
			setShowDiscardConfirm(true);
			return;
		}
		leaveTo("overview");
	};

	// Intentional navigation must clear the guard first, or the guard would
	// re-prompt over a discard/submit the user just confirmed.
	const leaveTo = (view: ViewType) => {
		setNavGuard(null);
		setView(view);
	};

	const discardAndLeave = () => {
		setShowDiscardConfirm(false);
		leaveTo("overview");
	};

	const applyPatch = (patch: Partial<ItemFormData>) => {
		setFormData((prev) => ({ ...prev, ...patch }));
	};

	const toggleValue = (value: string | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, label?: string) => {
		const str = typeof value === "string" ? value : value.target.value;
		if (!label) return;
		setFormData((prev) => ({ ...prev, [label]: str }));
	};

	// Only the first two steps gate progress; Basics and Details are optional.
	const isStepComplete = (n: number): boolean => {
		if (n === STEP_PHOTO) return Boolean(formData.imageURL) || useStockPhoto;
		if (n === STEP_CATEGORY) return Boolean(formData.category);
		return true;
	};

	// Furthest step the user may jump to: right after the first incomplete
	// required step. Keeps the tab tracker from skipping past the photo/category gates.
	const maxReachableStep = (() => {
		for (let n = 1; n < TOTAL_STEPS; n++) {
			if (!isStepComplete(n)) return n;
		}
		return TOTAL_STEPS;
	})();

	const goToStep = (n: number) => {
		setStep(Math.min(Math.max(n, 1), maxReachableStep));
	};

	const currentStepComplete = isStepComplete(step);
	const displayName = nameTouched ? (formData.name ?? "") : generateItemName(formData);

	const handleNameEdit = (name: string) => {
		setNameTouched(true);
		applyPatch({ name });
	};

	const handleSubmit = (e: FormEvent) => {
		e.preventDefault();

		addItem({ ...formData, name: displayName });
		showToast(`${formData.category} added to your closet!`);

		setNavGuard(null);
		setFormData(formItem);
		setUseStockPhoto(false);
		setNameTouched(false);
		setStep(STEP_PHOTO);
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
				<StepTabsTracker currentStep={step} onStepClick={goToStep} />

				<div className="form-step-content">
					{step === STEP_PHOTO && (
						<PhotoStep
							imageURL={formData.imageURL}
							useStockPhoto={useStockPhoto}
							onImageSelect={(src) => applyPatch({ imageURL: src })}
							onImageRemove={() => applyPatch({ imageURL: "" })}
							onUseStockPhoto={setUseStockPhoto}
						/>
					)}

					{step === STEP_CATEGORY && (
						<CategoryStep selected={formData.category} onSelect={(category) => applyPatch({ category })} />
					)}

					{step === STEP_BASICS && (
						<BasicsStep
							data={formData}
							onChange={applyPatch}
							brandOptions={brandOptions}
							setBrandOptions={setBrandOptions}
							onBrandUpdate={toggleValue}
						/>
					)}

					{step === STEP_DETAILS && (
						<DetailsStep
							data={formData}
							onChange={applyPatch}
							onToggleValue={toggleValue}
							careOptions={careOptions}
							setCareOptions={setCareOptions}
							displayName={displayName}
							onNameEdit={handleNameEdit}
						/>
					)}
				</div>

				{/* NAVIGATION BUTTONS */}
				<div className="form-controls">
					{step > 1 && (
						<button
							className="back-button"
							onClick={(e: MouseEvent<HTMLButtonElement>) => {
								e.preventDefault();
								setStep((prev) => prev - 1);
							}}
						>
							Back
						</button>
					)}
					{step === STEP_BASICS && (
						<button type="submit" className="skip-button">
							Skip &amp; add
						</button>
					)}
					{step < TOTAL_STEPS && (
						<button
							className="next-button"
							disabled={!currentStepComplete}
							onClick={(e: MouseEvent<HTMLButtonElement>) => {
								e.preventDefault();
								if (isStepComplete(step)) setStep((prev) => prev + 1);
							}}
						>
							Next
						</button>
					)}
					{step === TOTAL_STEPS && (
						<button type="submit" className="submit">
							Add to closet
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
