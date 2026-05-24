import { useState, useCallback } from "react";
import { useGoogleLogin } from "@react-oauth/google";

const GMAIL_SCOPE = "https://www.googleapis.com/auth/gmail.readonly";

export interface GmailAuthState {
	accessToken: string | null;
	isAuthenticated: boolean;
	error: string | null;
	isLoading: boolean;
}

export function useGmailAuth() {
	const [authState, setAuthState] = useState<GmailAuthState>({
		accessToken: null,
		isAuthenticated: false,
		error: null,
		isLoading: false,
	});

	const login = useGoogleLogin({
		scope: GMAIL_SCOPE,
		onSuccess: (tokenResponse) => {
			setAuthState({
				accessToken: tokenResponse.access_token,
				isAuthenticated: true,
				error: null,
				isLoading: false,
			});
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
