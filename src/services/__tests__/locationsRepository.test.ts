import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * E12-3.2 — per-user locations CRUD, the data layer behind the location
 * manager UI (E12-3.3) and the card/edit-form picker (E2 P1-6.2).
 *
 * Unlike locationSync.ts (which seeds + maps registry ids -> uuids for item
 * writes), this repository is the direct CRUD surface: list the user's real
 * named locations, add/rename, set-primary (respecting the DB's "exactly one
 * primary" unique index), and delete-with-reassign (so deleting a location
 * that still has items doesn't orphan them).
 */

interface Row {
	id: string;
	owner_user_id: string;
	label: string;
	kind: string;
	is_primary: boolean;
	created_at: string;
}

const { db } = vi.hoisted(() => ({
	db: {
		rows: [] as Row[],
		itemsUpdated: [] as Array<{ from: string; to: string }>,
		nextId: 1,
		insertError: null as { message: string } | null,
		updateError: null as { message: string } | null,
	},
}));

vi.mock("../../lib/supabaseClient", () => ({
	getSupabase: () => ({
		from: (table: string) => {
			if (table === "locations") {
				return {
					select: () => ({
						eq: (col: string, value: string) => ({
							order: () =>
								Promise.resolve({
									data: db.rows.filter((r) => r.owner_user_id === value),
									error: null,
								}),
							single: () => {
								const row = col === "id" ? db.rows.find((r) => r.id === value) : undefined;
								return Promise.resolve({ data: row ?? null, error: row ? null : { message: "not found" } });
							},
						}),
					}),
					insert: (row: Omit<Row, "id" | "created_at">) => ({
						select: () => ({
							single: () => {
								if (db.insertError) return Promise.resolve({ data: null, error: db.insertError });
								const created: Row = { ...row, id: `loc-${db.nextId++}`, created_at: new Date().toISOString() };
								db.rows.push(created);
								return Promise.resolve({ data: created, error: null });
							},
						}),
					}),
					update: (patch: Partial<Row>) => ({
						eq: (_col: string, id: string) => {
							if (db.updateError) return Promise.resolve({ error: db.updateError });
							const row = db.rows.find((r) => r.id === id);
							if (row) Object.assign(row, patch);
							return Promise.resolve({ error: null });
						},
					}),
					delete: () => ({
						eq: (_col: string, id: string) => {
							db.rows = db.rows.filter((r) => r.id !== id);
							return Promise.resolve({ error: null });
						},
					}),
				};
			}
			if (table === "items") {
				return {
					update: (patch: { location_id: string }) => ({
						eq: (_col: string, fromId: string) => {
							db.itemsUpdated.push({ from: fromId, to: patch.location_id });
							return Promise.resolve({ error: null });
						},
					}),
				};
			}
			throw new Error(`unexpected table ${table}`);
		},
	}),
}));

import { listLocations, addLocation, renameLocation, setPrimaryLocation, deleteLocation } from "../locationsRepository";

describe("locationsRepository", () => {
	beforeEach(() => {
		db.rows = [
			{ id: "loc-1", owner_user_id: "u1", label: "Nolita apartment", kind: "home", is_primary: true, created_at: "t1" },
			{ id: "loc-2", owner_user_id: "u1", label: "Hamptons house", kind: "other", is_primary: false, created_at: "t2" },
		];
		db.itemsUpdated = [];
		db.nextId = 1;
		db.insertError = null;
		db.updateError = null;
	});

	it("listLocations returns only the user's own rows", async () => {
		const rows = await listLocations("u1");
		expect(rows).toHaveLength(2);
		expect(rows.map((r) => r.label)).toEqual(["Nolita apartment", "Hamptons house"]);
	});

	it("addLocation creates a new row scoped to the user", async () => {
		const created = await addLocation("u1", { label: "Aspen safe", kind: "storage" });
		expect(created.label).toBe("Aspen safe");
		expect(created.kind).toBe("storage");
		expect(created.isPrimary).toBe(false);
	});

	it("addLocation throws on failure (surfaces to the UI / sync-failure net)", async () => {
		db.insertError = { message: "duplicate label" };
		await expect(addLocation("u1", { label: "Nolita apartment", kind: "home" })).rejects.toThrow(/location/i);
	});

	it("renameLocation updates the label", async () => {
		await renameLocation("loc-2", "Hamptons (guest house)");
		const rows = await listLocations("u1");
		expect(rows.find((r) => r.id === "loc-2")?.label).toBe("Hamptons (guest house)");
	});

	it("setPrimaryLocation clears the old primary and sets the new one (two writes, sequential)", async () => {
		await setPrimaryLocation("u1", "loc-2");
		const rows = await listLocations("u1");
		expect(rows.find((r) => r.id === "loc-1")?.isPrimary).toBe(false);
		expect(rows.find((r) => r.id === "loc-2")?.isPrimary).toBe(true);
	});

	it("deleteLocation reassigns the location's items to the fallback before deleting the row", async () => {
		await deleteLocation("loc-2", "loc-1");
		expect(db.itemsUpdated).toEqual([{ from: "loc-2", to: "loc-1" }]);
		const rows = await listLocations("u1");
		expect(rows.find((r) => r.id === "loc-2")).toBeUndefined();
	});

	it("deleteLocation without a reassign target just deletes (caller guarantees no orphaned items)", async () => {
		await deleteLocation("loc-2");
		expect(db.itemsUpdated).toEqual([]);
		const rows = await listLocations("u1");
		expect(rows.find((r) => r.id === "loc-2")).toBeUndefined();
	});

	it("deleteLocation refuses to delete the primary location without a reassign target error", async () => {
		await expect(deleteLocation("loc-1")).rejects.toThrow(/primary/i);
	});
});
