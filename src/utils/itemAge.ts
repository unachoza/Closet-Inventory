/**
 * Format an item's factual age from a purchase date string (RFC 2822 or ISO 8601).
 *
 * Returns a bare duration phrase — the caller composes any surrounding copy
 * (e.g. the Card renders "Purchased: {age} ago"). Tiers:
 *
 *   same day        → "today"
 *   < 1 month       → "X days"      (e.g. "20 days")
 *   < 1 year        → "X months"    (e.g. "5 months")
 *   >= 1 year       → "X years"     one decimal, trailing .0 dropped
 *                                   (e.g. "1.5 years", "3 years")
 *
 * Returns empty string when the date is missing, unparseable, or in the future.
 */

const MS_PER_DAY = 1000 * 60 * 60 * 24;
const DAYS_PER_MONTH_TIER = 31; // switch from days → months past this many days

export function formatItemAge(purchaseDate: string | undefined): string {
	if (!purchaseDate) return "";

	const purchased = new Date(purchaseDate);
	if (isNaN(purchased.getTime())) return "";

	const now = new Date();
	const diffMs = now.getTime() - purchased.getTime();
	if (diffMs < 0) return "";

	const days = Math.floor(diffMs / MS_PER_DAY);

	if (days === 0) return "today";

	if (days < DAYS_PER_MONTH_TIER) {
		return `${days} day${days === 1 ? "" : "s"}`;
	}

	// Calendar-accurate month/year difference (avoids drift from fixed day counts).
	let totalMonths = (now.getFullYear() - purchased.getFullYear()) * 12 + (now.getMonth() - purchased.getMonth());
	// If we haven't yet reached the same day-of-month, the latest month isn't complete.
	if (now.getDate() < purchased.getDate()) {
		totalMonths -= 1;
	}

	if (totalMonths < 12) {
		const months = Math.max(1, totalMonths);
		return `${months} month${months === 1 ? "" : "s"}`;
	}

	// One decimal place, dropping a trailing ".0" (e.g. 3.0 → "3 years", 1.5 → "1.5 years").
	const years = Math.round((totalMonths / 12) * 10) / 10;
	const rounded = Number.isInteger(years) ? `${years}` : years.toFixed(1);
	return `${rounded} year${years === 1 ? "" : "s"}`;
}
