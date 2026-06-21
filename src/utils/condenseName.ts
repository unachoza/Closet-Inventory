/**
 * Condense a raw retailer product name to ≤7 meaningful words.
 *
 * Marketplace emails (Amazon, Shein, Temu, Poshmark) produce names that are
 * either SEO keyword dumps with commas ("High Waist Flare Leg Jeans,Ladies
 * Casual Button,Pocket,Zipper High Waist Flare Leg…") or brand+size+condition
 * strings ("Babaton Deep Taupe Contour Scoop Stretch Cami Mini Dress Medium NWT").
 *
 * Strategy (applied in order):
 *  1. Split on first comma — kills Amazon/Temu repetition after the first phrase.
 *  2. Strip brand name from the start if provided (already stored separately).
 *  3. Strip gender prefixes (Womens, Ladies, Men's…).
 *  4. Strip condition tokens (NWT, NWOT, EUC…) anywhere in the string.
 *  5. Strip year tokens (2024, 2025, 2026).
 *  6. Strip sizes only at end of string (S/M/L/XL, Small/Medium/Large).
 *  7. Strip trailing filler ("with Pocket", "for Women", "Daily Wear"…).
 *  8. Collapse whitespace.
 *  9. Cap at MAX_WORDS (7).
 */

const MAX_WORDS = 7;

// Gender words at position 0, or preceded by a single word (unknown brand pattern:
// "Selianne Women's …" where "Selianne" isn't in the brand field).
const GENDER_PREFIX_RE = /^(\S+\s+)?(womens?|women's|mens?|men's|ladies|girls?|boys?|unisex)\s+/i;

// Poshmark / secondhand condition abbreviations.
const CONDITION_TOKEN_RE = /\b(nwt|nwot|euc|guc|vguc|new\s+with\s+tags?|new\s+without\s+tags?)\b/gi;

// Year noise (common in Temu/Amazon listings: "2026 Long Sleeve Cotton Top").
const YEAR_TOKEN_RE = /\b(202\d|201\d)\b/g;

// Apparel sizes — only strip when at the end of the string (Poshmark pattern).
const TRAILING_SIZE_RE = /\s+\b(xxs|xs|x-small|small|medium|large|xl|xxl|x-large|xx-large|plus\s+size|petite)\b\s*$/i;

// Trailing filler phrases that add no product info.
const TRAILING_FILLER_RE = /\s+(with\s+\w+(\s+\w+){0,2}|for\s+(women|men|girls|boys)|daily\s+wear|casual\s+daily|spring\/?fall|workout)\s*$/i;

export function condenseName(raw: string, brand?: string): string {
	if (!raw?.trim()) return raw;

	// 1. First comma segment kills SEO keyword repetition
	let name = raw.split(",")[0].trim();

	// 2. Strip leading brand name (already stored in the brand field)
	if (brand?.trim()) {
		const escaped = brand.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
		name = name.replace(new RegExp(`^${escaped}\\s+`, "i"), "");
	}

	// 3–7. Strip noise (gender strip applied twice: catches "Brand Women's…" after brand removal)
	name = name
		.replace(GENDER_PREFIX_RE, "")
		.replace(GENDER_PREFIX_RE, "")
		.replace(CONDITION_TOKEN_RE, " ")
		.replace(YEAR_TOKEN_RE, " ")
		.replace(TRAILING_SIZE_RE, "")
		.replace(TRAILING_FILLER_RE, "")
		.replace(/\s{2,}/g, " ")
		.trim();

	// 8. Cap at MAX_WORDS
	const words = name.split(/\s+/).filter(Boolean);
	if (words.length <= MAX_WORDS) return words.join(" ") || raw;
	return words.slice(0, MAX_WORDS).join(" ");
}
