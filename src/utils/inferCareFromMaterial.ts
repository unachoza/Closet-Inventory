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

/**
 * Maps a material name to its care group and extracts wash + dry instructions.
 * Returns an array of care strings (both washing and drying guidance).
 *
 * Care instructions are extracted from CARE_GROUPS in Fabric&Fiber.ts.
 * Only "Washing" and "Drying" labels are included (skips "Ironing").
 */
export function inferCareFromMaterial(materials: MaterialBlend[]): string[] {
	if (materials.length === 0) return [];

	// Use the primary (highest percentage) material's care group
	const primary = materials.sort((a, b) => b.percentage - a.percentage)[0];
	const normalizedMaterial = primary.material.toLowerCase().trim();

	// Look up the care group for this material
	const careGroupTitle = MATERIAL_TO_CARE_GROUP[normalizedMaterial];
	if (!careGroupTitle) return [];

	// Find the care group by title
	const careGroup = CARE_GROUPS.find((g) => g.title === careGroupTitle);
	if (!careGroup) return [];

	// Extract "Washing" and "Drying" instructions (if present)
	const instructions: string[] = [];
	for (const item of careGroup.items) {
		if ((item.label === "Washing" || item.label === "Drying") && item.value) {
			instructions.push(item.value);
		}
	}

	return instructions;
}
