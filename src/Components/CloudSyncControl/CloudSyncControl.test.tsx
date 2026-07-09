import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

const { mockAuth, mockCloset } = vi.hoisted(() => ({
	mockAuth: { isAuthenticated: false, user: null as { email?: string } | null, signIn: vi.fn(), signOut: vi.fn(), isLoading: false },
	mockCloset: { syncStatus: "synced" as "synced" | "syncing" | "offline" | "error" },
}));
vi.mock("../../context/SupabaseAuthContext", () => ({ useSupabaseAuthContext: () => mockAuth }));
vi.mock("../../context/ClosetContext", () => ({ useCloset: () => mockCloset }));

import CloudSyncControl from "./CloudSyncControl";

describe("CloudSyncControl", () => {
	beforeEach(() => {
		mockAuth.isAuthenticated = false;
		mockAuth.user = null;
		mockAuth.isLoading = false;
		mockAuth.signIn.mockReset();
		mockAuth.signOut.mockReset();
		mockCloset.syncStatus = "synced";
		localStorage.clear();
	});

	it("signed out, first visit: sign-in button shows the Google-unverified explainer before calling signIn", () => {
		render(<CloudSyncControl />);
		expect(screen.getByText(/^local$/i)).toBeInTheDocument();
		expect(screen.getByText(/signed out/i)).toBeInTheDocument();
		const btn = screen.getByRole("button", { name: /sign in to sync/i });
		fireEvent.click(btn);
		expect(mockAuth.signIn).not.toHaveBeenCalled();
		expect(screen.getByRole("dialog")).toBeInTheDocument();

		fireEvent.click(screen.getByRole("button", { name: /continue to google sign-in/i }));
		expect(mockAuth.signIn).toHaveBeenCalledTimes(1);
	});

	it("signed out, notice already seen: sign-in button calls signIn immediately", () => {
		localStorage.setItem("closetly-google-notice-seen", "true");
		render(<CloudSyncControl />);
		const btn = screen.getByRole("button", { name: /sign in to sync/i });
		fireEvent.click(btn);
		expect(mockAuth.signIn).toHaveBeenCalledTimes(1);
		expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
	});

	it("signed in + synced: shows Cloud store, 'Synced', and a sign-out button", () => {
		mockAuth.isAuthenticated = true;
		mockAuth.user = { email: "maya@example.com" };
		render(<CloudSyncControl />);
		expect(screen.getByText(/^cloud$/i)).toBeInTheDocument();
		expect(screen.getByTestId("cloud-sync-state").textContent).toMatch(/synced/i);
		const btn = screen.getByRole("button", { name: /sign out/i });
		fireEvent.click(btn);
		expect(mockAuth.signOut).toHaveBeenCalledTimes(1);
	});

	it("signed in + syncing: sync axis reads 'Behind'", () => {
		mockAuth.isAuthenticated = true;
		mockAuth.user = { email: "maya@example.com" };
		mockCloset.syncStatus = "syncing";
		render(<CloudSyncControl />);
		expect(screen.getByTestId("cloud-sync-state").textContent).toMatch(/behind/i);
	});

	it("signed in + error: sync axis reads 'Error'", () => {
		mockAuth.isAuthenticated = true;
		mockAuth.user = { email: "maya@example.com" };
		mockCloset.syncStatus = "error";
		render(<CloudSyncControl />);
		expect(screen.getByTestId("cloud-sync-state").textContent).toMatch(/error/i);
	});
});
