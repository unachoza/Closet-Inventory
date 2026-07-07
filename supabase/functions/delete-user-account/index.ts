// E1-4.8 — service_role account deletion (true identity erasure).
//
// The client-side `deleteAccountData` (RLS-scoped) removes the user's data
// (Storage + profile → cascade). This Edge Function additionally removes the
// `auth.users` identity row so the account is fully erased and `handle_new_user`
// does not regenerate an empty closet on a future sign-in.
//
// Deploy (needs a Supabase access token — the dev PAT was rotated):
//   supabase functions deploy delete-user-account --project-ref <ref>
// The function reads SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY from the Edge
// runtime env (set automatically for deployed functions).
//
// Deno runtime — not covered by the vitest suite. Verify via a live authed call.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const BUCKET = "item-photos";

Deno.serve(async (req: Request) => {
	if (req.method !== "POST" && req.method !== "DELETE") {
		return json({ error: "Method not allowed" }, 405);
	}

	const authHeader = req.headers.get("Authorization") ?? "";
	const jwt = authHeader.replace(/^Bearer\s+/i, "");
	if (!jwt) return json({ error: "Missing bearer token" }, 401);

	const url = Deno.env.get("SUPABASE_URL")!;
	const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
	const admin = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });

	// Resolve the caller from their JWT — never trust a user-supplied id.
	const { data: userData, error: userErr } = await admin.auth.getUser(jwt);
	if (userErr || !userData.user) return json({ error: "Invalid session" }, 401);
	const userId = userData.user.id;

	try {
		// 1. Storage cleanup (cascade can't reach Storage).
		const { data: files } = await admin.storage.from(BUCKET).list(userId);
		if (files && files.length > 0) {
			await admin.storage.from(BUCKET).remove(files.map((f) => `${userId}/${f.name}`));
		}

		// 2. Delete the auth user → ON DELETE CASCADE removes profile → closets →
		//    items → photos/materials/tags/wear_events/locations/members.
		const { error: delErr } = await admin.auth.admin.deleteUser(userId);
		if (delErr) return json({ error: `Deletion failed: ${delErr.message}` }, 500);

		return json({ success: true, deletedAt: new Date().toISOString() }, 200);
	} catch (e) {
		return json({ error: e instanceof Error ? e.message : "Unexpected error" }, 500);
	}
});

function json(body: unknown, status: number): Response {
	return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}
