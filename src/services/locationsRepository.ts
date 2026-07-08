import { getSupabase } from "../lib/supabaseClient";
import type { LocationKind } from "../utils/locations";

/**
 * E12-3.2 — per-user locations CRUD, the data layer behind the location
 * manager UI (E12-3.3) and the card/edit-form picker (E2 P1-6.2).
 *
 * Distinct from locationSync.ts: that module seeds the 4 starter rows and maps
 * registry-id <-> uuid for item writes (E2-sync.1). This repository is the
 * direct CRUD surface a human uses to manage their own named locations —
 * add "Aspen safe", rename "Nolita apartment", pick which one is primary,
 * delete "old storage unit" (reassigning its items first so none orphan).
 */

export interface UserLocation {
	readonly id: string;
	readonly label: string;
	readonly kind: LocationKind;
	readonly isPrimary: boolean;
}

interface LocationRow {
	id: string;
	label: string;
	kind: string;
	is_primary: boolean;
}

function rowToLocation(row: LocationRow): UserLocation {
	return { id: row.id, label: row.label, kind: row.kind as LocationKind, isPrimary: row.is_primary };
}

export async function listLocations(userId: string): Promise<UserLocation[]> {
	const supabase = getSupabase();
	const { data, error } = await supabase.from("locations").select("id, label, kind, is_primary").eq("owner_user_id", userId).order("created_at");
	if (error) throw new Error(`Failed to load locations: ${error.message}`);
	return ((data ?? []) as LocationRow[]).map(rowToLocation);
}

export async function addLocation(userId: string, input: { label: string; kind: LocationKind }): Promise<UserLocation> {
	const supabase = getSupabase();
	const { data, error } = await supabase
		.from("locations")
		.insert({ owner_user_id: userId, label: input.label, kind: input.kind, is_primary: false })
		.select()
		.single();
	if (error) throw new Error(`Failed to add location: ${error.message}`);
	return rowToLocation(data as LocationRow);
}

export async function renameLocation(id: string, label: string): Promise<void> {
	const supabase = getSupabase();
	const { error } = await supabase.from("locations").update({ label }).eq("id", id);
	if (error) throw new Error(`Failed to rename location: ${error.message}`);
}

/**
 * Sets `id` as the user's primary location, clearing the previous one.
 * Two sequential writes (not a transaction — supabase-js has no client-side
 * multi-statement transaction API) so a mid-failure can briefly leave zero
 * primaries; the caller should re-fetch and retry if the second write fails.
 */
export async function setPrimaryLocation(userId: string, id: string): Promise<void> {
	const supabase = getSupabase();
	const current = await listLocations(userId);
	const previousPrimary = current.find((l) => l.isPrimary && l.id !== id);

	if (previousPrimary) {
		const { error: clearError } = await supabase.from("locations").update({ is_primary: false }).eq("id", previousPrimary.id);
		if (clearError) throw new Error(`Failed to clear previous primary location: ${clearError.message}`);
	}
	const { error: setError } = await supabase.from("locations").update({ is_primary: true }).eq("id", id);
	if (setError) throw new Error(`Failed to set primary location: ${setError.message}`);
}

/**
 * Deletes a location. If it holds items, pass `reassignToId` so they're moved
 * there first (bulk `items.location_id` update, RLS-scoped to the caller's own
 * closets) — otherwise the FK `on delete set null` would leave items pointing
 * nowhere. Refuses to delete the primary location outright: the UI must have
 * the user pick a new primary first (there is no sensible automatic choice).
 */
export async function deleteLocation(id: string, reassignToId?: string): Promise<void> {
	const supabase = getSupabase();

	const { data: row, error: fetchError } = await supabase.from("locations").select("id, label, kind, is_primary").eq("id", id).single();
	if (fetchError) throw new Error(`Failed to load location: ${fetchError.message}`);
	if ((row as LocationRow).is_primary) {
		throw new Error("Cannot delete the primary location — set a different location as primary first.");
	}

	if (reassignToId) {
		const { error: reassignError } = await supabase.from("items").update({ location_id: reassignToId }).eq("location_id", id);
		if (reassignError) throw new Error(`Failed to reassign items off deleted location: ${reassignError.message}`);
	}

	const { error: deleteError } = await supabase.from("locations").delete().eq("id", id);
	if (deleteError) throw new Error(`Failed to delete location: ${deleteError.message}`);
}
