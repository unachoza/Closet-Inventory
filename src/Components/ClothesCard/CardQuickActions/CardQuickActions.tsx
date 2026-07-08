import { useEffect } from "react";
import type { ClothingItem } from "../../../utils/types";
import {
	availableActions,
	applyStatusAction,
	actionLabel,
	type StatusAction,
} from "../../../utils/statusTransitions";
import { useCloset } from "../../../context/ClosetContext";
import "./CardQuickActions.css";

/**
 * P1-4 — one-tap status quick actions, opened by a long-press on the card front.
 *
 * Mounted only while open, so cards that never long-press never touch `useCloset`
 * (keeps the presentational Card tests provider-free). Each action runs the pure
 * `applyStatusAction` transition and persists via `updateItem` (local + cloud).
 */

// Actions needing extra input (a borrower) belong in the lend modal (E2-5.1),
// not the one-tap menu.
const NEEDS_INPUT: readonly StatusAction[] = ["lend"];

interface CardQuickActionsProps {
	readonly item: ClothingItem;
	readonly onClose: () => void;
}

function humanStatus(status: ClothingItem["status"]): string {
	return (status ?? "clean").replace(/_/g, " ");
}

export function CardQuickActions({ item, onClose }: CardQuickActionsProps) {
	const { updateItem } = useCloset();
	const actions = availableActions(item.status).filter((a) => !NEEDS_INPUT.includes(a));

	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [onClose]);

	const run = (action: StatusAction) => {
		const patch = applyStatusAction(item, action);
		if (patch) updateItem(item.id, patch);
		onClose();
	};

	// stopPropagation on the whole overlay so taps inside never bubble to the card
	// (which would otherwise flip/open) or start a fresh long-press.
	return (
		<div
			className="card-quick-actions"
			onClick={(e) => e.stopPropagation()}
			onPointerDown={(e) => e.stopPropagation()}
		>
			<div className="card-quick-actions__backdrop" onClick={onClose} data-testid="quick-actions-backdrop" />
			<div className="card-quick-actions__panel" role="menu" aria-label="Status quick actions">
				<p className="card-quick-actions__status">{humanStatus(item.status)}</p>
				{actions.length === 0 ? (
					<p className="card-quick-actions__empty">No quick actions</p>
				) : (
					actions.map((a) => (
						<button key={a} type="button" role="menuitem" className="card-quick-actions__item" onClick={() => run(a)}>
							{actionLabel(a)}
						</button>
					))
				)}
			</div>
		</div>
	);
}
