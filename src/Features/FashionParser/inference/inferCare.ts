import type { MaterialBlend } from "../types";

/**
 * Single entry point for all inferred care tags. Combines fiber-based guidance
 * (from the material blend) with name/color-based guidance, deduped.
 *
 * Call this where the FINAL resolved fields are known — on the per-product
 * import path the color comes from the email's product card ("Color: White"),
 * not the subject, so passing the resolved color here is what makes color rules
 * (e.g. white → "Wash with like colors") fire.
 */
export function inferCare(name: string, color: string, materials: MaterialBlend[]): string[] {
	return [...new Set([...inferCareFromMaterial(materials, color), ...inferCareFromAttributes(name, color, materials)])];
}

// Care tags inferred from a garment's NAME + COLOR, as opposed to its material
// (see inferCareFromMaterial). Some care guidance depends on what the item is or
// its color rather than its fiber content.

// Every tag emitted anywhere in this file is capped at 3 words — these become
// pill labels on the card, and a longer tag (previously some ran to full
// sentences pulled from the Fabric Guide's prose) forces horizontal scroll on
// mobile. See CARE_LIKE_COLORS_TAG below for the one tag two rule sets share.

// Name-keyword → care tags. Order matters only for output ordering.
const NAME_CARE_RULES: [RegExp, string[]][] = [
	[/\blazers?\b/i, ["Dry clean"]],
	[/\b(shoes?|sneakers?|boots?|heels?|flats?|loafers?|pumps?|sandals?)\b/i, ["Wipe clean"]],
	[/\bjeans?\b/i, ["Wash inside out"]],
	[/\b(fleece|sherpa)\b/i, ["Wash inside out", "Air dry"]],
	[/\b(beaded|sequins?|sequined|embroidered)\b/i, ["Mesh laundry bag", "Hand wash"]],
	[/\b(raw[- ]?hem|distressed)\b/i, ["Use laundry bag"]],
	[/\b(zippers?|buckles?|stud(s|ded)?|hardware)\b/i, ["Close fasteners"]],
];

// Shared with WHITE_CARE_TAG below (inferCareFromMaterial) so a white item's
// two independent rule paths emit the identical string — inferCare()'s Set
// then dedupes them into one pill instead of two near-duplicates.
const CARE_LIKE_COLORS_TAG = "Like colors only";

// Color-keyword → care tags. Matched against the raw color text so navy/indigo
// stay distinct from lighter blues (which a normalized "Blue" would flatten).
const COLOR_CARE_RULES: [RegExp, string[]][] = [
	[/\b(white|ivory|cream|ecru|off[- ]?white)\b/i, [CARE_LIKE_COLORS_TAG]],
	[/\b(black|navy|indigo|charcoal)\b/i, ["Wash with darks"]],
	[/\b(red|neon|bright[- ]?pink)\b/i, ["Wash separately"]],
];

/**
 * Infers extra care instructions from a product's name and color.
 * Pure: returns a deduped (possibly empty) list of care strings, never mutates.
 *
 * @param name      product name (or any text to scan, e.g. subject + body)
 * @param color     color text — raw card value preferred (e.g. "Navy", "White")
 * @param materials optional material blend — used for special cases like leather shoes
 */
export function inferCareFromAttributes(name?: string, color?: string, materials?: MaterialBlend[]): string[] {
	const tags: string[] = [];
	const nameText = name ?? "";
	const colorText = color ?? "";

	// Check if this is a shoe with leather material
	const isShoe = /\b(shoes?|sneakers?|boots?|heels?|flats?|loafers?|pumps?|sandals?)\b/i.test(nameText);
	const hasLeather = materials?.some((m) => /\bleather\b/i.test(m.material)) ?? false;

	for (const [pattern, careTags] of NAME_CARE_RULES) {
		if (pattern.test(nameText)) {
			// Override default shoe care if it has leather
			if (isShoe && hasLeather && careTags.includes("Wipe clean")) {
				tags.push("Brush gently");
			} else {
				tags.push(...careTags);
			}
		}
	}
	// Shoes don't get laundry-based color rules (wash with darks, etc.)
	if (!isShoe) {
		for (const [pattern, careTags] of COLOR_CARE_RULES) {
			if (pattern.test(colorText)) tags.push(...careTags);
		}
	}

	return [...new Set(tags)];
}

