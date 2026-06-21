import type { MaterialBlend } from "./types";

export function resolveMaterial(
	productMaterial: MaterialBlend[] | string | undefined | null,
	emailMaterial: MaterialBlend[] | string | undefined | null,
): MaterialBlend[] | string | undefined | null {
	return productMaterial && productMaterial.length > 0
		? productMaterial
		: emailMaterial;
}