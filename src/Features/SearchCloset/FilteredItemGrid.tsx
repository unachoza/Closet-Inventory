import { ClothingItem } from "../../utils/types";
import FilteredCard from "./FilteredCard";
import "./EntireCloset.css";
import AnimatedContainer from "../../Components/AnimatedContainer/AnimatedContainer";

interface FilteredItemGridProps {
	items: ClothingItem[];
	matchKeysById: Map<string, string[]>;
	totalCount: number;
	onEditItem?: (item: ClothingItem) => void;
}

const FilteredItemGrid = ({ items, matchKeysById, totalCount, onEditItem }: FilteredItemGridProps) => {
	return (
		<>
			<p className="entire-closet__meta">
				Showing <strong>{items.length}</strong> of {totalCount} items
			</p>
			<div className="filtered-items-parent" role="list">
				<AnimatedContainer cacheKey={`${items.length}-${totalCount}`} className="items-grid">
					{items.map((item) => (
						<FilteredCard key={item.id} item={item} matchKeys={matchKeysById.get(item.id) ?? []} onEditItem={onEditItem} />
					))}
				</AnimatedContainer>
				{items.length === 0 && (
					<div className="filtered-item-grid__empty">
						<p>No items match your search or filters.</p>
						<p className="filtered-item-grid__empty-hint">Try adjusting your search query or clearing some filters.</p>
					</div>
				)}
			</div>
		</>
	);
};

export default FilteredItemGrid;
