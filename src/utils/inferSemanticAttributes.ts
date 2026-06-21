import type { ClothingItem } from "./types";

export function inferSemanticAttributes(text: string): Partial<ClothingItem> {
	const lower = text.toLowerCase();
	const result: Partial<ClothingItem> = {};

	// blazer → care override
	if (/\bblazer\b/i.test(lower)) {
		result.care = "dry clean only";
	}

	// contour → bodycon fit, going-out occasion
	if (/\bcontour\b/i.test(lower)) {
		result.occasion = "going-out";
	}

	return result;
}
