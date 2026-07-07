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
	});

	it("shows 'Local only' + a sign-in button when signed out", () => {
		render(<CloudSyncControl />);
		expect(screen.getByText(/local only/i)).toBeInTheDocument();
		const btn = screen.getByRole("button", { name: /sign in to sync/i });
		fireEvent.click(btn);
		expect(mockAuth.signIn).toHaveBeenCalledTimes(1);
	});

	it("shows 'Synced' + a sign-out button when signed in", () => {
		mockAuth.isAuthenticated = true;
		mockAuth.user = { email: "maya@example.com" };
		render(<CloudSyncControl />);
		expect(screen.getByText(/^synced$/i)).toBeInTheDocument();
		const btn = screen.getByRole("button", { name: /sign out/i });
		fireEvent.click(btn);
		expect(mockAuth.signOut).toHaveBeenCalledTimes(1);
	});

	it("reflects syncing state when signed in and syncing", () => {
		mockAuth.isAuthenticated = true;
		mockAuth.user = { email: "maya@example.com" };
		mockCloset.syncStatus = "syncing";
		render(<CloudSyncControl />);
		expect(screen.getByText(/syncing/i)).toBeInTheDocument();
	});
});
