import { useCallback, useRef } from "react";

/**
 * P1-4 — press-and-hold gesture for card quick actions, pointer-based so it works
 * identically with mouse and touch (no PWA needed).
 *
 * Design notes for the web pitfalls:
 *  - A hold that fires `onLongPress` **suppresses the following `onClick`**, so the
 *    card doesn't also flip/open on release.
 *  - Movement beyond `moveTolerance` cancels the timer (it's a scroll/drag, not a
 *    hold), so long-press never hijacks scrolling.
 *  - `onContextMenu` is prevented — on touch, a long-press otherwise triggers the
 *    native callout / context menu over our own.
 */

export interface UseLongPressOptions {
	readonly onLongPress: () => void;
	readonly onClick?: () => void;
	/** Hold duration in ms before `onLongPress` fires. */
	readonly delay?: number;
	/** Movement (px) that cancels the hold. */
	readonly moveTolerance?: number;
}

export interface LongPressHandlers {
	onPointerDown: (e: React.PointerEvent) => void;
	onPointerMove: (e: React.PointerEvent) => void;
	onPointerUp: () => void;
	onPointerLeave: () => void;
	onClick: () => void;
	onContextMenu: (e: React.SyntheticEvent) => void;
}

const DEFAULT_DELAY = 500;
const DEFAULT_MOVE_TOLERANCE = 10;

export function useLongPress({
	onLongPress,
	onClick,
	delay = DEFAULT_DELAY,
	moveTolerance = DEFAULT_MOVE_TOLERANCE,
}: UseLongPressOptions): LongPressHandlers {
	const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const firedRef = useRef(false); // long-press fired this cycle → swallow the click
	const startRef = useRef<{ x: number; y: number } | null>(null);

	const clearTimer = useCallback(() => {
		if (timerRef.current !== null) {
			clearTimeout(timerRef.current);
			timerRef.current = null;
		}
	}, []);

	const onPointerDown = useCallback(
		(e: React.PointerEvent) => {
			firedRef.current = false;
			startRef.current = { x: e.clientX, y: e.clientY };
			clearTimer();
			timerRef.current = setTimeout(() => {
				firedRef.current = true;
				timerRef.current = null;
				onLongPress();
			}, delay);
		},
		[clearTimer, delay, onLongPress],
	);

	const onPointerMove = useCallback(
		(e: React.PointerEvent) => {
			const start = startRef.current;
			if (!start || timerRef.current === null) return;
			const dx = Math.abs(e.clientX - start.x);
			const dy = Math.abs(e.clientY - start.y);
			if (dx > moveTolerance || dy > moveTolerance) clearTimer();
		},
		[clearTimer, moveTolerance],
	);

	const onPointerUp = useCallback(() => clearTimer(), [clearTimer]);
	const onPointerLeave = useCallback(() => clearTimer(), [clearTimer]);

	const handleClick = useCallback(() => {
		// Swallow the click that trails a long-press so the card doesn't also open.
		if (firedRef.current) {
			firedRef.current = false;
			return;
		}
		onClick?.();
	}, [onClick]);

	const onContextMenu = useCallback((e: React.SyntheticEvent) => e.preventDefault(), []);

	return {
		onPointerDown,
		onPointerMove,
		onPointerUp,
		onPointerLeave,
		onClick: handleClick,
		onContextMenu,
	};
}
