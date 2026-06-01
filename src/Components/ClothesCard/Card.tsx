import "./Card.css";
import { ClothingItem } from "../../utils/types";
import { useLocalStorageCloset } from "../../hooks/useLocalCloset";

import { useState } from "react";
import MaterialCompositionBar from "../MaterialCompositionBar/MaterialCompositionBar";
import { normalizeMaterial } from "../../utils/materialUtils";

interface CardProps {
	item: ClothingItem;
	onEditItem?: (item: ClothingItem) => void;
}

const ClothingCard = ({ item, onEditItem }: CardProps) => {
	const [flipped, setFlipped] = useState<boolean>(false);

	const { removeItem } = useLocalStorageCloset();

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
							<strong>Color:</strong> {item.color}
						</p>
						<p>
							<strong>Size:</strong> {item.size}
						</p>
						<p>
							<strong>Brand:</strong> {item.brand}
						</p>
						<div className="card-material">
							<strong>Material:</strong>{" "}
							{materialBlend.length > 0 ? <MaterialCompositionBar blend={materialBlend} /> : "—"}
						</div>

						<p>
							<strong>Occasion:</strong> {item.occasion}
						</p>
						<p>
							<strong>Age:</strong> {item.age}
						</p>
						<p>
							<strong>Care:</strong> {item.care}
						</p>
					</div>
					<div className="controls-container">
						<button
							onClick={(e) => {
								e.stopPropagation();
								removeItem(item.id);
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
