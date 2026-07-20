import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { SupabaseAuthContext } from "../../../context/SupabaseAuthContext";
import type { SupabaseAuthState } from "../../../hooks/useSupabaseAuth";

const { mockTrack } = vi.hoisted(() => ({ mockTrack: vi.fn() }));
vi.mock("../../../lib/analytics", () => ({ track: mockTrack }));

const { mockGetProfile, mockUpdateDisplayName } = vi.hoisted(() => ({
	mockGetProfile: vi.fn(),
	mockUpdateDisplayName: vi.fn(),
}));
vi.mock("../../../services/profileService", async (importOriginal) => ({
	...(await importOriginal<typeof import("../../../services/profileService")>()),
	getProfile: mockGetProfile,
	updateDisplayName: mockUpdateDisplayName,
}));

import NameStep from "./NameStep";

function makeAuth(userMeta: Record<string, unknown> = {}): SupabaseAuthState {
	return {
		session: null,
		user: { id: "user-1", user_metadata: userMeta } as unknown as User,
		gmailAccessToken: null,
		isAuthenticated: true,
		isLoading: false,
		error: null,
		signIn: vi.fn(),
		signOut: vi.fn(),
	};
}

function renderStep(auth = makeAuth(), onContinue = vi.fn()) {
	const wrapper = ({ children }: { children: ReactNode }) => (
		<SupabaseAuthContext.Provider value={auth}>{children}</SupabaseAuthContext.Provider>
	);
	render(<NameStep onContinue={onContinue} />, { wrapper });
	return { onContinue };
}

describe("NameStep", () => {
	beforeEach(() => {
		mockTrack.mockClear();
		mockGetProfile.mockReset().mockResolvedValue({
			ok: true,
			data: { id: "user-1", created_at: "", display_name: "Arianna", photo_url: null, settings: {} },
		});
		mockUpdateDisplayName.mockReset().mockResolvedValue({ ok: true, data: "Arianna" });
	});

	it("pre-fills the name from the profile", async () => {
		renderStep();
		await waitFor(() => expect(screen.getByRole("textbox")).toHaveValue("Arianna"));
	});

	it("falls back to Google metadata while the profile has no name", async () => {
		mockGetProfile.mockResolvedValue({
			ok: true,
			data: { id: "user-1", created_at: "", display_name: null, photo_url: null, settings: {} },
		});
		renderStep(makeAuth({ full_name: "Ari from Google" }));
		await waitFor(() => expect(screen.getByRole("textbox")).toHaveValue("Ari from Google"));
	});

	it("keeps an unedited confirmation to a no-op save and continues", async () => {
		const user = userEvent.setup();
		const { onContinue } = renderStep();
		await waitFor(() => expect(screen.getByRole("textbox")).toHaveValue("Arianna"));
		await user.click(screen.getByRole("button", { name: /that's me/i }));
		await waitFor(() => expect(onContinue).toHaveBeenCalled());
		expect(mockUpdateDisplayName).not.toHaveBeenCalled();
		expect(mockTrack).toHaveBeenCalledWith("profile_name_confirmed", { edited: false });
	});

	it("saves an edited name before continuing", async () => {
		const user = userEvent.setup();
		const { onContinue } = renderStep();
		await waitFor(() => expect(screen.getByRole("textbox")).toHaveValue("Arianna"));
		await user.clear(screen.getByRole("textbox"));
		await user.type(screen.getByRole("textbox"), "Ari");
		await user.click(screen.getByRole("button", { name: /that's me/i }));
		await waitFor(() => expect(onContinue).toHaveBeenCalled());
		expect(mockUpdateDisplayName).toHaveBeenCalledWith("user-1", "Ari");
		expect(mockTrack).toHaveBeenCalledWith("profile_name_confirmed", { edited: true });
	});

	it("shows a validation error for an empty name and stays put", async () => {
		const user = userEvent.setup();
		const { onContinue } = renderStep();
		await waitFor(() => expect(screen.getByRole("textbox")).toHaveValue("Arianna"));
		await user.clear(screen.getByRole("textbox"));
		await user.click(screen.getByRole("button", { name: /that's me/i }));
		expect(await screen.findByRole("alert")).toHaveTextContent(/name/i);
		expect(onContinue).not.toHaveBeenCalled();
	});

	it("shows a save error but still lets the user continue", async () => {
		mockUpdateDisplayName.mockResolvedValue({ ok: false, error: "network down" });
		const user = userEvent.setup();
		const { onContinue } = renderStep();
		await waitFor(() => expect(screen.getByRole("textbox")).toHaveValue("Arianna"));
		await user.clear(screen.getByRole("textbox"));
		await user.type(screen.getByRole("textbox"), "Ari");
		await user.click(screen.getByRole("button", { name: /that's me/i }));
		expect(await screen.findByRole("alert")).toHaveTextContent(/network down/i);
		expect(onContinue).not.toHaveBeenCalled();
		await user.click(screen.getByRole("button", { name: /continue anyway/i }));
		expect(onContinue).toHaveBeenCalled();
	});
});
