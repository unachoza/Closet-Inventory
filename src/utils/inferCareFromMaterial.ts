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

/** A color counts as "white" once normalized/trimmed (e.g. "White", "white "). */
function isWhite(color?: string): boolean {
	return color?.trim().toLowerCase() === "white";
}

/**
 * Maps a material name to its care group and extracts wash + dry instructions,
 * then layers on any color-driven guidance.
 *
 * Material care is extracted from CARE_GROUPS in Fabric&Fiber.ts — only
 * "Washing" and "Drying" labels are included (skips "Ironing"). A white item
 * additionally gets a "Wash with like colors only" tag, regardless of material
 * (so a white piece with unknown fabric still carries the warning).
 */
export function inferCareFromMaterial(materials: MaterialBlend[], color?: string): string[] {
	const instructions: string[] = [];

	if (materials.length > 0) {
		// Use the primary (highest percentage) material's care group. Sort a copy
		// to avoid mutating the caller's array.
		const primary = [...materials].sort((a, b) => b.percentage - a.percentage)[0];
		const normalizedMaterial = primary.material.toLowerCase().trim();

		const careGroupTitle = MATERIAL_TO_CARE_GROUP[normalizedMaterial];
		const careGroup = careGroupTitle ? CARE_GROUPS.find((g) => g.title === careGroupTitle) : undefined;

		if (careGroup) {
			for (const item of careGroup.items) {
				if ((item.label === "Washing" || item.label === "Drying") && item.value) {
					instructions.push(item.value);
				}
			}
		}
	}
	console.log(isWhite(color));
	if (isWhite(color)) instructions.push(WHITE_CARE_TAG);

	return instructions;
}
