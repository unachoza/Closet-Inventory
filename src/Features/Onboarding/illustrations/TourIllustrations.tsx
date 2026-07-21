/**
 * Line-art illustrations for the tour, in the brand's editorial style: espresso
 * strokes with terracotta accents (see OnboardingFlow.css for the variables).
 * Decorative only — every consumer pairs them with a real heading.
 */

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

export function EmailImportIllustration() {
	return (
		<svg viewBox="0 0 120 90" {...strokeProps} aria-hidden="true">
			<rect x="12" y="24" width="46" height="34" rx="4" />
			<path d="m12 28 23 17 23-17" />
			<path className="onb-ill-accent" d="M64 46h14" />
			<path className="onb-ill-accent" d="m74 40 8 6-8 6" />
			<path d="M94 28c-2-4-10-4-10 2 0 4 4 5 4 9h12c0-4 4-5 4-9 0-6-8-6-10-2Z" />
			<path d="M88 39v14a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V39" />
		</svg>
	);
}

export function CareIllustration() {
	return (
		<svg viewBox="0 0 120 90" {...strokeProps} aria-hidden="true">
			<path d="M38 14h30l14 14v40a4 4 0 0 1-4 4H38a4 4 0 0 1-4-4V18a4 4 0 0 1 4-4Z" />
			<path d="M68 14v14h14" />
			<circle className="onb-ill-accent" cx="53" cy="46" r="7" />
			<path className="onb-ill-accent" d="M48 62c1.5-3 8.5-3 10 0" />
			<path className="onb-ill-accent" d="M44 26h10" strokeWidth={1.8} />
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
