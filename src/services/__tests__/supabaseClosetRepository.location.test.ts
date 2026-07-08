import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ClothingItem } from "../../utils/types";

/**
 * E2-sync.1 regression — items with a registry locationId must sync.
 *
 * `items.location_id` is a uuid FK; the client registry uses string ids
 * ('suitcase', …). The repo must translate registryId → uuid on every write
 * and uuid → registryId on every read. Without it, Postgres rejects the whole
 * upsert and located items silently stay local-only.
 */

const SUITCASE_UUID = "00000000-0000-4000-8000-000000000003";

const { supaState } = vi.hoisted(() => ({
	supaState: {
		upsertedRows: [] as Array<Record<string, unknown>>,
		itemRows: [] as Array<Record<string, unknown>>,
	},
}));

vi.mock("../../lib/supabaseClient", () => ({
	getSupabase: () => ({
		from: (table: string) => {
			if (table === "closet_members") {
				return {
					select: () => ({
						eq: () => ({
							order: () => ({
								limit: () => ({
									maybeSingle: () => Promise.resolve({ data: { closet_id: "c1" }, error: null }),
								}),
							}),
						}),
					}),
				};
			}
			if (table === "items") {
				return {
					upsert: (rows: Record<string, unknown> | Record<string, unknown>[]) => {
						const arr = Array.isArray(rows) ? rows : [rows];
						supaState.upsertedRows.push(...arr);
						return Promise.resolve({ error: null });
					},
					select: () => ({
						eq: () => ({
							order: () =>
								Promise.resolve({
									data: supaState.itemRows,
									error: null,
								}),
						}),
					}),
				};
			}
			if (table === "item_materials") {
				return {
					delete: () => ({ eq: () => Promise.resolve({ error: null }) }),
					insert: () => Promise.resolve({ error: null }),
				};
			}
			throw new Error(`unexpected table ${table}`);
		},
	}),
}));

// Location resolver is mocked — its own behavior is covered by locationSync.test.ts.
vi.mock("../locationSync", () => ({
	ensureUserLocations: vi.fn().mockResolvedValue({
		toUuid: (registryId?: string) => (registryId === "suitcase" ? SUITCASE_UUID : registryId ? "uuid-for-" + registryId : null),
		toRegistryId: (uuid?: string | null) => (uuid === SUITCASE_UUID ? "suitcase" : (uuid ?? undefined)),
	}),
}));

import { SupabaseClosetRepository } from "../supabaseClosetRepository";

const item = (overrides: Partial<ClothingItem> = {}): ClothingItem =>
	({
		id: "i1",
		imageURL: "https://example.com/a.jpg",
		name: "Packed Dress",
		category: "dresses",
		color: "black",
		size: "M",
		brand: "X",
		material: [],
		occasion: "travel",
		care: "hand wash",
		...overrides,
	}) as ClothingItem;

describe("SupabaseClosetRepository — location id translation (E2-sync.1)", () => {
	beforeEach(() => {
		supaState.upsertedRows = [];
		supaState.itemRows = [];
	});

	it("add(): registry locationId 'suitcase' is written as the location uuid, never the raw string", async () => {
		await new SupabaseClosetRepository("u1").add(item({ locationId: "suitcase" }));
		expect(supaState.upsertedRows).toHaveLength(1);
		expect(supaState.upsertedRows[0].location_id).toBe(SUITCASE_UUID);
	});

	it("add(): no locationId writes NULL", async () => {
		await new SupabaseClosetRepository("u1").add(item());
		expect(supaState.upsertedRows[0].location_id).toBeNull();
	});

	it("importItems(): every row's locationId is translated", async () => {
		await new SupabaseClosetRepository("u1").importItems(
			[item({ id: "i1", locationId: "suitcase" }), item({ id: "i2" })],
			"merge",
		);
		expect(supaState.upsertedRows.map((r) => r.location_id)).toEqual([SUITCASE_UUID, null]);
	});

	it("getAll(): location uuid is mapped back to the registry id for the client", async () => {
		supaState.itemRows = [
			{
				id: "i1",
				closet_id: "c1",
				location_id: SUITCASE_UUID,
				name: "Packed Dress",
				category: "dresses",
				brand: null,
				retailer: null,
				color: null,
				size: null,
				purchase_price: null,
				original_price: null,
				purchase_date: null,
				condition: null,
				on_sale: false,
				notes: [],
				primary_photo_url: null,
				status: "traveling",
				item_fit: null,
				measurements: null,
				acquisition_type: null,
				country_of_origin: null,
				is_sentimental: false,
				is_high_value: false,
				is_private: false,
				is_lendable: true,
				occasion: null,
				care: [],
				qty: null,
				style: null,
				worn_count: 0,
				last_worn_at: null,
				loan: null,
				updated_at: "2026-07-07T00:00:00Z",
				item_materials: [],
			},
		];
		const [got] = await new SupabaseClosetRepository("u1").getAll();
		expect(got.locationId).toBe("suitcase"); // NOT the raw uuid
		expect(got.status).toBe("traveling");
	});
});
