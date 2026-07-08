import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * E2-sync.1 — location registry ↔ Supabase `locations` table mapping.
 *
 * Bug this guards: `items.location_id` is a uuid FK to `public.locations`, but
 * the client's registry ids are strings ('home' | 'storage' | 'suitcase' |
 * 'other'). Writing "suitcase" into the uuid column makes Postgres reject the
 * ENTIRE item upsert (invalid input syntax for type uuid) — so any located item
 * silently never syncs. The fix: seed the user's starter locations as real rows
 * once, then map registryId → uuid on write and uuid → registryId on read.
 */

interface LocationRow {
	id: string;
	owner_user_id: string;
	label: string;
	kind: string;
}

const { supaState } = vi.hoisted(() => ({
	supaState: {
		rows: [] as Array<{ id: string; owner_user_id: string; label: string; kind: string }>,
		selectError: null as { message: string } | null,
		insertError: null as { message: string } | null,
		insertCalls: [] as unknown[][],
	},
}));

let uuidCounter = 0;
const nextUuid = () => `00000000-0000-4000-8000-${String(++uuidCounter).padStart(12, "0")}`;

vi.mock("../../lib/supabaseClient", () => ({
	getSupabase: () => ({
		from: (table: string) => {
			if (table !== "locations") throw new Error(`unexpected table ${table}`);
			return {
				select: () => ({
					eq: (_col: string, userId: string) =>
						Promise.resolve({
							data: supaState.selectError ? null : supaState.rows.filter((r) => r.owner_user_id === userId),
							error: supaState.selectError,
						}),
				}),
				insert: (rows: Array<Omit<LocationRow, "id">>) => ({
					select: () => {
						if (supaState.insertError) return Promise.resolve({ data: null, error: supaState.insertError });
						supaState.insertCalls.push(rows);
						const inserted = rows.map((r) => ({ ...r, id: nextUuid() }));
						supaState.rows.push(...inserted);
						return Promise.resolve({ data: inserted, error: null });
					},
				}),
			};
		},
	}),
}));

import { ensureUserLocations } from "../locationSync";

describe("ensureUserLocations — starter-location seeding + id mapping", () => {
	beforeEach(() => {
		supaState.rows = [];
		supaState.selectError = null;
		supaState.insertError = null;
		supaState.insertCalls = [];
		uuidCounter = 0;
	});

	it("seeds all 4 starter locations for a fresh user", async () => {
		const map = await ensureUserLocations("u1");
		expect(supaState.rows).toHaveLength(4);
		expect(supaState.rows.map((r) => r.kind).sort()).toEqual(["home", "other", "storage", "suitcase"]);
		expect(supaState.rows.every((r) => r.owner_user_id === "u1")).toBe(true);
		// Every registry id resolves to a real uuid
		expect(map.toUuid("suitcase")).toMatch(/^[0-9a-f-]{36}$/);
	});

	it("does not re-insert locations that already exist (idempotent)", async () => {
		await ensureUserLocations("u1");
		const insertsAfterFirst = supaState.insertCalls.length;
		await ensureUserLocations("u1");
		expect(supaState.insertCalls.length).toBe(insertsAfterFirst); // no new inserts
		expect(supaState.rows).toHaveLength(4);
	});

	it("maps registryId → uuid and uuid → registryId (round-trip)", async () => {
		const map = await ensureUserLocations("u1");
		for (const registryId of ["home", "storage", "suitcase", "other"]) {
			const uuid = map.toUuid(registryId);
			expect(uuid).toBeTruthy();
			expect(map.toRegistryId(uuid)).toBe(registryId);
		}
	});

	it("toUuid(undefined) → null (item with no location stores NULL)", async () => {
		const map = await ensureUserLocations("u1");
		expect(map.toUuid(undefined)).toBeNull();
	});

	it("toRegistryId(null/undefined) → undefined", async () => {
		const map = await ensureUserLocations("u1");
		expect(map.toRegistryId(null)).toBeUndefined();
		expect(map.toRegistryId(undefined)).toBeUndefined();
	});

	it("passes through an unknown uuid (future custom locations, P1-6)", async () => {
		const map = await ensureUserLocations("u1");
		const customUuid = "99999999-9999-4999-8999-999999999999";
		expect(map.toRegistryId(customUuid)).toBe(customUuid);
	});

	it("throws when the select fails (sync layer records the failure)", async () => {
		supaState.selectError = { message: "select boom" };
		await expect(ensureUserLocations("u1")).rejects.toThrow(/locations/i);
	});

	it("throws when seeding fails", async () => {
		supaState.insertError = { message: "insert boom" };
		await expect(ensureUserLocations("u1")).rejects.toThrow(/locations/i);
	});
});
