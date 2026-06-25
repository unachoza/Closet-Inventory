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

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
	throw new Error("Missing SUPABASE_URL or SUPABASE_ANON_KEY in .env");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export function GmailSpike() {
	const [user, setUser] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	// Check if already signed in
	useEffect(() => {
		supabase.auth.getSession().then(({ data: { session } }) => {
			if (session?.user) {
				setUser(session.user.email || "Unknown");
				logResults(session);
			}
		});

		// Listen for auth changes
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
		const { error } = await supabase.auth.signInWithOAuth({
			provider: "google",
			options: {
				redirectTo: `${window.location.origin}`,
			},
		});
		if (error) console.error("OAuth error:", error);
		setLoading(false);
	};

	const signOut = async () => {
		await supabase.auth.signOut();
		setUser(null);
	};

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
