import "./Card.css";
import { ClothingItem } from "../../../utils/types";
import { CardDetails } from "../CardDetails/CardDetails";
import { CardQuickActions } from "../CardQuickActions/CardQuickActions";
import { useSignedImageUrl } from "../../../hooks/useSignedImageUrl";
import { useLongPress } from "../../../hooks/useLongPress";
import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";

interface CardProps {
	item: ClothingItem;
	onEditItem?: (item: ClothingItem) => void;
	onRemoveItem?: (id: string) => void;
}

/** Geometry the growing modal animates through (start = card rect, end = centered).
 *  Height is intentionally omitted from the centered state — the modal grows to
 *  fit its content (bounded by CSS max-height / min-height). */
interface Geometry {
	top: number;
	left: number;
	width: number;
	height?: number;
}

const DESKTOP_MODAL_MAX_WIDTH = 500;
const MOBILE_BREAKPOINT = 768;
const NAV_CLEARANCE = 12;

function prefersReducedMotion(): boolean {
	return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getNavHeight(): number {
	const nav = document.querySelector(".top-nav");
	return nav ? nav.getBoundingClientRect().height : 56;
}

/** Centered resting geometry for the details modal — near-fullscreen on phones.
 *  Height is omitted so the modal sizes to its content (CSS handles max/min).
 *  The top edge is clamped below the sticky nav so the title is never clipped. */
function centeredGeometry(): Geometry {
	const isSmall = window.innerWidth <= MOBILE_BREAKPOINT;
	const width = isSmall ? window.innerWidth * 0.94 : Math.min(DESKTOP_MODAL_MAX_WIDTH, window.innerWidth * 0.92);
	const navBottom = getNavHeight() + NAV_CLEARANCE;
	return {
		width,
		top: navBottom,
		left: (window.innerWidth - width) / 2,
	};
}

function rectToGeometry(rect: DOMRect): Geometry {
	return { top: rect.top, left: rect.left, width: rect.width, height: rect.height };
}

const ClothingCard = ({ item, onEditItem, onRemoveItem }: CardProps) => {
	const imageSrc = useSignedImageUrl(item.imageURL);
	const [flipped, setFlipped] = useState(false);
	// After the flip completes, the card grows into a centered modal.
	const [expanded, setExpanded] = useState(false);
	const [geometry, setGeometry] = useState<Geometry | null>(null);
	const [closing, setClosing] = useState(false);
	// P1-4: long-press on the front opens the quick-action menu (no flip).
	const [quickActionsOpen, setQuickActionsOpen] = useState(false);

	const cardRef = useRef<HTMLDivElement>(null);

	// Keep the open modal centered if the viewport changes (rotation / resize).
	useEffect(() => {
		if (!expanded || closing) return;
		const onResize = () => setGeometry(centeredGeometry());
		window.addEventListener("resize", onResize);
		return () => window.removeEventListener("resize", onResize);
	}, [expanded, closing]);

	// Grow the flipped card into the centered modal, animating from its current rect.
	const growIntoModal = useCallback(() => {
		const rect = cardRef.current?.getBoundingClientRect();
		if (!rect) return;

		setExpanded(true);

		if (prefersReducedMotion()) {
			setGeometry(centeredGeometry());
			return;
		}

		// FLIP: start at the card's current rect, then on the next frame
		// transition to the centered resting geometry.
		setGeometry(rectToGeometry(rect));
		requestAnimationFrame(() => {
			requestAnimationFrame(() => setGeometry(centeredGeometry()));
		});
	}, []);

	// Close: if only flipped (no modal), just flip back to front. If the modal is
	// open, shrink it back to the card rect first, then flip to front.
	const handleClose = useCallback(() => {
		if (!expanded || prefersReducedMotion()) {
			setExpanded(false);
			setGeometry(null);
			setFlipped(false);
			return;
		}
		const rect = cardRef.current?.getBoundingClientRect();
		setClosing(true);
		setGeometry(rect ? rectToGeometry(rect) : null);
	}, [expanded]);

	// When the shrink-back transition finishes, tear down the modal and flip front.
	const handleModalTransitionEnd = useCallback(
		(e: React.TransitionEvent<HTMLDivElement>) => {
			if (!closing || e.propertyName !== "width") return;
			setExpanded(false);
			setClosing(false);
			setGeometry(null);
			setFlipped(false);
		},
		[closing],
	);

	const handleCardClick = () => {
		// A long-press opens the quick menu instead of flipping; ignore the click.
		if (quickActionsOpen) return;
		// Flipped (but not yet expanded): clicking the card flips it back to front.
		// CardDetails stops propagation, so clicks on its content/buttons are safe.
		if (flipped) {
			if (!expanded) handleClose();
			return;
		}
		setFlipped(true);
	};

	// P1-4: press-and-hold the front to open quick actions (only while on the front).
	const longPress = useLongPress({
		onLongPress: () => {
			if (!flipped) setQuickActionsOpen(true);
		},
		onClick: handleCardClick,
	});

	const detailHandlers = {
		onEdit: () => {
			handleClose();
			onEditItem?.(item);
		},
		onRemove: () => {
			handleClose();
			onRemoveItem?.(item.id);
		},
		onClose: handleClose,
	};

	return (
		<>
			<div ref={cardRef} data-testid="clothes-card" className={`card ${flipped ? "flipped" : ""}`} {...longPress}>
				<div className="card-inner">
					{/* Front */}
					<div className="card-front">
						<div className="card-image">{imageSrc ? <img src={imageSrc} alt={item?.name} /> : null}</div>
						<div className="card-name-overlay">
							<span className="card-name-label">{item.name || item.brand || item.category}</span>
						</div>
					</div>

					{/* Back — always in DOM for the 3D flip (compact summary) */}
					<div className="card-back">
						<CardDetails item={item} variant="compact" onExpand={growIntoModal} {...detailHandlers} />
					</div>
				</div>

				{/* P1-4: long-press quick actions, overlaid on the front (no flip). */}
				{quickActionsOpen && !flipped && (
					<CardQuickActions item={item} onClose={() => setQuickActionsOpen(false)} />
				)}
			</div>

			{/* The flipped card grows into a centered details modal. Portaled to
			    document.body: this card sits inside .app-content, whose z-index:1
			    creates a stacking context that would trap the fixed overlay below
			    sibling chrome (sticky NavBar z:100, mobile BottomNav) no matter how
			    high its own z-index is — the BottomNav was intercepting taps on the
			    modal's pinned Edit/Remove footer. Same fix as the fabric DetailModal. */}
			{expanded &&
				geometry &&
				createPortal(
					<div className={`card-modal-overlay ${closing ? "card-modal-overlay--closing" : ""}`} onClick={handleClose}>
						<div
							className={`card-grow-modal${!closing ? " card-grow-modal--centered" : ""}`}
							style={{
								top: geometry.top,
								left: geometry.left,
								width: geometry.width,
								...(geometry.height !== undefined && { height: geometry.height }),
								"--card-modal-top": `${geometry.top}px`,
							} as React.CSSProperties}
							onClick={(e) => e.stopPropagation()}
							onTransitionEnd={handleModalTransitionEnd}
						>
							<CardDetails item={item} variant="full" {...detailHandlers} />
						</div>
					</div>,
					document.body,
				)}
		</>
	);
};

export default ClothingCard;
