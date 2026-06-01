import "./Card.css";
import { ClothingItem } from "../../utils/types";
import { useLocalStorageCloset } from "../../hooks/useLocalCloset";

import { useState } from "react";

interface CardProps {
	item: ClothingItem;
	onEditItem?: (item: ClothingItem) => void;
}

const ClothingCard = ({ item, onEditItem }: CardProps) => {
	const [flipped, setFlipped] = useState<boolean>(false);

	const { removeItem } = useLocalStorageCloset();

	const renderMaterial = ({ material }: any) => {
		if (!material) return null;

		// if material is a string
		if (typeof material === "string") {
			return (
				<>
					<strong>Material:</strong> {material}
				</>
			);
		}

		// if material is an array
		if (Array.isArray(material)) {
			return (
				<>
					<strong>Material:</strong> 
					{material.map((item, index) => {
						return (
							<span key={index}>
								{item.material}: {item.percentage}%{index < material.length - 1 ? ", " : ""}
							</span>
						);
					})}
				</>
			);
		}

		// if material is an object
		if (typeof material === "object") {
			return (
				<>
					<strong>Material:</strong>{" "}
					{Object.entries(material)
						.map(([key, value]) => `${key}: ${value}`)
						.join(", ")}
				</>
			);
		}

		return null;
	};

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
						<p>
							{/* <strong>Material:</strong> {item.material} */}
							{/* {item.materials.map((mat: any, idx: any) => (
								<span key={idx}>
									{mat.material} - {mat.percentage}%{" "}
								</span>
							))} */}
							{renderMaterial(item)}
						</p>
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
