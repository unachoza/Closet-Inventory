import { ClothingItem } from "../../utils/types";
import ClothingCard from "../../Components/ClothesCard/Card/Card";
import FilterMatchPills from "./FilterMatchPills";
import "./EntireCloset.css";

interface FilteredCardProps {
	item: ClothingItem;
	matchKeys: string[];
	onEditItem?: (item: ClothingItem) => void;
	onRemoveItem?: (id: string) => void;
}

const FilteredCard = ({ item, matchKeys, onEditItem, onRemoveItem }: FilteredCardProps) => {
	return (
		<div className="filtered-card">
			<ClothingCard item={item} onEditItem={onEditItem} onRemoveItem={onRemoveItem} />
			<FilterMatchPills matchKeys={matchKeys} />
		</div>
	);
};

export default FilteredCard;
