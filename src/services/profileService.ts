import { getSupabase } from "../lib/supabaseClient";
import type { Database } from "../lib/database.types";

export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

export type ProfileResult<T> = { ok: true; data: T } | { ok: false; error: string };

export const DISPLAY_NAME_MAX_LENGTH = 80;

const SIGNED_OUT_ERROR = "You need to be signed in to manage your profile.";

/** Boundary validation for a display name; returns the trimmed value on success. */
export function validateDisplayName(name: string): { ok: true; value: string } | { ok: false; error: string } {
	const trimmed = name.trim();
	if (!trimmed) return { ok: false, error: "Enter a name." };
	if (trimmed.length > DISPLAY_NAME_MAX_LENGTH) {
		return { ok: false, error: `Keep your name under ${DISPLAY_NAME_MAX_LENGTH} characters.` };
	}
	return { ok: true, value: trimmed };
}

/**
 * Idempotently (re)create the signed-in user's bootstrap rows — profile, closet,
 * and owner membership — via the `ensure_user_bootstrap` RPC.
 *
 * Normally `handle_new_user()` seeds these on signup and this is a no-op. It
 * exists for accounts the trigger never covered: the 2026-06-25 signup predated
 * the migration that created the trigger, leaving it with no profile and no
 * closet, and `getProfile()` below fails hard on that state. Calling this after
 * sign-in means such an account heals itself instead of stranding the person.
 *
 * The RPC takes no user id — it acts on `auth.uid()` server-side, so this can
 * never bootstrap another user's rows.
 *
 * Best-effort by design: a failure here must not block sign-in, so the caller
 * logs and continues rather than surfacing an error to a user who, in the
 * overwhelmingly common case, has working rows already.
 */
export async function ensureUserBootstrap(): Promise<ProfileResult<null>> {
	try {
		const { error } = await getSupabase().rpc("ensure_user_bootstrap");
		if (error) return { ok: false, error: error.message };
		return { ok: true, data: null };
	} catch (e) {
		return { ok: false, error: e instanceof Error ? e.message : "Could not initialize your account." };
	}
}

/**
 * Fetch the signed-in user's profile row. The row is seeded by the
 * handle_new_user() trigger on first sign-in (and repaired by
 * `ensureUserBootstrap()` above), so a missing row is an error state worth
 * surfacing, not an expected empty result.
 */
export async function getProfile(userId: string): Promise<ProfileResult<ProfileRow>> {
	if (!userId) return { ok: false, error: SIGNED_OUT_ERROR };
	try {
		const { data, error } = await getSupabase()
			.from("profiles")
			.select("id, created_at, display_name, photo_url, settings")
			.eq("id", userId)
			.single();
		if (error) return { ok: false, error: error.message };
		return { ok: true, data };
	} catch (e) {
		return { ok: false, error: e instanceof Error ? e.message : "Could not load your profile." };
	}
}

/** Update display_name (RLS-scoped to the owner); returns the saved, trimmed name. */
export async function updateDisplayName(userId: string, name: string): Promise<ProfileResult<string>> {
	if (!userId) return { ok: false, error: SIGNED_OUT_ERROR };
	const validated = validateDisplayName(name);
	if (!validated.ok) return { ok: false, error: validated.error };
	try {
		const { error } = await getSupabase()
			.from("profiles")
			.update({ display_name: validated.value })
			.eq("id", userId);
		if (error) return { ok: false, error: error.message };
		return { ok: true, data: validated.value };
	} catch (e) {
		return { ok: false, error: e instanceof Error ? e.message : "Could not save your name. Try again." };
	}
}
