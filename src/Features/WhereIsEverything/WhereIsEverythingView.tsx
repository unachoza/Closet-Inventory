import { useMemo } from "react";
import { useCloset } from "../../context/ClosetContext";
import { useLocations } from "../../context/LocationsContext";
import { groupItemsByLocation } from "../../utils/locationGroups";
import { ClothingItem } from "../../utils/types";
import LocationGroupSection from "./LocationGroupSection";
import "./WhereIsEverything.css";

interface WhereIsEverythingViewProps {
	onEditItem?: (item: ClothingItem) => void;
}

/** P1-5 — grouped-by-location view: the literal answer to "where is
 *  everything." Groups the whole closet by location (home/storage/suitcase/
 *  other, or the user's own named locations) with a count per group. */
const WhereIsEverythingView = ({ onEditItem }: WhereIsEverythingViewProps) => {
	const { closet, removeItem } = useCloset();
	const { locations, isLoading, error } = useLocations();

	const groups = useMemo(() => groupItemsByLocation(closet, locations), [closet, locations]);

	return (
		<main className="where-is-everything" aria-label="Where is everything">
			<div className="where-is-everything__header">
				<h1 className="where-is-everything__title">Where is everything</h1>
				<p className="where-is-everything__meta">
					<strong>{closet.length}</strong> item{closet.length === 1 ? "" : "s"} across {groups.length} location
					{groups.length === 1 ? "" : "s"}
				</p>
			</div>

			{error && (
				<p className="where-is-everything__error" role="alert">
					{error}
				</p>
			)}

			{isLoading ? (
				<p className="where-is-everything__loading">Loading your locations…</p>
			) : (
				<div className="where-is-everything__groups">
					{groups.map((group) => (
						<LocationGroupSection key={group.location.id} group={group} onEditItem={onEditItem} onRemoveItem={removeItem} />
					))}
				</div>
			)}
		</main>
	);
};

export default WhereIsEverythingView;
