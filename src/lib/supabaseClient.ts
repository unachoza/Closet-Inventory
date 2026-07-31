import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

let _client: SupabaseClient<Database> | null = null;

export function getSupabase(): SupabaseClient<Database> {
	if (_client) return _client;

	const url = import.meta.env.VITE_SUPABASE_URL;
	const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

	if (!url || !key) {
		throw new Error("VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set in .env");
	}

	_client = createClient<Database>(url, key, {
		auth: {
			// Without this, OAuth sign-in uses Supabase's default "implicit" flow,
			// which puts the access token, refresh token, and provider token
			// directly in the URL fragment after every sign-in (visible in browser
			// history, screenshots, and any tool that logs the current URL). PKCE
			// instead redirects with a short-lived, single-use `code` — worthless
			// without the `code_verifier` generated and kept client-side, and
			// already consumed by the time the real sign-in completes.
			// supabase-js exchanges it automatically (detectSessionInUrl defaults
			// to true), so no other auth code needs to change.
			flowType: "pkce",
		},
	});

	return _client;
}
