import type { MaterialBlend } from "../../utils/types";
import { getMaterialColor, blendTotal } from "../../utils/materialUtils";
import "./MaterialCompositionBar.css";

interface MaterialCompositionBarProps {
	blend: MaterialBlend[];
	/** Show the legend below the bar (default true) */
	showLegend?: boolean;
	/** Compact mode: smaller bar height, no legend label text */
	compact?: boolean;
}

const MaterialCompositionBar = ({
	blend,
	showLegend = true,
	compact = false,
}: MaterialCompositionBarProps) => {
	if (blend.length === 0) return null;

	const total = blendTotal(blend);
	// Normalize widths so they always fill 100% of the bar,
	// even if percentages don't add up perfectly.
	const scale = total > 0 ? 100 / total : 1;

	return (
		<div className={`mcb${compact ? " mcb--compact" : ""}`}>
			{/* Segmented bar */}
			<div className="mcb__bar" role="img" aria-label="Material composition">
				{blend.map((b, i) => {
					const color = getMaterialColor(b.material);
					const width = b.percentage * scale;
					return (
						<div
							key={i}
							className="mcb__segment"
							style={{ width: `${width}%`, background: color }}
							title={`${b.material}: ${b.percentage}%`}
						/>
					);
				})}
			</div>

			{/* Legend */}
			{showLegend && (
				<ul className="mcb__legend">
					{blend.map((b, i) => {
						const color = getMaterialColor(b.material);
						return (
							<li key={i} className="mcb__legend-item">
								<span
									className="mcb__legend-swatch"
									style={{ background: color }}
									aria-hidden="true"
								/>
								<span className="mcb__legend-label">
									{b.percentage}%&nbsp;{capitalize(b.material)}
								</span>
							</li>
						);
					})}
				</ul>
			)}
		</div>
	);
};

function capitalize(s: string): string {
	return s ? s.charAt(0).toUpperCase() + s.slice(1) : "";
}

export default MaterialCompositionBar;
