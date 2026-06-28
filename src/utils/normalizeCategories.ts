// Maps singular / variant category names onto a single canonical (plural) form
// so "dress" and "dresses", "top" and "tops" land in the same filter bucket.
const CATEGORY_GROUPS: Record<string, string> = {
	top: "tops",
	tops: "tops",
	bottom: "bottoms",
	bottoms: "bottoms",
	dress: "dresses",
	dresses: "dresses",
	coat: "coats",
	coats: "coats",
	sweater: "sweaters",
	sweaters: "sweaters",
	intimates: "intimates",
	// "active" is the legacy label for athleisure — fold it into the canonical bucket.
	active: "athleisure",
	athleisure: "athleisure",
	sock: "socks",
	socks: "socks",
	underwear: "underwear",
	shoe: "shoes",
	shoes: "shoes",
};

const normalizeCategory = (category: string): string => {
	const c = category.trim().toLowerCase();
	if (!c) return category.trim();
	return CATEGORY_GROUPS[c] ?? c;
};

export default normalizeCategory;
