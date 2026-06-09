// Canonical care instructions, keyed by substring. Shared by the card detail
// display (parseCareItems) and the closet care filter (parseCareLabels).
export const CARE_MAP: [keyword: string, emoji: string, label: string][] = [
	["dry clean", "🧺", "Dry clean"],
	["hand wash", "👐", "Hand wash"],
	["cold water", "🧼", "Cold wash"],
	["cold wash", "🧼", "Cold wash"],
	["machine wash", "🧼", "Machine wash"],
	["no bleach", "🚫", "No bleach"],
	["hang dry", "💨", "Hang dry"],
	["lay flat", "📐", "Lay flat"],
	["low heat", "🌡️", "Low heat"],
	["tumble", "🌀", "Tumble dry"],
	["hot water", "🔥", "Warm wash"],
];

export interface CareItem {
	emoji: string;
	label: string;
}

const toEntries = (care: string | string[]): string[] => (Array.isArray(care) ? care : care ? [care] : []).filter(Boolean);

/**
 * Display parsing: one badge per care entry (first keyword match wins), keeping
 * the emoji. Unmatched entries fall back to their raw text. Order preserved, no
 * dedupe — mirrors how the card shows care pills.
 */
export function parseCareItems(care: string | string[]): CareItem[] {
	return toEntries(care).map((raw) => {
		const lower = raw.toLowerCase();
		const match = CARE_MAP.find(([kw]) => lower.includes(kw));
		return match ? { emoji: match[1], label: match[2] } : { emoji: "🏷️", label: raw };
	});
}

/**
 * Filter parsing: collects EVERY canonical care label present, so a compound
 * entry like "machine wash cold, tumble dry low" indexes under both
 * "Machine wash" and "Tumble dry". Deduped; unmatched entries kept as raw text.
 */
export function parseCareLabels(care: string | string[]): string[] {
	const labels = new Set<string>();

	for (const raw of toEntries(care)) {
		const lower = raw.toLowerCase();
		let matched = false;
		for (const [kw, , label] of CARE_MAP) {
			if (lower.includes(kw)) {
				labels.add(label);
				matched = true;
			}
		}
		if (!matched) labels.add(raw.trim());
	}

	return [...labels];
}
