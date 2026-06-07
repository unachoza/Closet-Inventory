import "./EditItemView.css";
import type { ClothingItem, CategoryType, MaterialBlend, ViewType } from "../../../utils/types";
import { useLocalStorageCloset } from "../../../hooks/useLocalCloset";
import useStockPhoto from "../../../hooks/useStockPhoto";
import TextInput from "../TextInput/TextInput";
import AnimatedCheckbox from "../CheckboxCollection/RadixCheckbox";
import MaterialBlendInput from "../../../Components/MaterialBlendInput/MaterialBlendInput";
import MaterialCompositionBar from "../../../Components/MaterialCompositionBar/MaterialCompositionBar";
import { formItem, conditionOptions } from "../../../utils/constants";
import { normalizeMaterial } from "../../../utils/materialUtils";
import { formatItemAge } from "../../../utils/itemAge";
import { matchedCondition } from "../../../utils/condition";

import { normalizeToString } from "../../../utils/normalizeToString";
import { Dispatch, SetStateAction, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useToast } from "../../../Components/Toast/Toast";
import close from "../../../assets/close.svg";

/** Extract form-editable fields from a ClothingItem. Used for both
 *  initial state and when the item prop changes (batch import queue). */
function buildFormDataFromItem(item: ClothingItem): Partial<ClothingItem> {
	return {
		name: item.name,
		size: item.size,
		brand: item.brand,
		material: normalizeMaterial(item.material),
		occasion: item.occasion,
		age: item.age,
		condition: matchedCondition(item.condition, item.age) ?? "new",
		purchaseDate: item.purchaseDate,
		care: item.care,
		price: item.price,
		onSale: item.onSale,
		notes: item.notes,
		imageURL: item.imageURL,
		category: item.category,
		color: item.color,
	};
}

/** Convert an ISO/RFC date string to the "yyyy-MM-dd" value a <input type="date"> expects. */
function toDateInputValue(iso?: string): string {
	if (!iso) return "";
	const d = new Date(iso);
	if (isNaN(d.getTime())) return "";
	return d.toISOString().slice(0, 10);
}

/** Human-readable absolute date, e.g. "Mar 15, 2024". */
function toAbsoluteDate(iso?: string): string {
	if (!iso) return "";
	const d = new Date(iso);
	if (isNaN(d.getTime())) return "";
	return d.toLocaleDateString("default", { year: "numeric", month: "short", day: "numeric" });
}

export interface EditItemViewProps {
	item: ClothingItem;
	mode?: "edit" | "create";
	updateItem?: (id: string, updatedItem: Partial<ClothingItem>) => void;
	setView: Dispatch<SetStateAction<ViewType>>;
	/** Return to the Gmail email preview the user imported from */
	onReturnToEmail?: () => void;
	/** Skip this item in a batch import queue */
	onSkipItem?: () => void;
	/** Called after item is added to closet in batch mode (advances queue) */
	onItemAdded?: () => void;
	/** Current position in import queue (1-based) */
	queuePosition?: number;
	/** Total items in import queue */
	queueTotal?: number;
}

