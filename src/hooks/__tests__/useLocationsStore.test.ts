import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";

/**
 * E12-3.2 — the locations store hook: live per-user data when signed in,
 * static starter registry fallback when signed out (local-only mode).
 */

const { repo } = vi.hoisted(() => ({
	repo: {
		listLocations: vi.fn(),
		addLocation: vi.fn(),
		renameLocation: vi.fn(),
		setPrimaryLocation: vi.fn(),
		deleteLocation: vi.fn(),
	},
}));

vi.mock("../../services/locationsRepository", () => repo);

import { useLocationsStore } from "../useLocationsStore";

describe("useLocationsStore", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		repo.listLocations.mockResolvedValue([
			{ id: "loc-1", label: "Nolita apartment", kind: "home", isPrimary: true },
			{ id: "loc-2", label: "Hamptons house", kind: "other", isPrimary: false },
		]);
	});

	it("signed-out (userId null) uses the static starter registry, not the repository", async () => {
		const { result } = renderHook(() => useLocationsStore(null));
		await waitFor(() => expect(result.current.isLoading).toBe(false));
		expect(repo.listLocations).not.toHaveBeenCalled();
		expect(result.current.locations.map((l) => l.id)).toEqual(["home", "storage", "suitcase", "other"]);
		expect(result.current.primaryLocation?.id).toBe("home");
	});

	it("signed-in loads the user's real locations from the repository", async () => {
		const { result } = renderHook(() => useLocationsStore("u1"));
		await waitFor(() => expect(result.current.isLoading).toBe(false));
		expect(repo.listLocations).toHaveBeenCalledWith("u1");
		expect(result.current.locations.map((l) => l.label)).toEqual(["Nolita apartment", "Hamptons house"]);
		expect(result.current.primaryLocation?.label).toBe("Nolita apartment");
	});

	it("getLocation resolves a known id and falls back to primary for unknown/absent", async () => {
		const { result } = renderHook(() => useLocationsStore("u1"));
		await waitFor(() => expect(result.current.isLoading).toBe(false));
		expect(result.current.getLocation("loc-2").label).toBe("Hamptons house");
		expect(result.current.getLocation(undefined).label).toBe("Nolita apartment");
		expect(result.current.getLocation("unknown-uuid").label).toBe("Nolita apartment");
	});

	it("addLocation calls the repository then refreshes the list", async () => {
		repo.addLocation.mockResolvedValue({ id: "loc-3", label: "Aspen safe", kind: "storage", isPrimary: false });
		repo.listLocations.mockResolvedValueOnce([
			{ id: "loc-1", label: "Nolita apartment", kind: "home", isPrimary: true },
			{ id: "loc-2", label: "Hamptons house", kind: "other", isPrimary: false },
		]);
		const { result } = renderHook(() => useLocationsStore("u1"));
		await waitFor(() => expect(result.current.isLoading).toBe(false));

		repo.listLocations.mockResolvedValueOnce([
			{ id: "loc-1", label: "Nolita apartment", kind: "home", isPrimary: true },
			{ id: "loc-2", label: "Hamptons house", kind: "other", isPrimary: false },
			{ id: "loc-3", label: "Aspen safe", kind: "storage", isPrimary: false },
		]);
		await act(async () => {
			await result.current.addLocation({ label: "Aspen safe", kind: "storage" });
		});
		expect(repo.addLocation).toHaveBeenCalledWith("u1", { label: "Aspen safe", kind: "storage" });
		expect(result.current.locations.map((l) => l.label)).toContain("Aspen safe");
	});

	it("mutating helpers are no-ops (throw) when signed out — local mode is read-only", async () => {
		const { result } = renderHook(() => useLocationsStore(null));
		await waitFor(() => expect(result.current.isLoading).toBe(false));
		await expect(result.current.addLocation({ label: "X", kind: "other" })).rejects.toThrow(/sign in/i);
	});
});
