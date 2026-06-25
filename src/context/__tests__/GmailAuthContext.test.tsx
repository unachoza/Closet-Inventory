/**
 * GmailAuthProvider — the token must survive a consumer unmount/remount.
 *
 * Regression guard for E3-bug.2: previously `useGmailAuth` was called inside
 * `GmailImport`, which only mounts while `view === "gmail"`. Importing an item
 * unmounted GmailImport and destroyed the in-memory token, so "Back to email"
 * forced a full re-auth. Lifting the hook into this session-scoped provider keeps
 * the token alive across the view switch.
 */
import { render, screen, act, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useState } from "react";

// Capture the @react-oauth/google onSuccess so we can simulate a login.
let capturedOnSuccess: ((resp: { access_token: string; expires_in: number }) => void) | undefined;
vi.mock("@react-oauth/google", () => ({
	useGoogleLogin: (config: { onSuccess: (resp: { access_token: string; expires_in: number }) => void }) => {
		capturedOnSuccess = config.onSuccess;
		return vi.fn();
	},
}));

import { GmailAuthProvider, useGmailAuthContext } from "../GmailAuthContext";

/** A consumer that mirrors what GmailImport reads from the auth context. */
function AuthProbe() {
	const { isAuthenticated, accessToken } = useGmailAuthContext();
	return <div data-testid="probe">{isAuthenticated ? `auth:${accessToken}` : "anon"}</div>;
}

/** Toggling `mounted` mirrors GmailImport mounting/unmounting on view changes. */
function Harness() {
	const [mounted, setMounted] = useState(true);
	return (
		<GmailAuthProvider>
			<button onClick={() => setMounted((m) => !m)}>toggle</button>
			{mounted && <AuthProbe />}
		</GmailAuthProvider>
	);
}

describe("GmailAuthProvider — token survives consumer unmount/remount", () => {
	beforeEach(() => {
		localStorage.clear();
		capturedOnSuccess = undefined;
	});

	it("keeps the token across a consumer unmount (gmail → edit → back) without re-auth", () => {
		render(<Harness />);

		// Authenticate while the consumer (GmailImport-equivalent) is mounted.
		act(() => capturedOnSuccess?.({ access_token: "tok-123", expires_in: 3600 }));
		expect(screen.getByTestId("probe")).toHaveTextContent("auth:tok-123");

		// Unmount the consumer — mirrors switching to the "edit" view on import.
		fireEvent.click(screen.getByText("toggle"));
		expect(screen.queryByTestId("probe")).not.toBeInTheDocument();

		// Remount — mirrors "Back to email". The provider stayed mounted above the
		// view switch, so the token is still in memory: the consumer reads it back
		// as authenticated, with NO re-auth.
		fireEvent.click(screen.getByText("toggle"));
		expect(screen.getByTestId("probe")).toHaveTextContent("auth:tok-123");
	});

	it("starts unauthenticated before any login", () => {
		render(<Harness />);
		expect(screen.getByTestId("probe")).toHaveTextContent("anon");
	});

	it("throws when the context is used without a provider", () => {
		// React logs the error boundary trace — silence it for a clean run.
		const spy = vi.spyOn(console, "error").mockImplementation(() => {});
		expect(() => render(<AuthProbe />)).toThrow(/GmailAuthProvider/);
		spy.mockRestore();
	});
});
