import { useCallback, useMemo, useState } from "react";
import type { ClothingItem } from "../../utils/types";
import { useRetentionLifecycle } from "../../hooks/useRetentionLifecycle";
import { computeRevealStats } from "./revealStats";

const DAY0 = "day0" as const;

/**
 * Drives the Day 0 Reveal: whether it should show right now, the stats to
 * show it with, and the idle-trigger handoff from the Gmail import screen.
 *
 * This hook doesn't own the idle timer itself (that lives in GmailImport.tsx,
 * where the activity signal actually is) — `handleIdle` is what the import
 * screen calls once its own timer fires. Gating on `hasShown`/`markShown`
 * here (not just inside GmailImport) means the Reveal still only ever fires
 * once even if `handleIdle` were somehow called more than once.
 */
export function useReveal(closet: ClothingItem[]) {
	const { hasShown, markShown } = useRetentionLifecycle();
	const [show, setShow] = useState(false);

	const handleIdle = useCallback(() => {
		if (hasShown(DAY0)) return;
		markShown(DAY0);
		setShow(true);
	}, [hasShown, markShown]);

	const dismiss = useCallback(() => setShow(false), []);

	const stats = useMemo(() => computeRevealStats(closet), [closet]);

	return { show, stats, handleIdle, dismiss };
}
