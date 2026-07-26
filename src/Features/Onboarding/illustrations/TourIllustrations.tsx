/**
 * Line-art illustrations for the tour, in the brand's editorial style: espresso
 * strokes with terracotta accents (see OnboardingFlow.css for the variables).
 * Decorative only — every consumer pairs them with a real heading.
 */

import { DRESS_FILL_D, DRESS_HIGHLIGHT_D, DRESS_OUTLINE_D, DRESS_VIEWBOX } from "./dressPaths";

const strokeProps = {
	fill: "none",
	stroke: "currentColor",
	strokeWidth: 2.2,
	strokeLinecap: "round",
	strokeLinejoin: "round",
} as const;

export function WelcomeIllustration() {
	return (
		<svg viewBox="0 0 120 90" {...strokeProps} aria-hidden="true">
			<path d="M60 18a6 6 0 1 1 6-6c0 4-6 4-6 10v4" />
			<path d="M60 26 22 52c-3 2-1.5 7 2 7h72c3.5 0 5-5 2-7L60 26Z" />
			<path className="onb-ill-accent" d="M40 72h40M44 80h32" strokeWidth={1.8} />
		</svg>
	);
}

/**
 * Envelope → dress: an order confirmation becoming a catalogued garment. The
 * dress is the actual reference art from src/assets/dress&SuitSVG.svg (see
 * dressPaths.ts), not a redrawn approximation, so its curves match exactly.
 */
export function EmailImportIllustration() {
	return (
		<svg viewBox="0 0 120 90" {...strokeProps} aria-hidden="true">
			<rect x="8" y="33" width="44" height="34" rx="4" />
			<path d="m8 37 22 16 22-16" />
			<path className="onb-ill-accent" d="M60 50h12" />
			<path className="onb-ill-accent" d="m67 44 7 6-7 6" />
			<svg x="76" y="16" width="36" height="64.65" viewBox={DRESS_VIEWBOX}>
				<path fill="var(--primitive-brand-rose-terracotta)" stroke="none" d={DRESS_FILL_D} />
				<path fill="var(--bg-canvas)" stroke="none" d={DRESS_HIGHLIGHT_D} />
				<path fill="currentColor" stroke="none" d={DRESS_OUTLINE_D} />
			</svg>
		</svg>
	);
}

/**
 * Laundry basket, after src/assets/laundryBASKET copy.svg (a wide, shallow
 * woven hamper overflowing with a pile of clothes) — kept as line art with a
 * sparse diagonal weave and a terracotta pile instead of the reference's
 * dense crosshatch, to match the rest of the tour's icon weight.
 */
export function CareIllustration() {
	return (
		<svg viewBox="0 0 120 90" {...strokeProps} aria-hidden="true">
			<path d="M24 34c1-6 7-8 10-3" />
			<path d="M96 34c-1-6-7-8-10-3" />
			<path d="M28 38h64" />
			<path d="M28 38 42 68a4 4 0 0 0 4 3h28a4 4 0 0 0 4-3l14-30" />
			<path className="onb-ill-accent" strokeWidth={1.6} d="M38 44 54 62M50 44 66 62M62 44 78 60" />
			<path className="onb-ill-accent" strokeWidth={1.6} d="M54 44 38 62M66 44 50 62M78 44 62 60" />
		</svg>
	);
}

/** Three shopping bags: items added by hand instead of arriving by email. */
export function AddItemIllustration() {
	return (
		<svg viewBox="0 0 120 90" {...strokeProps} aria-hidden="true">
			<svg viewBox="0 0 120 90" {...strokeProps} aria-hidden="true">
				{/* Left bag — turned slightly toward center */}
				<path d="M10 43L34 39L43 43L43 69L18 73L10 68Z" fill="var(--pill-backdrop-pastel-terrocata)" />

				{/* Left bag side gusset */}
				<path d="M34 39L43 43L43 69L36 65Z" fill="var(--Light-hover-highlight)" />

				{/* Left bag handle */}
				<path d="M17 42C18 34 22 30 27 30C32 30 35 34 35 39" />

				{/* Center bag — front facing */}
				<path d="M41 24H84L81 70H44Z" fill="var(--Light-hover-highlight)" />

				{/* Center bag handle */}
				<path d="M52 24C52 15 58 11 63 11C69 11 75 16 75 24" />

				{/* Right bag — turned slightly toward center */}
				<path d="M82 43L91 39L110 44L108 71L84 68Z" fill="var(--Light-hover-highlight)" />

				{/* Right bag side gusset */}
				<path d="M82 43L91 39L91 65L84 68Z" fill="var(--pill-backdrop-pastel-terrocata)" />

				{/* Right bag handle */}
				<path d="M90 40C91 33 95 30 99 31C104 32 107 37 107 44" />

				{/* Subtle construction lines */}
				<path
					className="onb-ill-accent"
					strokeWidth={1.2}
					d="
			M13 49L35 45
			M86 48L107 52
			M47 64H78
		"
				/>
			</svg>
		</svg>
	);
}

export function SearchIllustration() {
	return (
		<svg viewBox="0 0 120 80" {...strokeProps} aria-hidden="true">
			<circle cx="54" cy="34" r="17" />
			<path className="onb-ill-accent" d="m67 47 16 16" />
			<path className="onb-ill-accent" d="M47 34c0-4.5 3.2-7 7-7" strokeWidth={1.8} />
		</svg>
	);
}
