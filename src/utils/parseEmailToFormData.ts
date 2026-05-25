import type { ItemFormData } from "./types";
import { formItem } from "./constants";

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
	"free people": "free people",
	reformation: "reformation",
	thredup: "thredup",
	"thred up": "thredup",
	poshmark: "poshmark",
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

	return {
		...formItem,
		brand: extractBrand(combinedText, from),
		category: extractCategory(combinedText),
		age: "new",
	};
}
