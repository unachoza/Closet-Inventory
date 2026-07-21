import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { SupabaseAuthContext } from "../../context/SupabaseAuthContext";
import type { SupabaseAuthState } from "../../hooks/useSupabaseAuth";
import { ViewProvider, useView } from "../../context/ViewContext";

vi.mock("../../lib/analytics", () => ({ track: vi.fn() }));

const { mockGetProfile } = vi.hoisted(() => ({ mockGetProfile: vi.fn() }));
vi.mock("../../services/profileService", async (importOriginal) => ({
	...(await importOriginal<typeof import("../../services/profileService")>()),
	getProfile: mockGetProfile,
	updateDisplayName: vi.fn(),
}));

import AvatarButton from "./AvatarButton";

function ViewProbe() {
	const { view } = useView();
	return <span data-testid="current-view">{view}</span>;
}

function makeAuth(overrides: Partial<SupabaseAuthState> = {}): SupabaseAuthState {
	return {
		session: null,
		user: { id: "user-1" } as User,
		gmailAccessToken: null,
		isAuthenticated: true,
		isLoading: false,
		error: null,
		signIn: vi.fn(),
		signOut: vi.fn(),
		...overrides,
	};
}

function renderButton(auth: SupabaseAuthState) {
	const wrapper = ({ children }: { children: ReactNode }) => (
		<SupabaseAuthContext.Provider value={auth}>
			<ViewProvider initialView="carousel">
				{children}
				<ViewProbe />
			</ViewProvider>
		</SupabaseAuthContext.Provider>
	);
	return render(<AvatarButton />, { wrapper });
}

describe("AvatarButton", () => {
	beforeEach(() => {
		mockGetProfile.mockReset().mockResolvedValue({
			ok: true,
			data: { id: "user-1", created_at: "", display_name: "Susan", photo_url: null, settings: {} },
		});
	});

	it("shows the Google photo when the profile has one", async () => {
		mockGetProfile.mockResolvedValue({
			ok: true,
			data: { id: "user-1", created_at: "", display_name: "Susan", photo_url: "https://example.com/a.jpg", settings: {} },
		});
		renderButton(makeAuth());
		await waitFor(() => expect(screen.getByRole("img")).toHaveAttribute("src", "https://example.com/a.jpg"));
	});

	it("falls back to the initial letter without a photo", async () => {
		renderButton(makeAuth());
		await waitFor(() => expect(screen.getByRole("button", { name: /profile/i })).toHaveTextContent("S"));
	});

	it("renders a generic icon when signed out", () => {
		renderButton(makeAuth({ user: null, isAuthenticated: false }));
		expect(screen.getByRole("button", { name: /profile/i })).toBeInTheDocument();
		expect(screen.queryByRole("img")).not.toBeInTheDocument();
	});

	it("navigates to the profile view on click", async () => {
		const user = userEvent.setup();
		renderButton(makeAuth());
		await user.click(screen.getByRole("button", { name: /profile/i }));
		expect(screen.getByTestId("current-view")).toHaveTextContent("profile");
	});
});
