import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { ClothingItem } from "../../utils/types";
import { LocationGroup } from "../../utils/locationGroups";
import FilteredCard from "../SearchCloset/FilteredCard/FilteredCard";
import "./WhereIsEverything.css";

interface LocationGroupSectionProps {
	group: LocationGroup;
	onEditItem?: (item: ClothingItem) => void;
	onRemoveItem?: (id: string) => void;
}

/** One collapsible location group — header (label, kind, count) + its items,
 *  or an empty-state line when nothing is currently there. Expanded by
 *  default: the point of this view is seeing everything at a glance. */
const LocationGroupSection = ({ group, onEditItem, onRemoveItem }: LocationGroupSectionProps) => {
	const [expanded, setExpanded] = useState(true);
	const { location, items } = group;
	const sectionId = `where-is-everything-panel-${location.id}`;

	return (
		<section className="location-group">
			<button
				type="button"
				className="location-group__header"
				onClick={() => setExpanded((v) => !v)}
				aria-expanded={expanded}
				aria-controls={sectionId}
			>
				<span className={`location-group__swatch location-group__swatch--${location.kind}`} aria-hidden="true" />
				<span className="location-group__label">{location.label}</span>
				<span className="location-group__count">{items.length}</span>
				<ChevronDown
					size={16}
					className={`location-group__chevron${expanded ? " location-group__chevron--open" : ""}`}
					aria-hidden="true"
				/>
			</button>

			{expanded && (
				<div id={sectionId} className="location-group__body">
					{items.length === 0 ? (
						<p className="location-group__empty">Nothing here right now.</p>
					) : (
						<div className="items-grid items-grid--compact" role="list">
							{items.map((item) => (
								<div key={item.id} role="listitem">
									<FilteredCard
										item={item}
										matchKeys={[]}
										onEditItem={onEditItem}
										onRemoveItem={onRemoveItem}
										borderMode="location_status"
									/>
								</div>
							))}
						</div>
					)}
				</div>
			)}
		</section>
	);
};

export default LocationGroupSection;
