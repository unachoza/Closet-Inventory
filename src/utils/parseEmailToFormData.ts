import type { ItemFormData } from "./types";
import { formItem } from "./constants";
import { inferStyleTagsFromName } from "./inferStyleTagsFromName";
import { inferMaterialFromName } from "./inferMaterialFromName";
import { inferProductAttributes } from "./inferProductAttributes";
import { cleanProductName } from "./cleanProductName";
import { parseInlineColorSize, stripBrandFromName } from "./parseNameHelpers";

const BRAND_PATTERNS: Record<string, string> = {
	aritzia: "aritzia",
	zara: "zara",
	"banana republic": "banana republic",
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
	sock: "socks",
	underwear: "underwear",
	legging: "active",
	sports: "active",
	bodysuit: "body",
	jumpsuit: "body",
	skort: "bottoms",
	balconette: "lingerie",
	plunge: "lingerie",
	thong: "underwear",
	briefs: "underwear",
	bikini: "lingerie",
	teddy: "lingerie",
	intimate: "lingerie",
	boots: "shoes",
	loafers: "shoes",
	slipper: "shoes",
	sandal: "shoes",
	sneaker: "shoes",
	heel: "shoes",
	flat: "shoes",
	mule: "shoes",
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

function stripHtml(html: string): string {
	const parser = new DOMParser();
	const doc = parser.parseFromString(html, "text/html");
	return doc.body.textContent ?? "";
}

export function parseEmailToFormData(subject: string, body: string, from: string): Partial<ItemFormData> {
	const plainBody = stripHtml(body);
	const combinedText = `${subject} ${plainBody}`;
	const brand = extractBrand(combinedText, from);
	const category = extractCategory(combinedText);
	const styleTags = inferStyleTagsFromName(combinedText, category);

	// Inline color/size extraction (e.g. Poshmark: "...in burgundy size M")
	const { color: inlineColor, size: inlineSize } = parseInlineColorSize(subject);

	// Clean name: strip brand prefix, gender junk, SEO noise, inline color/size suffix
	const nameFromSubject = stripBrandFromName(subject, brand);
	const cleanedName = cleanProductName(nameFromSubject);

	// Product attributes from the raw (uncleaned) name
	const attrs = inferProductAttributes(subject);

	return {
		...formItem,
		brand,
		category,
		...(cleanedName && { name: cleanedName }),
		...(inlineColor && { color: inlineColor }),
		...(inlineSize && { size: inlineSize }),
		material: inferMaterialFromName(combinedText),
		occasion: styleTags[0] ?? "",
		age: "new",
		...attrs,
	};
}
