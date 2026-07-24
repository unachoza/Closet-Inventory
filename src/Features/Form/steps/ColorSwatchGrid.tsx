import "./ColorSwatchGrid.css";

interface ColorSwatchGridProps {
	options: string[];
	selected: string;
	onSelect: (color: string) => void;
}

/* Plain hex fills — no color-mix / CSS range queries (older iOS Safari). */
const SWATCH_FILLS: Record<string, string> = {
	red: "#c0392b",
	brown: "#8d6e63",
	black: "#1c1c1c",
	grey: "#9e9e9e",
	white: "#fafafa",
	floral: "linear-gradient(135deg, #e91e63 0%, #ffc107 50%, #4caf50 100%)",
	blue: "#2f6fb2",
	gold: "#c9a227",
	green: "#3d8b40",
	orange: "#e07b28",
	yellow: "#e8c928",
	pink: "#e58fb1",
	purple: "#7e57c2",
};

/** Tappable color circles (single-select) replacing the old text checkbox column. */
const ColorSwatchGrid = ({ options, selected, onSelect }: ColorSwatchGridProps) => {
	return (
		<div className="color-swatch-grid" role="group" aria-label="Color">
			{options.map((color) => {
				const fill = SWATCH_FILLS[color] ?? color;
				const isGradient = fill.startsWith("linear-gradient");
				const isSelected = selected === color;
				return (
					<button
						key={color}
						type="button"
						className={`color-swatch${isSelected ? " color-swatch--selected" : ""}`}
						aria-pressed={isSelected}
						onClick={() => onSelect(isSelected ? "" : color)}
					>
						<span
							className="color-swatch__circle"
							style={isGradient ? { backgroundImage: fill } : { backgroundColor: fill }}
							aria-hidden="true"
						/>
						<span className="color-swatch__label">{color}</span>
					</button>
				);
			})}
		</div>
	);
};

export default ColorSwatchGrid;
