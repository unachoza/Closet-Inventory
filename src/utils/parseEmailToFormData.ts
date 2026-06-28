import type { ItemFormData } from "./types";
import { formItem } from "./constants";
import { parseInlineColorSize, stripBrandFromName, extractColorFromName } from "./parseNameHelpers";
import normalizeColor from "./normalizeColors";
import { extractBrandFromSender } from "./parseProductsFromEmail";
import { inferStyleTagsFromName } from "./inferStyleTagsFromName";
import { cleanProductName } from "./cleanProductName";
import { inferProductAttributes } from "./inferProductAttributes";
import { inferMaterialFromName } from "./inferMaterialFromName";
import { inferCare } from "./inferCare";
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
	vinted: "vinted",
	"the realreal": "the realreal",
	quince: "quince",
	madewell: "madewell",
	"white house black market": "white house black market",
	spanx: "spanx",
	"all saints": "all saints",
	cos: "cos",
	alo: "alo",
	abercrombie: "abercrombie",
	"j crew": "j crew",
};

const RESELLERS = ["poshmark", "depop", "ebay", "vinted", "threadup", "the realreal"];

const CATEGORY_KEYWORDS: Record<string, string> = {
	dress: "dresses",
	// bottoms
	skirt: "bottoms",
	pant: "bottoms",
	jean: "bottoms",
	culottes: "bottoms",
	trouser: "bottoms",
	short: "bottoms",
	skort: "bottoms",
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
	bra: "intimates",
	bralette: "intimates",
	lingerie: "intimates",
	//TODO
	//not always!
	plunge: "intimates",
	balconette: "intimates",
	demi: "intimates",
	scoop: "intimates",
	//TODO
	//not always!
	racerback: "intimates",
	underwire: "intimates",
	padded: "intimates",
	unpadded: "intimates",
	unlined: "intimates",
	sock: "socks",
	tights: "socks",
	underwear: "intimates",
	legging: "athleisure",
	sports: "athleisure",
	// A jersey is a top (soccer/football/sports shirt). More specific garment
	// words (dress, skirt, …) are matched earlier, so "jersey knit dress" still
	// resolves to dresses; a bare "jersey" lands in tops.
	jersey: "tops",
	swimsuit: "intimates",
	bodysuit: "body",
	jumpsuit: "body",
	cheeky: "intimates",
	thong: "intimates",
	briefs: "intimates",
	brief: "intimates",
	panty: "intimates",
	bikini: "intimates",
	teddy: "intimates",
	intimate: "intimates",
	pajama: "sleep",
	robe: "sleep",
	bathrobe: "sleep",
	kimonos: "sleep",
	boots: "shoes",
	loafers: "shoes",
	shoe: "shoes",
	loafer: "shoes",
	slipper: "shoes",
	sandal: "shoes",
	sneaker: "shoes",
	heel: "shoes",
	platform: "shoes",
	flat: "shoes",
	mule: "shoes",
	slingback: "shoes",
	pump: "shoes",
	wedge: "shoes",
	clog: "shoes",
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

/**
 * When the user forwards a retailer email, the outer "from" is their own Gmail
 * address (not useful). The real retailer sender is embedded in the forwarded
 * header block. This function finds that block and returns the inner From: value
 * so it can be fed through extractBrandFromSender as usual.
 *
 * Recognizes two common formats:
 *   "Begin forwarded message:\n\nFrom: BRAND <brand@eml.brand.com>"
 *   "---------- Forwarded message ---------\nFrom: brand <noreply@brand.com>"
 *
 * Also falls back to the first @brand.com address in a customer-care line
 * ("contact us at us_customer_care@icebreaker.com").
 */
export function extractForwardedFrom(plainText: string): string {
	const forwardedHeaderRe = /(?:begin\s+forwarded\s+message|[-]{5,}\s*forwarded\s+message\s*[-]{5,})/i;
	const match = forwardedHeaderRe.exec(plainText);
	if (match) {
		// Not line-anchored: stripped HTML collapses <br> tags so the "From:" can
		// sit mid-line right after "Begin forwarded message:". `.` stops at any
		// real newline, so plain-text forwards still capture just the From line.
		const after = plainText.slice(match.index + match[0].length);
		const fromLine = after.match(/From:\s*(.+)/i);
		if (fromLine) return fromLine[1].trim();
	}

	// Fallback: customer-care email domain (e.g. us_customer_care@icebreaker.com)
	const careMatch = plainText.match(/(?:contact|care|support)[^\n]*?[\w.+-]+@([\w-]+)\.\w+/i);
	if (careMatch) return `@${careMatch[1]}`;

	return "";
}

function stripHtml(html: string): string {
	const parser = new DOMParser();
	const doc = parser.parseFromString(html, "text/html");
	return doc.body.textContent ?? "";
}

/**
 * Resolve the true retailer sender from a forwarded email's HTML body.
 *
 * On the per-product import path the body passed to parseEmailToFormData is just
 * the product name, so the forwarded header (which lives in the full email body)
 * is never seen. Callers with the full HTML body use this to recover the real
 * sender (e.g. "icebreaker <noreply@orders.icebreaker.com>") and pass it as the
 * `from` argument. Returns "" when no forwarded sender is found.
 */
export function extractForwardedSender(htmlBody: string): string {
	if (!htmlBody) return "";
	return extractForwardedFrom(stripHtml(htmlBody));
}

function isFromReseller(from: string): boolean {
	const fromLower = from.toLowerCase();
	return RESELLERS.some((reseller) => fromLower.includes(reseller));
}

function hasNewTags(text: string): boolean {
	const lower = text.toLowerCase();
	return /\b(nwt|new\s+with\s+tags?)\b/i.test(lower);
}

export function parseEmailToFormData(subject: string, body: string, from: string, date?: string): Partial<ItemFormData> {
	const plainBody = stripHtml(body);
	const combinedText = `${subject} ${plainBody}`;
	// Brand from a known pattern in the subject/body/sender; otherwise fall back
	// to the email sender (e.g. an Old Navy receipt has no brand text — the
	// "Old Navy" sender becomes the brand).

	// For forwarded emails the outer `from` is the user's own address (not useful).
	// Try the inner sender first, then fall back to the outer one.
	const forwardedFrom = extractForwardedFrom(plainBody);
	const effectiveFrom = forwardedFrom || from;
	const brand = extractBrand(combinedText, effectiveFrom) || extractBrandFromSender(effectiveFrom);
	const category = extractCategory(combinedText);
	const styleTags = inferStyleTagsFromName(combinedText, category);

	// Inline color/size extraction (e.g. Poshmark: "...in burgundy size M")
	const { color: inlineColor, size: inlineSize } = parseInlineColorSize(subject);
	// Fallback chain: inline pattern → subject scan → body scan (for per-product
	// imports where the product name arrives as body, not subject).
	const color = normalizeColor(inlineColor || extractColorFromName(subject) || extractColorFromName(plainBody));

	// Clean name: strip brand prefix, gender junk, SEO noise, inline color/size suffix
	const nameFromSubject = stripBrandFromName(subject, brand);
	const cleanedName = cleanProductName(nameFromSubject);
	// Product attributes from the raw (uncleaned) text. Must scan combinedText,
	// not just the subject: on the per-product import path the style-bearing
	// product name arrives as `body` (subject is the retailer's generic
	// "Your order has been received"), so subject-only inference drops it.
	const attrs = inferProductAttributes(combinedText);

	const semantic = inferSemanticAttributes(combinedText);

	const inferencedMaterial = inferMaterialFromName(combinedText);
	// Care from material (fiber wash/dry) + name/color attributes (jeans → wash
	// inside out, white → wash with like colors, etc.), deduped. NOTE: on the
	// per-product import path the resolved color/material are recomputed there
	// (see GmailImport) since the card's color isn't visible to this function.
	const inferencedCare = inferCare(combinedText, color, inferencedMaterial);

	// Purchase date drives the factual age shown on the card.
	const parsed = new Date(date ?? "");
	const purchaseDate = date && !isNaN(parsed.getTime()) ? parsed.toISOString() : undefined;

	// For reseller platforms, default to "good" (unknown secondhand condition);
	// only upgrade to "new" if the listing explicitly says NWT/new with tags.
	let condition: string | undefined;
	if (isFromReseller(from)) {
		condition = hasNewTags(combinedText) ? "new" : "good";
	} else {
		// Retail sources: infer condition from purchase date
		condition = defaultConditionForPurchaseDate(purchaseDate);
	}

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
		// shouldn't default to "new"). For resellers, condition is only set if explicitly
		// marked NWT. The user can adjust it during import review.
		// Factual age comes from purchaseDate.
		...(condition && { condition }),
		...(purchaseDate ? { purchaseDate } : {}),
		...attrs,
		...semantic,
	};

	return result;
}
