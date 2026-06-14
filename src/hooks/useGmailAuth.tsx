import { useCallback, useEffect, useState } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { useLocalStorage } from "./uselocalStorage";

const GMAIL_SCOPE = "https://www.googleapis.com/auth/gmail.readonly";
const AUTH_STORAGE_KEY = "gmail_auth_token";

interface StoredAuth {
	readonly accessToken: string;
	readonly expiresAt: number; // timestamp in ms
}

const EMPTY_AUTH: StoredAuth = {
	accessToken: "",
	expiresAt: 0,
};

function isTokenValid(auth: StoredAuth): boolean {
	if (!auth.accessToken) return false;
	// Add 60s buffer so we don't use a token that's about to expire
	return Date.now() < auth.expiresAt - 60_000;
}

export function useGmailAuth() {
	// Only the token is persisted. error/isLoading are transient UI state — if they
	// were persisted, an interrupted login (e.g. a blocked popup on Safari) would
	// leave isLoading=true stored forever, permanently disabling the Connect button.
	const [storedAuth, setStoredAuth] = useLocalStorage<StoredAuth>(AUTH_STORAGE_KEY, EMPTY_AUTH);
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(false);

	// One-time cleanup: drop stale loading/error flags persisted by older builds so
	// users currently trapped on "Connecting..." recover on next load.
	useEffect(() => {
		try {
			window.localStorage.removeItem("gmail_auth_loading");
			window.localStorage.removeItem("gmail_auth_error");
		} catch {
			// Storage unavailable (e.g. private mode) — nothing to clean up.
		}
	}, []);

	const authenticated = isTokenValid(storedAuth);

	const login = useGoogleLogin({
		scope: GMAIL_SCOPE,
		onSuccess: (tokenResponse) => {
			// Google tokens typically expire in 3600 seconds (1 hour)
			const expiresInMs = (tokenResponse.expires_in ?? 3600) * 1000;

			setStoredAuth({
				accessToken: tokenResponse.access_token,
				expiresAt: Date.now() + expiresInMs,
			});
			setError(null);
			setIsLoading(false);
		},
		onError: (err) => {
			setStoredAuth(EMPTY_AUTH);
			setError(err.error_description ?? "Failed to authenticate with Google");
			setIsLoading(false);
		},
		onNonOAuthError: () => {
			setStoredAuth(EMPTY_AUTH);
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
		setStoredAuth(EMPTY_AUTH);
		setError(null);
	}, [setStoredAuth, setError]);

	return {
		accessToken: authenticated ? storedAuth.accessToken : null,
		isAuthenticated: authenticated,
		error,
		isLoading,
		login: handleLogin,
		logout,
	};
}
