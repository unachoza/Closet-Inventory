import { useState } from "react";
import type { ClothingItem } from "../../../utils/types";
import { normalizeMaterial, getMaterialColor } from "../../../utils/materialUtils";
import { normalizeToString } from "../../../utils/normalizeToString";
import "./CardDetails.css";

const CARE_MAP: [keyword: string, emoji: string, label: string][] = [
	["dry clean", "🧺", "Dry clean"],
	["hand wash", "👐", "Hand wash"],
	["cold water", "🧼", "Cold wash"],
	["cold wash", "🧼", "Cold wash"],
	["machine wash", "🧼", "Machine wash"],
	["no bleach", "🚫", "No bleach"],
	["hang dry", "💨", "Hang dry"],
	["lay flat", "📐", "Lay flat"],
	["low heat", "🌡️", "Low heat"],
	["tumble", "🌀", "Tumble dry"],
	["hot water", "🔥", "Warm wash"],
];

function parseCare(care: string | string[]): { emoji: string; label: string }[] {
	const items = Array.isArray(care) ? care : care ? [care] : [];
	return items.filter(Boolean).map((raw) => {
		const lower = raw.toLowerCase();
		const match = CARE_MAP.find(([kw]) => lower.includes(kw));
		return match ? { emoji: match[1], label: match[2] } : { emoji: "🏷️", label: raw };
	});
}

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
	const careItems = parseCare(item.care);
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

				{/* Composition bar */}
				{blend.length > 0 && (
					<div className="card-details__composition">
						<SectionTitle label="Composition" />
						<div className="card-details__composition-labels">
							{blend.map((m) => (
								<span
									key={m.material}
									className="card-details__composition-percentage"
									style={{ color: getMaterialColor(m.material) }}
								>
									{m.percentage}%
								</span>
							))}
						</div>
						<div className="card-details__composition-bar">
							{blend.map((m) => (
								<div
									key={m.material}
									className="card-details__composition-segment"
									style={{ background: getMaterialColor(m.material) }}
								/>
							))}
						</div>
						<div className="card-details__composition-materials">
							{blend.map((m) => (
								<span key={m.material} className="card-details__composition-material">
									{m.material}
								</span>
							))}
						</div>
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
