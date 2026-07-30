import { useEffect, useRef, useState } from "react";
import { useLocalCapacity } from "../../hooks/useLocalCapacity";
import { useSupabaseAuthContext } from "../../context/SupabaseAuthContext";
import { track } from "../../lib/analytics";
import type { CapacityTier } from "../../services/localClosetCapacity";
import "./LocalCapacityNotice.css";

/**
 * Escalating "this closet isn't backed up" notice for signed-out users.
 *
 * The point is that reaching the cap should never be a surprise. Three
 * dismissible touchpoints (roughly 10 / 30 / 50 items, or the equivalent in
 * bytes for a photo-heavy closet) precede the hard stop, each stating the real
 * count so the ceiling is legible well before it arrives.
 *
 * Dismissal is per-tier, not global: dismissing the gentle nudge shouldn't also
 * silence the urgent one. The blocked state is not dismissible — at that point
 * new items genuinely cannot be saved.
 */

const TIER_COPY: Record<Exclude<CapacityTier, "ok">, { tone: string; message: (n: number) => string }> = {
	gentle: {
		tone: "info",
		message: (n) => `Your ${n} items live on this device only. Create an account to keep them safe.`,
	},
	firm: {
		tone: "warn",
		message: (n) => `${n} items, saved only on this device — clearing your browser would lose them.`,
	},
	urgent: {
		tone: "urgent",
		message: (n) => `You're close to the limit for an unsaved closet (${n} items). Create an account to keep adding.`,
	},
	blocked: {
		tone: "blocked",
		message: (n) => `This device can't hold more than ${n} unsaved items. Create an account to keep going — nothing you've added is lost.`,
	},
};

const DISMISS_KEY = "closetly-capacity-dismissed";

function readDismissed(): ReadonlySet<string> {
	try {
		const raw = localStorage.getItem(DISMISS_KEY);
		return new Set(raw ? (JSON.parse(raw) as string[]) : []);
	} catch {
		return new Set();
	}
}

export default function LocalCapacityNotice() {
	const { isLocalOnly, capacity } = useLocalCapacity();
	const { signIn } = useSupabaseAuthContext();
	const [dismissed, setDismissed] = useState<ReadonlySet<string>>(readDismissed);

	const tier = capacity.tier;
	const isBlocked = tier === "blocked";
	const shouldShow = isLocalOnly && tier !== "ok" && (isBlocked || !dismissed.has(tier));

	// One event per tier reached, not per render.
	const reported = useRef<string | null>(null);
	useEffect(() => {
		if (!shouldShow || reported.current === tier) return;
		reported.current = tier;
		track(isBlocked ? "local_capacity_blocked" : "local_capacity_nudge_shown", {
			tier,
			item_count: capacity.itemCount,
			percent_used: capacity.percentUsed,
			blocked_reason: capacity.blockedReason,
		});
	}, [shouldShow, tier, isBlocked, capacity.itemCount, capacity.percentUsed, capacity.blockedReason]);

	if (!shouldShow) return null;

	const copy = TIER_COPY[tier];
	// At the ceiling the actionable number is the limit itself, not the count.
	const shown = isBlocked ? capacity.itemLimit : capacity.itemCount;

	const dismiss = () => {
		// Immutable update, and persist so it survives a reload.
		const next = new Set(dismissed).add(tier);
		setDismissed(next);
		try {
			localStorage.setItem(DISMISS_KEY, JSON.stringify([...next]));
		} catch {
			// Storage full is exactly the condition being warned about — the notice
			// still hides for this session via state, which is the important part.
		}
	};

	return (
		<div
			className={`capacity-notice capacity-notice--${copy.tone}`}
			role={isBlocked ? "alert" : "status"}
		>
			<p className="capacity-notice__message">{copy.message(shown)}</p>

			<div className="capacity-notice__actions">
				<button type="button" className="btn btn--primary capacity-notice__cta" onClick={() => void signIn()}>
					Create account
				</button>
				{!isBlocked && (
					<button
						type="button"
						className="btn btn--ghost capacity-notice__dismiss"
						onClick={dismiss}
						aria-label="Dismiss this reminder"
					>
						Not now
					</button>
				)}
			</div>
		</div>
	);
}
