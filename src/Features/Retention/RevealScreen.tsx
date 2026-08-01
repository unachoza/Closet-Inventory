import { useEffect, useMemo } from "react";
import { useCloset } from "../../context/ClosetContext";
import { track } from "../../lib/analytics";
import "./RevealScreen.css";

interface RevealScreenProps {
	onContinue: () => void;
}

/**
 * Day 0 — The Reveal. Full-screen, not skippable: the one-time payoff for
 * watching a closet build itself. Fires once ever (gated by
 * useRetentionLifecycle) the first time the user's own item count crosses
 * REVEAL_THRESHOLD — not tied to the Gmail import queue drain, since manual
 * adds and single-item imports never reach that branch.
 */
export default function RevealScreen({ onContinue }: RevealScreenProps) {
	const { closet } = useCloset();

	const stats = useMemo(() => {
		const ownItems = closet.filter((item) => !item.isDemo);
		const brandCount = new Set(ownItems.map((item) => item.brand).filter((brand) => brand && brand.trim().length > 0)).size;
		const totalValue = ownItems.reduce((sum, item) => sum + (item.price ?? 0), 0);
		return { pieceCount: ownItems.length, brandCount, totalValue };
	}, [closet]);

	useEffect(() => {
		track("reveal_shown", { pieceCount: stats.pieceCount, brandCount: stats.brandCount });
		// Fire once per mount, not on every stats recompute.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const valueLine = stats.totalValue > 0 ? `$${Math.round(stats.totalValue).toLocaleString()} in value.` : "";
	const brandLine = stats.brandCount > 0 ? `${stats.brandCount} brand${stats.brandCount === 1 ? "" : "s"}.` : "";

	return (
		<div className="reveal">
			<p className="reveal__eyebrow">Your closet, imported</p>
			<div className="reveal__stat-block">
				<div className="reveal__stat">{stats.pieceCount}</div>
				<div className="reveal__label">pieces tracked</div>
			</div>
			<p className="reveal__line">
				{brandLine} {valueLine} One inbox, now a closet.
			</p>
			<button type="button" className="reveal__cta" onClick={onContinue}>
				See your closet
			</button>
		</div>
	);
}
