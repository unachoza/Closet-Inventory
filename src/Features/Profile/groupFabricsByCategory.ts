import type { FabricSummary } from "../../hooks/useClosetFabrics";
import type { FiberCategory } from "../../Content/Fabrics&Fibers/textileTypes";

/** Fabrics whose material doesn't resolve to a fibers.ts entry (fiber === null). */
export type FabricGroup = FiberCategory | "other";

export interface FabricGroupSummary {
	group: FabricGroup;
	label: string;
	color: string;
	count: number;
	/** Constituent fabric names, most-counted first — feeds the aria-label. */
	fabricNames: string[];
}

/** Fixed display order + copy, independent of which groups a given closet happens to use. */
const GROUP_META: Record<FabricGroup, { label: string; color: string }> = {
	animal: { label: "Animal", color: "#b89b78" },
	plant: { label: "Plant", color: "#c9d3bf" },
	semi: { label: "Semi-synthetic", color: "#d9b8c4" },
	synth: { label: "Synthetic", color: "#a9bcc8" },
	other: { label: "Other", color: "#9fb0a0" },
};

const GROUP_ORDER: FabricGroup[] = ["animal", "plant", "semi", "synth", "other"];

/**
 * Collapses per-material fabric counts (e.g. "Cotton", "Merino wool",
 * "Viscose") into the five fibers.ts categories — natural animal, natural
 * plant, semi-synthetic, synthetic — plus "other" for materials that don't
 * resolve to a fibers.ts entry at all. Groups with zero items are omitted;
 * order is fixed so re-renders don't reshuffle the donut/legend.
 */
export function groupFabricsByCategory(fabrics: FabricSummary[]): FabricGroupSummary[] {
	const counts = new Map<FabricGroup, { count: number; fabricNames: string[] }>();

	for (const fabric of fabrics) {
		const group: FabricGroup = fabric.fiber?.category ?? "other";
		const existing = counts.get(group);
		if (existing) {
			existing.count += fabric.count;
			existing.fabricNames.push(fabric.name);
		} else {
			counts.set(group, { count: fabric.count, fabricNames: [fabric.name] });
		}
	}

	return GROUP_ORDER.filter((group) => counts.has(group)).map((group) => {
		const entry = counts.get(group)!;
		return {
			group,
			label: GROUP_META[group].label,
			color: GROUP_META[group].color,
			count: entry.count,
			fabricNames: entry.fabricNames,
		};
	});
}
