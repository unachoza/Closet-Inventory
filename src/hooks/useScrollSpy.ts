import { RefObject, useEffect, useState } from "react";

/** Thickness of the "read band". Sections are contiguous, so a thin band
 *  is crossed by exactly one section at a time — no tie-breaking guesswork. */
const BAND_PX = 8;

const readRootPx = (name: string, fallback: number): number => {
	if (typeof window === "undefined") return fallback;
	const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
	const parsed = Number.parseFloat(raw);
	return Number.isFinite(parsed) ? parsed : fallback;
};

/**
 * Returns the id of the section currently crossing a thin horizontal band just
 * below the sticky chrome (app NavBar + sticky TOC).
 *
 * Why not `threshold`: a threshold-based observer asks "is N% of the element on
 * screen?". Some sections are several viewports tall, so that percentage of
 * them can never fit in the viewport — the callback never fires and the
 * highlight freezes. A rootMargin band collapses the viewport to a thin strip,
 * which any section of any height can intersect.
 *
 * @param ids       section ids in document order (order is the tie-break)
 * @param chromeRef the sticky TOC element, whose height offsets the band
 */
export function useScrollSpy(ids: readonly string[], chromeRef: RefObject<HTMLElement | null>): string {
	const [activeId, setActiveId] = useState<string>(ids[0] ?? "");

	useEffect(() => {
		if (typeof IntersectionObserver === "undefined") return;

		let observer: IntersectionObserver | null = null;
		const inBand = new Map<string, boolean>();

		const connect = () => {
			observer?.disconnect();
			// Band sits directly under the app NavBar + the sticky TOC strip.
			const chromeTop = readRootPx("--header-height", 56) + (chromeRef.current?.offsetHeight ?? 0);
			const bandBottom = Math.max(0, window.innerHeight - chromeTop - BAND_PX);

			observer = new IntersectionObserver(
				(entries) => {
					entries.forEach((entry) => inBand.set(entry.target.id, entry.isIntersecting));
					// ids are in document order, so the first flagged id is the topmost
					// section touching the band. Immutable read — no last-writer-wins.
					const next = ids.find((id) => inBand.get(id) === true);
					if (next) setActiveId(next);
				},
				{ root: null, rootMargin: `-${chromeTop}px 0px -${bandBottom}px 0px`, threshold: 0 },
			);

			ids.forEach((id) => {
				const el = document.getElementById(id);
				if (el) observer?.observe(el);
			});
		};

		connect();

		// rootMargin is computed in px, so it must be rebuilt when the viewport or
		// the TOC strip (which wraps on narrow screens) changes size.
		const onResize = () => connect();
		window.addEventListener("resize", onResize);
		window.addEventListener("orientationchange", onResize);

		return () => {
			window.removeEventListener("resize", onResize);
			window.removeEventListener("orientationchange", onResize);
			observer?.disconnect();
		};
	}, [ids, chromeRef]);

	return activeId;
}
