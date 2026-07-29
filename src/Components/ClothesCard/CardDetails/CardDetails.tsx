import { JSX, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { ClothingItem } from "../../../utils/types";
import { normalizeMaterial, primaryMaterial, resolveFiber } from "../../../utils/materialUtils";
import MaterialCompositionBar from "../../MaterialCompositionBar/MaterialCompositionBar";
import DetailModal from "../../GuideComponents/Modal";
import { parseCareItems } from "../../../utils/careUtils";
import { humanizeCondition } from "../../../utils/condition";
import { toAbsoluteDate } from "../../../utils/dateUtils";
import { useViewOptional } from "../../../context/ViewContext";
import "./CardDetails.css";
import { formatItemAge } from "../../../utils/itemAge";

// Shared by the footer container, the exiting content, and the entering content
// so the box resize (layout) and the fade/slide (opacity/y) stay perfectly in
// sync — a mismatched pair (e.g. spring layout + eased opacity) is what reads
// as a "snap" once the faster one finishes and the other is still catching up.
const CONFIRM_SWAP_TRANSITION = { duration: 0.55, ease: [0.4, 0, 0.2, 1] as const };
const CONFIRM_SWAP_TRANSITION_REDUCED = { duration: 0.2, ease: [0.4, 0, 0.2, 1] as const };

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
	const prefersReducedMotion = useReducedMotion();
	const confirmSwapTransition = prefersReducedMotion ? CONFIRM_SWAP_TRANSITION_REDUCED : CONFIRM_SWAP_TRANSITION;
	const [fiberModalMaterial, setFiberModalMaterial] = useState<string | null>(null);
	const [fiberModalScrollTo, setFiberModalScrollTo] = useState<string | undefined>(undefined);
	const viewCtx = useViewOptional();
	const isFull = variant === "full";

	const blend = normalizeMaterial(item.material);
	const careItems = parseCareItems(item.care);
	// Occasion is stored either as an array or a comma-joined string (the manual-add
	// wizard writes multiple picks comma-joined) — normalize to one pill per value.
	const occasions = Array.isArray(item.occasion)
		? item.occasion
		: item.occasion
			? item.occasion
					.split(",")
					.map((o) => o.trim())
					.filter(Boolean)
			: [];
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
	const identityParts = [style?.season, item.condition && humanizeCondition(item.condition), item.price].filter(Boolean);
	const hasIdentity = !!purchasedLabel || identityParts.length > 0 || !!item.age;

	const hasExpandedContent = hasStyle || featureTags.length > 0 || hasIdentity || occasions.length > 0 || !!item.notes;

	const openFiberModal = (material: string, scrollTo?: string) => {
		setFiberModalMaterial(material);
		setFiberModalScrollTo(scrollTo);
	};

	const closeFiberModal = () => {
		setFiberModalMaterial(null);
		setFiberModalScrollTo(undefined);
	};

	const activeFiber = fiberModalMaterial ? resolveFiber(fiberModalMaterial) : null;

	const handleCarePillClick = () => {
		const top = primaryMaterial(blend);
		if (top && resolveFiber(top)) {
			openFiberModal(top, "Care");
		}
	};

	const carePillsAreTappable = blend.length > 0 && !!resolveFiber(primaryMaterial(blend));

	// Size/Color/Category pills, in priority order (highest first). On the
	// compact card-back there isn't always room for all three — rather than
	// letting them overflow into a scrollable row (which chained horizontal
	// swipes into rubber-banding the whole card), the lowest-priority pills
	// are dropped one at a time until the row actually fits. The full modal
	// always has room, so it renders every pill.
	const colorSizePills = [
		item.size ? (
			<span key="size" className="card-details__size-pill  pill">
				{item.size}
			</span>
		) : null,
		<span key="color" className="pill">
			{item.color || "—"}
		</span>,
		<span key="category" className="card-details__size-pill  pill">
			{item.category}
		</span>,
	].filter((p): p is JSX.Element => p !== null);

	const colorDisplayRef = useRef<HTMLDivElement>(null);
	const [visiblePillCount, setVisiblePillCount] = useState(colorSizePills.length);

	// Data changed (e.g. a different card) — start from "show everything" and
	// let the measurement effect below trim it back down if needed.
	useLayoutEffect(() => {
		setVisiblePillCount(colorSizePills.length);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [item.size, item.color, item.category, isFull]);

	// Re-measure whenever the visible count changes: if the row still overflows
	// its own box, drop one more trailing pill and let this effect fire again.
	useLayoutEffect(() => {
		if (isFull) return;
		const el = colorDisplayRef.current;
		if (!el) return;
		if (el.scrollWidth > el.clientWidth + 1 && visiblePillCount > 1) {
			setVisiblePillCount((count) => count - 1);
		}
	}, [visiblePillCount, isFull]);

	// Viewport/card resize (rotation, density toggle) can change how much room
	// the row has — reset to "everything" so the shrink effect re-measures.
	useLayoutEffect(() => {
		if (isFull) return;
		const el = colorDisplayRef.current;
		if (!el) return;
		const observer = new ResizeObserver(() => setVisiblePillCount(colorSizePills.length));
		observer.observe(el);
		return () => observer.disconnect();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isFull]);

	const visiblePills = isFull ? colorSizePills : colorSizePills.slice(0, visiblePillCount);

	return (
		<div className={`card-details ${isFull ? "card-details--full" : ""}`} onClick={(e) => e.stopPropagation()}>
			{/* Scrollable content area */}
			<div className="card-details__scrollable">
				{/* Name + category badge + close button. The close button floats within
				    the header text so it only claims space on the line(s) it actually
				    overlaps — a short name gets no wasted gutter, a long/wrapping name
				    never overlaps it. */}
				<div className="card-details__header">
					<div className="card-details__header-text">
						{onClose && (
							<button className="card-details__close" onClick={onClose} aria-label="Close">
								✕
							</button>
						)}
						<p className="card-details__name">{item.name || item.brand || item.category}</p>
						{item.brand && <p className="card-details__brand">{item.brand}</p>}
					</div>
				</div>

				{/* Color + size */}
				<div className="card-details__color-size">
					<SectionTitle label="Size & Color - Category" />
					<div className="card-details__color-display" ref={colorDisplayRef}>
						{visiblePills}
					</div>
				</div>

				{/* Composition bar — proportional segments + dot legend. Compact on the
				    flipped card-back (no legend text) since the card is only ~47vw wide
				    on phones; full legend shows in the expanded modal. */}
				{blend.length > 0 && (
					<div className="card-details__composition">
						<SectionTitle label="Composition" />
						<MaterialCompositionBar blend={blend} compact={!isFull} onMaterialClick={(m) => openFiberModal(m)} />
					</div>
				)}

				{/* Care pills */}
				{careItems.length > 0 && (
					<div className="card-details__care">
						<SectionTitle label="Care" />
						<div className="card-details__care-pills">
							{careItems.map((c) =>
								carePillsAreTappable ? (
									<button
										key={c.label}
										type="button"
										className="card-details__care-pill card-details__care-pill--tappable pill"
										onClick={handleCarePillClick}
									>
										<c.icon size={15} className="card-details__care-pill-icon" aria-hidden="true" /> {c.label}
									</button>
								) : (
									<span key={c.label} className="card-details__care-pill  pill">
										<c.icon size={15} className="card-details__care-pill-icon" aria-hidden="true" /> {c.label}
									</span>
								),
							)}
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
									{item.condition && (
										<p className="card-details__identity-text">
											Condition: {humanizeCondition(item.condition)}
										</p>
									)}
									{item.price != null && <p className="card-details__identity-text">Price: ${item.price}</p>}
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

			{/* Full view only: action buttons pinned in their own footer, outside the
			    scrollable content area, so they never scroll out of reach / get clipped. */}
			{isFull && (
				<motion.div
					layout
					transition={confirmSwapTransition}
					className="card-details__footer card-details__footer--actions"
				>
					<AnimatePresence mode="popLayout" initial={false}>
						{confirming ? (
							<motion.div
								key="confirm"
								layout
								className="card-details__confirm-section"
								initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -12 }}
								animate={{ opacity: 1, y: 0 }}
								exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -12 }}
								transition={confirmSwapTransition}
							>
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
							</motion.div>
						) : (
							<motion.div
								key="actions"
								layout
								className="card-details__buttons"
								initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -12 }}
								animate={{ opacity: 1, y: 0 }}
								exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -12 }}
								transition={confirmSwapTransition}
							>
								<button onClick={onEdit} className="card-details__button">
									Edit
								</button>
								<button
									onClick={() => setConfirming(true)}
									className="card-details__button card-details__button--remove"
								>
									Remove
								</button>
							</motion.div>
						)}
					</AnimatePresence>
				</motion.div>
			)}

			<DetailModal
				fiber={activeFiber}
				onClose={closeFiberModal}
				scrollToSection={fiberModalScrollTo}
				onOpenGuide={viewCtx ? () => viewCtx.setView("fabric") : undefined}
			/>
		</div>
	);
};
