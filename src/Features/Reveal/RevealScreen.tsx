import { useEffect, useRef } from "react";
import OnboardingShell from "../Onboarding/OnboardingShell";
import { track } from "../../lib/analytics";
import type { RevealStats } from "./revealStats";
import "../Onboarding/OnboardingFlow.css";
import "./Reveal.css";

export interface RevealScreenProps {
	stats: RevealStats;
	/** Which acquisition path earned this Reveal — drives copy: "imported
	 *  from email receipts" is only true for 'gmail'. */
	source: "gmail" | "manual";
	/** "See your closet" — the primary CTA, always lands on Closet regardless
	 *  of which of the 6 exit points triggered the Reveal. */
	onGoToCloset: () => void;
	/** Secondary action — cancels whatever navigation triggered the Reveal
	 *  (Gmail: "Keep Searching Emails", stays on the email list) or is a
	 *  fixed destination (manual: "Add another item", back to the wizard). */
	onContinueHunting: () => void;
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
 * Day 0 — The Reveal. Full-screen, one-time takeover — the payoff for
 * watching a closet build itself. Fires by intercepting the first attempt to
 * leave the Gmail email flow (hamburger drawer, profile, Closet/Care/Search,
 * manual add — see the reveal-guard registered in App.tsx) after she's
 * imported something, with a short-idle fallback for someone who abandons
 * the screen without navigating (see useReveal.ts). Only ever shows once
 * (retentionLifecycle.ts), so it can afford to be the loudest thing in the
 * app, same reasoning as WhatsChangedScreen's one-time card.
 *
 * Two equally-real choices, not a primary action + a dismiss: whichever
 * button she picks, the navigation attempt that triggered this is dropped —
 * neither button "resumes" it, both go to a fixed destination.
 */
export default function RevealScreen({ stats, source, onGoToCloset, onContinueHunting }: RevealScreenProps) {
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

	const handleGoToCloset = () => {
		track("reveal_closet_clicked");
		onGoToCloset();
	};

	const handleContinueHunting = () => {
		track("reveal_continue_hunting_clicked");
		onContinueHunting();
	};

	const eyebrow = source === "gmail" ? "Your closet, imported" : "Your closet, growing";
	const skipLabel = source === "gmail" ? "Keep Searching Emails" : "Add another item";

	return (
		<OnboardingShell
			cta={{ label: "See your closet", onClick: handleGoToCloset }}
			skip={{ label: skipLabel, onClick: handleContinueHunting }}
		>
			<div className="onb-step reveal-step reveal-step--slide-up">
				<p className="reveal-step__eyebrow">{eyebrow}</p>
				<p className="reveal-step__stat">{stats.pieceCount}</p>
				<p className="reveal-step__label">piece{stats.pieceCount === 1 ? "" : "s"} tracked</p>
				<p className="reveal-step__line">
					{stats.brandCount} brand{stats.brandCount === 1 ? "" : "s"}
					{valueLine ? `. ${valueLine}` : ""}.
				</p>
				{dateRangeLine && source === "gmail" && (
					<p className="reveal-step__range">Imported from email receipts between {dateRangeLine}.</p>
				)}
			</div>
		</OnboardingShell>
	);
}
