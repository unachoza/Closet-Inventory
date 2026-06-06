export interface ProductAttributes {
	sleeveLength?: string;
	hemLength?: string;
	neckline?: string;
	fit?: string;
	rise?: string;
	season?: string;
}

// Each entry: [pattern, canonical value].
// More-specific alternatives come before shorter ones they overlap with.
const SLEEVE_MAP: [RegExp, string][] = [
	[/\b(long[- ]?sleeve|longsleeve)\b/i, "long sleeve"],
	[/\b3\/4[- ]?sleeve\b/i, "3/4 sleeve"],
	[/\bshort[- ]?sleeve\b/i, "short sleeve"],
	[/\b(sleeveless|strapless)\b/i, "sleeveless"],
	[/\bcap[- ]?sleeve\b/i, "cap sleeve"],
	[/\bflutter[- ]?sleeve\b/i, "flutter sleeve"],
];

const HEM_MAP: [RegExp, string][] = [
	[/\bmini\b/i, "mini"],
	[/\bmidi\b/i, "midi"],
	[/\bmaxi\b/i, "maxi"],
	[/\bcrop(ped)?\b/i, "crop"],
];

const NECKLINE_MAP: [RegExp, string][] = [
	[/\b(square[- ]?neck|squareneck)\b/i, "square neck"],
	[/\b(v[- ]?neck|vneck)\b/i, "v-neck"],
	[/\bcrew[- ]?neck\b/i, "crew neck"],
	[/\b(turtle[- ]?neck|turtleneck)\b/i, "turtleneck"],
	[/\bmock[- ]?neck\b/i, "mock neck"],
	[/\boff[- ]?shoulder\b/i, "off-shoulder"],
	[/\bhalter\b/i, "halter"],
	[/\bscoop[- ]?neck\b/i, "scoop neck"],
	[/\bboat[- ]?neck\b/i, "boat neck"],
	[/\bcowl[- ]?neck\b/i, "cowl neck"],
];

const FIT_MAP: [RegExp, string][] = [
	// Longer phrases before single-word overlaps
	[/\bstraight[- ]leg\b/i, "straight leg"],
	[/\bwide[- ]leg\b/i, "wide leg"],
	[/\b(bodycon|contour)\b/i, "bodycon"],
	[/\bflare[d]?\b/i, "flare"],
	[/\bskinny\b/i, "skinny"],
	[/\bslim\b/i, "slim"],
	[/\brelaxed\b/i, "relaxed"],
	[/\boversized\b/i, "oversized"],
	[/\bfitted\b/i, "fitted"],
];

const RISE_MAP: [RegExp, string][] = [
	[/\bhigh[- ]?(waist|rise)\b/i, "high waist"],
	[/\bmid[- ]?(waist|rise)\b/i, "mid rise"],
	[/\blow[- ]?(waist|rise)\b/i, "low rise"],
];

const SEASON_MAP: [RegExp, string][] = [
	[/\bspring\b/i, "spring"],
	[/\bsummer\b/i, "summer"],
	[/\b(fall|autumn)\b/i, "fall"],
	[/\bwinter\b/i, "winter"],
];

function matchFirst(text: string, map: [RegExp, string][]): string | undefined {
	for (const [pattern, value] of map) {
		if (pattern.test(text)) return value;
	}
	return undefined;
}

export function inferProductAttributes(name: string): ProductAttributes {
	const attrs: ProductAttributes = {};

	const sleeveLength = matchFirst(name, SLEEVE_MAP);
	if (sleeveLength) attrs.sleeveLength = sleeveLength;

	const hemLength = matchFirst(name, HEM_MAP);
	if (hemLength) attrs.hemLength = hemLength;

	const neckline = matchFirst(name, NECKLINE_MAP);
	if (neckline) attrs.neckline = neckline;

	const fit = matchFirst(name, FIT_MAP);
	if (fit) attrs.fit = fit;

	const rise = matchFirst(name, RISE_MAP);
	if (rise) attrs.rise = rise;

	const season = matchFirst(name, SEASON_MAP);
	if (season) attrs.season = season;

	return attrs;
}
