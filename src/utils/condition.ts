import { conditionOptions } from "./constants";

/**
 * Resolve a canonical condition value for an item.
 *
 * Returns the item's `condition` when it's one of the known options, else the
 * legacy free-text `age` ONLY when that happens to be a valid condition
 * (older items stored ages like "one year" that are NOT conditions). Returns
 * `undefined` when nothing valid is found — callers decide the empty state
 * (the Card hides the row; the edit selector defaults to "new").
 */
export function matchedCondition(condition?: string, age?: string): string | undefined {
	if (condition && conditionOptions.includes(condition)) return condition;
	if (age && conditionOptions.includes(age)) return age;
	return undefined;
}

const MS_PER_YEAR = 1000 * 60 * 60 * 24 * 365.25;

/**
 * Estimate a starting condition from how long ago an item was purchased. Used to
 * seed the default for email imports — a years-old order shouldn't default to "new".
 * The user can always adjust it during import review.
 *
 *   < 1 year   → "new"
 *   1–3 years  → "like new"
 *   > 3 years  → "good"
 *
 * Falls back to "new" when the date is missing, unparseable, or in the future.
 */
export function defaultConditionForPurchaseDate(purchaseDate?: string): string {
	if (!purchaseDate) return "new";

	const purchased = new Date(purchaseDate);
	if (isNaN(purchased.getTime())) return "new";

	const years = (Date.now() - purchased.getTime()) / MS_PER_YEAR;
	if (years < 1) return "new";
	if (years <= 3) return "like new";
	return "good";
}
