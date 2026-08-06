import type { ClothingItem } from "../../utils/types";

export interface RevealDateRange {
	/** ISO datetime of the earliest purchaseDate found. */
	earliest: string;
	/** ISO datetime of the latest purchaseDate found. */
	latest: string;
}

export interface RevealStats {
	/** Non-demo item count. */
	pieceCount: number;
	/** Distinct, non-empty brands among non-demo items. */
	brandCount: number;
	/** Sum of price across non-demo items that have one. */
	totalValue: number;
	/** False when at least one non-demo item has no price — totalValue is an
	 *  undercount, not the true closet value. The Reveal's copy should soften
	 *  ("$X+" or omit the figure) rather than present it as exact. */
	hasCompleteValue: boolean;
	/** Earliest/latest purchaseDate across non-demo items, or null if none
	 *  have one. purchaseDate is optional and often absent for hand-added
	 *  items, so a null range is expected, not an error. */
	dateRange: RevealDateRange | null;
}

/**
 * Aggregates the stats the Day 0 Reveal needs, from the closet alone — no
 * new data source. Always excludes `isDemo` items, same rule as every other
 * closet-wide stat in the app (useClosetFabrics, useClosetFilters).
 */
export function computeRevealStats(closet: ClothingItem[]): RevealStats {
	const ownItems = closet.filter((item) => !item.isDemo);

	const brands = new Set(
		ownItems.map((item) => item.brand?.trim()).filter((brand): brand is string => Boolean(brand)),
	);

	const pricedItems = ownItems.filter((item) => typeof item.price === "number");
	const totalValue = pricedItems.reduce((sum, item) => sum + (item.price ?? 0), 0);

	const purchaseDates = ownItems
		.map((item) => item.purchaseDate)
		.filter((date): date is string => Boolean(date))
		.map((date) => new Date(date))
		.filter((date) => !Number.isNaN(date.getTime()));

	const dateRange: RevealDateRange | null =
		purchaseDates.length > 0
			? {
					earliest: new Date(Math.min(...purchaseDates.map((d) => d.getTime()))).toISOString(),
					latest: new Date(Math.max(...purchaseDates.map((d) => d.getTime()))).toISOString(),
				}
			: null;

	return {
		pieceCount: ownItems.length,
		brandCount: brands.size,
		totalValue,
		hasCompleteValue: ownItems.length > 0 && pricedItems.length === ownItems.length,
		dateRange,
	};
}
