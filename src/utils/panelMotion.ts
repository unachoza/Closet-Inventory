/**
 * Shared reveal motion for dropdown panels (PillComboField, MaterialCombobox).
 *
 * Fade + a short downward slide, not a height 0 → auto unroll. The unroll needs
 * an `overflow: hidden` wrapper to clip the growing box, and that wrapper clips
 * the panel's own content whenever the height animation doesn't resolve — which
 * left both panels stuck at `height: 0` showing only a sliver of the option
 * list. Transform/opacity has no such failure mode: the panel is always at its
 * natural size, so nothing can be cut off, and it stays on the compositor.
 */
export const PANEL_REVEAL_TRANSITION = { type: "spring", bounce: 0.16, visualDuration: 0.28 } as const;

/** Reduced motion: keep the state change legible, drop the travel. */
export const PANEL_REVEAL_TRANSITION_REDUCED = { duration: 0.12 } as const;

/** Distance the panel travels on open, in px. Small — a hint of motion, not a drop. */
const PANEL_SLIDE_PX = 6;

export const panelRevealProps = (reduced: boolean) => ({
	initial: reduced ? { opacity: 0 } : { opacity: 0, y: -PANEL_SLIDE_PX },
	animate: reduced ? { opacity: 1 } : { opacity: 1, y: 0 },
	exit: reduced ? { opacity: 0 } : { opacity: 0, y: -PANEL_SLIDE_PX },
	transition: reduced ? PANEL_REVEAL_TRANSITION_REDUCED : PANEL_REVEAL_TRANSITION,
});
