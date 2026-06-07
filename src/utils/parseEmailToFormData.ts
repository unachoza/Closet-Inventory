import type { ItemFormData } from "./types";
import { formItem } from "./constants";
import { inferStyleTagsFromName } from "./inferStyleTagsFromName";
import { inferMaterialFromName } from "./inferMaterialFromName";
import { inferCareFromMaterial } from "./inferCareFromMaterial";
import { inferProductAttributes } from "./inferProductAttributes";
import { cleanProductName } from "./cleanProductName";
import { parseInlineColorSize, stripBrandFromName } from "./parseNameHelpers";
import { extractBrandFromSender } from "./parseProductsFromEmail";
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
	brief: "underwear",
	panty: "underwear",
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

export function parseEmailToFormData(subject: string, body: string, from: string, date?: string): Partial<ItemFormData> {
	const plainBody = stripHtml(body);
	const combinedText = `${subject} ${plainBody}`;
	// Brand from a known pattern in the subject/body/sender; otherwise fall back
	// to the email sender (e.g. an Old Navy receipt has no brand text — the
	// "Old Navy" sender becomes the brand).
	const brand = extractBrand(combinedText, from) || extractBrandFromSender(from);
	const category = extractCategory(combinedText);
	const styleTags = inferStyleTagsFromName(combinedText, category);

	const parsed = new Date(date ?? "");
	const purchaseDate = date && !isNaN(parsed.getTime()) ? parsed.toISOString() : undefined;

	return {
		...formItem,
		brand: extractBrand(combinedText, from),
		category: extractCategory(combinedText),
		// Imported items default to "new" condition; the user can adjust this during
		// import review (e.g. for older orders). Factual age comes from purchaseDate.
		condition: "new",
		...(purchaseDate ? { purchaseDate } : {}),
	};
}
