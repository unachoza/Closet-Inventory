import { useCallback, useMemo, useState } from "react";
import type { ClothingItem } from "../../utils/types";
import { useRetentionLifecycle } from "../../hooks/useRetentionLifecycle";
import { computeRevealStats } from "./revealStats";

const DAY0 = "day0" as const;

/**
 * Drives the Day 0 Reveal: whether it should show right now, and the stats
 * to show it with. `handleTrigger` is called from two places in App.tsx —
 * navigating away from the Gmail view after an import (the primary,
 * near-instant signal) and a short idle fallback inside GmailImport.tsx for
 * someone who lingers there without navigating. Either way, gating on
 * `hasShown`/`markShown` here means the Reveal still only ever fires once,
 * even if both callers somehow fired.
 */
export function useReveal(closet: ClothingItem[]) {
	const { hasShown, markShown } = useRetentionLifecycle();
	const [show, setShow] = useState(false);

	const handleTrigger = useCallback(() => {
		if (hasShown(DAY0)) return;
		markShown(DAY0);
		setShow(true);
	}, [hasShown, markShown]);

	const dismiss = useCallback(() => setShow(false), []);

	const stats = useMemo(() => computeRevealStats(closet), [closet]);

	return { show, stats, handleTrigger, dismiss };
}