const EditItemView = ({ item, mode = "edit", setView, onReturnToEmail, onSkipItem, onItemAdded, queuePosition, queueTotal }: EditItemViewProps) => {
	const isCreateMode = mode === "create";
	const isInBatchMode = queuePosition !== undefined && queueTotal !== undefined;
	// age/condition/purchaseDate are pulled out of `remaining` so they are NOT
	// auto-rendered as generic editable text inputs. They get bespoke controls:
	// condition → a fixed-option selector, purchaseDate → a disabled display
	// (or a manual-entry prompt when an import has no date), factual age → read-only.
	const { id, imageURL, onSale, notes, material: _material, age: _age, condition: _condition, purchaseDate: _purchaseDate, ...remaining } = item;
	const inputsToSeperate = { id, onSale, notes };
	const { updateItem, addFullItem } = useLocalStorageCloset();
	const { showToast } = useToast();
	// Parent renders <EditItemView key={item.id} ...> so React remounts the
	// component for each new item, reinitializing useState with fresh data.
	// No useEffect needed — key-based remount is the React-idiomatic approach.
	const [formData, setFormData] = useState<Partial<ClothingItem>>(() => buildFormDataFromItem(item));

	// Stable ref — uses functional update so it never needs formData in deps.
	// TextInput is wrapped in memo(), so a stable handleChange means only the
	// TextInput whose value actually changed will re-render (not all 10+).
	const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	}, []);

	const onToggleDetail = useCallback((key: string, value: any) => {
		setFormData((prev) => ({ ...prev, [key]: !value }));
	}, []);

	const handleConditionChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
		setFormData((prev) => ({ ...prev, condition: e.target.value }));
	}, []);

	// Manual-entry fallback when an imported email had no parseable date.
	const handlePurchaseDateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		const { value } = e.target;
		setFormData((prev) => ({ ...prev, purchaseDate: value ? new Date(value).toISOString() : "" }));
	}, []);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (isCreateMode) {
			const imageURL = formData.imageURL || useStockPhoto(formData.category as CategoryType);
			const displayName = formData.name || (formData.brand ? `${formData.brand} ${formData.category}` : formData.category) || "New Item";

			addFullItem({
				id: item.id || crypto.randomUUID(),
				imageURL,
				name: displayName,
				category: formData.category ?? "",
				color: formData.color?.toLowerCase() ?? "",
				size: formData.size ?? "",
				brand: formData.brand ?? "",
				price: formData.price ?? "",
				material: normalizeMaterial(formData.material),
				occasion: formData.occasion ?? "",
				age: formData.age ?? "",
				condition: formData.condition ?? "new",
				// Preserve the captured purchase date so the card can compute factual age.
				purchaseDate: formData.purchaseDate,
				care: formData.care ?? "",
				onSale: formData.onSale ?? false,
				notes: formData.notes ?? "",
			});
			showToast(`${displayName} added to your closet!`);

			// In batch mode, advance to next item instead of going to carousel
			if (isInBatchMode && onItemAdded) {
				setTimeout(() => onItemAdded());
				return;
			}
		} else {
			updateItem(item.id, formData);
			setFormData(formItem);
			showToast(`${formData.name} updated`);
		}

		setTimeout(() => {
			setView("carousel");
		});
	};

	const handleSkip = () => {
		if (onSkipItem) {
			showToast("Item skipped");
			onSkipItem();
		}
	};

	const separateFeilds = () => {
		return Object.entries(inputsToSeperate).map(([key, value]) => {
			if (key === "imageURL") {
				return (
					<TextInput
						key={key}
						name={key}
						label={key}
						value={normalizeToString(formData[key] ?? value)}
						placeholder={!value ? `Enter ${key}` : ""}
						handleFormUpdate={handleChange}
					/>
				);
			} else if (key === "onSale") {
				return (
					<AnimatedCheckbox key={key} label={key} checked={!!formData[key]} onCheckedChange={() => onToggleDetail(key, value)} />
				);
			} else if (key === "notes") {
				return (
					<label key={key}>
						{key}
						<textarea
							name={key}
							className="textarea"
							value={normalizeToString(formData[key] ?? value)}
							placeholder={!value ? `Enter ${key}` : ""}
							onChange={handleChange}
						></textarea>
					</label>
				);
			}
			return null;
		});
	};

	if (!item) {
		return (
			<div className="edit-form-error">
				<h2>Error: No item selected for editing.</h2>
				<p>Please select an item to edit.</p>
			</div>
		);
	}

	return (
		<div className="edit-form form">
			<img src={close} className="close-icon" onClick={() => setView("carousel")} alt="close icon" data-testid="close-icon" />
			<motion.form
				layout
				onSubmit={handleSubmit}
				initial={{ opacity: 0, scale: 0.8 }}
				animate={{ opacity: 1, scale: 1 }}
				transition={{ duration: 0.5 }}
			>
				<h2 className="card-title">{isCreateMode ? "Import Item" : item.name}</h2>

				{/* Queue progress indicator for batch imports */}
				{isInBatchMode && (
					<div className="edit-form-queue-progress">
						<span className="edit-form-queue-badge">
							Item {queuePosition} of {queueTotal}
						</span>
					</div>
				)}

				{/* Return to email button for create mode */}
				{/* {isCreateMode && onReturnToEmail && (
					<button className="edit-form-return-btn" onClick={onReturnToEmail} type="button">
						&larr; Return to Email Preview
					</button>
				)} */}

				{/* Return to email button for create mode */}
				{isCreateMode && onReturnToEmail && (
					<button className="edit-form-return-btn" onClick={onReturnToEmail} type="button">
						&larr; Return to Email Preview
					</button>
				)}
				{/* Image preview for create mode */}

				{isCreateMode && formData.imageURL && (
					<div className="edit-form-image-preview">
						<img src={formData.imageURL} alt={formData.name ?? "Product"} className="edit-form-preview-img" />
					</div>
				)}

				<div className="form-fields">
					{Object.entries(remaining).map(([key, value]) => (
						<TextInput
							key={key}
							name={key}
							label={key}
							value={normalizeToString(formData[key] ?? value)}
							placeholder={!value ? `Enter ${key}` : ""}
							handleFormUpdate={handleChange}
						/>
					))}

					{/* Material blend — rendered separately from generic fields */}
					<div className="edit-form-material">
						<label className="edit-form-material__label">Material Composition</label>
						<MaterialCompositionBar blend={normalizeMaterial(formData.material)} showLegend={true} />
						<MaterialBlendInput
							value={normalizeMaterial(formData.material)}
							onChange={(blend: MaterialBlend[]) => setFormData((prev) => ({ ...prev, material: blend }))}
						/>
					</div>

					{/* Condition — fixed options, always editable (default "new"). */}
					<label className="edit-form-condition">
						condition
						<select
							name="condition"
							className="edit-form-condition__select"
							value={formData.condition ?? "new"}
							onChange={handleConditionChange}
							aria-label="condition"
						>
							{conditionOptions.map((opt) => (
								<option key={opt} value={opt}>
									{opt}
								</option>
							))}
						</select>
					</label>

					{/* Purchase date — drives factual age. When captured from an email it is
					    shown read-only (disabled); the rare no-date import falls back to a
					    manual date entry. */}
					{formData.purchaseDate ? (
						<label className="edit-form-purchase-date">
							purchase date
							<input
								type="text"
								className="edit-form-purchase-date__display"
								value={`${toAbsoluteDate(formData.purchaseDate)}${
									formatItemAge(formData.purchaseDate) ? ` · ${formatItemAge(formData.purchaseDate)} ago` : ""
								}`}
								disabled
								readOnly
								aria-label="purchase date"
							/>
						</label>
					) : (
						<label className="edit-form-purchase-date">
							purchase date
							<input
								type="date"
								className="edit-form-purchase-date__input"
								value={toDateInputValue(formData.purchaseDate)}
								onChange={handlePurchaseDateChange}
								max={toDateInputValue(new Date().toISOString())}
								aria-label="purchase date"
							/>
							<span className="edit-form-purchase-date__hint">No date found in the email — add one to track this item's age.</span>
						</label>
					)}

					{separateFeilds()}
				</div>

				<div className="edit-form-actions">
					<button type="submit">{isCreateMode ? "Add to Closet" : "Save Changes"}</button>
					{isInBatchMode && onSkipItem && (
						<button className="edit-form-skip-btn" onClick={handleSkip} type="button">
							Do NOT Add This Item
						</button>
					)}
				</div>
			</motion.form>
		</div>
	);
};

export default EditItemView;
