import { describe, it, expect, beforeEach, vi } from "vitest";
import type { ClothingItem } from "../../utils/types";

// Controllable stand-in for the Supabase-backed remote repository.
const { mockRemote } = vi.hoisted(() => ({
	mockRemote: {
		getAll: vi.fn(),
		getById: vi.fn(),
		add: vi.fn(),
		update: vi.fn(),
		remove: vi.fn(),
		importItems: vi.fn(),
		clear: vi.fn(),
	},
}));

vi.mock("../supabaseClosetRepository", () => ({
	SupabaseClosetRepository: vi.fn(function () {
		return mockRemote;
	}),
}));

import { SyncedClosetRepository } from "../syncedClosetRepository";
import { clearSyncFailures, getSyncFailureState } from "../syncFailureTracker";

const STORAGE_KEY = "my_closet_key";

const makeItem = (id: string, updatedAt?: string): ClothingItem =>
	({
		id,
		imageURL: "",
		name: `Item ${id}`,
		category: "tops",
		color: "black",
		size: "M",
		brand: "Test",
		material: [{ material: "cotton", percentage: 100 }],
		occasion: "casual",
		age: "new",
		care: "machine wash",
		updatedAt,
	}) as ClothingItem;

/**
 * E5-3.1 / US-5.3 — offline behaviour of the sync layer.
 *
 * "Cached closet viewable offline": getAll() serves the localStorage mirror
 * when Supabase is unreachable. "Writes queue and flush on reconnect": writes
 * land locally first; local-wins are pushed back on the next successful
 * reconcile (E1-1.6) — there is no separate outbox.
 */
describe("SyncedClosetRepository — offline (US-5.3)", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		clearSyncFailures();
		localStorage.clear();
		vi.spyOn(console, "error").mockImplementation(() => {});
	});

	it("serves the local cache when the remote is unreachable (offline read)", async () => {
		localStorage.setItem(STORAGE_KEY, JSON.stringify([makeItem("a"), makeItem("b")]));
		mockRemote.getAll.mockRejectedValue(new Error("network down"));

		const repo = new SyncedClosetRepository("user-1");
		const items = await repo.getAll();

		expect(items.map((i) => i.id).sort()).toEqual(["a", "b"]);
	});

	it("offline write lands locally and is tracked as a pending failure", async () => {
		mockRemote.add.mockRejectedValue(new Error("network down"));

		const repo = new SyncedClosetRepository("user-1");
		await repo.add(makeItem("a"));

		// Local mirror has the item immediately (offline-first write).
		expect(await repo.getById("a")).not.toBeNull();
		// The failed remote push is recorded (drives SyncStatusIndicator).
		await vi.waitFor(() => expect(getSyncFailureState().failedWriteCount).toBe(1));
	});

	it("flushes offline writes on the next reconcile (reconnect)", async () => {
		// 1. Write while offline — remote push fails, item stays local-only.
		mockRemote.add.mockRejectedValue(new Error("network down"));
		const repo = new SyncedClosetRepository("user-1");
		await repo.add(makeItem("a"));

		// 2. Network returns; remote holds other data. Reconcile must push the
		//    local-only item back up (merge) and clear the failure indicator.
		mockRemote.getAll.mockResolvedValue([makeItem("b", "2026-01-01T00:00:00.000Z")]);
		mockRemote.importItems.mockResolvedValue([]);

		const merged = await repo.getAll();

		expect(merged.map((i) => i.id).sort()).toEqual(["a", "b"]);
		await vi.waitFor(() => {
			expect(mockRemote.importItems).toHaveBeenCalledWith(
				expect.arrayContaining([expect.objectContaining({ id: "a" })]),
				"merge",
			);
		});
		await vi.waitFor(() => expect(getSyncFailureState().failedWriteCount).toBe(0));
	});
});
