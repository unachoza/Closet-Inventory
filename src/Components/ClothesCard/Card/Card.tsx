import "./Card.css";
import { ClothingItem } from "../../../utils/types";
import { CardDetails } from "../CardDetails/CardDetails";
import { useState, useEffect } from "react";

interface CardProps {
	item: ClothingItem;
	onEditItem?: (item: ClothingItem) => void;
	onRemoveItem?: (id: string) => void;
}

const ClothingCard = ({ item, onEditItem, onRemoveItem }: CardProps) => {
	const [flipped, setFlipped] = useState(false);
	const [isMobile, setIsMobile] = useState(() =>
		typeof window !== "undefined" && window.matchMedia("(max-width: 768px)").matches
	);

	useEffect(() => {
		const mq = window.matchMedia("(max-width: 768px)");
		const handler = (e: MediaQueryListEvent) => {
			setIsMobile(e.matches);
			if (!e.matches) setFlipped(false);
		};
		mq.addEventListener("change", handler);
		return () => mq.removeEventListener("change", handler);
	}, []);

	const handleClose = () => setFlipped(false);

	return (
		<>
			<div
				data-testid="clothes-card"
				className={`card ${flipped && !isMobile ? "flipped" : ""}`}
				onClick={() => !flipped && setFlipped(true)}
			>
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

					{/* Back — desktop only, always in DOM for 3D flip */}
					{!isMobile && (
						<div className="card-back">
							<CardDetails
								item={item}
								onEdit={() => onEditItem?.(item)}
								onRemove={() => onRemoveItem?.(item.id)}
								onClose={handleClose}
							/>
						</div>
					)}
				</div>
			</div>

			{/* Modal bottom-sheet — mobile only */}
			{isMobile && flipped && (
				<div className="card-modal-overlay" onClick={handleClose}>
					<div className="card-modal" onClick={(e) => e.stopPropagation()}>
						<CardDetails
							item={item}
							onEdit={() => { handleClose(); onEditItem?.(item); }}
							onRemove={() => { handleClose(); onRemoveItem?.(item.id); }}
							onClose={handleClose}
						/>
					</div>
				</div>
			)}
		</>
	);
};

export default ClothingCard;
