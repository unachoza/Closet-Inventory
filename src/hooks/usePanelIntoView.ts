import { useCallback, useEffect, useRef } from "react";

/** Breathing room left between the panel's bottom edge and the clipping edge. */
const PANEL_CLEARANCE_PX = 12;

/**
 * Scroll duration. The native `scrollBy({ behavior: "smooth" })` has no
 * speed control and reads as an abrupt snap over these short distances, so the
 * scroll is animated here instead.
 */
const SCROLL_DURATION_MS = 620;

/** easeInOutCubic — slow start and finish, so the motion reads as deliberate. */
function easeInOutCubic(t: number): number {
	return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function prefersReducedMotion(): boolean {
	return typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Nearest ancestor that both clips overflow and can actually scroll. In the
 * edit form that's `.form-fields` (`overflow-y: auto`); `.edit-form` above it
 * is `overflow: hidden`, which clips but can't be scrolled, so it's skipped.
 * Returns null when nothing scrolls (e.g. jsdom, where every measurement is 0).
 */
function findScrollableAncestor(el: HTMLElement): HTMLElement | null {
	let node = el.parentElement;
	while (node) {
		const { overflowY } = getComputedStyle(node);
		if (/(auto|scroll|overlay)/.test(overflowY) && node.scrollHeight > node.clientHeight) return node;
		node = node.parentElement;
	}
	return null;
}

/**
 * Keeps an absolutely-positioned dropdown panel fully visible.
 *
 * A panel that opens near the bottom of a scrollable field area (`.form-fields`
 * in the edit form) extends past that container's edge and is clipped — hiding
 * the tail of the option list and the Done button, with no way to reach them.
 * This measures the collision and scrolls the container just far enough to
 * bring the whole panel into view.
 *
 * Returns a `run` callback so a caller can re-check at a moment of its
 * choosing — notably after a reveal animation settles, since a panel measured
 * mid-animation hasn't reached its full height yet. `run` is also safe to call
 * during the animation: it measures against the panel's natural content height
 * (`scrollHeight`) rather than its current animated height.
 */
export function usePanelIntoView<T extends HTMLElement>(panelRef: React.RefObject<T | null>, isOpen: boolean, extraDep?: unknown) {
	const cancelRef = useRef<(() => void) | null>(null);

	const run = useCallback(() => {
		const panel = panelRef.current;
		if (!panel) return;

		const scroller = findScrollableAncestor(panel);
		if (!scroller) return;

		const rect = panel.getBoundingClientRect();
		// Mid-animation the rect is short; scrollHeight already reports the full
		// content, so the larger of the two is the height to plan against.
		const naturalBottom = rect.top + Math.max(rect.height, panel.scrollHeight);
		const delta = naturalBottom - scroller.getBoundingClientRect().bottom + PANEL_CLEARANCE_PX;
		if (delta <= 0) return;

		// Never scroll past the container's own end.
		const maxScroll = scroller.scrollHeight - scroller.clientHeight - scroller.scrollTop;
		const distance = Math.min(delta, maxScroll);
		if (distance <= 0) return;

		cancelRef.current?.();

		if (prefersReducedMotion() || typeof requestAnimationFrame !== "function") {
			scroller.scrollTop += distance;
			return;
		}

		const startTop = scroller.scrollTop;
		const startTime = performance.now();
		let frame = 0;

		const step = (now: number) => {
			const t = Math.min(1, (now - startTime) / SCROLL_DURATION_MS);
			scroller.scrollTop = startTop + distance * easeInOutCubic(t);
			if (t < 1) frame = requestAnimationFrame(step);
			else cancelRef.current = null;
		};
		frame = requestAnimationFrame(step);
		cancelRef.current = () => cancelAnimationFrame(frame);
	}, [panelRef]);

	useEffect(() => {
		if (isOpen) run();
	}, [isOpen, extraDep, run]);

	// Abandon an in-flight scroll if the panel closes or unmounts, so it can't
	// keep moving the container out from under whatever the user does next.
	useEffect(() => {
		if (!isOpen) cancelRef.current?.();
	}, [isOpen]);
	useEffect(() => () => cancelRef.current?.(), []);

	return run;
}
