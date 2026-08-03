import { useMemo } from "react";
import { useCloset } from "../context/ClosetContext";
import { extractMaterialNames } from "./useClosetFilters";
import { resolveFiber } from "../utils/materialUtils";
import { inferCareFromMaterial } from "../Features/FashionParser/inference/inferCare";
import type { Fiber } from "../Content/Fabrics&Fibers/textileTypes";

export type CareTone = "warn" | "ok";

const DRY_CLEAN_OR_HAND_WASH = /hand wash|dry clean/i;

export interface FabricSummary {
	/** Canonical fiber name as counted, e.g. "Cotton", "Wool". */
	name: string;
	/** Resolved encyclopedia entry, when this material maps to one. */
	fiber: Fiber | null;
	count: number;
	/** Share of own (non-demo) items that include this fiber, 0–100. */
	pctOfCloset: number;
	careLabel: string;
	careTone: CareTone;
	/** One-line care tip for the desktop card. */
	tip: string;
}

const FALLBACK_CARE_LABEL = "Check label";
const FALLBACK_TIP = "No specific care guidance on file for this fabric yet.";

function summarizeCare(name: string): { label: string; tone: CareTone; tip: string } {
	const instructions = inferCareFromMaterial([{ material: name, percentage: 100 }]);
	if (instructions.length === 0) {
		return { label: FALLBACK_CARE_LABEL, tone: "warn", tip: FALLBACK_TIP };
	}
	const tip = instructions[0];
	const tone: CareTone = DRY_CLEAN_OR_HAND_WASH.test(tip) ? "warn" : "ok";
	const label = tone === "warn" ? (/dry clean/i.test(tip) ? "Dry clean" : "Hand wash") : "Machine safe";
	return { label, tone, tip };
}

/**
 * Aggregates the signed-in user's own (non-demo) items by fabric, joining each
 * counted material to its fibers.ts encyclopedia entry and care guidance.
 * Reuses the counting rules already validated in useClosetFilters (material
 * dimension) rather than re-implementing them.
 */
export function useClosetFabrics() {
	const { closet } = useCloset();

	return useMemo(() => {
		const ownItems = closet.filter((item) => !item.isDemo);
		const counts = new Map<string, number>();

		for (const item of ownItems) {
			for (const name of extractMaterialNames(item.material)) {
				counts.set(name, (counts.get(name) ?? 0) + 1);
			}
		}

		const total = ownItems.length;
		const fabrics: FabricSummary[] = Array.from(counts.entries())
			.map(([name, count]) => {
				const fiber = resolveFiber(name);
				const care = summarizeCare(name);
				return {
					name,
					fiber,
					count,
					pctOfCloset: total > 0 ? Math.round((count / total) * 100) : 0,
					careLabel: care.label,
					careTone: care.tone,
					tip: care.tip,
				};
			})
			.sort((a, b) => b.count - a.count);

		const resolvableCount = fabrics.filter((f) => f.fiber !== null).length;

		return { fabrics, resolvableCount };
	}, [closet]);
}
