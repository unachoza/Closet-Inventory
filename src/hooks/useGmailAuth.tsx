import { useCallback } from "react";
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
	const [storedAuth, setStoredAuth] = useLocalStorage<StoredAuth>(
		AUTH_STORAGE_KEY,
		EMPTY_AUTH
	);
	const [error, setError] = useLocalStorage<string | null>(
		"gmail_auth_error",
		null
	);
	const [isLoading, setIsLoading] = useLocalStorage<boolean>(
		"gmail_auth_loading",
		false
	);

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
		login();
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
