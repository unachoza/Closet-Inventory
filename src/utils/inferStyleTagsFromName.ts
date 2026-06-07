import { occasionExamples } from "./constants";

// Each entry: [pattern to test against name+category, occasion tag]
// Order matters — more specific patterns first (cocktail before going-out).
const OCCASION_MAP: [RegExp, string][] = [
	// Formal
	[/\b(formal|gala|black\s*tie|prom|evening\s*gown|ball\s*gown)\b/i, "formal"],

	// Wedding
	[/\b(wedding|bridal|bride|bridesmaid|maid\s*of\s*honor)\b/i, "wedding"],

	// Cocktail
	[/\b(cocktail|semi[- ]?formal)\b/i, "cocktail"],

	// Going Out
	[
		/\b(going[- ]?out|night[- ]?out|club|bodycon|animal\s*print|corset|bustier|leather|faux\s*leather|mesh|cut[- ]?out|plunge|lace[- ]?up|sequin|sequins|sparkle|sparkly)\b/i,
		"going-out",
	],

	// Work Wear
	[
		/\b(work\s*wear|office|professional|business\s*casual|blazer|tailored|suiting|button[- ]?down|oxford|trouser|trousers|pencil\s*skirt)\b/i,
		"work wear",
	],

	// Sports
	[
		/\b(gym|yoga|athletic|sport|workout|running|cycling|activewear|training|legging|leggings)\b/i,
		"sports",
	],

	// Vacation
	[
		/\b(vacation|vacay|beach|resort|tropical|swim|bikini|one[- ]?piece|sarong|caftan|cover[- ]?up)\b/i,
		"vacation",
	],

	// Holiday
	[
		/\b(christmas|festive|holiday\s*party|nye|new\s*year|thanksgiving|velvet|metallic|rhinestone)\b/i,
		"holiday",
	],

	// Church
	[/\b(church|sunday\s*best|sunday\s*mass)\b/i, "church"],

	// Picnic
	[/\b(picnic|garden\s*party|floral|gingham|eyelet|smocked)\b/i, "picnic"],

	// Casual / Everyday
	[/\b(casual|everyday|lounge|weekend|basic|basics)\b/i, "casual"],
];

const VALID_TAGS = new Set<string>(occasionExamples);

const EVERYDAY_CATEGORIES = new Set(["underwear", "lingerie", "socks"]);

export function inferStyleTagsFromName(name: string, category?: string): string[] {
	const combined = `${name} ${category ?? ""}`;
	const tags: string[] = [];

	for (const [pattern, tag] of OCCASION_MAP) {
		if (!VALID_TAGS.has(tag)) continue;
		if (!pattern.test(combined)) continue;
		if (tags.includes(tag)) continue;
		tags.push(tag);
		if (tags.length >= 2) break;
	}

	if (tags.length === 0 && category && EVERYDAY_CATEGORIES.has(category)) {
		if (VALID_TAGS.has("everyday")) tags.push("everyday");
	}

	return tags;
}
