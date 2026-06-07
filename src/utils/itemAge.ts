/**
 * Format an item's age from a purchase date string (RFC 2822 or ISO 8601).
 *
 * Rounding bands:
 *   < 2 years  → nearest 6-month band ("6 months", "1 year", "1.5 years", etc.)
 *   2–5 years  → nearest whole year ("2 years" … "4 years")
 *   5+ years   → exact floored years ("5 years", "6 years", …)
 *
 * Returns empty string when the date is unparseable.
 */
export function formatItemAge(purchaseDate: string): string {
	const purchased = new Date(purchaseDate);
	if (isNaN(purchased.getTime())) return "";

	const now = new Date();
	const totalMonths =
		(now.getFullYear() - purchased.getFullYear()) * 12 +
		(now.getMonth() - purchased.getMonth());

	if (totalMonths < 0) return "";

	if (totalMonths < 24) {
		// Round to nearest 6-month band
		const bands = Math.round(totalMonths / 6);
		if (bands === 0) return "< 6 months";
		if (bands % 2 === 0) {
			const years = bands / 2;
			return years === 1 ? "1 year" : `${years} years`;
		}
		const halfYears = bands * 0.5;
		return `${halfYears} years`;
	}

	if (totalMonths < 60) {
		const years = Math.round(totalMonths / 12);
		return `${years} year${years !== 1 ? "s" : ""}`;
	}

	const years = Math.floor(totalMonths / 12);
	return `${years} years`;
}
