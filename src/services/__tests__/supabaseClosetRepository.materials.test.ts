import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ClothingItem } from "../../utils/types";

const { supaState } = vi.hoisted(() => ({ supaState: { materialsInsertError: null as { message: string } | null, materialsDeleteError: null as { message: string } | null } }));

vi.mock("../../lib/supabaseClient", () => ({
	getSupabase: () => ({
		from: (table: string) => {
			if (table === "closet_members") {
				return { select: () => ({ eq: () => ({ order: () => ({ limit: () => ({ maybeSingle: () => Promise.resolve({ data: { closet_id: "c1" }, error: null }) }) }) }) }) };
			}
			if (table === "items") {
				return { upsert: () => Promise.resolve({ error: null }) };
			}
			if (table === "item_materials") {
				return {
					delete: () => ({ eq: () => Promise.resolve({ error: supaState.materialsDeleteError }) }),
					insert: () => Promise.resolve({ error: supaState.materialsInsertError }),
				};
			}
			return {};
		},
	}),
}));

// Location resolver isn't under test here — covered by locationSync.test.ts.
vi.mock("../locationSync", () => ({
	ensureUserLocations: vi.fn().mockResolvedValue({
		toUuid: () => null,
		toRegistryId: () => undefined,
	}),
}));

import { SupabaseClosetRepository } from "../supabaseClosetRepository";

const item = (): ClothingItem => ({ id: "i1", imageURL: "", name: "Tee", category: "tops", color: "black", size: "M", brand: "X", material: [{ material: "cotton", percentage: 100 }], occasion: "casual", age: "new", care: "wash" }) as ClothingItem;

describe("SupabaseClosetRepository — material error handling (bug #3)", () => {
	beforeEach(() => {
		supaState.materialsInsertError = null;
		supaState.materialsDeleteError = null;
	});

	it("add() rejects when the materials insert fails (no longer silent)", async () => {
		supaState.materialsInsertError = { message: "insert boom" };
		await expect(new SupabaseClosetRepository("u1").add(item())).rejects.toThrow(/materials/i);
	});

	it("add() rejects when the materials delete fails", async () => {
		supaState.materialsDeleteError = { message: "delete boom" };
		await expect(new SupabaseClosetRepository("u1").add(item())).rejects.toThrow(/materials/i);
	});

	it("add() resolves when materials succeed", async () => {
		await expect(new SupabaseClosetRepository("u1").add(item())).resolves.toBeDefined();
	});
});
