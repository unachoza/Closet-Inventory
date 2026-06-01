const normalizeColor = (color: string): string => {
	const c = color.trim().toLowerCase();

	// BLACK
	if (c.includes("black") || c.includes("charcoal") || c.includes("caviar")) {
		return "Black";
	}

	// WHITE
	if (c.includes("white")) {
		return "White";
	}

	// GREY
	if (c.includes("grey") || c.includes("gray") || c.includes("heather")) {
		return "Grey";
	}

	// BROWN
	if (c.includes("brown") || c.includes("taupe") || c.includes("chocolate") || c.includes("beige") || c.includes("tan") || c.includes("khaki")) {
		return "Brown";
	}

	// PINK
	if (c.includes("pink") || c.includes("raspberry") || c.includes("fuchsia") || c.includes("lollipop") || c.includes("dusty pink")) {
		return "Pink";
	}

	// RED / BURGUNDY
	if (c.includes("red") || c.includes("burgundy")) {
		return "Red";
	}

	// GREEN
	if (c.includes("green") || c.includes("olive") || c.includes("oil")) {
		return "Green";
	}

	// BLUE
	if (c.includes("blue") || c.includes("ocean") || c.includes("midnight")) {
		return "Blue";
	}

	// PURPLE
	if (c.includes("purple") || c.includes("dewberry")) {
		return "Purple";
	}

	// ORANGE
	if (c.includes("orange")) {
		return "Orange";
	}

	// PRINT / PATTERN
	if (c.includes("floral") || c.includes("print")) {
		return "Pattern";
	}

	// fallback
	return color.trim();
};

// Separators used when an item lists more than one color, e.g. "brown / taupe",
// "blue, white", "red & black". Multi-word single colors ("heather dark grey")
// have no separator and stay as one group.
const COLOR_SPLIT = /\s*\/\s*|\s*,\s*|\s*&\s*|\s*\+\s*|\s+and\s+/i;

// Expand a raw color string into its distinct normalized color groups.
// "brown / taupe" → ["Brown"]; "blue / white" → ["Blue", "White"].
export const normalizeColorGroups = (color: string): string[] => {
	const parts = color
		.split(COLOR_SPLIT)
		.map((p) => p.trim())
		.filter(Boolean);
	const source = parts.length > 0 ? parts : [color];
	return Array.from(new Set(source.map(normalizeColor)));
};

export default normalizeColor;
