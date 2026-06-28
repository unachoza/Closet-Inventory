import "./EditItemView.css";
import type { ClothingItem, CategoryType, MaterialBlend, ViewType } from "../../../utils/types";
import { useLocalStorageCloset } from "../../../hooks/useLocalCloset";
import getStockPhoto from "../../../utils/getStockPhoto";
import TextInput from "../TextInput/TextInput";
// import AnimatedCheckbox from "../CheckboxCollection/RadixCheckbox";
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
import { enrichFromRetailer } from "../../../utils/enrichFromRetailer";
import { inferMaterialFromName } from "../../../utils/inferMaterialFromName";
import { inferProductAttributes } from "../../../utils/inferProductAttributes";

/** Fields the user may leave blank when adding/editing an item **/
const OPTIONAL_FIELDS = new Set(["occasion", "care", "price"]);

/** Extract form-editable fields from a ClothingItem. Used for both
 *  initial state and when the item prop changes (batch import queue). */
function buildFormDataFromItem(item: ClothingItem): Partial<ClothingItem> {
	return {
		...item,
		material: normalizeMaterial(item.material),
		condition: matchedCondition(item.condition, item.age) ?? "new",
	};
}

/** Convert an ISO/RFC date string to the "yyyy-MM-dd" value a <input type="date"> expects. */
function toDateInputValue(iso?: string): string {
	if (!iso) return "";
	const d = new Date(iso);
	if (isNaN(d.getTime())) return "";
	return d.toISOString().slice(0, 10);
}

import { toAbsoluteDate } from "../../../utils/dateUtils";

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
		...remaining
	} = item;
	const inputsToSeperate = { id, onSale, notes, style };
	const { updateItem, addFullItem } = useLocalStorageCloset();
	const { showToast } = useToast();
	// Parent renders <EditItemView key={item.id} ...> so React remounts the
	// component for each new item, reinitializing useState with fresh data.
	// No useEffect needed — key-based remount is the React-idiomatic approach.
	const [formData, setFormData] = useState<Partial<ClothingItem>>(() => buildFormDataFromItem(item));

	// Stable ref — uses functional update so it never needs formData in deps.
	// TextInput is wrapped in memo(), so a stable handleChange means only the
	// TextInput whose value actually changed will re-render (not all 10+).
	const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | string) => {
		if (typeof e === "string") return;
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	}, []);

	// const onToggleDetail = useCallback((key: string, value: any) => {
	// 	setFormData((prev) => ({ ...prev, [key]: !value }));
	// }, []);

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
			} as ClothingItem);
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

	const [enrichmentState, setEnrichmentState] = useState<"idle" | "loading" | "done" | "error">("idle");
	const [enrichmentSource, setEnrichmentSource] = useState<string | null>(null);

	const handleEnrich = useCallback(async () => {
		const brand = String(formData.brand ?? item.brand ?? "");
		const name = String(formData.name ?? item.name ?? "");
		if (!brand && !name) return;

		setEnrichmentState("loading");
		try {
			const result = await enrichFromRetailer(
				brand,
				name,
				typeof (item as Record<string, unknown>).itemNumber === "string"
					? (item as Record<string, unknown>).itemNumber as string
					: undefined,
				brand,
			);

			setFormData((prev) => {
				const updates: Partial<ClothingItem> = {};

				if (result.materialsRaw && (!prev.material || (Array.isArray(prev.material) && prev.material.length === 0))) {
					updates.material = inferMaterialFromName(result.materialsRaw);
				}

				if (result.careRaw) {
					updates.care = result.careRaw;
				}

				const currentStyle = prev.style ?? {};
				const styleUpdates: Partial<typeof currentStyle> = {};

				if (result.description) {
					const attrs = inferProductAttributes(result.description);
					if (attrs.hemLength && !currentStyle.hemLength) styleUpdates.hemLength = attrs.hemLength;
					if (attrs.neckline && !currentStyle.neckline) styleUpdates.neckline = attrs.neckline;
					if (attrs.sleeveLength && !currentStyle.sleeveLength) styleUpdates.sleeveLength = attrs.sleeveLength;
					if (attrs.fit && !currentStyle.fit) styleUpdates.fit = attrs.fit;
				}

				if (result.fitInfo) {
					const fitMatch = result.fitInfo.match(/Fit:\s*(\w+)/i);
					if (fitMatch && !currentStyle.fit) styleUpdates.fit = fitMatch[1];
					const lengthMatch = result.fitInfo.match(/Length:\s*(\w+)/i);
					if (lengthMatch && !currentStyle.hemLength) styleUpdates.hemLength = lengthMatch[1];
				}

				if (Object.keys(styleUpdates).length > 0) {
					updates.style = { ...currentStyle, ...styleUpdates };
				}

				return { ...prev, ...updates };
			});

			setEnrichmentSource(result.pdpUrl ?? result.source);
			setEnrichmentState("done");
			showToast("Product details found!");
		} catch {
			setEnrichmentState("error");
			showToast("Couldn't find product details");
		}
	}, [formData.brand, formData.name, item, showToast]);

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
				// TODO: re-enable onSale checkbox when needed
				return null;
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
						&larr; Back to Email
					</button>
				)}
				{/* Image preview for create mode */}

				{isCreateMode && formData.imageURL && (
					<div className="edit-form-image-preview">
						<img src={formData.imageURL} alt={formData.name ?? "Product"} className="edit-form-preview-img" />
					</div>
				)}

				{isCreateMode && formData.brand && (
					<button
						type="button"
						className="edit-form-enrich-btn"
						onClick={handleEnrich}
						disabled={enrichmentState === "loading"}
					>
						{enrichmentState === "loading" && "Finding details..."}
						{enrichmentState === "idle" && "Find Full Details"}
						{enrichmentState === "done" && "Details found"}
						{enrichmentState === "error" && "Retry"}
					</button>
				)}
				{enrichmentSource && enrichmentState === "done" && (
					<span className="edit-form-enrich-source">
						from {(() => { try { return new URL(enrichmentSource).hostname; } catch { return enrichmentSource; } })()}
					</span>
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

					{separateFeilds()}
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
