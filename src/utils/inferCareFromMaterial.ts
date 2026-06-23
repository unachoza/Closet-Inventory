import { CARE_GROUPS } from "../Content/Fabric&Fiber";
import type { MaterialBlend } from "./types";

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
