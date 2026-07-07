import "./EditItemView.css";
import type { ClothingItem, CategoryType, MaterialBlend, ViewType } from "../../../utils/types";
import { useCloset } from "../../../context/ClosetContext";
import { useSignedImageUrl } from "../../../hooks/useSignedImageUrl";
import getStockPhoto from "../../../utils/getStockPhoto";
import TextInput from "../TextInput/TextInput";
import MaterialBlendInput from "../../../Components/MaterialBlendInput/MaterialBlendInput";
import MaterialCompositionBar from "../../../Components/MaterialCompositionBar/MaterialCompositionBar";
import { formItem, conditionOptions, statusOptions, occasionExamples, careExamples } from "../../../utils/constants";
import PillComboField from "../../../Components/PillComboField/PillComboField";
import { LOCATIONS } from "../../../utils/locations";
import type { ItemStatus, WearState } from "../../../utils/types";
import { normalizeMaterial } from "../../../utils/materialUtils";
import { formatItemAge } from "../../../utils/itemAge";
import { matchedCondition } from "../../../utils/condition";
import { normalizeToString } from "../../../utils/normalizeToString";
import { Dispatch, SetStateAction, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useToast } from "../../../Components/Toast/Toast";
import close from "../../../assets/close.svg";
import { toAbsoluteDate } from "../../../utils/dateUtils";

/** Fields the user may leave blank when adding/editing an item **/
const OPTIONAL_FIELDS = new Set(["occasion", "care", "price"]);

function buildFormDataFromItem(item: ClothingItem): Partial<ClothingItem> {
	return {
		...item,
		material: normalizeMaterial(item.material),
		condition: matchedCondition(item.condition, item.age) ?? "new",
	};
}

function toDateInputValue(iso?: string): string {
	if (!iso) return "";
	const d = new Date(iso);
	if (isNaN(d.getTime())) return "";
	return d.toISOString().slice(0, 10);
}

/**
 * Helper utility to turn the raw text layout back into a clean string array
 * by discarding bullet artifacts.
 */
function parseTextToNotesArray(text: string): string[] {
	if (!text || !text.trim()) return [];
	return text
		.split("\n")
		.map((line) => line.replace(/^\s*[•\-*]\s*/, "").trim())
		.filter((line) => line.length > 0);
}

export interface EditItemViewProps {
	item: ClothingItem;
	mode?: "edit" | "create";
	updateItem?: (id: string, updatedItem: Partial<ClothingItem>) => void;
	setView: Dispatch<SetStateAction<ViewType>>;
	onReturnToEmail?: () => void;
	onSkipItem?: () => void;
	onItemAdded?: () => void;
	queuePosition?: number;
	queueTotal?: number;
}

