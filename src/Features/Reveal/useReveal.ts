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
 * with ViewContext (leaving Gmail having imported something) and the
 * manual-add 3-item threshold. Both share the single `day0` horizon — the
 * Reveal is a once-ever payoff regardless of which acquisition path earned
 * it, so whichever fires first wins and the other becomes a no-op via
 * `hasShown`/`markShown`.
 *
 * `source` records which path triggered it, so the stats (and RevealScreen's
 * copy) can be scoped to items from that same source rather than mixing
 * Gmail imports and manual adds together.
 *
 * Returns whether it actually armed (true) or was a no-op because it's
 * already been shown (false) — the reveal-guard needs this synchronously,
 * to know whether to hold the navigation it just intercepted.
 */
export function useReveal(closet: ClothingItem[]) {
	const { hasShown, markShown } = useRetentionLifecycle();
	const [show, setShow] = useState(false);
	const [source, setSource] = useState<"gmail" | "manual">("gmail");

	const handleTrigger = useCallback(
		(triggerSource: "gmail" | "manual"): boolean => {
			if (hasShown(DAY0)) return false;
			markShown(DAY0);
			setSource(triggerSource);
			setShow(true);
			return true;
		},
		[hasShown, markShown],
	);

	const dismiss = useCallback(() => setShow(false), []);

	const stats = useMemo(() => computeRevealStats(closet, source), [closet, source]);

	return { show, stats, source, handleTrigger, dismiss };
}
