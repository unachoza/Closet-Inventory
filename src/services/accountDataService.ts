import { getSupabase } from "../lib/supabaseClient";
import { SupabaseClosetRepository } from "./supabaseClosetRepository";
import { downloadFile } from "../utils/exportCloset";
import type { ClothingItem } from "../utils/types";

const BUCKET = "item-photos";

/**
 * E1-4.8 — self-serve data export + account deletion (GDPR/CCPA).
 *
 * All operations are RLS-scoped to the signed-in user: `select` returns only
 * their own rows, and deletion removes only what they own. Full identity
 * erasure (the `auth.users` row) needs the service_role Edge Function
 * `delete-user-account`; this client path covers the data itself.
 */

export interface AccountExport {
	readonly exportedAt: string;
	readonly userId: string;
	readonly profile: unknown | null;
	readonly closets: unknown[];
	readonly items: ClothingItem[];
	readonly wearEvents: unknown[];
}

/** Gather everything the signed-in user owns into a single portable payload. */
export async function exportAccountData(userId: string): Promise<AccountExport> {
	const supabase = getSupabase();
	const repo = new SupabaseClosetRepository(userId);

	// RLS scopes every result to the caller — no explicit user filter needed.
	const [items, profileRes, closetsRes, wearRes] = await Promise.all([
		repo.getAll(),
		supabase.from("profiles").select("*"),
		supabase.from("closets").select("*"),
		supabase.from("wear_events").select("*"),
	]);

	return {
		exportedAt: new Date().toISOString(),
		userId,
		profile: profileRes.data?.[0] ?? null,
		closets: closetsRes.data ?? [],
		items,
		wearEvents: wearRes.data ?? [],
	};
}

/** Trigger a browser download of an account export as pretty-printed JSON. */
export function downloadAccountExport(data: AccountExport): void {
	const stamp = new Date().toISOString().slice(0, 10);
	downloadFile(JSON.stringify(data, null, 2), `nothing-to-wear-export-${stamp}.json`, "application/json;charset=utf-8;");
}

/**
 * Delete the signed-in user's data.
 *
 * 1. Remove their Storage objects (Postgres cascade can't reach Storage).
 * 2. Delete their `profiles` row — `closets.created_by → profiles(id) ON DELETE
 *    CASCADE` then removes closets → items → photos/materials/tags/wear_events/
 *    locations/members in one shot. Requires the `profiles_delete_own` policy
 *    (migration 20260707000001).
 *
 * Does NOT remove the `auth.users` identity row — that is the Edge Function's
 * job. Callers should sign the user out afterward.
 */
export async function deleteAccountData(userId: string): Promise<void> {
	const supabase = getSupabase();

	// 1. Storage: list the user's folder and remove every object.
	const { data: files, error: listError } = await supabase.storage.from(BUCKET).list(userId);
	if (listError) throw new Error(`Failed to list photos for deletion: ${listError.message}`);
	if (files && files.length > 0) {
		const paths = files.map((f) => `${userId}/${f.name}`);
		const { error: removeError } = await supabase.storage.from(BUCKET).remove(paths);
		if (removeError) throw new Error(`Failed to delete photos: ${removeError.message}`);
	}

	// 2. Delete the profile → cascades the entire owned graph.
	const { error: profileError } = await supabase.from("profiles").delete().eq("id", userId);
	if (profileError) throw new Error(`Failed to delete account data: ${profileError.message}`);
}

/**
 * Full account deletion: wipe the user's data (RLS), then best-effort erase the
 * `auth.users` identity via the `delete-user-account` Edge Function.
 *
 * The Edge Function is deploy-gated; if it isn't deployed the identity row
 * persists (the data is already gone). The caller should sign out afterward.
 */
export async function deleteAccount(userId: string): Promise<void> {
	await deleteAccountData(userId);
	try {
		await getSupabase().functions.invoke("delete-user-account", { method: "POST" });
	} catch {
		// Edge Function not deployed / unreachable — data is already wiped; the
		// identity row is erased once the function is live. Don't block sign-out.
	}
}
