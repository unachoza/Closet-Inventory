import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ClothingItem } from "../../utils/types";

// ── Mocks ──────────────────────────────────────────────────────────────────
const { mockGetAll, state, downloadSpy } = vi.hoisted(() => ({
	mockGetAll: vi.fn(),
	downloadSpy: vi.fn(),
	state: {
		tables: {} as Record<string, unknown[]>,
		deleteCalls: [] as Array<{ table: string; col: string; val: string }>,
		listPrefix: "" as string,
		listData: [] as Array<{ name: string }>,
		removed: [] as string[],
		listError: null as unknown,
		invokeCalls: [] as unknown[][],
	},
}));

vi.mock("../supabaseClosetRepository", () => ({
	SupabaseClosetRepository: vi.fn(function (this: unknown) {
		return { getAll: mockGetAll };
	}),
}));

vi.mock("../../utils/exportCloset", () => ({ downloadFile: downloadSpy }));

vi.mock("../../lib/supabaseClient", () => ({
	getSupabase: () => ({
		from: (table: string) => ({
			select: () => Promise.resolve({ data: state.tables[table] ?? [], error: null }),
			delete: () => ({
				eq: (col: string, val: string) => {
					state.deleteCalls.push({ table, col, val });
					return Promise.resolve({ error: null });
				},
			}),
		}),
		functions: { invoke: (...args: unknown[]) => { state.invokeCalls.push(args); return Promise.resolve({ data: null, error: null }); } },
		storage: {
			from: () => ({
				list: (prefix: string) => {
					state.listPrefix = prefix;
					return Promise.resolve({ data: state.listData, error: state.listError });
				},
				remove: (paths: string[]) => {
					state.removed.push(...paths);
					return Promise.resolve({ error: null });
				},
			}),
		},
	}),
}));

import { exportAccountData, downloadAccountExport, deleteAccountData, deleteAccount } from "../accountDataService";

const item = (id: string): ClothingItem => ({ id, imageURL: "", name: id, category: "tops", color: "", size: "", brand: "", material: [], occasion: "", age: "", care: "" }) as ClothingItem;

describe("accountDataService", () => {
	beforeEach(() => {
		mockGetAll.mockReset().mockResolvedValue([item("a"), item("b")]);
		state.tables = { profiles: [{ id: "u1", display_name: "Maya" }], closets: [{ id: "c1" }], wear_events: [{ id: "w1" }] };
		state.deleteCalls = [];
		state.listData = [{ name: "p1.jpg" }, { name: "p2.jpg" }];
		state.removed = [];
		state.listError = null;
		downloadSpy.mockReset();
	});

	describe("exportAccountData", () => {
		it("gathers items, profile, closets, and wear events into one payload", async () => {
			const out = await exportAccountData("u1");
			expect(out.userId).toBe("u1");
			expect(out.items).toHaveLength(2);
			expect(out.profile).toEqual({ id: "u1", display_name: "Maya" });
			expect(out.closets).toHaveLength(1);
			expect(out.wearEvents).toHaveLength(1);
			expect(typeof out.exportedAt).toBe("string");
		});

		it("returns null profile when none exists", async () => {
			state.tables.profiles = [];
			const out = await exportAccountData("u1");
			expect(out.profile).toBeNull();
		});
	});

	describe("downloadAccountExport", () => {
		it("downloads a pretty-printed JSON file", async () => {
			const data = await exportAccountData("u1");
			downloadAccountExport(data);
			expect(downloadSpy).toHaveBeenCalledTimes(1);
			const [content, filename, mime] = downloadSpy.mock.calls[0];
			expect(filename).toMatch(/\.json$/);
			expect(mime).toContain("application/json");
			expect(JSON.parse(content).userId).toBe("u1");
		});
	});

	describe("deleteAccountData", () => {
		it("removes the user's Storage objects then deletes the profile (cascades)", async () => {
			await deleteAccountData("u1");
			// Storage: listed under the user's folder, removed with folder-prefixed paths
			expect(state.listPrefix).toBe("u1");
			expect(state.removed).toEqual(["u1/p1.jpg", "u1/p2.jpg"]);
			// Profile delete drives the ON DELETE CASCADE of the whole graph
			expect(state.deleteCalls).toContainEqual({ table: "profiles", col: "id", val: "u1" });
		});

		it("still deletes the profile when there are no Storage objects", async () => {
			state.listData = [];
			await deleteAccountData("u1");
			expect(state.removed).toEqual([]);
			expect(state.deleteCalls).toContainEqual({ table: "profiles", col: "id", val: "u1" });
		});
	});

	describe("deleteAccount (orchestrator)", () => {
		it("wipes data then invokes the identity-erasure Edge Function", async () => {
			await deleteAccount("u1");
			expect(state.deleteCalls).toContainEqual({ table: "profiles", col: "id", val: "u1" });
			expect(state.invokeCalls).toHaveLength(1);
			expect(state.invokeCalls[0][0]).toBe("delete-user-account");
		});
	});
});
