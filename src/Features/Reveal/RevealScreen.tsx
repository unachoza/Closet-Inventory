import { useEffect, useRef } from "react";
import OnboardingShell from "../Onboarding/OnboardingShell";
import { track } from "../../lib/analytics";
import type { RevealStats } from "./revealStats";
import "../Onboarding/OnboardingFlow.css";
import "./Reveal.css";

export interface RevealScreenProps {
	stats: RevealStats;
	onDismiss: () => void;
}

function formatDateRange(stats: RevealStats): string | null {
	if (!stats.dateRange) return null;
	// UTC, not local time: purchaseDate is commonly stored as a UTC midnight
	// timestamp (e.g. "2026-06-01T00:00:00.000Z"), and toLocaleDateString
	// formats in the browser's local timezone — anyone west of UTC would see
	// that render as "May 2026", a full month off. Format the UTC calendar
	// date directly instead of letting the local offset shift it.
	const fmt = (iso: string) => new Date(iso).toLocaleDateString(undefined, { month: "long", year: "numeric", timeZone: "UTC" });
	const earliest = fmt(stats.dateRange.earliest);
	const latest = fmt(stats.dateRange.latest);
	return earliest === latest ? earliest : `${earliest} – ${latest}`;
}

function formatValue(stats: RevealStats): string | null {
	if (stats.totalValue <= 0) return null;
	const amount = Math.round(stats.totalValue).toLocaleString();
	// "+" signals the total is a floor, not an exact figure, when at least one
	// item has no price on file — softer than presenting an undercount as fact.
	return stats.hasCompleteValue ? `$${amount} in value` : `$${amount}+ in value`;
}

/**
 * Day 0 — The Reveal. Full-screen, one-time takeover, fired once the Gmail
 * import screen has gone idle (see useReveal.ts) — the payoff for watching a
 * closet build itself. Not skippable-then-forgotten: it only ever shows once
 * (retentionLifecycle.ts), so it can afford to be the loudest thing in the
 * app, same reasoning as WhatsChangedScreen's one-time card.
 */
export default function RevealScreen({ stats, onDismiss }: RevealScreenProps) {
	// StrictMode double-mounts effects; guard so "shown" fires once per actual
	// appearance, matching WhatsChangedScreen/InstallStep's pattern.
	const trackedShown = useRef(false);

	useEffect(() => {
		if (!trackedShown.current) {
			trackedShown.current = true;
			track("reveal_shown", {
				piece_count: stats.pieceCount,
				brand_count: stats.brandCount,
				has_date_range: stats.dateRange !== null,
				has_complete_value: stats.hasCompleteValue,
			});
		}
	}, [stats]);

	const valueLine = formatValue(stats);
	const dateRangeLine = formatDateRange(stats);

	return (
		<OnboardingShell cta={{ label: "See your closet", onClick: onDismiss }}>
			<div className="onb-step reveal-step">
				<p className="reveal-step__eyebrow">Your closet, imported</p>
				<p className="reveal-step__stat">{stats.pieceCount}</p>
				<p className="reveal-step__label">piece{stats.pieceCount === 1 ? "" : "s"} tracked</p>
				<p className="reveal-step__line">
					{stats.brandCount} brand{stats.brandCount === 1 ? "" : "s"}
					{valueLine ? `. ${valueLine}` : ""}.
				</p>
				{dateRangeLine && <p className="reveal-step__range">Imported from {dateRangeLine}.</p>}
			</div>
		</OnboardingShell>
	);
}
