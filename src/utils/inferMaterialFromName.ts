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
	[/\bpolyamide\b/i, "polyamide"],
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

	// Collect every distinct material keyword present in the name, preserving
	// keyword order. A name like "Cotton Modal Tank Top" yields two materials;
	// overlapping patterns (e.g. "organic cotton" and "cotton") collapse to one.
	const found: string[] = [];
	for (const [pattern, material] of MATERIAL_KEYWORDS) {
		if (pattern.test(name) && !found.includes(material)) {
			found.push(material);
		}
	}

	if (found.length === 0) return [];

	// No explicit percentages in the name — split evenly so the inferred blend
	// still sums to 100. Any rounding remainder goes to the first material.
	const base = Math.floor(100 / found.length);
	const remainder = 100 - base * found.length;
	return found.map((material, i) => ({
		material,
		percentage: i === 0 ? base + remainder : base,
	}));
}
