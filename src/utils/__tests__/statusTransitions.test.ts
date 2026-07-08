import { describe, it, expect } from "vitest";
import type { ClothingItem, LoanRecord } from "../types";
import {
	availableActions,
	getNextStatus,
	applyStatusAction,
	STATUS_TRANSITIONS,
} from "../statusTransitions";

/**
 * P1-9 — pure status transition state machine.
 *
 * Guarantees quick-actions (P1-4) and any status change go through ONE consistent
 * graph. Pure + immutable: applyStatusAction returns a new patch, never mutates.
 * The helper owns the status graph only — it writes no worn_count rollup (E11 owns
 * that via wear_events).
 */

const item = (overrides: Partial<ClothingItem> = {}): ClothingItem =>
	({
		id: "i1",
		imageURL: "",
		name: "Tee",
		category: "tops",
		color: "black",
		size: "M",
		brand: "X",
		material: [],
		occasion: "casual",
		care: "wash",
		...overrides,
	}) as ClothingItem;

const loan = (): LoanRecord => ({ borrowerName: "Jess", since: "2026-07-08T00:00:00Z" });

describe("statusTransitions — graph integrity", () => {
	it("every transition targets a different status than its explicit source", () => {
		for (const t of STATUS_TRANSITIONS) {
			if (t.from !== "*") expect(t.to).not.toBe(t.from);
		}
	});

	it("every transition has a human label (for the quick-action menu)", () => {
		for (const t of STATUS_TRANSITIONS) {
			expect(typeof t.label).toBe("string");
			expect(t.label.length).toBeGreaterThan(0);
		}
	});
});

describe("getNextStatus", () => {
	it("clean → dirty via 'wear'", () => {
		expect(getNextStatus("clean", "wear")).toBe("dirty");
	});

	it("dirty → at_cleaner via 'send_to_cleaner'", () => {
		expect(getNextStatus("dirty", "send_to_cleaner")).toBe("at_cleaner");
	});

	it("at_cleaner → clean via 'pick_up'", () => {
		expect(getNextStatus("at_cleaner", "pick_up")).toBe("clean");
	});

	it("on_loan → clean via 'return_loan'", () => {
		expect(getNextStatus("on_loan", "return_loan")).toBe("clean");
	});

	it("traveling → clean via 'return_home'", () => {
		expect(getNextStatus("traveling", "return_home")).toBe("clean");
	});

	it("absent status is treated as 'clean'", () => {
		expect(getNextStatus(undefined, "wear")).toBe("dirty");
	});

	it("returns null for an illegal transition (can't launder something clean)", () => {
		expect(getNextStatus("clean", "launder")).toBeNull();
	});

	it("returns null for pick_up when not at the cleaner", () => {
		expect(getNextStatus("clean", "pick_up")).toBeNull();
	});
});

describe("availableActions — what the quick-action menu offers", () => {
	it("a clean item can be worn, lent, packed, or sent to repair — not laundered", () => {
		const actions = availableActions("clean");
		expect(actions).toContain("wear");
		expect(actions).toContain("lend");
		expect(actions).toContain("pack");
		expect(actions).toContain("send_to_repair");
		expect(actions).not.toContain("launder");
	});

	it("a dirty item can be laundered or sent to the cleaner", () => {
		const actions = availableActions("dirty");
		expect(actions).toContain("launder");
		expect(actions).toContain("send_to_cleaner");
	});

	it("an on_loan item's only exit is return_loan (no double-lend)", () => {
		const actions = availableActions("on_loan");
		expect(actions).toContain("return_loan");
		expect(actions).not.toContain("lend");
	});

	it("never offers an action that would keep the same status", () => {
		for (const status of ["clean", "dirty", "at_cleaner", "in_repair", "traveling", "on_loan"] as const) {
			for (const action of availableActions(status)) {
				expect(getNextStatus(status, action)).not.toBe(status);
			}
		}
	});

	it("absent status resolves to clean's actions", () => {
		expect(availableActions(undefined)).toEqual(availableActions("clean"));
	});
});

describe("applyStatusAction — immutable patch", () => {
	it("returns a patch with the next status, does NOT mutate the item", () => {
		const original = item({ status: "clean" });
		const snapshot = JSON.stringify(original);
		const patch = applyStatusAction(original, "wear");
		expect(patch).toEqual({ status: "dirty" });
		expect(JSON.stringify(original)).toBe(snapshot); // unchanged
	});

	it("returns null for an illegal action", () => {
		expect(applyStatusAction(item({ status: "clean" }), "launder")).toBeNull();
	});

	it("does NOT write a worn_count rollup on 'wear' (E11 owns that)", () => {
		const patch = applyStatusAction(item({ status: "clean", wornCount: 3 }), "wear");
		expect(patch).not.toHaveProperty("wornCount");
		expect(patch).not.toHaveProperty("lastWornAt");
	});

	it("'lend' sets the loan object from options", () => {
		const l = loan();
		const patch = applyStatusAction(item({ status: "clean" }), "lend", { loan: l });
		expect(patch).toEqual({ status: "on_loan", loan: l });
	});

	it("'return_loan' clears the loan object", () => {
		const patch = applyStatusAction(item({ status: "on_loan", loan: loan() }), "return_loan");
		expect(patch).toEqual({ status: "clean", loan: undefined });
	});

	it("resets location to primary (home) when returning home from traveling", () => {
		const patch = applyStatusAction(item({ status: "traveling", locationId: "suitcase" }), "return_home");
		expect(patch?.status).toBe("clean");
		expect(patch?.locationId).toBe("home");
	});
});