const EditItemView = ({ item, mode = "edit", setView, onReturnToEmail, onSkipItem, onItemAdded, queuePosition, queueTotal }: EditItemViewProps) => {
	const isCreateMode = mode === "create";
	const isInBatchMode = queuePosition !== undefined && queueTotal !== undefined;

	const {
		id,
		imageURL,
		onSale,
		notes,
		material: _material,
		age: _age,
		condition: _condition,
		purchaseDate: _purchaseDate,
		style,
		originalPrice: _originalPrice,
		qty: _qty,
		// These fields get bespoke controls below (not generic text inputs).
		status: _status,
		locationId: _locationId,
		occasion: _occasion,
		care: _care,
		...remaining
	} = item;
	const inputsToSeperate = { id, onSale, notes, style };
	const { updateItem, addFullItem } = useCloset();
	const { showToast } = useToast();

	const [formData, setFormData] = useState<Partial<ClothingItem>>(() => buildFormDataFromItem(item));
	const previewSrc = useSignedImageUrl(formData.imageURL);

	// Local state specifically managing the raw text string inside the textarea field
	const [textAreaNotes, setTextAreaNotes] = useState<string>(() => {
		const initialNotes = formData.notes ?? notes;
		return initialNotes && initialNotes.length > 0 ? `• ${initialNotes.join("\n• ")}` : "";
	});

	const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | string) => {
		if (typeof e === "string") return;
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	}, []);

	const handleNotesTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		setTextAreaNotes(e.target.value);
	};

	const handleConditionChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
		setFormData((prev) => ({ ...prev, condition: e.target.value as WearState }));
	}, []);

	const handleStatusChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
		setFormData((prev) => ({ ...prev, status: e.target.value as ItemStatus }));
	}, []);

	const handleLocationChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
		setFormData((prev) => ({ ...prev, locationId: e.target.value }));
	}, []);

	const handleOccasionAdd = useCallback((value: string) => {
		setFormData((prev) => ({ ...prev, occasion: value }));
	}, []);

	const handleOccasionRemove = useCallback(() => {
		setFormData((prev) => ({ ...prev, occasion: "" }));
	}, []);

	const handleCareAdd = useCallback((value: string) => {
		setFormData((prev) => {
			const current = Array.isArray(prev.care) ? prev.care : prev.care ? [prev.care] : [];
			return { ...prev, care: current.includes(value) ? current : [...current, value] };
		});
	}, []);

	const handleCareRemove = useCallback((value: string) => {
		setFormData((prev) => {
			const current = Array.isArray(prev.care) ? prev.care : prev.care ? [prev.care] : [];
			return { ...prev, care: current.filter((c) => c !== value) };
		});
	}, []);

	const handlePurchaseDateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		const { value } = e.target;
		setFormData((prev) => ({ ...prev, purchaseDate: value ? new Date(value).toISOString() : "" }));
	}, []);

	const handleNotesKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		const textarea = e.currentTarget;
		const { value, selectionStart, selectionEnd } = textarea;

		if (e.key === "Enter") {
			e.preventDefault();

			const bulletStr = "• ";
			const beforeCursor = value.substring(0, selectionStart);
			const afterCursor = value.substring(selectionEnd);

			let replacementText: string;
			let newCursorPos: number;

			if (value.trim() === "") {
				replacementText = bulletStr;
				newCursorPos = bulletStr.length;
			} else {
				replacementText = `${beforeCursor}\n${bulletStr}${afterCursor}`;
				newCursorPos = beforeCursor.length + 1 + bulletStr.length;
			}

			setTextAreaNotes(replacementText);

			setTimeout(() => {
				textarea.focus();
				textarea.setSelectionRange(newCursorPos, newCursorPos);
			}, 0);
		}
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		// Convert the textarea text block back into a clean string array before updating state or local closet storage structures
		const finalNotesArray = parseTextToNotesArray(textAreaNotes);

		if (isCreateMode) {
			const imageURL = formData.imageURL || getStockPhoto(formData.category as CategoryType);
			const displayName = formData.name || (formData.brand ? `${formData.brand} ${formData.category}` : formData.category) || "New Item";

			addFullItem({
				...item,
				...formData,
				id: item.id || crypto.randomUUID(),
				imageURL,
				name: displayName,
				color: (formData.color ?? "").toLowerCase(),
				material: normalizeMaterial(formData.material),
				condition: formData.condition ?? "new",
				notes: finalNotesArray, // Injected parsed string[]
			} as ClothingItem);

			showToast(`${displayName} added to your closet!`);

			if (isInBatchMode && onItemAdded) {
				setTimeout(() => onItemAdded());
				return;
			}
		} else {
			updateItem(item.id, {
				...formData,
				notes: finalNotesArray, // Injected parsed string[]
			});
			setFormData(formItem);
			setTextAreaNotes("");
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

	const separateFields = () => {
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
				return null;
			} else if (key === "notes") {
				return (
					<label key={key} className="edit-form-notes-label">
						{key}
						<textarea
							name={key}
							className="textarea"
							value={textAreaNotes}
							placeholder="Press Enter to start adding bulleted notes..."
							onChange={handleNotesTextAreaChange}
							onKeyDown={handleNotesKeyDown}
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

				{isInBatchMode && (
					<div className="edit-form-queue-progress">
						<span className="edit-form-queue-badge">
							Item {queuePosition} of {queueTotal}
						</span>
					</div>
				)}

				{isCreateMode && onReturnToEmail && (
					<button className="edit-form-return-btn" onClick={onReturnToEmail} type="button">
						&larr; Back to Email
					</button>
				)}

				{isCreateMode && previewSrc && (
					<div className="edit-form-image-preview">
						<img src={previewSrc} alt={formData.name ?? "Product"} className="edit-form-preview-img" />
					</div>
				)}

				<div className="form-fields">
					{Object.entries(remaining).map(([key, value]) => (
						<TextInput
							key={key}
							name={key}
							label={key}
							value={normalizeToString(formData[key as keyof ClothingItem] ?? value)}
							placeholder={!value ? `Enter ${key}` : ""}
							handleFormUpdate={handleChange}
							required={!OPTIONAL_FIELDS.has(key)}
						/>
					))}
					{onSale && (
						<TextInput
							name="originalPrice"
							label="original price"
							value={normalizeToString(formData.originalPrice ?? _originalPrice ?? "")}
							placeholder="Enter original price"
							handleFormUpdate={handleChange}
						/>
					)}
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
							<span className="edit-form-purchase-date__hint">
								No date found in the email — add one to track this item's age.
							</span>
						</label>
					)}

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
									{opt.replace(/_/g, " ")}
								</option>
							))}
						</select>
					</label>

					{/* Status — E2 lifecycle state (clean/dirty/at cleaner/etc.). Default "clean". */}
					<label className="edit-form-condition">
						status
						<select
							name="status"
							className="edit-form-condition__select"
							value={formData.status ?? "clean"}
							onChange={handleStatusChange}
							aria-label="status"
						>
							{statusOptions.map((opt) => (
								<option key={opt} value={opt}>
									{opt.replace(/_/g, " ")}
								</option>
							))}
						</select>
					</label>

					{/* Location — E2 US-2.2. Default the primary (home) location. */}
					<label className="edit-form-condition">
						location
						<select
							name="locationId"
							className="edit-form-condition__select"
							value={formData.locationId ?? "home"}
							onChange={handleLocationChange}
							aria-label="location"
						>
							{LOCATIONS.map((loc) => (
								<option key={loc.id} value={loc.id}>
									{loc.label}
								</option>
							))}
						</select>
					</label>

					<PillComboField
						label="occasion"
						options={occasionExamples}
						selected={formData.occasion ? [formData.occasion] : []}
						onAdd={handleOccasionAdd}
						onRemove={handleOccasionRemove}
						multiSelect={false}
					/>

					<PillComboField
						label="care"
						options={careExamples}
						selected={Array.isArray(formData.care) ? formData.care : formData.care ? [formData.care] : []}
						onAdd={handleCareAdd}
						onRemove={handleCareRemove}
						multiSelect={true}
					/>
					<div className="edit-form-material">
						<label className="edit-form-material__label">Material Composition</label>
						<MaterialCompositionBar blend={normalizeMaterial(formData.material)} showLegend={true} />
						<MaterialBlendInput
							value={normalizeMaterial(formData.material)}
							onChange={(blend: MaterialBlend[]) => setFormData((prev) => ({ ...prev, material: blend }))}
						/>
					</div>

					{separateFields()}
				</div>

				<div className="edit-form-actions">
					{isInBatchMode && onSkipItem && (
						<button className="edit-form-skip-btn" onClick={handleSkip} type="button">
							Skip This Item
						</button>
					)}
					<button type="submit" className="submit ingestion-edit-form">
						{isCreateMode ? "Add to Closet" : "Save Changes"}
					</button>
				</div>
			</motion.form>
		</div>
	);
};

export default EditItemView;
