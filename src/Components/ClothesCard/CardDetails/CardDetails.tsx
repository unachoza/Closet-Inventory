import { useState } from "react";
import type { ClothingItem } from "../../../utils/types";
import { normalizeMaterial } from "../../../utils/materialUtils";
import MaterialCompositionBar from "../../MaterialCompositionBar/MaterialCompositionBar";
import { normalizeToString } from "../../../utils/normalizeToString";
import { parseCareItems } from "../../../utils/careUtils";
import "./CardDetails.css";

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
	const notes = normalizeToString(item.notes);

	const hasExpandedContent = occasions.length > 0 || !!notes || !!item.age || !!item.price;

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
					<div className="card-details__header-right">
						{item.category && <span className="card-details__category-tag">{item.category}</span>}
					</div>
				</div>

				<div className="card-details__divider" />

				{/* Color + size */}
				<div className="card-details__color-size">
					<div className="card-details__color-display">
						<div className="card-details__color-circle" />
						<span className="card-details__color-name">{item.color || "—"}</span>
					</div>
					{item.size && <span className="card-details__size-pill  pill">{item.size}</span>}
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
						{(item.age || item.price) && (
							<div className="card-details__expanded-subsection">
								<SectionTitle label="Identity" />
								<p className="card-details__identity-text">{[item.age, item.price].filter(Boolean).join(" · ")}</p>
							</div>
						)}

						{occasions.length > 0 && (
							<div className="card-details__expanded-subsection">
								<SectionTitle label="Occasion" />
								<div className="card-details__occasion-pills">
									{occasions.map((o) => (
										<span key={o} className="card-details__occasion-pill  pill">
											{o}
										</span>
									))}
								</div>
							</div>
						)}

						{notes && (
							<div className="card-details__expanded-subsection">
								<SectionTitle label="Notes" />
								<p className="card-details__notes-text">"{notes}"</p>
							</div>
						)}

						{/* Action buttons */}
						{confirming ? (
							<div className="card-details__confirm-section">
								<p className="card-details__confirm-text">Remove this item?</p>
								<div className="card-details__buttons">
									<button onClick={() => setConfirming(false)} className="card-details__button card-details__button--cancel">
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
								<button onClick={() => setConfirming(true)} className="card-details__button card-details__button--remove">
									Remove
								</button>
								<button onClick={onEdit} className="card-details__button">
									Edit
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
