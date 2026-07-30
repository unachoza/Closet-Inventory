import type { ClothingItem } from "../utils/types";

/**
 * Capacity accounting for the signed-out ("local only") closet.
 *
 * Why this exists: a signed-out closet lives entirely in `localStorage` under
 * `my_closet_key`, and browsers cap that at roughly 5MB. Photos are stored as
 * base64 data URLs until the user signs in (see `base64PhotoGuard`), so a
 * handful of photo-bearing items can exhaust the quota long before any
 * sensible item count would. Worse, `safeSetItem` swallows the resulting
 * QuotaExceededError and returns false, and `localClosetRepository.write()`
 * ignores that result — so without a guard the item looks added in memory and
 * is silently never persisted.
 *
 * The cap therefore trips on **whichever limit is reached first**, count or
 * bytes, so the user always gets a deliberate "create an account" prompt
 * instead of invisible data loss.
 *
 * Pure and side-effect free: it measures the array it is handed and returns a
 * fresh result. Deciding what to *do* with a tier is the UI's business.
 */

/** Hard ceiling on locally-held items before an account is required. */
export const LOCAL_ITEM_LIMIT = 60;

/**
 * Byte budget for the serialized closet. Deliberately below the ~5MB browser
 * cap: `my_closet_key` is not the only thing in localStorage (onboarding stage,
 * consent, feature state), and hitting the real ceiling is the failure mode
 * being prevented, not one to approach.
 */
export const LOCAL_BYTE_BUDGET = 4_000_000;

/** Item counts at which the "not backed up" nudge escalates. */
export const NUDGE_AT_GENTLE = 10;
export const NUDGE_AT_FIRM = 30;
export const NUDGE_AT_URGENT = 50;

export type CapacityTier = "ok" | "gentle" | "firm" | "urgent" | "blocked";

/** Which ceiling forced the block — drives the wording the user sees. */
export type BlockedReason = "count" | "size";

export interface LocalCapacity {
	itemCount: number;
	/** Estimated serialized size of the closet, in bytes. */
	bytesUsed: number;
	itemLimit: number;
	byteBudget: number;
	tier: CapacityTier;
	isBlocked: boolean;
	blockedReason: BlockedReason | null;
	/** Worse of the two ratios, 0–100, for a progress indicator. */
	percentUsed: number;
}

/**
 * Estimate the bytes `localStorage` will charge for a string.
 *
 * Browsers store Web Storage as UTF-16, so a character generally costs 2 bytes
 * regardless of how compact its UTF-8 form is. Multiplying by 2 is the
 * conservative reading — it over-estimates rather than under, which is the
 * right direction to err when the penalty for guessing low is silent data loss.
 */
function estimateBytes(serialized: string): number {
	return serialized.length * 2;
}

/** Ratio of used to budget, clamped to [0, 1]. */
function ratio(used: number, budget: number): number {
	if (budget <= 0) return 1;
	return Math.min(used / budget, 1);
}

function tierFor(itemCount: number, bytesUsed: number): CapacityTier {
	if (itemCount >= LOCAL_ITEM_LIMIT || bytesUsed >= LOCAL_BYTE_BUDGET) return "blocked";

	// Size pressure maps onto the same escalation ladder as item count, so a
	// photo-heavy closet warns just as early as a long one.
	const usage = Math.max(itemCount / LOCAL_ITEM_LIMIT, bytesUsed / LOCAL_BYTE_BUDGET);

	if (itemCount >= NUDGE_AT_URGENT || usage >= NUDGE_AT_URGENT / LOCAL_ITEM_LIMIT) return "urgent";
	if (itemCount >= NUDGE_AT_FIRM || usage >= NUDGE_AT_FIRM / LOCAL_ITEM_LIMIT) return "firm";
	if (itemCount >= NUDGE_AT_GENTLE || usage >= NUDGE_AT_GENTLE / LOCAL_ITEM_LIMIT) return "gentle";
	return "ok";
}

/**
 * Measure a signed-out closet against both ceilings.
 *
 * `items` is read, never modified.
 */
export function measureLocalCloset(items: readonly ClothingItem[]): LocalCapacity {
	const itemCount = items.length;

	// Measure what actually gets written: the same JSON the repository persists.
	let bytesUsed: number;
	try {
		bytesUsed = estimateBytes(JSON.stringify(items));
	} catch {
		// Unserializable closet (cycles, exotic values) — treat as at-budget so
		// the user is stopped rather than silently failing to persist.
		bytesUsed = LOCAL_BYTE_BUDGET;
	}

	const tier = tierFor(itemCount, bytesUsed);

	// Count is checked first so a closet that trips both reports the ceiling the
	// user can most readily act on ("you have 60 items") over an opaque byte count.
	const blockedReason: BlockedReason | null =
		tier !== "blocked" ? null : itemCount >= LOCAL_ITEM_LIMIT ? "count" : "size";

	const percentUsed = Math.round(
		Math.max(ratio(itemCount, LOCAL_ITEM_LIMIT), ratio(bytesUsed, LOCAL_BYTE_BUDGET)) * 100,
	);

	return {
		itemCount,
		bytesUsed,
		itemLimit: LOCAL_ITEM_LIMIT,
		byteBudget: LOCAL_BYTE_BUDGET,
		tier,
		isBlocked: tier === "blocked",
		blockedReason,
		percentUsed,
	};
}
