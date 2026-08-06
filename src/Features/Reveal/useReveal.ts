import { useCallback, useMemo, useState } from "react";
import type { ClothingItem } from "../../utils/types";
import { useRetentionLifecycle } from "../../hooks/useRetentionLifecycle";
import { computeRevealStats } from "./revealStats";

const DAY0 = "day0" as const;

/**
 * Drives the Day 0 Reveal: whether it should show right now, and the stats
 * to show it with.
 *
 * `handleTrigger` has two callers in App.tsx: the reveal-guard registered
 * with ViewContext (the primary signal — she's tried to leave the Gmail
 * flow having imported something) and a short idle fallback inside
 * GmailImport.tsx for someone who lingers there without navigating. Either
 * way, gating on `hasShown`/`markShown` here means the Reveal still only
 * ever fires once, even if both callers somehow fired.
 *
 * Returns whether it actually armed (true) or was a no-op because it's
 * already been shown (false) — the reveal-guard needs this synchronously,
 * to know whether to hold the navigation it just intercepted.
 */
export function useReveal(closet: ClothingItem[]) {
	const { hasShown, markShown } = useRetentionLifecycle();
	const [show, setShow] = useState(false);

	const handleTrigger = useCallback((): boolean => {
		if (hasShown(DAY0)) return false;
		markShown(DAY0);
		setShow(true);
		return true;
	}, [hasShown, markShown]);

	const dismiss = useCallback(() => setShow(false), []);

	const stats = useMemo(() => computeRevealStats(closet), [closet]);

	return { show, stats, handleTrigger, dismiss };
}
