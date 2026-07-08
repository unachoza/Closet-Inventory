import { getSupabase } from "../lib/supabaseClient";
import { LOCATIONS } from "../utils/locations";

/**
 * E2-sync.1 — bridge between the client's static location registry and the
 * per-user `public.locations` table.
 *
 * `items.location_id` in Postgres is a uuid FK; the client registry uses the
 * string ids 'home' | 'storage' | 'suitcase' | 'other'. Writing a registry id
 * into the uuid column makes Postgres reject the whole item upsert — so every
 * located item silently failed to sync. This module seeds the 4 starter
 * locations as real rows (once, idempotently — RLS `locations_all_own` allows
 * it) and returns a bidirectional id map for the repository to translate on
 * every read/write.
 *
 * Custom locations (P1-6) build on this: user-defined rows simply appear in the
 * same table; unknown uuids pass through `toRegistryId` untouched so future
 * custom ids aren't mangled into "home".
 */

export interface LocationIdMap {
	/** Registry id → row uuid. Absent/empty registry id → null (NULL column). */
	toUuid(registryId?: string): string | null;
	/** Row uuid → registry id. Unknown uuids pass through; null/absent → undefined. */
	toRegistryId(uuid?: string | null): string | undefined;
}

interface LocationRow {
	id: string;
	label: string;
	kind: string;
}

function buildMap(rows: LocationRow[]): LocationIdMap {
	// Starter rows are keyed by kind (registry ids equal their kind by design —
	// see `LOCATIONS` in utils/locations.ts). First row per kind wins.
	const registryToUuid = new Map<string, string>();
	const uuidToRegistry = new Map<string, string>();
	for (const row of rows) {
		if (!registryToUuid.has(row.kind)) {
			registryToUuid.set(row.kind, row.id);
			uuidToRegistry.set(row.id, row.kind);
		}
	}
	return {
		toUuid(registryId?: string): string | null {
			if (!registryId) return null;
			return registryToUuid.get(registryId) ?? null;
		},
		toRegistryId(uuid?: string | null): string | undefined {
			if (!uuid) return undefined;
			// Unknown uuid = a custom location (P1-6) — pass through rather than
			// collapsing to the primary/home fallback.
			return uuidToRegistry.get(uuid) ?? uuid;
		},
	};
}

/**
 * Ensure the user's starter locations exist and return the id map.
 * Throws on Supabase errors so the caller's sync-failure net records it.
 */
export async function ensureUserLocations(userId: string): Promise<LocationIdMap> {
	const supabase = getSupabase();

	const { data: existing, error: selectError } = await supabase
		.from("locations")
		.select("id, label, kind")
		.eq("owner_user_id", userId);
	if (selectError) throw new Error(`Failed to load locations: ${selectError.message}`);

	const rows: LocationRow[] = (existing ?? []) as LocationRow[];
	const presentKinds = new Set(rows.map((r) => r.kind));
	const missing = LOCATIONS.filter((l) => !presentKinds.has(l.kind));

	if (missing.length > 0) {
		const { data: inserted, error: insertError } = await supabase
			.from("locations")
			.insert(missing.map((l) => ({ owner_user_id: userId, label: l.label, kind: l.kind })))
			.select();
		if (insertError) throw new Error(`Failed to seed locations: ${insertError.message}`);
		rows.push(...((inserted ?? []) as LocationRow[]));
	}

	return buildMap(rows);
}