// Material → Care group title mapping. Handles synonyms and cross-references.
const MATERIAL_TO_CARE_GROUP: Record<string, string> = {
	// Animal fibers
	wool: "Wool, Cashmere & Mohair",
	cashmere: "Wool, Cashmere & Mohair",
	mohair: "Wool, Cashmere & Mohair",
	alpaca: "Wool, Cashmere & Mohair",
	angora: "Wool, Cashmere & Mohair",
	qiviut: "Wool, Cashmere & Mohair",
	silk: "Silk",

	// Plant fibers
	cotton: "Cotton & Linen",
	linen: "Cotton & Linen",
	hemp: "Cotton & Linen",
	ramie: "Cotton & Linen",
	jute: "Cotton & Linen",

	// Regenerated/semi-synthetic
	viscose: "Viscose, Rayon, Modal & TENCEL™",
	rayon: "Viscose, Rayon, Modal & TENCEL™",
	modal: "Viscose, Rayon, Modal & TENCEL™",
	lyocell: "Viscose, Rayon, Modal & TENCEL™",
	bamboo: "Viscose, Rayon, Modal & TENCEL™",
	cupro: "Viscose, Rayon, Modal & TENCEL™",

	// Synthetic
	polyester: "Polyester, Nylon & Synthetics",
	nylon: "Polyester, Nylon & Synthetics",
	polyamide: "Polyester, Nylon & Synthetics",
	spandex: "Polyester, Nylon & Synthetics",
	elastane: "Polyester, Nylon & Synthetics",
	lycra: "Polyester, Nylon & Synthetics",
	acrylic: "Polyester, Nylon & Synthetics",
	polypropylene: "Polyester, Nylon & Synthetics",
};

// Short wash/dry tags per care group, independent of the Fabric Guide's prose
// (src/Content/Fabrics&Fibers/careGroups.ts) — that prose is written for the
// long-form guide and several entries run to full sentences, which as pill
// text forces horizontal scroll on mobile. This table is the single place
// responsible for keeping every auto-inferred tag at 3 words or fewer.
// Also fixes a real coverage gap: the Viscose/Rayon/Modal/TENCEL group in
// careGroups.ts uses "Viscose / Rayon" / "Modal & TENCEL™" item labels
// instead of "Washing"/"Drying", so materials in that group previously
// produced zero care instructions here.
const CARE_GROUP_TAGS: Record<string, string[]> = {
	"Wool, Cashmere & Mohair": ["Hand wash", "Lay flat"],
	Silk: ["Hand wash", "Hang dry"],
	"Cotton & Linen": ["Machine wash", "Tumble dry low"],
	"Viscose, Rayon, Modal & TENCEL™": ["Hand wash", "Lay flat"],
	"Polyester, Nylon & Synthetics": ["Machine wash cold", "Low heat", "No fabric softener"],
};

function isWhite(color?: string): boolean {
	return color?.trim().toLowerCase() === "white";
}

// Fiber-trait rules that apply to any material present in the blend (not just
// the primary), layered on top of the care-group wash/dry guidance.
const MATERIAL_TRAIT_RULES: [string[], string[]][] = [
	[["linen", "rayon"], ["Line dry"]],
	[["nylon", "polyester"], ["No fabric softener"]],
];

/**
 * Maps a material blend to care instructions, optionally layering color-driven guidance.
 * - The primary (highest %) material contributes wash/dry guidance from CARE_GROUP_TAGS.
 * - White items get CARE_LIKE_COLORS_TAG regardless of material.
 * - Fiber-trait rules add extra guidance for any material in the blend.
 *
 * Pure: returns a deduped (possibly empty) list, never mutates the input.
 */
export function inferCareFromMaterial(materials: MaterialBlend[], color?: string): string[] {
	const instructions: string[] = [];

	if (materials.length > 0) {
		const primary = [...materials].sort((a, b) => b.percentage - a.percentage)[0];
		const careGroupTitle = MATERIAL_TO_CARE_GROUP[primary.material.toLowerCase().trim()];
		const tags = careGroupTitle ? CARE_GROUP_TAGS[careGroupTitle] : undefined;
		if (tags) instructions.push(...tags);

		// Fiber-trait rules across the whole blend.
		const names = materials.map((m) => m.material.toLowerCase().trim());
		for (const [keywords, careTags] of MATERIAL_TRAIT_RULES) {
			if (keywords.some((k) => names.some((n) => n.includes(k)))) {
				instructions.push(...careTags);
			}
		}
	}

	if (isWhite(color)) instructions.push(CARE_LIKE_COLORS_TAG);

	return [...new Set(instructions)];
}
