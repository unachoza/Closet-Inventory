import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";

/**
 * "Dry clean" care icon, sourced from assets/care-icons/dry-cleaning.svg. Not
 * imported as an asset URL (the codebase's usual pattern for one-off SVGs,
 * e.g. utils/constants.ts's category icons) because CARE_MAP's icon slot is
 * rendered as a component — `<c.icon size={15} className="..." />` (see
 * CardDetails.tsx) — matching Lucide's calling convention, not `<img src>`.
 *
 * The source file hardcodes `fill="#fff"` (meant for a colored badge
 * background), which is invisible against the care pill's light
 * `--bg-surface-secondary` background and can't be recolored via `<img>`.
 * Inlined here as real JSX with `fill="currentColor"` instead, so it tracks
 * `color` the same way every Lucide icon does — pill text color, hover
 * states, light/dark theme — with no separate masking mechanism to maintain.
 *
 * The path is a solid silhouette (fill only, no stroke in the source), so a
 * bare `stroke-width` does nothing without `stroke` paint to widen. `stroke`
 * is set here to the same color as the fill, so `strokeWidth` thickens the
 * silhouette's outline — same visual effect a stroke-width bump has on a
 * Lucide line icon. The viewBox is `0 0 1200 1200`, 50x Lucide's `0 0 24 24`,
 * so `strokeWidth` is scaled by that ratio: passing `strokeWidth={2}` (Lucide's
 * default) reads as the same relative thickness Lucide icons render at.
 */
const VIEWBOX_SIZE = 1200;
const LUCIDE_VIEWBOX_SIZE = 24;
const SCALE = VIEWBOX_SIZE / LUCIDE_VIEWBOX_SIZE / 2;

const DryCleanIcon = forwardRef<SVGSVGElement, LucideProps>(({ size = 24, color = "currentColor", strokeWidth = 2, ...rest }, ref) => (
	<svg
		ref={ref}
		xmlns="http://www.w3.org/2000/svg"
		width={size}
		height={size}
		viewBox={`0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`}
		fill={color}
		stroke={color}
		strokeWidth={Number(strokeWidth) * SCALE}
		strokeLinejoin="round"
		{...rest}
	>
		<path d="m638.86 322.6h-20.625v-14.391c0-10.219 6.0938-19.359 15.562-23.297l8.3906-3.5156c28.125-11.766 46.312-39.047 46.312-69.562v-22.172c0-42.516-34.594-77.156-77.156-77.156h-22.641c-42.562 0-77.156 34.594-77.156 77.156 0 10.078 8.1562 18.234 18.234 18.234s18.234-8.1562 18.234-18.234c0-22.406 18.234-40.641 40.641-40.641h22.641c22.406 0 40.641 18.234 40.641 40.641v22.172c0 15.75-9.375 29.812-23.906 35.859l-8.3906 3.5156c-23.062 9.6562-37.922 32.016-37.922 57v14.391h-20.625c-162.28 0-294.28 132-294.28 294.28v452.39c0 10.078 8.1562 18.234 18.234 18.234h629.86c10.078 0 18.234-8.1562 18.234-18.234v-452.39c0-162.28-132-294.28-294.28-294.28zm-335.53 294.28c0-142.18 115.64-257.81 257.76-257.81h20.625v691.92h-278.44v-434.11zm593.34 434.11h-278.44v-691.92h20.625c142.18 0 257.81 115.64 257.81 257.81z" />
	</svg>
));

DryCleanIcon.displayName = "DryCleanIcon";

export default DryCleanIcon;
