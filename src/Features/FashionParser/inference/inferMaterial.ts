import { normalizeMaterial } from "../normalizers/normalizeMaterial";
import type { MaterialBlend } from "../types";

// Longer/more-specific patterns before shorter ones they contain.
const MATERIAL_KEYWORDS: [RegExp, string][] = [
  [/\bcashmere\b/i, "cashmere"],
  [/\bmerino\s+wool\b/i, "wool"],
  [/\bmerino\b/i, "wool"],
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

function extractBlendString(name: string): string {
  const pairs = Array.from(name.matchAll(/(\d+(?:\.\d+)?)\s*%\s*([\w™®-]+)/gi));
  return pairs.map((m) => `${m[1]}% ${m[2]}`).join(", ");
}

/** Infers a material blend from a product name. Percentage blends take priority over keyword matching. */
export function inferMaterialFromName(name: string): MaterialBlend[] {
  if (/\d+\s*%/.test(name)) {
    const blend = normalizeMaterial(extractBlendString(name));
    if (blend.length > 0) return blend;
  }

  const found: string[] = [];
  for (const [pattern, material] of MATERIAL_KEYWORDS) {
    if (pattern.test(name) && !found.includes(material)) {
      found.push(material);
    }
  }

  if (found.length === 0) return [];

  const base = Math.floor(100 / found.length);
  const remainder = 100 - base * found.length;
  return found.map((material, i) => ({
    material,
    percentage: i === 0 ? base + remainder : base,
  }));
}
