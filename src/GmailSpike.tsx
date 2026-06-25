import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

/**
 * Gmail spike test — does Supabase Auth's Google OAuth return a provider_refresh_token?
 *
 * Steps:
 * 1. Click "Sign in with Google"
 * 2. Complete the Google sign-in
 * 3. Come back to the app
 * 4. Open browser console (F12)
 * 5. Look for "Gmail spike result:" — does it include provider_refresh_token?
 *
 * If YES → the design works, we can store + refresh server-side ✅
 * If NO → fallback to separate Google OAuth client (still viable) ⚠️
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// Lazy — only throws when the component is actually rendered, not at import time.
const supabase = SUPABASE_URL && SUPABASE_ANON_KEY
	? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
	: null;

export function GmailSpike() {
	const [user, setUser] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	// Hooks must run unconditionally — guard against missing config in the JSX below.
	useEffect(() => {
		if (!supabase) return;
		supabase.auth.getSession().then(({ data: { session } }) => {
			if (session?.user) {
				setUser(session.user.email || "Unknown");
				logResults(session);
			}
		});

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			if (session?.user) {
				setUser(session.user.email || "Unknown");
				logResults(session);
			}
		});

		return () => subscription?.unsubscribe();
	}, []);

	const signInWithGoogle = async () => {
		setLoading(true);
		const result = await supabase?.auth.signInWithOAuth({
			provider: "google",
			options: {
				redirectTo: `${window.location.origin}`,
			},
		});
		if (result?.error) console.error("OAuth error:", result.error);
		setLoading(false);
	};

	const signOut = async () => {
		await supabase?.auth.signOut();
		setUser(null);
	};

	if (!supabase) {
		return (
			<div style={{ padding: "2rem", fontFamily: "system-ui" }}>
				<h1>Gmail Spike Test</h1>
				<p style={{ color: "red" }}>
					Missing <code>VITE_SUPABASE_URL</code> or <code>VITE_SUPABASE_ANON_KEY</code> in .env
				</p>
			</div>
		);
	}

	return (
		<div style={{ padding: "2rem", fontFamily: "system-ui" }}>
			<h1>Gmail Spike Test</h1>
			<p>
				Testing if Supabase Auth's Google OAuth returns a <code>provider_refresh_token</code>.
			</p>

			{user ? (
				<>
					<p>
						<strong>Signed in as:</strong> {user}
					</p>
					<p style={{ fontSize: "0.9rem", color: "#666" }}>
						Check the browser console (F12) for the detailed session dump. Look for{" "}
						<code>provider_refresh_token</code>.
					</p>
					<button onClick={signOut} style={{ padding: "0.5rem 1rem", marginRight: "1rem" }}>
						Sign Out
					</button>
				</>
			) : (
				<button
					onClick={signInWithGoogle}
					disabled={loading}
					style={{ padding: "0.5rem 1rem", fontSize: "1rem" }}
				>
					{loading ? "Signing in..." : "Sign in with Google"}
				</button>
			)}
		</div>
	);
}

function logResults(session: import("@supabase/supabase-js").Session) {
	console.log("=== Gmail spike result ===");
	console.log("Full session:", session);
	console.log("User metadata:", session.user?.user_metadata);
	console.log("Identities:", session.user?.identities);

	const hasRefreshToken = !!session.user?.user_metadata?.provider_refresh_token;
	console.log(
		hasRefreshToken ? "✅ HAS provider_refresh_token" : "❌ NO provider_refresh_token",
	);

	if (hasRefreshToken) {
		console.log("provider_refresh_token:", session.user.user_metadata.provider_refresh_token);
	}
}
