import type { ClothingItem, ItemStatus, LoanRecord } from "./types";
import { PRIMARY_LOCATION } from "./locations";

/**
 * P1-9 — pure status transition state machine.
 *
 * One consistent graph for every status change, so quick-actions (P1-4) and the
 * edit form can't drift. Everything here is pure + immutable: `applyStatusAction`
 * returns a NEW patch object and never mutates its input.
 *
 * **Ownership boundary:** this helper owns the *status graph* only. It deliberately
 * writes no `wornCount` / `lastWornAt` rollup on `wear` — those cached rollups are
 * E11's (written via `wear_events`, the canonical Log-a-Wear path). The `wear`
 * transition here is the pure status side (clean → dirty); E11's Log-a-Wear is the
 * richer path that also records the wear event.
 *
 * Adding a state (P1-11's `airing` / `stored`) is a matter of appending rows to
 * `STATUS_TRANSITIONS` — no logic changes.
 */

export type StatusAction =
	| "wear" //            clean → dirty
	| "launder" //         dirty → clean
	| "send_to_cleaner" // dirty → at_cleaner
	| "pick_up" //         at_cleaner → clean
	| "send_to_repair" //  (present) → in_repair
	| "finish_repair" //   in_repair → clean
	| "lend" //            (present) → on_loan
	| "return_loan" //     on_loan → clean
	| "pack" //            (present) → traveling
	| "return_home"; //    traveling → dirty (you come home with worn clothes)

export interface StatusTransition {
	readonly action: StatusAction;
	/** Source status, or "*" for any status where the item is physically present. */
	readonly from: ItemStatus | "*";
	readonly to: ItemStatus;
	/** Human label for the quick-action menu. */
	readonly label: string;
}

/** Absent `status` is treated as this. */
const DEFAULT_STATUS: ItemStatus = "clean";

/**
 * "Present" statuses: the item is physically with the owner, so wildcard actions
 * (lend / pack / send_to_repair) apply. Excludes states where the item is already
 * away or committed elsewhere.
 */
const PRESENT_STATUSES: readonly ItemStatus[] = ["clean", "dirty"];

export const STATUS_TRANSITIONS: readonly StatusTransition[] = [
	{ action: "wear", from: "clean", to: "dirty", label: "Wear it" },
	{ action: "launder", from: "dirty", to: "clean", label: "Did laundry" },
	{ action: "send_to_cleaner", from: "dirty", to: "at_cleaner", label: "Send to cleaner" },
	{ action: "pick_up", from: "at_cleaner", to: "clean", label: "Picked up" },
	{ action: "send_to_repair", from: "*", to: "in_repair", label: "Send for repair" },
	{ action: "finish_repair", from: "in_repair", to: "clean", label: "Repair done" },
	{ action: "lend", from: "*", to: "on_loan", label: "Lend…" },
	{ action: "return_loan", from: "on_loan", to: "clean", label: "Returned" },
	{ action: "pack", from: "*", to: "traveling", label: "Pack for trip" },
	// Coming home from a trip → dirty, not clean: worn travel clothes need washing.
	// (Original spec flagged this as "clean/dirty — ask"; dirty is the realistic
	// default. A separate "unworn" path can be added if users want the nuance.)
	{ action: "return_home", from: "traveling", to: "dirty", label: "Back home" },
];

function resolveStatus(status?: ItemStatus): ItemStatus {
	return status ?? DEFAULT_STATUS;
}

/** True when a wildcard (`from: "*"`) transition applies to the given status. */
function wildcardApplies(current: ItemStatus, to: ItemStatus): boolean {
	// Present-only, and never a no-op (can't lend something already on loan, etc.).
	return PRESENT_STATUSES.includes(current) && to !== current;
}

function findTransition(current: ItemStatus, action: StatusAction): StatusTransition | null {
	for (const t of STATUS_TRANSITIONS) {
		if (t.action !== action) continue;
		if (t.from === current && t.to !== current) return t;
		if (t.from === "*" && wildcardApplies(current, t.to)) return t;
	}
	return null;
}

/** The next status for an action, or `null` if the action is illegal from `status`. */
export function getNextStatus(status: ItemStatus | undefined, action: StatusAction): ItemStatus | null {
	const t = findTransition(resolveStatus(status), action);
	return t ? t.to : null;
}

/** The actions legal from a given status — drives the quick-action menu (P1-4). */
export function availableActions(status?: ItemStatus): StatusAction[] {
	const current = resolveStatus(status);
	const seen = new Set<StatusAction>();
	const actions: StatusAction[] = [];
	for (const t of STATUS_TRANSITIONS) {
		if (seen.has(t.action)) continue;
		if (findTransition(current, t.action)) {
			actions.push(t.action);
			seen.add(t.action);
		}
	}
	return actions;
}

export interface ApplyOptions {
	/** Required by `lend` — the borrower record to attach. */
	readonly loan?: LoanRecord;
}

/**
 * Produce the immutable patch for applying `action` to `item`, or `null` if the
 * action is illegal from the item's current status. Never mutates `item`.
 *
 * Side effects encoded here (beyond `status`):
 *  - `lend`         → sets `loan` from `opts.loan`
 *  - `return_loan`  → clears `loan`
 *  - `return_home`  → resets `locationId` to the primary (home) location
 */
export function applyStatusAction(
	item: ClothingItem,
	action: StatusAction,
	opts: ApplyOptions = {},
): Partial<ClothingItem> | null {
	const next = getNextStatus(item.status, action);
	if (next === null) return null;

	const patch: Partial<ClothingItem> = { status: next };

	if (action === "lend") patch.loan = opts.loan;
	if (action === "return_loan") patch.loan = undefined;
	if (action === "return_home") patch.locationId = PRIMARY_LOCATION.id;

	return patch;
}
