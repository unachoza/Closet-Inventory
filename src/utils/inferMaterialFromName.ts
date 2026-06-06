import { normalizeMaterial } from "./materialUtils";
import type { MaterialBlend } from "./types";

// Longer/more-specific patterns before shorter ones they contain.
// Uses \b word boundaries to avoid partial-word matches (lace ≠ place).
const MATERIAL_KEYWORDS: [RegExp, string][] = [
	[/\bcashmere\b/i, "cashmere"],
	[/\bmerino\s+wool\b/i, "wool"],
	[/\borganic\s+cotton\b/i, "cotton"],
	[/\b(lyocell|tencel)\b/i, "lyocell"],
	[/\b(viscose|rayon)\b/i, "rayon"],
	[/\b(spandex|elastane|lycra)\b/i, "spandex"],
	[/\bcotton\b/i, "cotton"],
	[/\bsilk\b/i, "silk"],
	[/\bwool\b/i, "wool"],
	[/\blinen\b/i, "linen"],
	[/\bmodal\b/i, "modal"],
	[/\bpolyester\b/i, "polyester"],
	[/\bnylon\b/i, "nylon"],
	[/\bacrylic\b/i, "acrylic"],
	[/\bleather\b/i, "leather"],
	[/\bvelvet\b/i, "velvet"],
	[/\bdenim\b/i, "denim"],
	[/\bfleece\b/i, "fleece"],
	[/\blace\b/i, "lace"],
	[/\bchiffon\b/i, "chiffon"],
	[/\bsatin\b/i, "satin"],
];

// Extracts "95% Cotton, 5% Spandex" from "95% Cotton, 5% Spandex Leggings"
// by grabbing only the N% <single-word> pairs, ignoring trailing product words.
function extractBlendString(name: string): string {
	const pairs = Array.from(name.matchAll(/(\d+(?:\.\d+)?)\s*%\s*([\w™®-]+)/gi));
	return pairs.map((m) => `${m[1]}% ${m[2]}`).join(", ");
}

export function inferMaterialFromName(name: string): MaterialBlend[] {
	// Percentage-based blend wins over keyword inference.
	if (/\d+\s*%/.test(name)) {
		const blend = normalizeMaterial(extractBlendString(name));
		if (blend.length > 0) return blend;
	}

	// Single-material keyword match → 100%.
	for (const [pattern, material] of MATERIAL_KEYWORDS) {
		if (pattern.test(name)) {
			return [{ material, percentage: 100 }];
		}
	}

	return [];
}
