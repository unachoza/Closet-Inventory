import type { MaterialBlend } from "./types";
import { inferCareFromMaterial } from "./inferCareFromMaterial";
import { inferCareFromAttributes } from "./inferCareFromAttributes";

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
	return [...new Set([...inferCareFromMaterial(materials), ...inferCareFromAttributes(name, color, materials)])];
}
