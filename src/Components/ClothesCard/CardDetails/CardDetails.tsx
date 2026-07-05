import { useState } from "react";
import type { ClothingItem } from "../../../utils/types";
import { normalizeMaterial } from "../../../utils/materialUtils";
import MaterialCompositionBar from "../../MaterialCompositionBar/MaterialCompositionBar";
import { parseCareItems } from "../../../utils/careUtils";
import { humanizeCondition } from "../../../utils/condition";
import { toAbsoluteDate } from "../../../utils/dateUtils";
import "./CardDetails.css";
import { formatItemAge } from "../../../utils/itemAge";

function SectionTitle({ label }: { label: string }) {
	return (
		<div className="card-details__section-title">
			<span className="card-details__section-title-label">{label}</span>
			<div className="card-details__section-title-divider" />
		</div>
	);
}

interface CardDetailsProps {
	item: ClothingItem;
	/**
	 * "compact" (default): summary shown on the flipped card, with a
	 * "See all details" button that calls onExpand to open the modal.
	 * "full": the modal view — every section + Edit/Remove are shown inline.
	 */
	variant?: "compact" | "full";
	/** Invoked by the compact "See all details" button to grow into the modal. */
	onExpand?: () => void;
	onEdit?: () => void;
	onRemove?: () => void;
	onClose?: () => void;
}

