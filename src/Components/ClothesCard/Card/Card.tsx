import "./Card.css";
import { ClothingItem } from "../../../utils/types";
import { CardDetails } from "../CardDetails/CardDetails";
import { useState, useEffect, useRef, useCallback } from "react";

interface CardProps {
	item: ClothingItem;
	onEditItem?: (item: ClothingItem) => void;
	onRemoveItem?: (id: string) => void;
}

/** Geometry the growing modal animates through (start = card rect, end = centered). */
interface Geometry {
	top: number;
	left: number;
	width: number;
	height: number;
}

const DESKTOP_MODAL_MAX_WIDTH = 560;
const DESKTOP_MODAL_MAX_HEIGHT = 740;
const MOBILE_BREAKPOINT = 768;

function prefersReducedMotion(): boolean {
	return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Centered resting geometry for the details modal — near-fullscreen on phones. */
function centeredGeometry(): Geometry {
	const isSmall = window.innerWidth <= MOBILE_BREAKPOINT;
	const width = isSmall ? window.innerWidth * 0.94 : Math.min(DESKTOP_MODAL_MAX_WIDTH, window.innerWidth * 0.92);
	const height = isSmall ? window.innerHeight * 0.88 : Math.min(DESKTOP_MODAL_MAX_HEIGHT, window.innerHeight * 0.86);
	return {
		width,
		height,
		top: (window.innerHeight - height) / 2,
		left: (window.innerWidth - width) / 2,
	};
}

function rectToGeometry(rect: DOMRect): Geometry {
	return { top: rect.top, left: rect.left, width: rect.width, height: rect.height };
}

const ClothingCard = ({ item, onEditItem, onRemoveItem }: CardProps) => {
	const [flipped, setFlipped] = useState(false);
	// After the flip completes, the card grows into a centered modal.
	const [expanded, setExpanded] = useState(false);
	const [geometry, setGeometry] = useState<Geometry | null>(null);
	const [closing, setClosing] = useState(false);

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

	// Close: shrink the modal back to the card rect, then flip to front.
	const handleClose = useCallback(() => {
		if (prefersReducedMotion()) {
			setExpanded(false);
			setGeometry(null);
			setFlipped(false);
			return;
		}
		const rect = cardRef.current?.getBoundingClientRect();
		setClosing(true);
		setGeometry(rect ? rectToGeometry(rect) : null);
	}, []);

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
		if (flipped) return;
		setFlipped(true);
	};

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
			<div ref={cardRef} data-testid="clothes-card" className={`card ${flipped ? "flipped" : ""}`} onClick={handleCardClick}>
				<div className="card-inner">
					{/* Front */}
					<div className="card-front">
						<div className="card-image">
							<img src={item.imageURL} alt={item.name} />
						</div>
						<div className="card-name-overlay">
							<span className="card-name-label">{item.name || item.brand || item.category}</span>
						</div>
					</div>

					{/* Back — always in DOM for the 3D flip (compact summary) */}
					<div className="card-back">
						<CardDetails item={item} variant="compact" onExpand={growIntoModal} {...detailHandlers} />
					</div>
				</div>
			</div>

			{/* The flipped card grows into a centered details modal */}
			{expanded && geometry && (
				<div className={`card-modal-overlay ${closing ? "card-modal-overlay--closing" : ""}`} onClick={handleClose}>
					<div
						className="card-grow-modal"
						style={{ top: geometry.top, left: geometry.left, width: geometry.width, height: geometry.height }}
						onClick={(e) => e.stopPropagation()}
						onTransitionEnd={handleModalTransitionEnd}
					>
						<CardDetails item={item} variant="full" {...detailHandlers} />
					</div>
				</div>
			)}
		</>
	);
};

export default ClothingCard;
