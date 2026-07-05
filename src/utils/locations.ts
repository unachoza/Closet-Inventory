/**
 * E2 US-2.2: minimal location registry (localStorage-first).
 *
 * `ClothingItem.locationId` is a free string that references one of these
 * starter locations. Home is the primary location: items there (or with no
 * location set) are treated as "at home" and render a neutral card border —
 * indicators only appear when an item is *away*. A user-defined "add your own"
 * location set is a later E2 step; this is the starter preset.
 */
export type LocationKind = 'home' | 'storage' | 'suitcase' | 'other';

export interface Location {
	id: string;
	label: string;
	kind: LocationKind;
	isPrimary?: boolean;
}

/** Starter preset. `id === kind` for the presets to keep seeding/reads simple. */
export const LOCATIONS: Location[] = [
	{ id: 'home', label: 'Home', kind: 'home', isPrimary: true },
	{ id: 'storage', label: 'Storage', kind: 'storage' },
	{ id: 'suitcase', label: 'Suitcase', kind: 'suitcase' },
	{ id: 'other', label: 'Other', kind: 'other' },
];

/** The location every item defaults to when `locationId` is absent/unknown. */
export const PRIMARY_LOCATION: Location = LOCATIONS.find((l) => l.isPrimary) ?? LOCATIONS[0];

/** Resolve a location id to its record. Absent/unknown ids resolve to the primary (home) location. */
export function getLocation(id?: string): Location {
	if (!id) return PRIMARY_LOCATION;
	return LOCATIONS.find((l) => l.id === id) ?? PRIMARY_LOCATION;
}

/** True when the item is at its primary (home) location, or has no location set. */
export function isPrimaryLocation(id?: string): boolean {
	return getLocation(id).isPrimary === true;
}
