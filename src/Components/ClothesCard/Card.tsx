import "./Card.css";
import { ClothingItem } from "../../utils/types";

import { useState } from "react";
import MaterialCompositionBar from "../MaterialCompositionBar/MaterialCompositionBar";
import { normalizeMaterial } from "../../utils/materialUtils";
import { formatItemAge } from "../../utils/itemAge";
import { matchedCondition } from "../../utils/condition";

interface CardProps {
	item: ClothingItem;
	onEditItem?: (item: ClothingItem) => void;
	onRemoveItem?: (id: string) => void;
}

const ClothingCard = ({ item, onEditItem, onRemoveItem }: CardProps) => {
	const [flipped, setFlipped] = useState<boolean>(false);

	const materialBlend = normalizeMaterial(item.material);

	// Factual age, computed from the purchase date (e.g. "1.5 years", "20 days").
	// Empty when there is no valid purchase date — the row is hidden in that case.
	// TODO: handle items with no meaningful "purchase date" — vintage, thrifted, or
	// inherited pieces. These need a separate provenance concept (e.g. "estimated era"
	// or "acquired" date) rather than a purchase date, so age isn't misleading.
	const factualAge = formatItemAge(item.purchaseDate);

	// Subjective condition. Only a recognized condition is shown — legacy items
	// whose `age` held a free-text duration (e.g. "one year") render no row,
	// rather than a misleading "Condition: one year".
	const conditionDisplay = matchedCondition(item.condition, item.age);

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
					{/* <div className="card-info">
						<p className="card-category">{item.category}</p>
						<h2 className="card-title">{item.name}</h2>
					</div> */}
				</div>

				{/* Back */}
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
						{factualAge && (
							<p>
								<strong>Purchased:</strong> {factualAge} ago
							</p>
						)}
						{conditionDisplay && (
							<p>
								<strong>Condition:</strong> {conditionDisplay}
							</p>
						)}
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
