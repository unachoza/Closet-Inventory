import { ClothingItem, Category } from "../utils/types";
import { CATEGORIES } from "../utils/data";
import { Plus, Check, ShoppingBag, Star } from "lucide-react";

import "./ClosetPanel.css";

interface ClosetPanelProps {
	closet: ClothingItem[];
	activeCategory: Category;
	setActiveCategory: (category: Category) => void;
	selectedItems: Record<string, ClothingItem>;
	onToggleItem: (item: ClothingItem) => void;
	onAddItem: () => void;
}

const ClosetPanel = ({ closet, activeCategory, setActiveCategory, selectedItems, onToggleItem, onAddItem }: ClosetPanelProps) => {
	const filteredItems = activeCategory === "All" ? closet : closet.filter((item) => item.category === activeCategory);

	return (
		<div className="closet-panel">
			{/* Header */}
			<div className="closet-panel__header">
				<div className="closet-panel__header-row">
					<div>
						<p className="closet-panel__eyebrow">Browse</p>

						<h2 className="closet-panel__title">
							My Closet
							<span className="closet-panel__count">{closet.length} pieces</span>
						</h2>
					</div>

					<button type="button" className="closet-panel__add-btn" onClick={onAddItem}>
						<Plus size={12} strokeWidth={2} />
						<span>Add</span>
					</button>
				</div>

				{/* Category Tabs */}
				<div className="closet-panel__tabs">
					{CATEGORIES.map((cat) => {
						const count = cat === "All" ? closet.length : closet.filter((item) => item.category === cat).length;

						const isActive = activeCategory === cat;

						return (
							<button
								key={cat}
								type="button"
								onClick={() => setActiveCategory(cat)}
								className={`closet-panel__tab ${isActive ? "closet-panel__tab--active" : ""}`}
							>
								<span>{cat}</span>

								<span className={`closet-panel__tab-count ${isActive ? "closet-panel__tab-count--active" : ""}`}>
									{count}
								</span>
							</button>
						);
					})}
				</div>
			</div>

			{/* Content */}
			<div className="closet-panel__content">
				{filteredItems.length === 0 ? (
					<div className="closet-panel__empty">
						<ShoppingBag size={32} strokeWidth={1} />

						<p>No items here yet</p>

						<button type="button" className="closet-panel__empty-btn" onClick={onAddItem}>
							Add your first piece
						</button>
					</div>
				) : (
					<div className="closet-panel__grid">
						{filteredItems.map((item) => {
							const isSelected = !!selectedItems[item.id];

							return (
								<button
									key={item.id}
									type="button"
									onClick={() => onToggleItem(item)}
									className={`closet-card ${isSelected ? "closet-card--selected" : ""}`}
								>
									<div className="closet-card__image-wrapper">
										<img
											src={item.imageUrl}
											alt={item.name}
											className={`closet-card__image ${isSelected ? "closet-card__image--selected" : ""}`}
										/>

										{item.isFavorite && (
											<div className="closet-card__favorite">
												<Star size={12} strokeWidth={1} />
											</div>
										)}

										{isSelected && (
											<div className="closet-card__selected-indicator">
												<Check size={12} strokeWidth={2.5} />
											</div>
										)}

										<div className="closet-card__category">
											<span>{item.category}</span>
										</div>
									</div>

									<div className={`closet-card__details ${isSelected ? "closet-card__details--selected" : ""}`}>
										<p className={`closet-card__name ${isSelected ? "closet-card__name--selected" : ""}`}>
											{item.name}
										</p>

										<div className="closet-card__meta">
											<p
												className={`closet-card__brand ${
													isSelected ? "closet-card__brand--selected" : ""
												}`}
											>
												{item.brand || item.category}
											</p>

											<span
												className="closet-card__color-dot"
												style={{
													backgroundColor: item.colorHex,
												}}
											/>
										</div>
									</div>
								</button>
							);
						})}
					</div>
				)}
			</div>
		</div>
	);
};

export default ClosetPanel;