export const CardDetails = ({ item, variant = "compact", onExpand, onEdit, onRemove, onClose }: CardDetailsProps) => {
	const [confirming, setConfirming] = useState(false);
	const isFull = variant === "full";

	const blend = normalizeMaterial(item.material);
	const careItems = parseCareItems(item.care);
	const occasions = Array.isArray(item.occasion) ? item.occasion : item.occasion ? [item.occasion] : [];
	const normalizedNotesItems = item.notes === undefined ? [] : Array.isArray(item.notes) ? item.notes : [item.notes];
	// const notesItems: string[] = Array.isArray(notes) ? notes : [notes]

	// Inferred style attributes live on the nested `style` object (from
	// inferProductAttributes — populated during email import), NOT as flat
	// fields on the item. Deduped + joined so empty fields collapse gracefully.
	const style = item.style;
	const { hasStretch, hasPockets, accents, ...otherStyles } = style ?? {};
	const hasStyle = Object.keys(otherStyles).length > 0;

	// accents is `string | string[]` — normalize to an array so each accent
	// (e.g. "buttons", "zipper") renders as its own pill, and an empty array
	// contributes nothing (no ghost pill).
	const accentTags = Array.isArray(style?.accents) ? style.accents : style?.accents ? [style.accents] : [];
	const featureTags = [style?.hasStretch && "Stretch", style?.hasPockets && "Pockets", ...accentTags].filter((t): t is string => !!t);
	// Identity: factual age (from purchaseDate), price, condition, season.
	const purchasedLabel = toAbsoluteDate(item.purchaseDate);
	const ageLabel = formatItemAge(item.purchaseDate);
	const identityParts = [style?.season, item.condition && humanizeCondition(item.condition), item.price].filter(
		(p): p is string => !!p,
	);
	const hasIdentity = !!purchasedLabel || identityParts.length > 0 || !!item.age;

	const hasExpandedContent = hasStyle || featureTags.length > 0 || hasIdentity || occasions.length > 0 || !!item.notes;

	return (
		<div className={`card-details ${isFull ? "card-details--full" : ""}`} onClick={(e) => e.stopPropagation()}>
			{/* Scrollable content area */}
			<div className="card-details__scrollable">
				{/* Name + category badge + close button */}
				{onClose && (
					<button className="card-details__close" onClick={onClose} aria-label="Close">
						✕
					</button>
				)}
				<div className="card-details__header">
					<div className="card-details__header-text">
						<p className="card-details__name">{item.name || item.brand || item.category}</p>
						{item.brand && <p className="card-details__brand">{item.brand}</p>}
					</div>
				</div>

				{/* Color + size */}
				<div className="card-details__color-size">
					<SectionTitle label="Size & Color - Category" />
					<div className="card-details__color-display">
						{item.size && <span className="card-details__size-pill  pill">{item.size}</span>}
						<span className="pill">{item.color || "—"}</span>
						<span className="card-details__size-pill  pill">{item.category}</span>
					</div>
				</div>

				{/* Composition bar — proportional segments + dot legend */}
				{blend.length > 0 && (
					<div className="card-details__composition">
						<SectionTitle label="Composition" />
						<MaterialCompositionBar blend={blend} />
					</div>
				)}

				{/* Care pills */}
				{careItems.length > 0 && (
					<div className="card-details__care">
						<SectionTitle label="Care" />
						<div className="card-details__care-pills">
							{careItems.map((c) => (
								<span key={c.label} className="card-details__care-pill  pill">
									{c.emoji} {c.label}
								</span>
							))}
						</div>
					</div>
				)}

				{/* Full view only: extra details + action buttons */}
				{isFull && (
					<div className="card-details__expanded">
						{hasStyle && (
							<div className="card-details__expanded-subsection">
								<SectionTitle label="Silhouette & Shape" />
								{style?.silhouette && <p className="card-details__identity-text">Silhouette: {style.silhouette}</p>}
								{style?.fit && <p className="card-details__identity-text">Fit: {style.fit}</p>}
								{style?.legShape && <p className="card-details__identity-text">Leg Shape: {style.legShape}</p>}
								{style?.waistStyle && <p className="card-details__identity-text">Waist: {style.waistStyle}</p>}
								{style?.hemLength && <p className="card-details__identity-text">Length: {style.hemLength}</p>}
								{style?.rise && <p className="card-details__identity-text">Rise: {style.rise}</p>}
							</div>
						)}
						{hasStyle && (style?.neckline || style?.sleeveLength || style?.sleeveStyle) && (
							<div className="card-details__expanded-subsection">
								<SectionTitle label="Neckline & Sleeves" />
								{style?.neckline && <p className="card-details__identity-text">Neckline: {style.neckline}</p>}
								{style?.sleeveLength && (
									<p className="card-details__identity-text">Sleeve Length: {style.sleeveLength}</p>
								)}
								{style?.sleeveStyle && (
									<p className="card-details__identity-text">Sleeve Style: {style.sleeveStyle}</p>
								)}
							</div>
						)}
						{hasStyle && (style?.shaping?.length || style?.construction?.length) && (
							<div className="card-details__expanded-subsection">
								<SectionTitle label="Construction Details" />
								{style?.shaping && style.shaping.length > 0 && (
									<p className="card-details__identity-text">Shaping: {style.shaping.join(", ")}</p>
								)}
								{style?.construction && style.construction.length > 0 && (
									<p className="card-details__identity-text">Details: {style.construction.join(", ")}</p>
								)}
							</div>
						)}
						{hasStyle && (style?.accents?.length || style?.pattern) && (
							<div className="card-details__expanded-subsection">
								<SectionTitle label="Embellishments & Pattern" />
								{style?.pattern && <p className="card-details__identity-text">Pattern: {style.pattern}</p>}
								{style?.accents && style.accents.length > 0 && (
									<p className="card-details__identity-text">Accents: {style.accents.join(", ")}</p>
								)}
							</div>
						)}
						{hasStyle && style?.closure?.length && (
							<div className="card-details__expanded-subsection">
								<SectionTitle label="Closure & Features" />
								{style?.closure && style.closure.length > 0 && (
									<p className="card-details__identity-text">Closure: {style.closure.join(", ")}</p>
								)}
								{style?.hasStretch && <p className="card-details__identity-text">✓ Stretch</p>}
								{style?.hasPockets && <p className="card-details__identity-text">✓ Pockets</p>}
							</div>
						)}
						{featureTags.length > 0 && (
							<div className="card-details__expanded-subsection">
								<SectionTitle label="Features" />
								<div className="card-details__occasion-pills">
									{featureTags.map((t) => (
										<span key={t} className="card-details__occasion-pill  pill">
											{t}
										</span>
									))}
								</div>
							</div>
						)}
						{hasIdentity && (
							<div className="card-details__expanded-subsection">
								<SectionTitle label="Identity" />
								<div className="card-details__identity-text">
									{purchasedLabel && (
										<p className="card-details__identity-text">
											Purchased {purchasedLabel}
											{ageLabel ? ` - ${ageLabel} ago` : ""}
										</p>
									)}
									{item.condition && <p className="card-details__identity-text">Condition: {humanizeCondition(item.condition)}</p>}
									{item.price && <p className="card-details__identity-text">Price: {item.price}</p>}
								</div>
							</div>
						)}
						{occasions.length > 0 && (
							<div className="card-details__expanded-subsection">
								<SectionTitle label="Occasion & Season" />
								<div className="card-details__occasion-pills">
									{occasions.map((o) => (
										<span key={o} className="card-details__occasion-pill  pill">
											{o}
										</span>
									))}
									{item.style?.season && (
										<span className="card-details__occasion-pill  pill">{item.style.season}</span>
									)}
								</div>
							</div>
						)}
						{item.notes && (
							<div className="card-details__expanded-subsection">
								<SectionTitle label="Notes" />
								{normalizedNotesItems.map((note: string, i: number) => (
									<p key={i} className="card-details__notes-text">
										- {note.charAt(0).toUpperCase() + note.slice(1)}
									</p>
								))}
							</div>
						)}
						{/* Action buttons */}
						{confirming ? (
							<div className="card-details__confirm-section">
								<p className="card-details__confirm-text">Remove this item?</p>
								<div className="card-details__buttons">
									<button
										onClick={() => setConfirming(false)}
										className="card-details__button card-details__button--cancel"
									>
										Cancel
									</button>
									<button
										onClick={() => {
											setConfirming(false);
											onRemove?.();
										}}
										className="card-details__button card-details__button--confirm"
									>
										Yes, remove
									</button>
								</div>
							</div>
						) : (
							<div className="card-details__buttons">
								<button onClick={onEdit} className="card-details__button">
									Edit
								</button>
								<button
									onClick={() => setConfirming(true)}
									className="card-details__button card-details__button--remove"
								>
									Remove
								</button>
							</div>
						)}
					</div>
				)}
			</div>

			{/* Compact view only: button to grow into the full modal */}
			{!isFull && hasExpandedContent && (
				<div className="card-details__footer">
					<button onClick={onExpand} className="card-details__toggle-details">
						See all details
					</button>
				</div>
			)}
		</div>
	);
};
