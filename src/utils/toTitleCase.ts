/**
 * Convert a product name to Title Case for display.
 *
 * Retailer emails frequently send names in ALL CAPS (e.g. "COTTON MODAL TANK
 * TOP"). CSS `text-transform: capitalize` can't fix that — it only upper-cases
 * the first letter of each word and leaves the rest as-is, so caps stay caps.
 * This lower-cases first, then capitalizes the first letter of each word
 * (including after hyphens and slashes), e.g.:
 *   "COTTON MODAL TANK TOP" -> "Cotton Modal Tank Top"
 *   "V-NECK T-SHIRT"        -> "V-Neck T-Shirt"
 *
 * Display-only: storage and parser output keep their original casing so search,
 * de-duplication, and tests are unaffected.
 */
export function toTitleCase(input: string): string {
	if (!input) return input;
	return input.toLowerCase().replace(/(^|[\s/\-&(])([a-z])/g, (_, sep: string, ch: string) => sep + ch.toUpperCase());
}
