import { useCallback, useEffect, useState } from "react";
import { useGoogleLogin } from "@react-oauth/google";

const GMAIL_SCOPE = "https://www.googleapis.com/auth/gmail.readonly";
// Legacy key — the access token used to be persisted here. We now keep it in
// memory only and purge this key on mount (see below).
const LEGACY_TOKEN_KEY = "gmail_auth_token";

interface GmailAuth {
	readonly accessToken: string;
	readonly expiresAt: number; // timestamp in ms
}

const EMPTY_AUTH: GmailAuth = {
	accessToken: "",
	expiresAt: 0,
};

function isTokenValid(auth: GmailAuth): boolean {
	if (!auth.accessToken) return false;
	// Add 60s buffer so we don't use a token that's about to expire
	return Date.now() < auth.expiresAt - 60_000;
}

export function useGmailAuth() {
	// The Gmail access token is kept in MEMORY ONLY — never in localStorage.
	// A persisted gmail.readonly token is a standing XSS target: any script that
	// runs on the page could read it straight out of storage. In-memory means it
	// dies on reload (cost: re-auth after a refresh, which is cheap). Server-side
	// token storage is the longer-term home (E1 cloud backend).
	const [auth, setAuth] = useState<GmailAuth>(EMPTY_AUTH);
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(false);

	// One-time cleanup: purge credentials persisted by older builds — including
	// the access token itself, which used to live in localStorage — so no stale
	// token lingers on disk for existing users after this upgrade.
	useEffect(() => {
		try {
			window.localStorage.removeItem(LEGACY_TOKEN_KEY);
			window.localStorage.removeItem("gmail_auth_loading");
			window.localStorage.removeItem("gmail_auth_error");
		} catch {
			// Storage unavailable (e.g. private mode) — nothing to clean up.
		}
	}, []);

	const authenticated = isTokenValid(auth);

	const login = useGoogleLogin({
		scope: GMAIL_SCOPE,
		onSuccess: (tokenResponse) => {
			// Google tokens typically expire in 3600 seconds (1 hour)
			const expiresInMs = (tokenResponse.expires_in ?? 3600) * 1000;

			setAuth({
				accessToken: tokenResponse.access_token,
				expiresAt: Date.now() + expiresInMs,
			});
			setError(null);
			setIsLoading(false);
		},
		onError: (err) => {
			setAuth(EMPTY_AUTH);
			setError(err.error_description ?? "Failed to authenticate with Google");
			setIsLoading(false);
		},
		onNonOAuthError: () => {
			setAuth(EMPTY_AUTH);
			setError("Authentication popup was closed");
			setIsLoading(false);
		},
	});

	const handleLogin = useCallback(() => {
		setIsLoading(true);
		setError(null);
		try {
			login();
		} catch (err) {
			// Safari can block the OAuth popup outright; don't leave the button hung.
			setIsLoading(false);
			setError("Couldn't open Google sign-in. Please allow pop-ups for this site and try again.");
			console.warn("Gmail login failed to open", err);
		}
	}, [login, setIsLoading, setError]);

	const logout = useCallback(() => {
		setAuth(EMPTY_AUTH);
		setError(null);
	}, [setAuth, setError]);

	return {
		accessToken: authenticated ? auth.accessToken : null,
		isAuthenticated: authenticated,
		error,
		isLoading,
		login: handleLogin,
		logout,
	};
}
