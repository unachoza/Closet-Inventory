import { useState, useCallback, useRef } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { useLocalStorage } from "./uselocalStorage";
import { useToast } from "../Components/Toast/Toast";

const GMAIL_SCOPE = "https://www.googleapis.com/auth/gmail.readonly";
const AUTH_STORAGE_KEY = "gmail_auth";

export interface GmailAuthState {
	accessToken: string | null;
	isAuthenticated: boolean;
	error: string | null;
	isLoading: boolean;
	expiresAt?: number | null; // unix ms
}
export function useGmailAuth() {
	const { showToast } = useToast();
	const [storedAuth, setStoredAuth] = useLocalStorage<GmailAuthState>(AUTH_STORAGE_KEY, {
		accessToken: null,
		isAuthenticated: false,
		error: null,
		isLoading: false,
		expiresAt: null,
	});
	const [authState, setAuthState] = useState<GmailAuthState>(storedAuth);
	const logoutTimer = useRef<NodeJS.Timeout | null>(null);

	const login = useGoogleLogin({
		scope: GMAIL_SCOPE,
		onSuccess: (tokenResponse) => {
			setAuthState({
				accessToken: tokenResponse.access_token,
				isAuthenticated: true,
				error: null,
				isLoading: false,
			});
			setStoredAuth(authState)
		},
		onError: (error) => {
			setAuthState({
				accessToken: null,
				isAuthenticated: false,
				error: error.error_description ?? "Failed to authenticate with Google",
				isLoading: false,
			});
		},
		onNonOAuthError: () => {
			setAuthState({
				accessToken: null,
				isAuthenticated: false,
				error: "Authentication popup was closed",
				isLoading: false,
			});
		},
	});

	const handleLogin = useCallback(() => {
		setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));
		login();
	}, [login]);

	const logout = useCallback(() => {
		setAuthState({
			accessToken: null,
			isAuthenticated: false,
			error: null,
			isLoading: false,
		});
	}, []);

	return { ...authState, login: handleLogin, logout };
}
