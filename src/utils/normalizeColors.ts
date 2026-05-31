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

export default normalizeColor;
