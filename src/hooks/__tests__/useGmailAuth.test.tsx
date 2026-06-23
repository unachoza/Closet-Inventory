/**
 * useGmailAuth — token must never be persisted.
 *
 * The Gmail access token is a gmail.readonly credential (full inbox read).
 * It is kept in memory only so that an XSS on the page cannot exfiltrate it
 * from localStorage. These tests lock that guarantee in and verify the
 * one-time purge of the legacy persisted token.
 */
import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

const LEGACY_TOKEN_KEY = "gmail_auth_token";

// Capture the @react-oauth/google onSuccess so we can simulate a login.
let capturedOnSuccess: ((resp: { access_token: string; expires_in: number }) => void) | undefined;
vi.mock("@react-oauth/google", () => ({
	useGoogleLogin: (config: { onSuccess: (resp: { access_token: string; expires_in: number }) => void }) => {
		capturedOnSuccess = config.onSuccess;
		return vi.fn();
	},
}));

import { useGmailAuth } from "../useGmailAuth";

describe("useGmailAuth — in-memory token", () => {
	beforeEach(() => {
		localStorage.clear();
		capturedOnSuccess = undefined;
	});

	it("purges any legacy token persisted by older builds on mount", () => {
		localStorage.setItem(LEGACY_TOKEN_KEY, JSON.stringify({ accessToken: "leaked", expiresAt: Date.now() + 3_600_000 }));

		renderHook(() => useGmailAuth());

		expect(localStorage.getItem(LEGACY_TOKEN_KEY)).toBeNull();
	});

	it("does not write the token to localStorage after a successful login", () => {
		const { result } = renderHook(() => useGmailAuth());

		act(() => capturedOnSuccess?.({ access_token: "secret-token", expires_in: 3600 }));

		// Authenticated in memory…
		expect(result.current.isAuthenticated).toBe(true);
		expect(result.current.accessToken).toBe("secret-token");
		// …but nothing about the token is on disk.
		const dump = JSON.stringify(localStorage);
		expect(dump).not.toContain("secret-token");
		expect(localStorage.getItem(LEGACY_TOKEN_KEY)).toBeNull();
	});

	it("clears the in-memory token on logout", () => {
		const { result } = renderHook(() => useGmailAuth());
		act(() => capturedOnSuccess?.({ access_token: "secret-token", expires_in: 3600 }));

		act(() => result.current.logout());

		expect(result.current.isAuthenticated).toBe(false);
		expect(result.current.accessToken).toBeNull();
	});
});
