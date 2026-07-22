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

// Name-keyword → care tags. Order matters only for output ordering.
const NAME_CARE_RULES: [RegExp, string[]][] = [
	[/\blazers?\b/i, ["Dry clean"]],
	[/\b(shoes?|sneakers?|boots?|heels?|flats?|loafers?|pumps?|sandals?)\b/i, ["Wipe with damp cloth"]],
	[/\bjeans?\b/i, ["Wash inside out"]],
	[/\b(fleece|sherpa)\b/i, ["Wash inside out", "Air dry"]],
	[/\b(beaded|sequins?|sequined|embroidered)\b/i, ["Use mesh laundry bag", "Hand wash only"]],
	[/\b(raw[- ]?hem|distressed)\b/i, ["Wash in a laundry bag"]],
	[/\b(zippers?|buckles?|stud(s|ded)?|hardware)\b/i, ["Close fasteners before washing"]],
];

// Color-keyword → care tags. Matched against the raw color text so navy/indigo
// stay distinct from lighter blues (which a normalized "Blue" would flatten).
const COLOR_CARE_RULES: [RegExp, string[]][] = [
	[/\b(white|ivory|cream|ecru|off[- ]?white)\b/i, ["Wash with like colors"]],
	[/\b(black|navy|indigo|charcoal)\b/i, ["Wash with dark colors"]],
	[/\b(red|neon|bright[- ]?pink)\b/i, ["Wash separately before first use"]],
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
			if (isShoe && hasLeather && careTags.includes("Wipe with damp cloth")) {
				tags.push("Use soft Horsehair Brush");
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

import { CARE_GROUPS } from "../../../Content/Fabric&Fiber";

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

// Care guidance that depends on color rather than material.
const WHITE_CARE_TAG = "Wash with like colors only";

function isWhite(color?: string): boolean {
	return color?.trim().toLowerCase() === "white";
}

// Fiber-trait rules that apply to any material present in the blend (not just
// the primary), layered on top of the care-group wash/dry guidance.
const MATERIAL_TRAIT_RULES: [string[], string[]][] = [
	[["linen", "rayon"], ["Line dry"]],
	[["nylon", "polyester"], ["Do not use fabric softeners"]],
];

/**
 * Maps a material blend to care instructions, optionally layering color-driven guidance.
 * - The primary (highest %) material contributes wash/dry guidance from CARE_GROUPS.
 * - White items get "Wash with like colors only" regardless of material.
 * - Fiber-trait rules add extra guidance for any material in the blend.
 *
 * Pure: returns a deduped (possibly empty) list, never mutates the input.
 */
export function inferCareFromMaterial(materials: MaterialBlend[], color?: string): string[] {
	const instructions: string[] = [];

	if (materials.length > 0) {
		const primary = [...materials].sort((a, b) => b.percentage - a.percentage)[0];
		const careGroupTitle = MATERIAL_TO_CARE_GROUP[primary.material.toLowerCase().trim()];
		const careGroup = careGroupTitle ? CARE_GROUPS.find((g) => g.title === careGroupTitle) : undefined;
		if (careGroup) {
			for (const item of careGroup.items) {
				if ((item.label === "Washing" || item.label === "Drying") && item.value) {
					instructions.push(item.value);
					console.log({ instructions });
				}
			}
		}

		// Fiber-trait rules across the whole blend.
		const names = materials.map((m) => m.material.toLowerCase().trim());
		for (const [keywords, careTags] of MATERIAL_TRAIT_RULES) {
			if (keywords.some((k) => names.some((n) => n.includes(k)))) {
				instructions.push(...careTags);
			}
		}
	}

	if (isWhite(color)) instructions.push(WHITE_CARE_TAG);

	return [...new Set(instructions)];
}
