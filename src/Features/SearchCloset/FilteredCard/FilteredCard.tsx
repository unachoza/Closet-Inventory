import { ClothingItem } from "../../../utils/types";
import { BorderMode } from "../../../utils/borderMode";
import { useLocations } from "../../../context/LocationsContext";
import ClothingCard from "../../../Components/ClothesCard/Card/Card";
import FilterMatchPills from "../FilterMatchPills/FilterMatchPills";
import "../EntireCloset.css";

interface FilteredCardProps {
	item: ClothingItem;
	matchKeys: string[];
	onEditItem?: (item: ClothingItem) => void;
	onRemoveItem?: (id: string) => void;
	borderMode?: BorderMode;
}

const FilteredCard = ({ item, matchKeys, onEditItem, onRemoveItem, borderMode = "off" }: FilteredCardProps) => {
	// The border color is driven entirely by data-* attributes → CSS maps them to
	// brand tokens (see EntireCloset.css). Home/primary locations map to a neutral
	// (transparent) border; only "away" locations show color. The status dot is
	// added in the combined mode.
	const { getLocation } = useLocations();
	const showBorder = borderMode !== "off";
	const showStatus = borderMode === "location_status";
	const locationKind = getLocation(item.locationId).kind;
	const status = item.status ?? "clean";

	return (
		<div
			className="filtered-card"
			data-border={showBorder ? borderMode : undefined}
			data-location-kind={showBorder ? locationKind : undefined}
			data-status={showStatus ? status : undefined}
		>
			<ClothingCard item={item} onEditItem={onEditItem} onRemoveItem={onRemoveItem} />
			{showStatus && (
				<span
					className="filtered-card__status-dot"
					data-status={status}
					aria-label={`Status: ${status.replace(/_/g, " ")}`}
					title={status.replace(/_/g, " ")}
				/>
			)}
			<FilterMatchPills matchKeys={matchKeys} />
		</div>
	);
};

export default FilteredCard;
