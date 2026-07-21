import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { SupabaseAuthContext } from "../../context/SupabaseAuthContext";
import type { SupabaseAuthState } from "../../hooks/useSupabaseAuth";
import { ViewProvider } from "../../context/ViewContext";

vi.mock("../../lib/analytics", () => ({ track: vi.fn() }));
vi.mock("../../lib/monitoring", async (importOriginal) => ({
	...(await importOriginal<typeof import("../../lib/monitoring")>()),
	appVersion: () => "v-test-1.2.3",
}));

const { mockGetProfile, mockUpdateDisplayName } = vi.hoisted(() => ({
	mockGetProfile: vi.fn(),
	mockUpdateDisplayName: vi.fn(),
}));
vi.mock("../../services/profileService", async (importOriginal) => ({
	...(await importOriginal<typeof import("../../services/profileService")>()),
	getProfile: mockGetProfile,
	updateDisplayName: mockUpdateDisplayName,
}));

vi.mock("../../Components/NavBar/AccountDataModal/AccountDataModal", () => ({
	default: ({ isOpen }: { isOpen: boolean }) => (isOpen ? <div role="dialog" aria-label="Account and data" /> : null),
}));

import ProfileView from "./ProfileView";

function makeAuth(overrides: Partial<SupabaseAuthState> = {}): SupabaseAuthState {
	return {
		session: null,
		user: { id: "user-1", email: "a@example.com" } as User,
		gmailAccessToken: null,
		isAuthenticated: true,
		isLoading: false,
		error: null,
		signIn: vi.fn(),
		signOut: vi.fn().mockResolvedValue(undefined),
		...overrides,
	};
}

function renderView(auth = makeAuth()) {
	const wrapper = ({ children }: { children: ReactNode }) => (
		<SupabaseAuthContext.Provider value={auth}>
			<ViewProvider initialView="profile">{children}</ViewProvider>
		</SupabaseAuthContext.Provider>
	);
	render(<ProfileView />, { wrapper });
	return { auth };
}

describe("ProfileView", () => {
	beforeEach(() => {
		mockGetProfile.mockReset().mockResolvedValue({
			ok: true,
			data: { id: "user-1", created_at: "", display_name: "Susan", photo_url: null, settings: {} },
		});
		mockUpdateDisplayName.mockReset().mockResolvedValue({ ok: true, data: "Ari" });
	});

	it("shows the display name, email, and app version", async () => {
		renderView();
		await waitFor(() => expect(screen.getByText("Susan")).toBeInTheDocument());
		expect(screen.getByText(/a@example\.com/)).toBeInTheDocument();
		expect(screen.getByText(/v-test-1\.2\.3/)).toBeInTheDocument();
	});

	it("edits the display name inline", async () => {
		const user = userEvent.setup();
		renderView();
		await waitFor(() => expect(screen.getByText("Susan")).toBeInTheDocument());

		await user.click(screen.getByRole("button", { name: /edit name/i }));
		const input = screen.getByRole("textbox", { name: /your name/i });
		await user.clear(input);
		await user.type(input, "Ari");
		await user.click(screen.getByRole("button", { name: /^save$/i }));

		await waitFor(() => expect(mockUpdateDisplayName).toHaveBeenCalledWith("user-1", "Ari"));
		expect(await screen.findByText("Ari")).toBeInTheDocument();
	});

	it("shows a save error and stays in edit mode", async () => {
		mockUpdateDisplayName.mockResolvedValue({ ok: false, error: "rls denied" });
		const user = userEvent.setup();
		renderView();
		await waitFor(() => expect(screen.getByText("Susan")).toBeInTheDocument());

		await user.click(screen.getByRole("button", { name: /edit name/i }));
		await user.clear(screen.getByRole("textbox", { name: /your name/i }));
		await user.type(screen.getByRole("textbox", { name: /your name/i }), "Ari");
		await user.click(screen.getByRole("button", { name: /^save$/i }));

		expect(await screen.findByRole("alert")).toHaveTextContent(/rls denied/i);
		expect(screen.getByRole("textbox", { name: /your name/i })).toBeInTheDocument();
	});

	it("opens the account and data modal", async () => {
		const user = userEvent.setup();
		renderView();
		await user.click(await screen.findByRole("button", { name: /account and data/i }));
		expect(screen.getByRole("dialog", { name: /account and data/i })).toBeInTheDocument();
	});

	it("opens the feedback panel", async () => {
		const user = userEvent.setup();
		renderView();
		await user.click(await screen.findByRole("button", { name: /send feedback/i }));
		expect(screen.getByRole("dialog", { name: /send feedback/i })).toBeInTheDocument();
	});

	it("signs out", async () => {
		const user = userEvent.setup();
		const { auth } = renderView();
		await user.click(await screen.findByRole("button", { name: /sign out/i }));
		expect(auth.signOut).toHaveBeenCalled();
	});

	it("shows a sign-in invitation when signed out", () => {
		renderView(makeAuth({ user: null, isAuthenticated: false }));
		expect(screen.getByRole("button", { name: /sign in with google/i })).toBeInTheDocument();
		expect(screen.queryByRole("button", { name: /sign out/i })).not.toBeInTheDocument();
		expect(screen.getByText(/v-test-1\.2\.3/)).toBeInTheDocument();
	});
});
