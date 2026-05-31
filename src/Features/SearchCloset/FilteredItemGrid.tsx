import { ClothingItem } from "../../utils/types";
import FilteredCard from "./FilteredCard";
import "./EntireCloset.css";

interface FilteredItemGridProps {
	items: ClothingItem[];
	matchKeysById: Map<string, string[]>;
	totalCount: number;
	onEditItem?: (item: ClothingItem) => void;
}

const FilteredItemGrid = ({
	items,
	matchKeysById,
	totalCount,
	onEditItem,
}: FilteredItemGridProps) => {
	return (
		<>
			<p className="entire-closet__meta">
				Showing <strong>{items.length}</strong> of {totalCount} items
			</p>
			<div className="filtered-item-grid" role="list">
				{items.map((item) => (
					<div key={item.id} role="listitem">
						<FilteredCard
							item={item}
							matchKeys={matchKeysById.get(item.id) ?? []}
							onEditItem={onEditItem}
						/>
					</div>
				))}
				{items.length === 0 && (
					<div className="filtered-item-grid__empty">
						<p>No items match your search or filters.</p>
						<p className="filtered-item-grid__empty-hint">
							Try adjusting your search query or clearing some filters.
						</p>
					</div>
				)}
			</div>
		</>
	);
};

export default FilteredItemGrid;
