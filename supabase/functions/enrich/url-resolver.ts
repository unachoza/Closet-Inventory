interface UrlTemplate {
	pattern: (name: string, itemNumber?: string) => string;
	search?: (name: string, itemNumber?: string) => string;
}

function slugify(name: string): string {
	return name
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "");
}

// Zara emails have "0/7521/001/700/03" — URL needs "07521001" (first 3 segments, no slashes)
function zaraItemNumberToSku(raw: string): string {
	const digits = raw.replace(/\//g, "");
	console.log({ digits });
	// If already clean digits, try first 8
	if (/^\d+$/.test(digits)) return digits.slice(0, 8);
	// Fallback: strip non-digits
	console.log(digits.slice(0, 8));
	console.log(raw.replace(/\D/g, "").slice(0, 8));
	return raw.replace(/\D/g, "").slice(0, 8);
}

const RETAILER_TEMPLATES: Record<string, UrlTemplate> = {
	aritzia: {
		pattern: (name, itemNumber) => {
			if (itemNumber) {
				const slug = slugify(name);
				return `https://www.aritzia.com/us/en/product/${slug}/${itemNumber}.html`;
			}
			return "";
		},
		search: (name, itemNumber) => {
			const q = encodeURIComponent(itemNumber ? `${name} ${itemNumber}` : name);
			return `https://www.aritzia.com/us/en/search?q=${q}`;
		},
	},
	babaton: {
		pattern: (name, itemNumber) => RETAILER_TEMPLATES.aritzia.pattern(name, itemNumber),
		search: (name, itemNumber) => RETAILER_TEMPLATES.aritzia.search!(name, itemNumber),
	},
	tna: {
		pattern: (name, itemNumber) => RETAILER_TEMPLATES.aritzia.pattern(name, itemNumber),
		search: (name, itemNumber) => RETAILER_TEMPLATES.aritzia.search!(name, itemNumber),
	},
	wilfred: {
		pattern: (name, itemNumber) => RETAILER_TEMPLATES.aritzia.pattern(name, itemNumber),
		search: (name, itemNumber) => RETAILER_TEMPLATES.aritzia.search!(name, itemNumber),
	},
	"wilfred free": {
		pattern: (name, itemNumber) => RETAILER_TEMPLATES.aritzia.pattern(name, itemNumber),
		search: (name, itemNumber) => RETAILER_TEMPLATES.aritzia.search!(name, itemNumber),
	},
	zara: {
		pattern: (name, itemNumber) => {
			if (itemNumber) {
				const sku = zaraItemNumberToSku(itemNumber);
				const slug = slugify(name);
				return `https://www.zara.com/us/en/${slug}-p${sku}.html`;
			}
			return "";
		},
		search: (name) => {
			const q = encodeURIComponent(name);
			return `https://www.zara.com/us/en/search?searchTerm=${q}`;
		},
	},
	anthropologie: {
		pattern: (name) => {
			const slug = slugify(name);
			return `https://www.anthropologie.com/shop/${slug}`;
		},
	},
	nordstrom: {
		pattern: (name, itemNumber) => {
			const slug = slugify(name);
			if (itemNumber) {
				return `https://www.nordstrom.com/s/${slug}/${itemNumber}`;
			}
			return `https://www.nordstrom.com/s/${slug}`;
		},
	},
};

export function resolveProductUrl(retailer: string, name: string, itemNumber?: string): string | null {
	const template = RETAILER_TEMPLATES[retailer];
	if (!template) return null;

	const url = template.pattern(name, itemNumber);
	return url || null;
}

export function resolveSearchUrl(retailer: string, name: string, itemNumber?: string): string | null {
	const template = RETAILER_TEMPLATES[retailer];
	return template?.search?.(name, itemNumber) ?? null;
}

const PRODUCT_URL_PATTERNS: Record<string, RegExp> = {
	aritzia: /https:\/\/www\.aritzia\.com\/[a-z]{2}\/[a-z]{2}\/product\/[^\s"'<>]+/gi,
	zara: /https:\/\/www\.zara\.com\/[a-z]{2}\/[a-z]{2}\/[^\s"'<>]*-p\d+\.html[^\s"'<>]*/gi,
	anthropologie: /https:\/\/www\.anthropologie\.com\/shop\/[^\s"'<>]+/gi,
	nordstrom: /https:\/\/www\.nordstrom\.com\/s\/[^\s"'<>]+/gi,
};

export function extractProductUrlFromSearch(html: string, retailer: string): string | null {
	const pattern = PRODUCT_URL_PATTERNS[retailer];
	if (!pattern) return null;

	pattern.lastIndex = 0;
	const match = pattern.exec(html);
	if (!match) return null;

	return match[0].replace(/&amp;/g, "&");
}
