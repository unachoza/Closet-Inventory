export interface ProductAttributes {
	neckline?: string;
	topLength? string;
	sleeveLength?: string;
	hemLength?: string;
	fit?: string;
	rise?: string;
	season?: string;
	hasStretch?: boolean;
	hasPockets?: boolean;
	pattern?: string;
	accents?: string
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
	[/\b(scoop[- ]?neck|scoopneck)\b/i, "scoop neck"],
	[/\b(boat[- ]?neck|boatneck)\b/i, "boat neck"],
	[/\b(cowl[- ]?neck|cowlneck)\b/i, "cowl neck"],
	[/\b(turtle[- ]?neck|turtleneck)\b/i, "turtleneck"],
	[/\b(mock[- ]?neck|mockneck)\b/i, "mock neck"],

	[/\bstrapless\b/i, "strapless"],
	[/\bsweetheart\b/i, "sweetheart"],
	[/\b(one[- ]?shoulder)\b/i, "one shoulder"],
	[/\b(off[- ]?(the[- ]?)?shoulder)\b/i, "off-shoulder"],
	[/\bcold[- ]?shoulder\b/i, "cold shoulder"],
	[/\bhalter\b/i, "halter"],

	[/\bplunge\b/i, "plunge"],
	[/\bkeyhole\b/i, "keyhole"],
	[/\btie[- ]?neck\b/i, "tie neck"],
	[/\bhenley\b/i, "henley"],
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

const STYLE_MAP: [RegExp, string][] = [
	[/\ba[- ]?line\b/i, "a-line"],
	[/\bsheath\b/i, "sheath"],
	[/\bshift\b/i, "shift"],
	[/\bmaxi\b/i, "maxi"],
	[/\bmidi\b/i, "midi"],
	[/\bmini\b/i, "mini"],
	[/\bbodycon\b/i, "bodycon"],
	[/\bfit[- ]?(and|&)[- ]?flare\b/i, "fit & flare"],
	[/\bshirt[- ]?dress\b/i, "shirtdress"],
	[/\bhigh[- /]?low\b/i, "high/low"],
	[/\bwrap\b/i, "wrap"],
	[/\bdrop[- ]?waist\b/i, "drop waist"],
	[/\bslip[- ]?dress\b/i, "slip dress"],
	[/\bpopover\b/i, "popover"],
	[/\bpencil\b/i, "pencil"],
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

const ACCENTS_MAP: [RegExp, string][] = [
	[/\bbeaded\b/i, "beaded"],
	[/\bbows?\b/i, "bows"],
	[/\bchains?\b/i, "chains"],
	[/\bcut[- ]?outs?\b/i, "cut outs"],
	[/\bembroider(ed|y)?\b/i, "embroidered"],
	[/\bflannel\b/i, "flannel"],
	[/\bfrayed[- ]?edges?\b/i, "frayed edges"],
	[/\bfringe\b/i, "fringe"],
	[/\bglitter\b/i, "glitter"],
	[/\blace[- ]?up\b/i, "lace-up"],
	[/\bpeplum\b/i, "peplum"],
	[/\bripped\b/i, "ripped"],
	[/\bruched\b/i, "ruched"],
	[/\bruffles?\b/i, "ruffles"],
	[/\bsequins?\b/i, "sequins"],
	[/\brhinestones?\b/i, "rhinestones"],
	[/\bstudded\b/i, "studded"],
	[/\bvelvet\b/i, "velvet"],
];

const PATTERN_MAP: [RegExp, string][] = [
	[/\banimal[- ]?print\b/i, "animal print"],
	[/\bargyle\b/i, "argyle"],
	[/\bcamo\b/i, "camo"],
	[/\bcheckered\b/i, "checkered"],
	[/\bgingham\b/i, "gingham"],
	[/\bchevron\b/i, "chevron"],
	[/\bherringbone\b/i, "herringbone"],
	[/\bcolor[- ]?block(ed)?\b/i, "color block"],
	[/\bfloral\b/i, "floral"],
	[/\bgraphic\b/i, "graphic"],
	[/\bhearts?\b/i, "hearts"],
	[/\bhoundstooth\b/i, "houndstooth"],
	[/\bmetallic\b/i, "metallic"],
	[/\bpaisley\b/i, "paisley"],
	[/\bplaid\b/i, "plaid"],
	[/\bpolka[- ]?dots?\b/i, "polka dots"],
	[/\bprint(ed)?\b/i, "print"],
	[/\bsolid\b/i, "solid"],
	[/\bstars?\b/i, "stars"],
	[/\bstripes?\b/i, "stripes"],
	[/\btie[- ]?dye\b/i, "tie-dye"],
	[/\btropical\b/i, "tropical"],
	[/\btweed\b/i, "tweed"],
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
