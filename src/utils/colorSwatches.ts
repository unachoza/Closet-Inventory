import { colorOptions } from "./constants";

/** Swatch fill for each color option — solid hex, or a gradient for multi-tone options. */
export const colorSwatchFills: Record<(typeof colorOptions)[number], string> = {
	red: "#c0392b",
	brown: "#6b4a35",
	black: "#1c1c1c",
	grey: "#9a9a9a",
	white: "#f5f5f0",
	floral: "linear-gradient(135deg, #f4c2c2 0%, #a8c69f 50%, #e8a5c4 100%)",
	blue: "#3b6ea5",
	gold: "#c9a24b",
	green: "#5a7d4d",
	orange: "#d9822b",
	yellow: "#e6c229",
	pink: "#d98ba9",
	purple: "#7a5c99",
};

export const getColorSwatchFill = (color: string): string => colorSwatchFills[color] ?? "transparent";
