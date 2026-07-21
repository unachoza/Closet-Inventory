/* ─────────────────────────────────────────────
   fiberCompare.ts
   Data + pure helpers for the Fiber Comparison table
   (sortable columns + pick-up-to-3-to-compare). Kept
   separate from the view so the logic is unit-testable.
   ─────────────────────────────────────────────*/

export interface FiberRow {
	fiber: string;
	category: string;
	source: string;
	breathability: string;
	durability: string;
	ecoRating: string;
	cost: string;
}

export type SortKey = keyof FiberRow;
export type SortDir = "asc" | "desc";

/** Max fibers a user can pin side-by-side in compare mode. */
export const MAX_COMPARE = 3;

export const FIBER_ROWS: readonly FiberRow[] = [
	{ fiber: "Merino Wool", category: "Natural/Animal", source: "Merino sheep", breathability: "High", durability: "High", ecoRating: "Good", cost: "$$–$$$" },
	{ fiber: "Cashmere", category: "Natural/Animal", source: "Cashmere goat", breathability: "Medium", durability: "Low", ecoRating: "Fair", cost: "$$$$" },
	{ fiber: "Mohair", category: "Natural/Animal", source: "Angora goat", breathability: "High", durability: "High", ecoRating: "Fair", cost: "$$$" },
	{ fiber: "Silk", category: "Natural/Animal", source: "Silkworm", breathability: "High", durability: "Medium", ecoRating: "Low", cost: "$$$$" },
	{ fiber: "Alpaca", category: "Natural/Animal", source: "Alpaca", breathability: "High", durability: "High", ecoRating: "Good", cost: "$$$" },
	{ fiber: "Cotton", category: "Natural/Plant", source: "Cotton plant", breathability: "High", durability: "High", ecoRating: "Fair", cost: "$" },
	{ fiber: "Linen", category: "Natural/Plant", source: "Flax plant", breathability: "Very High", durability: "Very High", ecoRating: "Good", cost: "$$" },
	{ fiber: "Hemp", category: "Natural/Plant", source: "Hemp plant", breathability: "High", durability: "Very High", ecoRating: "Excellent", cost: "$$" },
	{ fiber: "Viscose/Rayon", category: "Semi-Synthetic", source: "Wood pulp", breathability: "High", durability: "Low", ecoRating: "Poor", cost: "$" },
	{ fiber: "Modal", category: "Semi-Synthetic", source: "Beech trees", breathability: "High", durability: "Medium", ecoRating: "Fair", cost: "$$" },
	{ fiber: "TENCEL™/Lyocell", category: "Semi-Synthetic", source: "Eucalyptus", breathability: "High", durability: "Medium", ecoRating: "Excellent", cost: "$$" },
	{ fiber: "Polyester", category: "Synthetic", source: "Petroleum", breathability: "Low", durability: "Very High", ecoRating: "Poor", cost: "$" },
	{ fiber: "Nylon", category: "Synthetic", source: "Petroleum", breathability: "Low", durability: "Very High", ecoRating: "Poor", cost: "$–$$" },
	{ fiber: "Spandex/Lycra", category: "Synthetic", source: "Petroleum", breathability: "Very Low", durability: "Medium", ecoRating: "Poor", cost: "$$" },
	{ fiber: "Acrylic", category: "Synthetic", source: "Petroleum", breathability: "Low", durability: "Medium", ecoRating: "Poor", cost: "$" },
];

/** Ordinal rank for the qualitative scales, so sorting is by meaning not alphabet. */
const SCALE_RANK: Record<string, number> = {
	"Very Low": 0,
	Low: 1,
	Medium: 2,
	High: 3,
	"Very High": 4,
	Poor: 0,
	Fair: 1,
	Good: 2,
	Excellent: 3,
};

/** Comparable numeric value for a cell: qualitative scales by rank, cost by $-count,
 *  everything else lowercased for stable alphabetical order. */
function cellValue(row: FiberRow, key: SortKey): number | string {
	const raw = row[key];
	if (key === "breathability" || key === "durability" || key === "ecoRating") {
		return SCALE_RANK[raw] ?? -1;
	}
	if (key === "cost") {
		// Rank by the highest price tier present, so a range like "$$–$$$" (top
		// tier 3) ranks below a flat "$$$$" (4) rather than by total $ count.
		const runs = raw.split(/[^$]+/).map((run) => run.length);
		return Math.max(0, ...runs);
	}
	return raw.toLowerCase();
}

/**
 * Immutably sort a copy of the rows by a column. String columns compare
 * alphabetically; qualitative + cost columns compare by their ordinal value.
 */
export function sortRows(rows: readonly FiberRow[], key: SortKey, dir: SortDir): FiberRow[] {
	const sorted = [...rows].sort((a, b) => {
		const av = cellValue(a, key);
		const bv = cellValue(b, key);
		if (av < bv) return -1;
		if (av > bv) return 1;
		return 0;
	});
	return dir === "desc" ? sorted.reverse() : sorted;
}

/**
 * Immutably toggle a fiber in the compare selection, capping at MAX_COMPARE.
 * Adding beyond the cap is a no-op (the current selection is returned unchanged).
 */
export function togglePick(selected: readonly string[], fiber: string): string[] {
	if (selected.includes(fiber)) {
		return selected.filter((f) => f !== fiber);
	}
	if (selected.length >= MAX_COMPARE) {
		return [...selected];
	}
	return [...selected, fiber];
}
