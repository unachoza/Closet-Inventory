import { occasionExamples } from "./constants";

// Each entry: [pattern to test against name+category, occasion tag]
// Order matters — more specific patterns first (cocktail before going-out).
const OCCASION_MAP: [RegExp, string][] = [
	[/\b(formal|gala|black\s*tie|prom)\b/i, "formal"],
	[/\b(wedding|bridal|bride)\b/i, "wedding"],
	[/\bcocktail\b/i, "cocktail"],
	[/\b(going[- ]out|night[- ]out|club|bodycon|sequin|sparkle)\b/i, "going-out"],
	[/\b(work\s*wear|office|professional|business\s*casual|pencil\s*skirt)\b/i, "work wear"],
	[/\b(gym|yoga|athletic|sport|workout|running|cycling|activewear|training)\b/i, "sports"],
	[/\b(beach|resort|tropical|cover.?up|swim)\b/i, "vacation"],
	[/\b(vacation)\b/i, "vacation"],
	[/\b(christmas|festive|nye|new\s*year|thanksgiving)\b/i, "holiday"],
	[/\b(church|sunday\s*best|sunday\s*mass)\b/i, "church"],
	[/\b(picnic|garden\s*party)\b/i, "picnic"],
	[/\bbasics?\b/i, "basics"],
	[/\b(casual|everyday|lounge|weekend)\b/i, "casual"],
];

const VALID_TAGS = new Set<string>(occasionExamples);

const EVERYDAY_CATEGORIES = new Set(["underwear", "lingerie"]);

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
