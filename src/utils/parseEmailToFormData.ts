import type { ItemFormData } from "./types";
import { formItem } from "./constants";
import { parseInlineColorSize, stripBrandFromName, extractColorFromName } from "./parseNameHelpers";
import normalizeColor from "./normalizeColors";
import { extractBrandFromSender } from "./parseProductsFromEmail";
import { inferStyleTagsFromName } from "./inferStyleTagsFromName";
import { cleanProductName } from "./cleanProductName";
import { inferProductAttributes } from "./inferProductAttributes";
import { inferMaterialFromName } from "./inferMaterialFromName";
import { inferCareFromMaterial } from "./inferCareFromMaterial";
import { inferSemanticAttributes } from "./inferSemanticAttributes";
import { defaultConditionForPurchaseDate } from "./condition";

const BRAND_PATTERNS: Record<string, string> = {
	aritzia: "aritzia",
	zara: "zara",
	"banana republic": "banana republic",
	"old navy": "old navy",
	oldnavy: "old navy",
	target: "target",
	gap: "gap",
	"forever 21": "forever 21",
	"h&m": "h&m",
	uniqlo: "uniqlo",
	nordstrom: "nordstrom",
	anthropologie: "anthropologie",
	everlane: "everlane",
	express: "express",
	fenty: "fenty",
	"lulu lemon": "lulu lemon",
	lululemon: "lulu lemon",
	nike: "nike",
	adidas: "adidas",
	mango: "mango",
	asos: "asos",
	shein: "shein",
	skims: "skims",
	"free people": "free people",
	reformation: "reformation",
	thredup: "thredup",
	"thred up": "thredup",
	poshmark: "poshmark",
	cuup: "cuup",
	cider: "cider",
	"princess polly": "princess polly",
	princesspolly: "princess polly",
	temu: "temu",
	depop: "depop",
	ebay: "ebay",
	amazon: "amazon",
};

const CATEGORY_KEYWORDS: Record<string, string> = {
	dress: "dresses",
	skirt: "bottoms",
	pant: "bottoms",
	jean: "bottoms",
	culottes: "bottoms",
	trouser: "bottoms",
	short: "bottoms",
	top: "tops",
	blouse: "tops",
	shirt: "tops",
	"t-shirt": "tops",
	tee: "tops",
	tank: "tops",
	sweater: "sweaters",
	hoodie: "sweaters",
	cardigan: "sweaters",
	coat: "coats",
	jacket: "coats",
	blazer: "coats",
	bra: "lingerie",
	lingerie: "lingerie",
	plunge: "lingerie",
	balconette: "lingerie",
	demi: "lingerie",
	scoop: "lingerie",
	racerback: "lingerie",
	underwire: "lingerie",
	padded: "lingerie",
	unpadded: "lingerie",
	sock: "socks",
	tights: "socks",
	underwear: "underwear",
	legging: "active",
	sports: "active",
	bodysuit: "body",
	jumpsuit: "body",
	skort: "bottoms",
	cheeky: "underwear",
	thong: "underwear",
	briefs: "underwear",
	brief: "underwear",
	panty: "underwear",
	bikini: "lingerie",
	teddy: "lingerie",
	intimate: "lingerie",
	shoe: "shoes",
	boot: "shoes",
	loafer: "shoes",
	slipper: "shoes",
	sandal: "shoes",
	sneaker: "shoes",
	heel: "shoes",
	flat: "shoes",
	mule: "shoes",
	slingback: "shoes",
	pump: "shoes",
	wedge: "shoes",
	clog: "shoes",
	platform: "shoes",
};

function extractBrand(text: string, from: string): string {
	const combined = `${from} ${text}`.toLowerCase();
	for (const [pattern, brand] of Object.entries(BRAND_PATTERNS)) {
		if (combined.includes(pattern)) {
			return brand;
		}
	}
	return "";
}

function extractCategory(text: string): string {
	const lower = text.toLowerCase();
	for (const [keyword, category] of Object.entries(CATEGORY_KEYWORDS)) {
		if (lower.includes(keyword)) {
			return category;
		}
	}
	return "";
}

/** Returns the clothing category for a product name, or "" if none matches. */
export function categoryFromName(name: string): string {
	return extractCategory(name);
}

function stripHtml(html: string): string {
	const parser = new DOMParser();
	const doc = parser.parseFromString(html, "text/html");
	return doc.body.textContent ?? "";
}

export function parseEmailToFormData(subject: string, body: string, from: string, date?: string): Partial<ItemFormData> {
	const plainBody = stripHtml(body);
	const combinedText = `${subject} ${plainBody}`;
	// Brand from a known pattern in the subject/body/sender; otherwise fall back
	// to the email sender (e.g. an Old Navy receipt has no brand text — the
	// "Old Navy" sender becomes the brand).

	const brand = extractBrand(combinedText, from) || extractBrandFromSender(from);
	const category = extractCategory(combinedText);
	const styleTags = inferStyleTagsFromName(combinedText, category);

	// Inline color/size extraction (e.g. Poshmark: "...in burgundy size M")
	const { color: inlineColor, size: inlineSize } = parseInlineColorSize(subject);
	// Fallback: scan product name for a known color word (e.g. "Deep Taupe" in Aritzia subjects)
	const color = normalizeColor(inlineColor || extractColorFromName(subject));

	// Clean name: strip brand prefix, gender junk, SEO noise, inline color/size suffix
	const nameFromSubject = stripBrandFromName(subject, brand);
	const cleanedName = cleanProductName(nameFromSubject);
	// Product attributes from the raw (uncleaned) name
	const attrs = inferProductAttributes(subject);

	const semantic = inferSemanticAttributes(combinedText);

	const inferencedMaterial = inferMaterialFromName(combinedText);
	const inferencedCare = inferCareFromMaterial(inferencedMaterial);

	// Purchase date drives the factual age shown on the card.
	const parsed = new Date(date ?? "");
	const purchaseDate = date && !isNaN(parsed.getTime()) ? parsed.toISOString() : undefined;

	const result = {
		...formItem,
		brand,
		category,
		...(cleanedName && { name: cleanedName }),
		...(color && { color }),
		...(inlineSize && { size: inlineSize }),
		material: inferencedMaterial,
		...(inferencedCare.length > 0 && { care: inferencedCare }),
		occasion: styleTags[0] ?? "",
		// Default condition is seeded from the order's age (a years-old purchase
		// shouldn't default to "new"). The user can adjust it during import review.
		// Factual age comes from purchaseDate.
		condition: defaultConditionForPurchaseDate(purchaseDate),
		...(purchaseDate ? { purchaseDate } : {}),
		...attrs,
		...semantic,
	};

	return result;
}
