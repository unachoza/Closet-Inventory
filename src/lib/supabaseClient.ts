import { createClient } from "@supabase/supabase-js";

// Lazy singleton — validation happens on first call, not at module evaluation,
// so importing this file in CI/preview environments without Supabase env vars
// doesn't crash the app until the Supabase auth flow is actually invoked.
let _client: ReturnType<typeof createClient> | null = null;

export function getSupabase(): ReturnType<typeof createClient> {
	if (_client) return _client;
	const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
	const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
	if (!url || !key) throw new Error("VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set in .env");
	_client = createClient(url, key);
	return _client;
}
