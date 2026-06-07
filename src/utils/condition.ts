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
