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

const makeItem = (id: string, isDemo = false, updatedAt?: string): ClothingItem =>
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
		isDemo,
		updatedAt,
	}) as ClothingItem;

const STORAGE_KEY = "my_closet_key";

/**
 * BUG-2 — the demo starter closet must never reach Supabase.
 *
 * Demo items (`isDemo: true`) are shown locally so a new closet isn't empty,
 * but every remote-write chokepoint in SyncedClosetRepository must exclude
 * them: the empty-cloud seed, the reconcile local-wins push, and the direct
 * add / update / importItems fire-and-forget writes.
 */
describe("SyncedClosetRepository — demo items never reach the cloud (BUG-2)", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		localStorage.clear();
		vi.spyOn(console, "error").mockImplementation(() => {});
		mockRemote.add.mockResolvedValue(undefined);
		mockRemote.update.mockResolvedValue(null);
		mockRemote.remove.mockResolvedValue(undefined);
		mockRemote.importItems.mockResolvedValue([]);
		mockRemote.clear.mockResolvedValue(undefined);
		mockRemote.getAll.mockResolvedValue([]);
		mockRemote.getById.mockResolvedValue(null);
	});

	it("empty-cloud seed pushes only real items, never demo", async () => {
		localStorage.setItem(STORAGE_KEY, JSON.stringify([makeItem("demo-1", true), makeItem("real-1", false)]));
		const repo = new SyncedClosetRepository("user-1");

		await repo.getAll();

		expect(mockRemote.importItems).toHaveBeenCalledTimes(1);
		const [pushed] = mockRemote.importItems.mock.calls[0];
		expect((pushed as ClothingItem[]).map((i) => i.id)).toEqual(["real-1"]);
	});

	it("does not seed the cloud at all when the closet is demo-only", async () => {
		localStorage.setItem(STORAGE_KEY, JSON.stringify([makeItem("demo-1", true), makeItem("demo-2", true)]));
		const repo = new SyncedClosetRepository("user-1");

		await repo.getAll();

		expect(mockRemote.importItems).not.toHaveBeenCalled();
	});

	it("add() skips the remote write for a demo item but pushes a real one", async () => {
		const repo = new SyncedClosetRepository("user-1");

		await repo.add(makeItem("demo-1", true));
		expect(mockRemote.add).not.toHaveBeenCalled();

		await repo.add(makeItem("real-1", false));
		expect(mockRemote.add).toHaveBeenCalledTimes(1);
		expect(mockRemote.add.mock.calls[0][0].id).toBe("real-1");
	});

	it("importItems() strips demo items before the remote write", async () => {
		const repo = new SyncedClosetRepository("user-1");

		await repo.importItems([makeItem("demo-1", true), makeItem("real-1", false)], "merge");

		expect(mockRemote.importItems).toHaveBeenCalledTimes(1);
		const [pushed] = mockRemote.importItems.mock.calls[0];
		expect((pushed as ClothingItem[]).map((i) => i.id)).toEqual(["real-1"]);
	});

	it("reconcile local-wins push excludes demo items", async () => {
		localStorage.setItem(
			STORAGE_KEY,
			JSON.stringify([makeItem("demo-1", true, "2026-02-01T00:00:00.000Z"), makeItem("real-1", false, "2026-02-01T00:00:00.000Z")]),
		);
		// Remote already has an unrelated item, so getAll reconciles rather than seeds.
		mockRemote.getAll.mockResolvedValue([makeItem("remote-1", false, "2026-01-01T00:00:00.000Z")]);
		const repo = new SyncedClosetRepository("user-1");

		await repo.getAll();

		expect(mockRemote.importItems).toHaveBeenCalledTimes(1);
		const [pushed] = mockRemote.importItems.mock.calls[0];
		const ids = (pushed as ClothingItem[]).map((i) => i.id);
		expect(ids).toContain("real-1");
		expect(ids).not.toContain("demo-1");
	});

	it("update() skips the remote write when the underlying item is demo", async () => {
		localStorage.setItem(STORAGE_KEY, JSON.stringify([makeItem("demo-1", true)]));
		const repo = new SyncedClosetRepository("user-1");

		await repo.update("demo-1", { name: "Renamed demo" });

		expect(mockRemote.update).not.toHaveBeenCalled();
	});
});
