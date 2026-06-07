// Matches "...in dusty pink size M" or "...in ivory" or "...size XS"
const INLINE_IN_COLOR_RE = /\s+in\s+([a-z][a-z\s]+?)(?=\s+size\s|\s*$)/i;
const INLINE_SIZE_RE = /\s+size\s+(\S+)\s*$/i;

// Size qualifiers to strip from SHEIN's "COLOR-Petite S" / "COLOR-Plus 2XL" format
const SIZE_QUALIFIER_RE = /^(petite|plus|tall)\s+/i;

export function parseInlineColorSize(name: string): { color: string; size: string } {
	let color = "";
	let size = "";

	const colorMatch = name.match(INLINE_IN_COLOR_RE);
	if (colorMatch) color = colorMatch[1].trim().toLowerCase();

	const sizeMatch = name.match(INLINE_SIZE_RE);
	if (sizeMatch) size = sizeMatch[1].trim();

	return { color, size };
}

export function parseSHEINSizeField(sizeField: string): { color: string; size: string } {
	const dashIdx = sizeField.indexOf("-");
	if (dashIdx === -1) return { color: "", size: sizeField.trim() };

	const colorPart = sizeField.slice(0, dashIdx).trim().toLowerCase();
	const sizePart = sizeField.slice(dashIdx + 1).trim().replace(SIZE_QUALIFIER_RE, "").trim();

	return { color: colorPart, size: sizePart };
}

export function stripBrandFromName(name: string, brand: string): string {
	if (!brand) return name;

	// Only strip when brand appears at the very start (case-insensitive)
	const escaped = brand.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	return name.replace(new RegExp(`^${escaped}\\s+`, "i"), "").trim();
}
