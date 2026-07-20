import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { SupabaseAuthContext } from "../../context/SupabaseAuthContext";
import type { SupabaseAuthState } from "../useSupabaseAuth";

const { mockGetProfile, mockUpdateDisplayName } = vi.hoisted(() => ({
	mockGetProfile: vi.fn(),
	mockUpdateDisplayName: vi.fn(),
}));

vi.mock("../../services/profileService", async (importOriginal) => ({
	...(await importOriginal<typeof import("../../services/profileService")>()),
	getProfile: mockGetProfile,
	updateDisplayName: mockUpdateDisplayName,
}));

import { useProfile } from "../useProfile";

const PROFILE_ROW = {
	id: "user-1",
	created_at: "2026-07-01T00:00:00Z",
	display_name: "Arianna",
	photo_url: "https://example.com/a.jpg",
	settings: {},
};

function makeAuth(overrides: Partial<SupabaseAuthState> = {}): SupabaseAuthState {
	return {
		session: null,
		user: { id: "user-1", email: "a@example.com" } as User,
		gmailAccessToken: null,
		isAuthenticated: true,
		isLoading: false,
		error: null,
		signIn: vi.fn(),
		signOut: vi.fn(),
		...overrides,
	};
}

function wrapperFor(auth: SupabaseAuthState) {
	return function Wrapper({ children }: { children: ReactNode }) {
		return <SupabaseAuthContext.Provider value={auth}>{children}</SupabaseAuthContext.Provider>;
	};
}

describe("useProfile", () => {
	beforeEach(() => {
		mockGetProfile.mockReset().mockResolvedValue({ ok: true, data: PROFILE_ROW });
		mockUpdateDisplayName.mockReset().mockResolvedValue({ ok: true, data: "Ari" });
	});

	it("fetches the profile for the signed-in user", async () => {
		const { result } = renderHook(() => useProfile(), { wrapper: wrapperFor(makeAuth()) });
		await waitFor(() => expect(result.current.profile).toEqual(PROFILE_ROW));
		expect(mockGetProfile).toHaveBeenCalledWith("user-1");
	});

	it("returns no profile when signed out and never hits the service", () => {
		const { result } = renderHook(() => useProfile(), {
			wrapper: wrapperFor(makeAuth({ user: null, isAuthenticated: false })),
		});
		expect(result.current.profile).toBeNull();
		expect(mockGetProfile).not.toHaveBeenCalled();
	});

	it("surfaces a fetch error", async () => {
		mockGetProfile.mockResolvedValue({ ok: false, error: "rls denied" });
		const { result } = renderHook(() => useProfile(), { wrapper: wrapperFor(makeAuth()) });
		await waitFor(() => expect(result.current.error).toBe("rls denied"));
		expect(result.current.profile).toBeNull();
	});

	it("updates the display name optimistically on success", async () => {
		const { result } = renderHook(() => useProfile(), { wrapper: wrapperFor(makeAuth()) });
		await waitFor(() => expect(result.current.profile).not.toBeNull());

		let outcome: { ok: boolean } | undefined;
		await act(async () => {
			outcome = await result.current.updateDisplayName("  Ari  ");
		});
		expect(outcome).toEqual({ ok: true, data: "Ari" });
		expect(mockUpdateDisplayName).toHaveBeenCalledWith("user-1", "  Ari  ");
		expect(result.current.profile?.display_name).toBe("Ari");
	});

	it("leaves the profile untouched when the update fails", async () => {
		mockUpdateDisplayName.mockResolvedValue({ ok: false, error: "rls denied" });
		const { result } = renderHook(() => useProfile(), { wrapper: wrapperFor(makeAuth()) });
		await waitFor(() => expect(result.current.profile).not.toBeNull());

		await act(async () => {
			await result.current.updateDisplayName("Ari");
		});
		expect(result.current.profile?.display_name).toBe("Arianna");
	});

	it("rejects an update while signed out", async () => {
		const { result } = renderHook(() => useProfile(), {
			wrapper: wrapperFor(makeAuth({ user: null, isAuthenticated: false })),
		});
		let outcome: { ok: boolean } | undefined;
		await act(async () => {
			outcome = await result.current.updateDisplayName("Ari");
		});
		expect(outcome?.ok).toBe(false);
		expect(mockUpdateDisplayName).not.toHaveBeenCalled();
	});
});
