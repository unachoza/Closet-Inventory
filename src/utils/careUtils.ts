import type { LucideIcon } from "lucide-react";
import { WashingMachine, Hand, Ban, Wind, Square, Thermometer, RotateCw, Flame, Tag } from "lucide-react";

// Canonical care instructions, keyed by substring. Shared by the card detail
// display (parseCareItems) and the closet care filter (parseCareLabels).
// Lucide icons (not emoji) so care badges match the rest of the chrome and
// render consistently across devices.
export const CARE_MAP: [keyword: string, icon: LucideIcon, label: string][] = [
	["dry clean", WashingMachine, "Dry clean"],
	["hand wash", Hand, "Hand wash"],
	["cold water", WashingMachine, "Cold wash"],
	["cold wash", WashingMachine, "Cold wash"],
	["machine wash", WashingMachine, "Machine wash"],
	["no bleach", Ban, "No bleach"],
	["hang dry", Wind, "Hang dry"],
	["lay flat", Square, "Lay flat"],
	["low heat", Thermometer, "Low heat"],
	["tumble", RotateCw, "Tumble dry"],
	["hot water", Flame, "Warm wash"],
];

export const BRAND_CARE_MAP: [keyword: string, icon: LucideIcon, label: string][] = [
	["dry clean", WashingMachine, "Dry clean"],
	["hand wash", Hand, "Hand wash"],
	["cold water", WashingMachine, "Cold wash"],
	["cold wash", WashingMachine, "Cold wash"],
	["machine wash", WashingMachine, "Machine wash"],
	["no bleach", Ban, "No bleach"],
	["hang dry", Wind, "Hang dry"],
	["lay flat", Square, "Lay flat"],
	["low heat", Thermometer, "Low heat"],
	["tumble", RotateCw, "Tumble dry"],
	["hot water", Flame, "Warm wash"],
];
export interface CareItem {
	icon: LucideIcon;
	label: string;
}

const toEntries = (care: string | string[]): string[] => (Array.isArray(care) ? care : care ? [care] : []).filter(Boolean);

/**
 * Display parsing: one badge per care entry (first keyword match wins), keeping
 * the icon. Unmatched entries fall back to their raw text. Order preserved, no
 * dedupe — mirrors how the card shows care pills.
 */
export function parseCareItems(care: string | string[]): CareItem[] {
	return toEntries(care).map((raw) => {
		const lower = raw.toLowerCase();
		const match = CARE_MAP.find(([kw]) => lower.includes(kw));
		return match ? { icon: match[1], label: match[2] } : { icon: Tag, label: raw };
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
