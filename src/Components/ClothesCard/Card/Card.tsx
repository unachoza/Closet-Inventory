import "./Card.css";
import { ClothingItem } from "../../../utils/types";
import { CardDetails } from "../CardDetails/CardDetails";

import { useState } from "react";
import MaterialCompositionBar from "../../MaterialCompositionBar/MaterialCompositionBar";
import { normalizeMaterial } from "../../../utils/materialUtils";

interface CardProps {
	item: ClothingItem;
	onEditItem?: (item: ClothingItem) => void;
	onRemoveItem?: (id: string) => void;
}

const ClothingCard = ({ item, onEditItem, onRemoveItem }: CardProps) => {
	const [flipped, setFlipped] = useState<boolean>(false);

	// Coerce defensively: closet data may still carry a legacy string
	// (e.g. "95% Cotton, 5% Spandex") or be the new MaterialBlend[] shape.
	const materialBlend = normalizeMaterial(item.material);

	return (
		<div data-testid="clothes-card" className={`card ${flipped ? "flipped" : ""}`} onClick={() => setFlipped(!flipped)}>
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

				{/* Back */}
				{flipped && <CardDetails item={item} />}
				<div className="card-back">
					<h2 className="card-title">{item.name}</h2>
					<div className="card-details">
						<p>
							<strong>Size:</strong> {item.size}
						</p>
						<p>
							<strong>Color:</strong> {item.color}
						</p>
						<p>
							<strong>Brand:</strong> {item.brand}
						</p>
						<p>
							<strong>Occasion:</strong> {item.occasion}
						</p>
						<p>
							<strong>Age:</strong> {item.age}
						</p>
						<div className="card-material">
							<strong>Material:</strong>{" "}
							{materialBlend.length > 0 ? <MaterialCompositionBar blend={materialBlend} /> : "—"}
						</div>

						<p>
							<strong>Care:</strong> {item.care}
						</p>
					</div>
					<div className="controls-container">
						<button
							onClick={(e) => {
								e.stopPropagation();
								onRemoveItem?.(item.id);
							}}
						>
							Remove
						</button>
						<button
							onClick={(e) => {
								e.stopPropagation();
								if (onEditItem) {
									onEditItem(item);
								}
							}}
						>
							Edit
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ClothingCard;
