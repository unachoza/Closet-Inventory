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
import { getSyncFailureState, clearSyncFailures } from "../syncFailureTracker";

const makeItem = (id: string): ClothingItem =>
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
	}) as ClothingItem;

describe("SyncedClosetRepository — failed-sync tracking", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		clearSyncFailures();
		localStorage.clear();
		vi.spyOn(console, "error").mockImplementation(() => {});
		// Sensible defaults; individual tests override.
		mockRemote.add.mockResolvedValue(undefined);
		mockRemote.update.mockResolvedValue(null);
		mockRemote.remove.mockResolvedValue(undefined);
		mockRemote.importItems.mockResolvedValue([]);
		mockRemote.clear.mockResolvedValue(undefined);
		mockRemote.getAll.mockResolvedValue([]);
	});

	it("records a failure when a remote add rejects (no longer swallowed)", async () => {
		mockRemote.add.mockRejectedValueOnce(new Error("network down"));
		const repo = new SyncedClosetRepository("user-1");

		await repo.add(makeItem("a"));

		await vi.waitFor(() => expect(getSyncFailureState().failedWriteCount).toBe(1));
		expect(getSyncFailureState().lastError).toBe("network down");
	});

	it("does not record a failure when the remote write succeeds", async () => {
		const repo = new SyncedClosetRepository("user-1");
		await repo.add(makeItem("a"));
		await repo.update("a", { name: "Renamed" });
		await repo.remove("a");
		// Give any background catches a chance to run.
		await Promise.resolve();
		expect(getSyncFailureState().failedWriteCount).toBe(0);
	});

	it("stays local-only (never records) when signed out", async () => {
		const repo = new SyncedClosetRepository(null);
		await repo.add(makeItem("a"));
		await Promise.resolve();
		expect(getSyncFailureState().failedWriteCount).toBe(0);
	});

	it("clears pending failures after a successful getAll reconcile", async () => {
		// 1. A write fails → local mirror has the item, one pending failure.
		mockRemote.add.mockRejectedValueOnce(new Error("boom"));
		const repo = new SyncedClosetRepository("user-1");
		await repo.add(makeItem("a"));
		await vi.waitFor(() => expect(getSyncFailureState().failedWriteCount).toBe(1));

		// 2. getAll seeds the empty remote from local and clears the indicator.
		await repo.getAll();
		await vi.waitFor(() => expect(getSyncFailureState().failedWriteCount).toBe(0));
	});
});
