import type { MaterialBlend } from "./types";

// Care tags inferred from a garment's NAME + COLOR, as opposed to its material
// (see inferCareFromMaterial). Some care guidance depends on what the item is or
// its color rather than its fiber content.

// Name-keyword → care tags. Order matters only for output ordering.
const NAME_CARE_RULES: [RegExp, string[]][] = [
	[/\blazers?\b/i, ["Dry clean"]],
	[/\b(shoes?|sneakers?|boots?|heels?|flats?|loafers?|pumps?|sandals?)\b/i, ["Wipe with damp cloth"]],
	[/\bjeans?\b/i, ["Wash inside out"]],
	[/\b(fleece|sherpa)\b/i, ["Wash inside out", "Air dry"]],
	[/\b(beaded|sequins?|sequined|embroidered)\b/i, ["Wash in a mesh laundry bag", "Hand wash only"]],
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
	for (const [pattern, careTags] of COLOR_CARE_RULES) {
		if (pattern.test(colorText)) tags.push(...careTags);
	}

	return [...new Set(tags)];
}
