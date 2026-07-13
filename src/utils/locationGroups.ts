import { ClothingItem } from "./types";
import { Location } from "./locations";

/** One location and the items currently assigned to it. */
export interface LocationGroup {
	location: Location;
	items: ClothingItem[];
}

/**
 * P1-5 — "Where are my clothes": group the closet by location for a
 * grouped-by-location overview, with per-group counts.
 *
 * Every known location gets a group, even with zero items — an empty
 * "Storage" group is itself an answer ("nothing's in storage"). Items whose
 * `locationId` doesn't resolve to a known location (deleted/unknown id, or
 * absent) fall back to the primary/home group, matching `getLocation`'s
 * absent-id behavior elsewhere in the app.
 *
 * Groups sort primary/home first, then alphabetically by label.
 */
export function groupItemsByLocation(items: ClothingItem[], locations: Location[]): LocationGroup[] {
	const byId = new Map(locations.map((loc) => [loc.id, loc]));
	const primary = locations.find((loc) => loc.isPrimary) ?? locations[0];

	const itemsByLocationId = new Map<string, ClothingItem[]>();
	for (const loc of locations) itemsByLocationId.set(loc.id, []);

	for (const item of items) {
		const resolvedId = item.locationId && byId.has(item.locationId) ? item.locationId : primary?.id;
		if (resolvedId === undefined) continue;
		itemsByLocationId.get(resolvedId)?.push(item);
	}

	const sortedLocations = [...locations].sort((a, b) => {
		if (a.isPrimary !== b.isPrimary) return a.isPrimary ? -1 : 1;
		return a.label.localeCompare(b.label);
	});

	return sortedLocations.map((location) => ({
		location,
		items: itemsByLocationId.get(location.id) ?? [],
	}));
}
