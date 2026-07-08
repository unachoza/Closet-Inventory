import { useCallback, useEffect, useState } from "react";
import { LOCATIONS, PRIMARY_LOCATION, type Location, type LocationKind } from "../utils/locations";
import * as locationsRepository from "../services/locationsRepository";
import type { UserLocation } from "../services/locationsRepository";

/**
 * E12-3.2 — the per-user locations store. Signed-in users get their real,
 * named locations from Supabase (live CRUD, backs the manager UI + card
 * picker); signed-out / local-only users get the static 4-kind starter
 * registry, read-only, matching pre-E12 behavior exactly.
 */

export interface LocationsStore {
	readonly locations: Location[];
	readonly primaryLocation: Location | undefined;
	readonly isLoading: boolean;
	readonly error: string | null;
	getLocation(id?: string): Location;
	addLocation(input: { label: string; kind: LocationKind }): Promise<void>;
	renameLocation(id: string, label: string): Promise<void>;
	setPrimaryLocation(id: string): Promise<void>;
	deleteLocation(id: string, reassignToId?: string): Promise<void>;
	refresh(): Promise<void>;
}

const SIGNED_OUT_ERROR = "Sign in to manage your locations.";

function toLocation(l: UserLocation): Location {
	return { id: l.id, label: l.label, kind: l.kind, isPrimary: l.isPrimary };
}

export function useLocationsStore(userId: string | null): LocationsStore {
	const [locations, setLocations] = useState<Location[]>(userId ? [] : LOCATIONS);
	const [isLoading, setIsLoading] = useState<boolean>(!!userId);
	const [error, setError] = useState<string | null>(null);

	const refresh = useCallback(async () => {
		if (!userId) {
			setLocations(LOCATIONS);
			setIsLoading(false);
			return;
		}
		setIsLoading(true);
		try {
			const rows = await locationsRepository.listLocations(userId);
			setLocations(rows.map(toLocation));
			setError(null);
		} catch (e) {
			setError(e instanceof Error ? e.message : "Failed to load locations");
		} finally {
			setIsLoading(false);
		}
	}, [userId]);

	useEffect(() => {
		refresh();
	}, [refresh]);

	const primaryLocation = locations.find((l) => l.isPrimary) ?? (userId ? undefined : PRIMARY_LOCATION);

	const getLocation = useCallback(
		(id?: string): Location => {
			if (id) {
				const found = locations.find((l) => l.id === id);
				if (found) return found;
			}
			return primaryLocation ?? PRIMARY_LOCATION;
		},
		[locations, primaryLocation],
	);

	const addLocation = useCallback(
		async (input: { label: string; kind: LocationKind }) => {
			if (!userId) throw new Error(SIGNED_OUT_ERROR);
			await locationsRepository.addLocation(userId, input);
			await refresh();
		},
		[userId, refresh],
	);

	const renameLocation = useCallback(
		async (id: string, label: string) => {
			if (!userId) throw new Error(SIGNED_OUT_ERROR);
			await locationsRepository.renameLocation(id, label);
			await refresh();
		},
		[userId, refresh],
	);

	const setPrimaryLocationFn = useCallback(
		async (id: string) => {
			if (!userId) throw new Error(SIGNED_OUT_ERROR);
			await locationsRepository.setPrimaryLocation(userId, id);
			await refresh();
		},
		[userId, refresh],
	);

	const deleteLocationFn = useCallback(
		async (id: string, reassignToId?: string) => {
			if (!userId) throw new Error(SIGNED_OUT_ERROR);
			await locationsRepository.deleteLocation(id, reassignToId);
			await refresh();
		},
		[userId, refresh],
	);

	return {
		locations,
		primaryLocation,
		isLoading,
		error,
		getLocation,
		addLocation,
		renameLocation,
		setPrimaryLocation: setPrimaryLocationFn,
		deleteLocation: deleteLocationFn,
		refresh,
	};
}
