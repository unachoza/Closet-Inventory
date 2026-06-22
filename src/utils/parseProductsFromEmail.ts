import { parseSHEINSizeField, stripBrandFromName, parseInlineColorSize } from "./parseNameHelpers";
import { cleanProductName } from "./cleanProductName";
import { inferProductAttributes } from "./inferProductAttributes";

/**
 * Extracts product details from order confirmation email HTML.
 *
 * Most clothing retailers (Aritzia, Zara, Nordstrom, etc.) use table-based
 * email layouts where each product is a <tr> with <td> cells for:
 * image, name/brand, size, color, qty, price, subtotal.
 *
 * This parser walks <tr> elements, identifies product rows by the presence
 * of a product image, then reads sibling <td> cells for structured details.
 */

export interface ExtractedProduct {
	readonly imageUrl: string;
	readonly name: string;
	readonly brand: string;
	readonly price: string;
	readonly originalPrice?: string;
	readonly qty?: number;
	readonly color: string;
	readonly size: string;
	readonly itemNumber: string;
	readonly material: string;
	readonly onSale: boolean;
	// Inferred clothing attributes
	readonly sleeveLength?: string;
	readonly hemLength?: string;
	readonly neckline?: string;
	readonly fit?: string;
	readonly rise?: string;
}

const PRICE_REGEX = /\$\d{1,5}(?:\.\d{2})?/g;
// "29.99 USD" / "69.90 EUR" — numeric amount followed by currency code (no $ prefix)
const CURRENCY_CODE_PRICE_REGEX = /(\d{1,5}\.\d{2})\s*(?:&nbsp;)?\s*(USD|EUR|GBP|CAD|AUD)/gi;
const ITEM_NUMBER_REGEX = /item\s*(?:no|number|#)\s*:?\s*(\d+)/i;

// Images smaller than this are spacers/tracking pixels
const MIN_IMG_DIMENSION = 30;

const SKIP_IMG_PATTERNS = [
	"spacer",
	"pixel",
	"tracking",
	"logo",
	"icon",
	"banner",
	"header",
	"footer",
	"social",
	"facebook",
	"twitter",
	"instagram",
	"pinterest",
	"youtube",
	"badge",
	"btn",
	"button",
	"arrow",
	"chevron",
	"caret",
	"star",
	"rating",
];

/**
 * Select direct child elements by tag name.
 * Replaces `el.querySelectorAll(":scope > TAG")` which is unreliable
 * in some DOM implementations (notably jsdom used by Vitest).
 */
function directChildren(parent: Element, tag: string): Element[] {
	const upper = tag.toUpperCase();
	return Array.from(parent.children).filter((c) => c.tagName === upper);
}

function isProductImage(img: HTMLImageElement): boolean {
	const src = img.getAttribute("src") ?? "";
	if (!src || src.startsWith("data:")) return false;

	const width = parseInt(img.getAttribute("width") ?? "0", 10);
	const height = parseInt(img.getAttribute("height") ?? "0", 10);
	if (width > 0 && width < MIN_IMG_DIMENSION) return false;
	if (height > 0 && height < MIN_IMG_DIMENSION) return false;

	const lowerSrc = src.toLowerCase();
	return !SKIP_IMG_PATTERNS.some((p) => lowerSrc.includes(p));
}

function extractPrices(text: string): string[] {
	// First try $-prefixed prices
	const dollarPrices = Array.from(text.matchAll(PRICE_REGEX)).map((m) => m[0]);
	if (dollarPrices.length > 0) return dollarPrices;

	// Fall back to "29.99 USD" / "69.90 EUR" format
	const codePrices = Array.from(text.matchAll(CURRENCY_CODE_PRICE_REGEX)).map((m) => `$${m[1]}`);
	return codePrices;
}

interface CellPricing {
	readonly price: string;
	readonly originalPrice: string;
}

/**
 * Extract the current (paid) price and, when present, the struck-through
 * original price from a price cell.
 *
 * Sale layouts pair a line-through original with a colored sale price, e.g.
 *   <span style="text-decoration:line-through;">$88.00</span>
 *   <span style="color:#ff3366">$34.99</span>
 * The struck span is the original; the colored (non-struck) span is what was paid.
 */
function getCellPricing(td: Element): CellPricing {
	// Struck-through original (sale marker).
	const struckEl = td.querySelector("s, strike, del, [style*='line-through']");
	const originalPrice = struckEl ? (extractPrices(struckEl.textContent ?? "")[0] ?? "") : "";

	// Look for colored/styled price spans (sale price indicators)
	const coloredSpans = td.querySelectorAll("span[style]");
	for (const span of coloredSpans) {
		const style = span.getAttribute("style") ?? "";
		// Sale prices often use red/pink colors, not line-through
		if ((style.includes("color") && !style.includes("line-through")) || style.includes("#ff") || style.includes("red")) {
			const prices = extractPrices(span.textContent ?? "");
			if (prices.length > 0) return { price: prices[0], originalPrice };
		}
	}

	// Fallback: get the last price in the cell (usually the current price).
	// If there are two prices and the first is higher, treat it as the original.
	const allPrices = extractPrices(td.textContent ?? "");
	const price = allPrices.length > 0 ? allPrices[allPrices.length - 1] : "";
	let inferredOriginal = originalPrice;
	if (!inferredOriginal && allPrices.length >= 2) {
		const first = parseFloat(allPrices[0].replace("$", ""));
		const last = parseFloat(price.replace("$", ""));
		if (last < first) inferredOriginal = allPrices[0];
	}
	return { price, originalPrice: inferredOriginal };
}

function getCellText(td: Element): string {
	return (td.textContent ?? "").trim().replace(/\s+/g, " ");
}

// Looks for explicit "Material:", "Fabric:", "Content:" labels,
// then falls back to bare percentage-blend patterns.
const MATERIAL_LABEL_RE = /(?:material|fabric|fiber\s+content|fibre\s+content|content|composition):\s*([^\n<]+)/i;
const FIBER_PCT_RE = /\d+\s*%\s*[a-z]/i;

function extractMaterialFromText(text: string): string {
	const labelMatch = text.match(MATERIAL_LABEL_RE);
	if (labelMatch) return labelMatch[1].trim();

	// Scan line-by-line so a lone "95% Cotton, 5% Spandex" line is found
	// without grabbing unrelated text before/after it.
	for (const line of text.split(/[\n;]/)) {
		if (FIBER_PCT_RE.test(line)) return line.trim();
	}

	return "";
}

interface ParsedNameCell {
	readonly brand: string;
	readonly name: string;
	readonly itemNumber: string;
}

function parseNameCell(td: Element): ParsedNameCell {
	const fullText = getCellText(td);

	// Try to get product name from <a> tag (common pattern)
	const link = td.querySelector("a");
	const linkText = link ? (link.textContent ?? "").trim() : "";

	// Extract item number
	const itemMatch = fullText.match(ITEM_NUMBER_REGEX);
	const itemNumber = itemMatch ? itemMatch[1] : "";

	// Split by line breaks or <br> — first line is typically brand, second is product name
	const lines = fullText
		.split(/\n/)
		.map((l) => l.trim())
		.filter((l) => l.length > 0 && !l.match(ITEM_NUMBER_REGEX));

	let brand = "";
	let name = linkText;

	if (lines.length >= 2) {
		brand = lines[0];
		if (!name) {
			name = lines[1];
		}
	} else if (lines.length === 1 && !name) {
		name = lines[0];
	}

	// Clean up: remove item number text from name if present
	const cleanName = name
		.replace(ITEM_NUMBER_REGEX, "")
		.replace(/item\s*no\s*:\s*/i, "")
		.trim();

	return { brand, name: cleanName, itemNumber };
}

/**
 * Strategy 2: Find <tr> rows with 4+ cells that contain a product image,
 * then read sibling <td> cells for size, color, price, etc.
 * Common for Aritzia, Nordstrom, and other traditional retailers.
 */
function extractFromTableRows(doc: Document): ExtractedProduct[] {
	const allRows = doc.querySelectorAll("tr");
	const products: ExtractedProduct[] = [];
	const seenItems = new Set<string>();

	for (const row of allRows) {
		const cells = directChildren(row, "td");
		if (cells.length < 4) continue;

		// Find a cell with a product image
		const imgCell = cells.find((td) => {
			const img = td.querySelector("img");
			return img && isProductImage(img as HTMLImageElement);
		});
		if (!imgCell) continue;

		const img = imgCell.querySelector("img") as HTMLImageElement;
		const imageUrl = img.getAttribute("src") ?? "";

		// Find the name/description cell — it's typically the widest text cell
		// or the one with the most content after the image.
		// Some retailers (Zara) put the image AND product name in the same <td>,
		// so also consider imgCell when it has substantial text.
		const imgCellText = getCellText(imgCell);
		const textCells = cells.filter((td) => {
			const text = getCellText(td);
			return text.length > 10 && td !== imgCell;
		});

		// When imgCell itself has substantial text (image + name in same cell),
		// prefer it as the name source over other cells (which may be SKU/reference).
		// Detect SKU-like strings (e.g. "0/4331/014/600/04") so they aren't mistaken for names.
		const looksLikeSku = (t: string) => /^\d[\d/\-]+$/.test(t.trim());
		const imgTextLooksLikeName = imgCellText.length > 5 && !looksLikeSku(imgCellText);
		const textCellsAreSkus = textCells.length > 0 && textCells.every((td) => looksLikeSku(getCellText(td)));
		let nameCell: Element;
		if (imgTextLooksLikeName && (textCells.length === 0 || textCellsAreSkus)) {
			nameCell = imgCell;
		} else if (textCells.length > 0) {
			// The name cell is usually the one with the most text content
			nameCell = textCells.reduce((best, td) => (getCellText(td).length > getCellText(best).length ? td : best));
		} else {
			continue;
		}

		const { brand, name, itemNumber } = parseNameCell(nameCell);

		if (!name) continue;

		// Deduplicate by item number or name
		const dedupeKey = itemNumber || name.toLowerCase();
		if (seenItems.has(dedupeKey)) continue;
		seenItems.add(dedupeKey);

		// Read remaining cells for size, color, price
		const otherCells = cells.filter((td) => td !== imgCell && td !== nameCell);

		let size = "";
		let color = "";
		let price = "";
		let originalPrice = "";

		for (const td of otherCells) {
			const text = getCellText(td);
			if (!text) continue;

			// Check if this cell has a price
			const cellPricing = getCellPricing(td);
			if (cellPricing.price && !price) {
				price = cellPricing.price;
				originalPrice = cellPricing.originalPrice;
				continue;
			}

			// Short single values are likely size or color
			if (text.length <= 15) {
				// Size-like values: S, M, L, XL, 0, 2, 4, 6, 8, etc.
				if (!size && /^(XXS|XS|XL|XXL|XXXL|S|M|L|\d{1,2})$/i.test(text)) {
					size = text;
					continue;
				}

				// Numeric-only (could be quantity) — skip single digits
				if (/^\d$/.test(text)) continue;

				// Skip quantity-label cells from nested tables (e.g. "Qty:1", "Qty: 2")
				if (/^qty/i.test(text)) continue;

				// Otherwise likely color
				if (!color && text.length > 1 && !/^\$/.test(text)) {
					color = text;
					continue;
				}
			}
		}

		products.push({
			imageUrl,
			name,
			brand,
			price,
			...(originalPrice ? { originalPrice } : {}),
			color,
			size,
			itemNumber,
			material: "",
			onSale: Boolean(originalPrice),
		});
	}

	return products;
}

/**
 * Parse "Color SKU_NUMBER" strings like "Brown 0/3641/871/700/02"
 * into just the color portion.
 */
function parseColorFromSkuLine(text: string): string {
	const trimmed = text.trim();
	// Match color name before a numeric/slash SKU pattern
	const match = trimmed.match(/^([A-Za-z][A-Za-z\s/-]*?)(?:\s+\d[\d/]+\s*$|\s*$)/);
	if (match?.[1]) {
		return match[1].trim();
	}
	// If no SKU pattern, return the whole string if it looks like a color
	if (trimmed.length < 30 && !/\d{3,}/.test(trimmed)) {
		return trimmed;
	}
	return "";
}

/**
 * Parse a "qty / price" line into the price. Handles both the $-prefixed
 * form ("1 unit / $ 14.90") and the currency-code form Zara uses
 * ("1 unit / 12.99 USD", where &nbsp; decodes to a non-breaking space).
 */
function parsePriceFromUnitLine(text: string): string {
	const match = text.match(/\$\s*(\d{1,5}(?:\.\d{2})?)/);
	if (match) return `$${match[1]}`;
	// Fall back to the "12.99 USD" / "69.90 EUR" currency-code format.
	const codePrices = extractPrices(text);
	return codePrices.length > 0 ? codePrices[0] : "";
}

/**
 * Strategy 3: Div-based layouts (Zara, etc.).
 *
 * Zara uses <td> cells containing a product image followed by sequential
 * <div> elements for name, color+SKU, qty+price, and size.
 * Products may appear in <td class="rd-product-col"> or similar containers.
 */
function extractFromDivLayout(doc: Document): ExtractedProduct[] {
	const products: ExtractedProduct[] = [];
	const seenNames = new Set<string>();

	// Strategy 2a: Look for Zara-specific class patterns
	const productCells = doc.querySelectorAll("td.rd-product-col, td[class*='product']");

	for (const cell of productCells) {
		const img = cell.querySelector("img") as HTMLImageElement | null;
		if (!img || !isProductImage(img)) continue;

		const imageUrl = img.getAttribute("src") ?? "";

		// Collect all <div> elements that are direct or near-direct descendants
		// Walk up from the image to find the container with divs
		let container: Element = img;
		for (let i = 0; i < 5; i++) {
			const parent = container.parentElement;
			if (!parent || parent === cell) break;
			container = parent;
		}

		// Get all divs in the cell after the image container
		const allDivs = Array.from(cell.querySelectorAll("div"));
		const textDivs = allDivs.filter((div) => {
			const text = (div.textContent ?? "").trim();
			// Skip empty divs and divs that are just containers for other divs
			if (!text) return false;
			// Skip if this div has child divs with the same text (it's a wrapper)
			const childDivs = div.querySelectorAll("div");
			if (childDivs.length > 0) {
				const childText = Array.from(childDivs)
					.map((d) => (d.textContent ?? "").trim())
					.join(" ");
				if (childText === text) return false;
			}
			return true;
		});

		if (textDivs.length === 0) continue;

		// Parse sequential divs: name, color+SKU, qty+price, size
		const name = (textDivs[0]?.textContent ?? "").trim();
		if (!name || seenNames.has(name.toLowerCase())) continue;
		seenNames.add(name.toLowerCase());

		const colorLine = textDivs.length > 1 ? (textDivs[1]?.textContent ?? "").trim() : "";
		const priceLine = textDivs.length > 2 ? (textDivs[2]?.textContent ?? "").trim() : "";
		const sizeLine = textDivs.length > 3 ? (textDivs[3]?.textContent ?? "").trim() : "";

		const color = parseColorFromSkuLine(colorLine);
		const price = parsePriceFromUnitLine(priceLine);
		const size = sizeLine.trim();

		products.push({ imageUrl, name, brand: "", price, color, size, itemNumber: "", material: "", onSale: false });
	}

	if (products.length > 0) return products;

	// Strategy 2b: Generic div-based — find <td> cells with a product image
	// and sibling <div> elements (no class dependency)
	const allTds = doc.querySelectorAll("td");

	for (const td of allTds) {
		const img = td.querySelector("img") as HTMLImageElement | null;
		if (!img || !isProductImage(img)) continue;

		// Only treat the image's OWN cell as the product cell. Without this, a
		// large container <td> (e.g. an entire email body wrapping a hero banner
		// plus unrelated text divs and an order total) is mistaken for a product
		// cell, producing a bogus "intro text + total price" item that pre-empts
		// the real line-item strategies. A genuine div-based product cell holds
		// the image directly, so its closest <td> ancestor is itself.
		if (img.closest("td") !== td) continue;

		const imageUrl = img.getAttribute("src") ?? "";

		// Get leaf-level divs with text content
		const divs = Array.from(td.querySelectorAll("div"));
		const leafDivs = divs.filter((div) => {
			const text = (div.textContent ?? "").trim();
			if (!text || text.length < 2) return false;
			const childDivs = div.querySelectorAll("div");
			for (const child of childDivs) {
				if ((child.textContent ?? "").trim() === text) return false;
			}
			return true;
		});

		if (leafDivs.length < 2) continue;

		const name = (leafDivs[0]?.textContent ?? "").trim();
		if (!name || seenNames.has(name.toLowerCase())) continue;

		// Check if this looks like a product (name should be non-numeric, not a tracking pixel label)
		if (/^\d+$/.test(name) || name.length < 3) continue;
		seenNames.add(name.toLowerCase());

		let color = "";
		let price = "";
		let size = "";

		for (let i = 1; i < leafDivs.length; i++) {
			const text = (leafDivs[i]?.textContent ?? "").trim();
			if (!text) continue;

			// Check for price pattern
			if (!price && /\$\s*\d/.test(text)) {
				price = parsePriceFromUnitLine(text);
				continue;
			}

			// Check for size-like value (single letter/number or standard sizes)
			if (!size && /^(XXS|XS|XL|XXL|XXXL|S|M|L|\d{1,2})$/i.test(text)) {
				size = text;
				continue;
			}

			// Likely color + SKU line
			if (!color && text.length < 40) {
				color = parseColorFromSkuLine(text);
				continue;
			}
		}

		products.push({ imageUrl, name, brand: "", price, color, size, itemNumber: "", material: "", onSale: false });
	}

	return products;
}

/**
 * Parse "Size Sm Sleeveless Top" → { size: "Sm", name: "Sleeveless Top" }
 * Also handles "Size 6 Midi Dress", "Size XS Tank Top", etc.
 */
function parseSizeAndName(text: string): { size: string; name: string } {
	const match = text.match(/^Size\s+(\S+)\s+(.+)$/i);
	if (match) {
		return { size: match[1], name: match[2].trim() };
	}
	return { size: "", name: text.trim() };
}

/**
 * Strategy 1: Nested two-cell table rows (ThredUp, Poshmark, etc.).
 *
 * ThredUp uses a 2-cell <tr>: one <td> for the product image, and a sibling
 * <td> containing deeply nested tables with <a> links for:
 *   link 1: Brand (e.g., "Reformation")
 *   link 2: Size + Category (e.g., "Size Sm Sleeveless Top")
 *   link 3: Price (e.g., "$44.99")
 *
 * This strategy runs first because it is the most specific — it requires
 * the "Size X ProductName" link pattern unique to resale marketplaces.
 *
 * If the product image can't be loaded (e.g. CORS), the item is still
 * detected — the user can add/upload an image later in the EditItemView form.
 */
function extractFromNestedTables(doc: Document): ExtractedProduct[] {
	const products: ExtractedProduct[] = [];
	const seenKeys = new Set<string>();

	const allRows = doc.querySelectorAll("tr");

	for (const row of allRows) {
		const cells = directChildren(row, "td");
		// Target rows with exactly 2 cells (image + details)
		if (cells.length !== 2) continue;

		// Identify which cell has the product image and which has details.
		// The image cell contains an <img>; the details cell has nested <a> links.
		let imageUrl = "";
		let detailsCell: Element | null = null;

		for (const cell of cells) {
			const img = cell.querySelector("img");
			if (img && isProductImage(img as HTMLImageElement)) {
				imageUrl = img.getAttribute("src") ?? "";
			} else {
				detailsCell = cell;
			}
		}

		// Details cell is required; image is optional (user can add later)
		if (!detailsCell) continue;

		// Extract text from all <a> links in the details cell
		const links = Array.from(detailsCell.querySelectorAll("a"));
		const linkTexts = links.map((a) => (a.textContent ?? "").trim()).filter((t) => t.length > 0);

		if (linkTexts.length < 2) continue;

		let brand = "";
		let name = "";
		let size = "";
		let price = "";
		let hasSizePattern = false;

		for (const text of linkTexts) {
			const trimmed = text.trim();

			// Price: starts with $
			if (/^\$\s*\d/.test(trimmed) && !price) {
				price = trimmed.replace(/\s+/g, "");
				continue;
			}

			// Size + Name pattern: "Size Sm Sleeveless Top"
			if (/^size\s+/i.test(trimmed) && !name) {
				const parsed = parseSizeAndName(trimmed);
				size = parsed.size;
				name = parsed.name;
				hasSizePattern = true;
				continue;
			}

			// First unmatched text is the brand
			if (!brand) {
				brand = trimmed;
				continue;
			}

			// If we still don't have a name, use this text
			if (!name) {
				name = trimmed;
			}
		}

		// This strategy requires the "Size X Name" pattern to avoid false
		// positives on generic 2-cell layout rows in other email formats.
		if (!hasSizePattern) continue;

		if (!name && !brand) continue;
		if (!name) name = brand;

		// Deduplicate by brand+name+image+price. Resale orders (ThredUp) often
		// contain several copies of the same style (same brand + name) that are
		// nonetheless distinct line items — they differ by image and/or price.
		// Keying on brand+name alone collapsed them into one; including the image
		// URL and price keeps genuinely-separate purchases as separate items
		// while still de-duping true repeats (identical row rendered twice).
		const dedupeKey = `${brand}|${name}|${imageUrl}|${price}`.toLowerCase();
		if (seenKeys.has(dedupeKey)) continue;
		seenKeys.add(dedupeKey);

		products.push({
			imageUrl,
			name,
			brand: brand !== name ? brand : "",
			price,
			color: "",
			size,
			itemNumber: "",
			material: "",
			onSale: false,
		});
	}

	return products;
}

/**
 * Parse size/color from lines like "US 4 / DUSTY PINK" or "S / Black".
 * Returns size and color separately.
 */
function parseSizeColorLine(text: string): { size: string; color: string } {
	// Remove QTY portion if present (e.g. "US 4 / DUSTY PINKQTY: 1")
	const cleaned = text.replace(/QTY\s*:?\s*\d+/i, "").trim();

	// "US 4 / DUSTY PINK", "S / Black", "S | Red Plaid", "2 | Black & White Plaid"
	const match = cleaned.match(/^(?:US\s+)?(\S+)\s*[/|]\s*(.+)$/i);
	if (match) {
		return {
			size: match[1].trim(),
			color: match[2].trim().toLowerCase(),
		};
	}
	return { size: "", color: "" };
}

/**
 * Extract text lines from an element, splitting on <br> tags.
 * DOMParser's textContent ignores <br>, so we process innerHTML instead.
 */
function getTextLines(el: Element): string[] {
	return el.innerHTML
		.replace(/<br\s*\/?>/gi, "\n")
		.replace(/<[^>]*>/g, " ")
		.replace(/&nbsp;/gi, " ")
		.replace(/ /g, " ")
		.split("\n")
		.map((line) => line.trim().replace(/\s+/g, " "))
		.filter((line) => line.length > 0);
}

/**
 * Read a value from a nested 2-column attribute table by its label.
 * H&M-style detail cells embed a <table> of "Label" / "Value" rows
 * (e.g. "Color" → "Black", "Size" → "S"). Matches case-insensitively
 * and tolerates a trailing colon ("Color:").
 */
function getAttributeByLabel(cell: Element, label: string): string {
	const cells = Array.from(cell.querySelectorAll("td"));
	for (let i = 0; i < cells.length - 1; i++) {
		const key = getCellText(cells[i]).replace(/:$/, "").trim().toLowerCase();
		if (key === label) return getCellText(cells[i + 1]).trim();
	}
	return "";
}

/**
 * Strategy: Two-cell rows whose details cell embeds a nested attribute
 * table (H&M). Each product is a <tr> with an image <td> and a details
 * <td> containing the product name (first <br>-delimited line), a price
 * (with optional struck-through original), and a nested <table> of
 * Label/Value rows (Art. No., Color, Size, Quantity).
 *
 * Strict guard: both Color and Size must resolve from the nested table,
 * so it won't false-match the paragraph/labeled/nested layouts that share
 * the generic two-cell shape.
 */
function extractFromAttributeTableRows(doc: Document): ExtractedProduct[] {
	const products: ExtractedProduct[] = [];
	const seen = new Set<string>();

	for (const row of doc.querySelectorAll("tr")) {
		const cells = directChildren(row, "td");
		if (cells.length !== 2) continue;

		// Identify image cell and details cell.
		let imageUrl = "";
		let detailsCell: Element | null = null;
		for (const cell of cells) {
			const img = cell.querySelector("img");
			if (img && isProductImage(img as HTMLImageElement)) {
				imageUrl = img.getAttribute("src") ?? "";
			} else {
				detailsCell = cell;
			}
		}
		if (!detailsCell) continue;

		// Strict guard: require a nested attribute table with Color AND Size.
		const color = getAttributeByLabel(detailsCell, "color");
		const size = getAttributeByLabel(detailsCell, "size");
		if (!color || !size) continue;

		const lines = getTextLines(detailsCell);

		// Product name: first non-trivial <br>-delimited line.
		const name = lines.find((line) => line.length > 3) ?? "";
		if (!name) continue;

		const itemNumber = getAttributeByLabel(detailsCell, "art. no.");

		// Struck-through original price marks a sale; the current price is the
		// first $ value (on the price line) that isn't the struck original.
		const struckEl = detailsCell.querySelector("s, strike, del, [style*='line-through']");
		const struck = struckEl ? (extractPrices(struckEl.textContent ?? "")[0] ?? "") : "";
		const onSale = Boolean(struck);

		// The price line is the first <br>-delimited line containing a "$"
		// (the nested table's "Total" line appears later and is ignored).
		const priceLine = lines.find((line) => line.includes("$")) ?? "";
		const prices = extractPrices(priceLine);
		const price = prices.find((p) => p !== struck) ?? prices[0] ?? "";

		const dedupeKey = `${name.toLowerCase()}|${color.toLowerCase()}|${size.toLowerCase()}`;
		if (seen.has(dedupeKey)) continue;
		seen.add(dedupeKey);

		products.push({
			imageUrl,
			name,
			brand: "",
			price,
			...(onSale && struck ? { originalPrice: struck } : {}),
			color: color.toLowerCase(),
			size,
			itemNumber,
			material: "",
			onSale,
		});
	}

	return products;
}

/**
 * Strategy 2: Two-cell table rows with paragraph-based details
 * (Princess Polly, Shopify/Klaviyo DTC brand emails).
 *
 * Uses a 2-cell <tr>: one <td> with the product image, another <td>
 * with <p> elements for product name, size/color, and price.
 *
 * Sale price detection: if a <span style="text-decoration:line-through">
 * is present, the non-strikethrough number is the current sale price.
 *
 * If the product image can't be loaded (e.g. CORS), the item is still
 * detected — the user can add an image later in the EditItemView form.
 */
function extractFromParagraphLayout(doc: Document): ExtractedProduct[] {
	const products: ExtractedProduct[] = [];
	const seenNames = new Set<string>();

	const allRows = doc.querySelectorAll("tr");

	for (const row of allRows) {
		const cells = directChildren(row, "td");
		if (cells.length !== 2) continue;

		// Identify image cell and details cell
		let imageUrl = "";
		let imgAlt = "";
		let detailsCell: Element | null = null;

		for (const cell of cells) {
			const img = cell.querySelector("img");
			if (img && isProductImage(img as HTMLImageElement)) {
				imageUrl = img.getAttribute("src") ?? "";
				imgAlt = img.getAttribute("alt") ?? "";
			} else {
				detailsCell = cell;
			}
		}

		if (!detailsCell) continue;

		// This strategy requires <p> elements for product info
		const paragraphs = Array.from(detailsCell.querySelectorAll("p"));
		if (paragraphs.length < 2) continue;

		let name = "";
		let size = "";
		let color = "";
		let price = "";
		let originalPrice = "";
		let onSale = false;

		for (const p of paragraphs) {
			const lines = getTextLines(p);

			// Check for sale price: <span style="text-decoration:line-through">
			const strikeSpan = p.querySelector("span[style*='line-through']");
			if (strikeSpan && !price) {
				const strikeText = (strikeSpan.textContent ?? "").trim();
				const fullText = (p.textContent ?? "").trim().replace(/\s+/g, " ");
				// Remove the strikethrough original price, extract remaining sale price
				const remaining = fullText.replace(strikeText, "").trim();
				const priceMatch = remaining.match(/(\d{1,5}(?:\.\d{2})?)/);
				if (priceMatch) {
					price = `$${priceMatch[1]}`;
					originalPrice = extractPrices(strikeText)[0] ?? "";
					onSale = true;
					continue;
				}
			}

			for (const line of lines) {
				// Skip QTY lines
				if (/^QTY/i.test(line)) continue;

				// Size/color: "US 4 / DUSTY PINK" or "S / Black"
				if (!size && line.includes("/")) {
					const parsed = parseSizeColorLine(line);
					if (parsed.size) {
						size = parsed.size;
						color = parsed.color;
						continue;
					}
				}

				// Regular price (no strikethrough): standalone number like "$71.25" or
				// "71.25". Require a $ prefix OR a decimal — a bare integer is a size
				// (e.g. ALDO lists shoe size "7" on its own line), not a price.
				if (!price) {
					const priceMatch = line.match(/^\$\s*(\d{1,5}(?:\.\d{2})?)\s*$/) || line.match(/^(\d{1,5}\.\d{2})\s*$/);
					if (priceMatch) {
						price = `$${priceMatch[1]}`;
						continue;
					}
				}

				// First substantial text is the product name
				if (!name && line.length > 3) {
					name = line;
				}
			}
		}

		// Fallback: use image alt text for product name
		if (!name && imgAlt.length > 3) {
			name = imgAlt;
		}

		if (!name) continue;

		// Require at least size or price to confirm this is a product row
		// (avoids matching generic 2-cell layout rows with just text + image)
		if (!size && !price) continue;

		if (seenNames.has(name.toLowerCase())) continue;
		seenNames.add(name.toLowerCase());

		products.push({
			imageUrl,
			name,
			brand: "",
			price,
			...(originalPrice ? { originalPrice } : {}),
			color,
			size,
			itemNumber: "",
			material: "",
			onSale,
		});
	}

	return products;
}

/**
 * Strategy 4: Labeled-field layout with <th> header cells
 * (CUUP, Demandware/Salesforce Commerce Cloud emails).
 *
 * Uses a <tr> with 2 <th> children: one for the product image (in a nested
 * table with logo underneath), and one for details containing a bold <span>
 * with the product name + labeled text fields (Color:, Size:, Price:, etc.).
 *
 * Name format: "The Scoop - Micro" → name = "The Scoop", material = "Micro".
 * Sale detection: "Price: $49.00" (list) vs "$34.30" in sibling cell (paid).
 */
function extractFromLabeledFieldLayout(doc: Document): ExtractedProduct[] {
	const products: ExtractedProduct[] = [];
	const seenKeys = new Set<string>();

	const allRows = doc.querySelectorAll("tr");

	for (const row of allRows) {
		const ths = directChildren(row, "th");
		if (ths.length !== 2) continue;

		// Identify image th and details th
		let imageUrl = "";
		let detailsTh: Element | null = null;

		for (const th of ths) {
			// Details th: has a bold span + labeled fields like "Color:" or "Size:"
			const boldSpan = th.querySelector("span[style*='bold']");
			const thText = (th.textContent ?? "").toLowerCase();
			const hasLabeledFields = thText.includes("color:") || thText.includes("size:") || thText.includes("price:");

			if (boldSpan && hasLabeledFields) {
				detailsTh = th;
				continue;
			}

			// Image th: contains a product image (logo is filtered by isProductImage)
			const imgs = Array.from(th.querySelectorAll("img"));
			for (const img of imgs) {
				if (isProductImage(img as HTMLImageElement)) {
					imageUrl = img.getAttribute("src") ?? "";
					break;
				}
			}
		}

		if (!detailsTh) continue;

		// Get product name from bold span
		const boldSpan = detailsTh.querySelector("span[style*='bold']");
		if (!boldSpan) continue;

		const rawName = (boldSpan.textContent ?? "").trim();
		if (!rawName) continue;

		// Parse "The Scoop - Micro" → name="The Scoop", material="Micro"
		let name = rawName;
		let material = "";
		const dashParts = rawName.split(/\s*-\s*/);
		if (dashParts.length >= 2) {
			name = dashParts[0].trim();
			material = dashParts.slice(1).join(" - ").trim();
		}

		// Find the details <td> (contains the bold span) inside the nested table
		const innerTds = Array.from(detailsTh.querySelectorAll("td"));
		const detailTd = innerTds.find((td) => td.querySelector("span[style*='bold']"));
		if (!detailTd) continue;

		// Extract labeled fields from the details td
		const detailLines = getTextLines(detailTd);

		let color = "";
		let size = "";
		let listPrice = 0;
		let itemNumber = "";
		let labeledMaterial = "";

		for (const line of detailLines) {
			const colorMatch = line.match(/^Color:\s*(.+)/i);
			if (colorMatch && !color) {
				color = colorMatch[1].trim().toLowerCase();
				continue;
			}
			const sizeMatch = line.match(/^Size:\s*(.+)/i);
			if (sizeMatch && !size) {
				const sizeVal = sizeMatch[1].trim();
				size = sizeVal === "N/A" ? "" : sizeVal;
				continue;
			}
			const materialMatch = line.match(/^(?:Material|Fabric|Content|Fiber\s*Content|Composition):\s*(.+)/i);
			if (materialMatch && !labeledMaterial) {
				labeledMaterial = materialMatch[1].trim();
				continue;
			}
			const itemMatch = line.match(/^Item\s*#:\s*(.+)/i);
			if (itemMatch && !itemNumber) {
				itemNumber = itemMatch[1].trim();
				continue;
			}
			const priceFieldMatch = line.match(/^Price:\s*\$?(\d{1,5}(?:\.\d{2})?)/i);
			if (priceFieldMatch && listPrice === 0) {
				listPrice = parseFloat(priceFieldMatch[1]);
			}
		}

		// If no labeled material field, try extracting from the full details text
		if (!labeledMaterial) {
			labeledMaterial = extractMaterialFromText(getCellText(detailsTh));
		}

		// Get paid price from a sibling <td> (not the details td)
		let paidPrice = "";
		for (const td of innerTds) {
			if (td === detailTd) continue;
			const text = getCellText(td).trim();
			const pm = text.match(/^\$\d{1,5}(?:\.\d{2})?$/);
			if (pm) {
				paidPrice = pm[0];
			}
		}

		// Use paid price if available, otherwise list price
		const price = paidPrice || (listPrice > 0 ? `$${listPrice.toFixed(2)}` : "");

		// If paid < list, item is on sale; original price is the labeled "Price:" field
		const paidNum = paidPrice ? parseFloat(paidPrice.replace("$", "")) : 0;
		const onSale = listPrice > 0 && paidNum > 0 && paidNum < listPrice;
		const originalPrice = onSale ? `$${listPrice.toFixed(2)}` : "";

		// Deduplicate by name + color + size (same style in different colors are separate items)
		const dedupeKey = `${name}|${color}|${size}`.toLowerCase();
		if (seenKeys.has(dedupeKey)) continue;
		seenKeys.add(dedupeKey);

		products.push({
			imageUrl,
			name,
			brand: "",
			price,
			...(originalPrice ? { originalPrice } : {}),
			color,
			size,
			itemNumber,
			material: labeledMaterial || material,
			onSale,
		});
	}

	return products;
}

/**
 * Strategy 5: React Email section layout (Cider, Shopify React Email templates).
 *
 * Each product is in a <table data-id="react-email-section"> containing a
 * 3-column <tr>: image (col 1), details with <p> name + labeled Color/Size
 * spans (col 2), and price with optional strikethrough for sales (col 3).
 */
function extractFromReactEmailLayout(doc: Document): ExtractedProduct[] {
	const products: ExtractedProduct[] = [];
	const seenNames = new Set<string>();

	const sections = doc.querySelectorAll("table[data-id='react-email-section']");
	if (sections.length === 0) return [];

	for (const section of sections) {
		const rows = section.querySelectorAll("tr");

		for (const row of rows) {
			const cols = directChildren(row, "td");
			if (cols.length < 3) continue;

			// Column 1: product image
			let imageUrl = "";
			let detailsCol: Element | null = null;
			let priceCol: Element | null = null;

			for (const col of cols) {
				const img = col.querySelector("img");
				if (img && isProductImage(img as HTMLImageElement)) {
					imageUrl = img.getAttribute("src") ?? "";
					continue;
				}

				// Details column: contains a <p> with the product name
				const p = col.querySelector("p");
				if (p && !detailsCol) {
					detailsCol = col;
					continue;
				}

				// Price column: contains dollar amount text
				const text = getCellText(col);
				if (/\$\d/.test(text) && !priceCol) {
					priceCol = col;
				}
			}

			if (!detailsCol) continue;

			// Extract name from <p>
			const nameP = detailsCol.querySelector("p");
			const name = nameP ? (nameP.textContent ?? "").trim() : "";
			if (!name || name.length < 3) continue;

			// Extract Color, Size, and Material from labeled spans
			let color = "";
			let size = "";
			let spanMaterial = "";
			const allSpans = Array.from(detailsCol.querySelectorAll("span"));

			for (let i = 0; i < allSpans.length; i++) {
				const text = (allSpans[i].textContent ?? "").trim();
				const cleanLabel = text.replace(/[:\s]/g, "").toLowerCase();

				if (cleanLabel === "color" && i + 1 < allSpans.length) {
					const valText = (allSpans[i + 1].textContent ?? "").trim();
					if (valText.length > 0 && !/^(size|color|material|fabric)/i.test(valText)) {
						color = valText.toLowerCase();
						i++;
					}
				} else if (cleanLabel === "size" && i + 1 < allSpans.length) {
					const valText = (allSpans[i + 1].textContent ?? "").trim().replace(/\s+/g, " ");
					if (valText.length > 0 && !/^(size|color|material|fabric)/i.test(valText)) {
						// "XS （US 2）" or "M （US 6）" → extract size code before parens
						const sizeMatch = valText.match(/^(\S+)/);
						size = sizeMatch ? sizeMatch[1] : valText;
						i++;
					}
				} else if (/^(material|fabric|content|composition)$/.test(cleanLabel) && i + 1 < allSpans.length) {
					const valText = (allSpans[i + 1].textContent ?? "").trim();
					if (valText.length > 0 && !spanMaterial) {
						spanMaterial = valText;
						i++;
					}
				}
			}

			// Fall back to scanning full column text for labeled/percentage material
			if (!spanMaterial) {
				spanMaterial = extractMaterialFromText(getCellText(detailsCol));
			}

			// Extract price (with sale detection via line-through)
			let price = "";
			let originalPrice = "";
			let onSale = false;

			if (priceCol) {
				const strikeDiv = priceCol.querySelector("div[style*='line-through']");
				if (strikeDiv) {
					onSale = true;
					const strikePm = (strikeDiv.textContent ?? "").trim().match(/\$\d{1,5}(?:\.\d{2})?/);
					if (strikePm) originalPrice = strikePm[0];
					// Sale price is in the bold (non-strikethrough) div
					const priceDivs = Array.from(priceCol.querySelectorAll("div"));
					for (const div of priceDivs) {
						const style = div.getAttribute("style") ?? "";
						if (style.includes("font-weight") && !style.includes("line-through")) {
							const pm = (div.textContent ?? "").trim().match(/\$\d{1,5}(?:\.\d{2})?/);
							if (pm) {
								price = pm[0];
								break;
							}
						}
					}
				}

				// Fallback: last price in the column
				if (!price) {
					const allPrices = extractPrices(priceCol.textContent ?? "");
					if (allPrices.length > 0) {
						price = allPrices[allPrices.length - 1];
						// Two prices where second is lower = sale
						if (allPrices.length >= 2) {
							const first = parseFloat(allPrices[0].replace("$", ""));
							const last = parseFloat(price.replace("$", ""));
							if (last < first) {
								onSale = true;
								originalPrice = allPrices[0];
							}
						}
					}
				}
			}

			if (seenNames.has(name.toLowerCase())) continue;
			seenNames.add(name.toLowerCase());

			products.push({
				imageUrl,
				name,
				brand: "",
				price,
				...(originalPrice ? { originalPrice } : {}),
				color,
				size,
				itemNumber: "",
				material: spanMaterial,
				onSale,
			});
		}
	}

	return products;
}

/** Returns true if text looks like a size value rather than a color name. */
function looksLikeSize(text: string): boolean {
	const t = text.trim();
	// Number or range: "8", "8.5", "8.5-9", "38-40"
	if (/^\d[\d.\-/]*$/.test(t)) return true;
	// Letter sizes: "S", "M", "L", "XS", "XL", "XXL", etc.
	if (/^(XXXS|XXS|XS|XL|XXL|XXXL|S|M|L)$/i.test(t)) return true;
	if (/^one\s*size$/i.test(t)) return true;
	return false;
}

/**
 * Strategy 6: Order-ID container with 3-column product rows.
 *
 * Emails that contain an "Order ID:" / "Order #:" marker and nearby
 * 3-column <tr> rows: image, product details (name + "size / color"),
 * and price. This is a common pattern for Chinese marketplace retailers
 * (e.g. AliExpress, Wish, Shein) and some Shopify stores.
 *
 * Guard: requires "Order" marker text AND at least one product image,
 * so it won't fire on image-based emails (Temu) where products are PNGs.
 */
function extractFromOrderContainerRows(doc: Document): ExtractedProduct[] {
	// Quick check: does this email contain an order marker?
	const bodyText = doc.body.textContent ?? "";
	const hasOrderMarker = /order\s*(id|#|number)\s*:?\s*/i.test(bodyText);
	if (!hasOrderMarker) return [];

	const products: ExtractedProduct[] = [];
	const seenNames = new Set<string>();

	const allRows = doc.querySelectorAll("tr");

	for (const row of allRows) {
		const cols = directChildren(row, "td");
		// Need exactly 3 columns (image, details, price)
		if (cols.length !== 3) continue;

		// Identify image, details, and price columns
		let imageUrl = "";
		let detailsCol: Element | null = null;
		let priceCol: Element | null = null;

		for (const col of cols) {
			const img = col.querySelector("img");
			if (img && isProductImage(img as HTMLImageElement) && !imageUrl) {
				imageUrl = img.getAttribute("src") ?? "";
				continue;
			}

			const text = getCellText(col);

			// Price column: contains a dollar amount
			if (/\$\d/.test(text) && !priceCol) {
				priceCol = col;
				continue;
			}

			// Details column: has substantial text (product name)
			if (text.length > 5 && !detailsCol) {
				detailsCol = col;
			}
		}

		// Require image + details to confirm product row
		if (!imageUrl || !detailsCol) continue;

		// Extract product name — prefer bold/styled text
		const bold = detailsCol.querySelector(
			"strong, b, span[style*='bold'], p[style*='bold'], [style*='font-weight:700'], [style*='font-weight: 700']",
		);
		let name = bold ? (bold.textContent ?? "").trim() : "";

		if (!name) {
			const lines = getTextLines(detailsCol);
			name = lines.find((l) => l.length > 3 && !/^[×x]\d|^qty/i.test(l)) ?? "";
		}

		if (!name || name.length < 3) continue;

		// Extract size/color from "8.5-9 / black" or "Khaki / 8.5-9" patterns
		let size = "";
		let color = "";
		const detailLines = getTextLines(detailsCol);

		for (const line of detailLines) {
			if (line === name) continue;
			// Skip quantity lines: "×1", "x1", "qty: 1"
			if (/^[×x]\d|^qty/i.test(line)) continue;

			// "size / color" or "color / size" pattern
			if (line.includes("/") && !size && !color) {
				const parts = line.split("/").map((p) => p.trim());
				if (parts.length === 2 && parts[0].length > 0 && parts[1].length > 0) {
					for (const part of parts) {
						if (looksLikeSize(part) && !size) {
							size = part;
						} else if (!color) {
							color = part.toLowerCase();
						}
					}
					continue;
				}
			}

			// Labeled fields: "Color: Black", "Size: M"
			const colorMatch = line.match(/^Color\s*:?\s*(.+)/i);
			if (colorMatch && !color) {
				color = colorMatch[1].trim().toLowerCase();
				continue;
			}
			const sizeMatch = line.match(/^Size\s*:?\s*(.+)/i);
			if (sizeMatch && !size) {
				size = sizeMatch[1].trim();
				continue;
			}
		}

		// Extract price
		let price = "";
		let originalPrice = "";
		let onSale = false;
		if (priceCol) {
			// Struck-through original (e.g. "Was $90.00").
			const strikeEl = priceCol.querySelector("[style*='line-through'], s, strike, del");
			if (strikeEl) {
				onSale = true;
				originalPrice = extractPrices(strikeEl.textContent ?? "")[0] ?? "";
			}

			const allPrices = extractPrices(priceCol.textContent ?? "");
			if (allPrices.length > 0) {
				price = allPrices[allPrices.length - 1];
				if (allPrices.length >= 2) {
					const first = parseFloat(allPrices[0].replace("$", ""));
					const last = parseFloat(price.replace("$", ""));
					if (last < first) {
						onSale = true;
						if (!originalPrice) originalPrice = allPrices[0];
					}
				}
			}
		}

		if (seenNames.has(name.toLowerCase())) continue;
		seenNames.add(name.toLowerCase());

		products.push({
			imageUrl,
			name,
			brand: "",
			price,
			...(originalPrice ? { originalPrice } : {}),
			color,
			size,
			itemNumber: "",
			material: "",
			onSale,
		});
	}

	return products;
}

/**
 * Detect emails where the product list is rendered as a server-side image
 * rather than structured HTML. Temu is the primary example — they bake
 * all product details into a single PNG to prevent scraping.
 *
 * Returns the retailer name (e.g. "Temu") or empty string if not detected.
 */
export function detectImageBasedRetailer(html: string, from: string): string {
	const lowerHtml = html.toLowerCase();
	const lowerFrom = from.toLowerCase();

	const hasTemu = lowerFrom.includes("temu") || lowerHtml.includes("temu.com");
	const hasKwcdn = lowerHtml.includes("kwcdn.com");
	const hasTemuFile = lowerHtml.includes("pfs-u.file.temu.com");

	if (hasTemu || hasKwcdn || hasTemuFile) {
		return "Temu";
	}

	return "";
}

/**
 * Strategy 8: Text-only product rows without images (Express, etc.).
 *
 * Some retailers use simple table rows with just product name, quantity,
 * and price — no images, no color/size fields. Each product is often
 * in its own <table> with spacer cells (width < 10) between content cells.
 *
 * Requires at least 2 matching rows to confirm this is a product listing
 * (a single text row could be a shipping/subtotal summary line).
 */
function extractFromTextOnlyRows(doc: Document): ExtractedProduct[] {
	const products: ExtractedProduct[] = [];
	const seenNames = new Set<string>();

	const SUMMARY_PATTERNS =
		/^(sub\s*total|total|tax|shipping|discount|promo|coupon|order\s*(total|summary)|item\s*$|product\s*$|description|qty|quantity|price|amount|your\s*order|gift|credit|balance|fee|handling|estimated)/i;

	const allRows = doc.querySelectorAll("tr");

	for (const row of allRows) {
		const cells = directChildren(row, "td");
		if (cells.length < 3) continue;

		// Skip rows that have product images (handled by other strategies)
		const hasProductImage = cells.some((td) => {
			const img = td.querySelector("img");
			return img ? isProductImage(img as HTMLImageElement) : false;
		});
		if (hasProductImage) continue;

		// Filter out spacer cells (tiny width + no real text)
		const contentCells = cells.filter((td) => {
			const width = parseInt(td.getAttribute("width") ?? "0", 10);
			if (width > 0 && width < 10) return false;
			const text = getCellText(td);
			return text.length > 0;
		});

		if (contentCells.length < 3) continue;

		// Identify name cell (substantial text) and price cell (decimal number)
		let nameCell: Element | null = null;
		let priceValue = "";

		for (const td of contentCells) {
			const text = getCellText(td);

			// Price: decimal number like "34.00" or "$34.00"
			const cleanText = text.replace(/\s/g, "");
			if (/^\$?\d{1,5}\.\d{2}$/.test(cleanText) && !priceValue) {
				priceValue = cleanText.startsWith("$") ? cleanText : `$${cleanText}`;
				continue;
			}

			// Quantity: single digit — skip it
			if (/^\d$/.test(text)) continue;

			// Name: substantial text, not a number
			if (text.length > 5 && !nameCell) {
				nameCell = td;
			}
		}

		if (!nameCell || !priceValue) continue;

		const name = getCellText(nameCell);
		if (SUMMARY_PATTERNS.test(name)) continue;
		if (name.length < 5) continue;

		if (seenNames.has(name.toLowerCase())) continue;
		seenNames.add(name.toLowerCase());

		products.push({
			imageUrl: "",
			name,
			brand: "",
			price: priceValue,
			color: "",
			size: "",
			itemNumber: "",
			material: "",
			onSale: false,
		});
	}

	// Require at least 2 products to avoid matching summary/header rows
	return products.length >= 2 ? products : [];
}

/**
 * Strategy 8 (Fallback): Find product images and read nearby text.
 * Used when no structured format is detected.
 */
function extractFromImages(doc: Document): ExtractedProduct[] {
	const images = Array.from(doc.querySelectorAll("img")).filter((img) => isProductImage(img as HTMLImageElement));

	const products: ExtractedProduct[] = [];
	const seenNames = new Set<string>();

	for (const img of images) {
		const src = img.getAttribute("src") ?? "";
		const alt = img.getAttribute("alt") ?? "";

		// Walk up to find a container with text
		let container: Element = img;
		for (let i = 0; i < 5; i++) {
			const parent = container.parentElement;
			if (!parent) break;
			container = parent;
			const text = (container.textContent ?? "").trim();
			if (text.length > 20) break;
		}

		const nearbyText = (container.textContent ?? "").trim();
		const name =
			alt ||
			nearbyText
				.split("\n")
				.find((l) => l.trim().length > 3)
				?.trim() ||
			"";

		if (!name || seenNames.has(name.toLowerCase())) continue;
		seenNames.add(name.toLowerCase());

		const allPrices = extractPrices(nearbyText);

		products.push({
			imageUrl: src,
			name,
			brand: "",
			price: allPrices.length > 0 ? allPrices[allPrices.length - 1] : "",
			color: "",
			size: "",
			itemNumber: "",
			material: "",
			onSale: false,
		});
	}

	return products;
}

/**
 * Extract a brand name suggestion from the email sender field.
 * Used as a fallback when no brand is detected from the email HTML.
 *
 * Prefers the display name (e.g. "Princess Polly" from "Princess Polly <no-reply@...>").
 * Falls back to the email domain (e.g. "princesspolly" from "no-reply@princesspolly.com").
 * The user can edit this suggestion in the EditItemView form.
 */
export function extractBrandFromSender(from: string): string {
	if (!from) return "";

	// Try display name: "Princess Polly <noreply@princesspolly.com>" → "Princess Polly"
	const displayMatch = from.match(/^([^<]+)/);
	if (displayMatch) {
		const display = displayMatch[1].trim();
		// Skip generic/automated sender names
		if (display && !/^(no-?reply|info|support|orders?|hello|team|mail|notification)/i.test(display)) {
			return display.toLowerCase();
		}
	}

	// Fall back to email domain: "noreply@princesspolly.com" → "princesspolly"
	const domainMatch = from.match(/@([^.]+)/);
	if (domainMatch) {
		const domain = domainMatch[1].toLowerCase();
		if (!/^(gmail|yahoo|outlook|hotmail|mail|email)/.test(domain)) {
			return domain;
		}
	}

	return "";
}

/**
 * Pre-processing: remove DOM content after order total markers.
 *
 * Many emails (especially Amazon) include "recommended" or "continue shopping"
 * product sections AFTER the order summary. These get falsely detected as
 * purchased items. Cutting the DOM at the first "Grand Total" / "Order Total" /
 * "Subtotal" marker prevents strategies from seeing that content.
 */
function removePostTotalContent(doc: Document): void {
	const strongPattern = /\b(grand\s*total|order\s*total)\b/i;
	const weakPattern = /\bsub\s*total\b/i;

	const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT);

	while (walker.nextNode()) {
		const text = walker.currentNode.textContent ?? "";

		let isTotal = false;

		if (strongPattern.test(text)) {
			isTotal = true;
		} else if (weakPattern.test(text)) {
			// "Subtotal" often appears as a column header (Aritzia uses
			// <td>subtotal</td> in its header row). Only treat it as an
			// end-of-order marker when the containing row also has a
			// dollar amount — real summary rows pair the label with a price.
			const row = walker.currentNode.parentElement?.closest("tr");
			const rowText = row ? (row.textContent ?? "") : "";
			if (/\$\d/.test(rowText)) {
				isTotal = true;
			}
		}

		if (!isTotal) continue;

		// Skip <th> / <thead> column headers
		let inHeader = false;
		let check: Element | null = walker.currentNode.parentElement;
		while (check) {
			if (check.tagName === "TH" || check.tagName === "THEAD") {
				inHeader = true;
				break;
			}
			if (check.tagName === "TR" || check.tagName === "TABLE") break;
			check = check.parentElement;
		}
		if (inHeader) continue;

		// Remove all content that follows this text node in document order
		let el: Element | null = walker.currentNode.parentElement;
		while (el && el !== doc.body) {
			while (el.nextSibling) {
				el.nextSibling.remove();
			}
			el = el.parentElement;
		}
		return;
	}
}

/**
 * Parse Amazon's `<sup>$</sup>14<sup>99</sup>` price format into "$14.99".
 * Falls back to standard $XX.XX regex if no <sup> pattern found.
 */
function parseAmazonSupPrice(container: Element): string {
	const sups = container.querySelectorAll("sup");
	for (const sup of sups) {
		if ((sup.textContent ?? "").trim() !== "$") continue;

		const parent = sup.parentElement;
		if (!parent) continue;

		const children = Array.from(parent.childNodes);
		const supIndex = children.indexOf(sup);

		let dollars = "";
		let cents = "00";

		for (let i = supIndex + 1; i < children.length; i++) {
			const node = children[i];
			if (node.nodeType === Node.TEXT_NODE) {
				const t = (node.textContent ?? "").trim();
				if (/^\d+$/.test(t) && !dollars) {
					dollars = t;
				}
			} else if (node.nodeType === Node.ELEMENT_NODE && (node as Element).tagName === "SUP") {
				const t = (node.textContent ?? "").trim();
				if (/^\d{1,2}$/.test(t)) {
					cents = t;
				}
				break;
			}
		}

		if (dollars) {
			return `$${dollars}.${cents}`;
		}
	}

	const prices = extractPrices(container.textContent ?? "");
	return prices.length > 0 ? prices[prices.length - 1] : "";
}

/**
 * Strategy: Amazon MJML column layout.
 *
 * Amazon emails use MJML-generated inline-block <div> columns:
 * - `mj-column-per-25` contains the product image (`img.productImage`)
 * - `mj-column-per-75` contains name (<a> tag) and price (<sup> format)
 *
 * Guard: requires at least one `img.productImage` or `td.productImageTd`
 * to avoid false positives on non-Amazon emails.
 */
function extractFromAmazonLayout(doc: Document): ExtractedProduct[] {
	const productImgs = doc.querySelectorAll("img.productImage, td.productImageTd img");
	if (productImgs.length === 0) return [];

	const products: ExtractedProduct[] = [];
	const seenNames = new Set<string>();

	for (const img of productImgs) {
		if (!isProductImage(img as HTMLImageElement)) continue;
		const imageUrl = img.getAttribute("src") ?? "";

		// Walk up to find the mj-column container div
		let columnDiv: Element | null = img as Element;
		while (columnDiv && columnDiv !== doc.body) {
			const cls = columnDiv.getAttribute("class") ?? "";
			if (cls.includes("mj-column")) break;
			columnDiv = columnDiv.parentElement;
		}

		let detailsContainer: Element | null = null;

		if (columnDiv && (columnDiv.getAttribute("class") ?? "").includes("mj-column")) {
			// MJML layout: find sibling mj-column div with product details
			const parent = columnDiv.parentElement;
			if (parent) {
				for (const child of Array.from(parent.children)) {
					if (child === columnDiv) continue;
					const cls = child.getAttribute("class") ?? "";
					if (cls.includes("mj-column") && (child.textContent ?? "").trim().length > 5) {
						detailsContainer = child;
						break;
					}
				}
			}
		}

		if (!detailsContainer) {
			// Fallback: table cell layout — find sibling <td> with text
			const td = (img as Element).closest("td");
			if (td) {
				const row = td.closest("tr");
				if (row) {
					const cells = directChildren(row, "td");
					for (const cell of cells) {
						if (cell === td) continue;
						if ((cell.textContent ?? "").trim().length > 10) {
							detailsContainer = cell;
							break;
						}
					}
				}
			}
		}

		if (!detailsContainer) continue;

		// Extract product name from <a> tag
		let name = "";
		const links = detailsContainer.querySelectorAll("a");
		for (const link of links) {
			const linkText = (link.textContent ?? "").trim();
			if (linkText.length > 5 && !linkText.startsWith("$")) {
				name = linkText;
				break;
			}
		}

		if (!name || name.length < 3) continue;

		const price = parseAmazonSupPrice(detailsContainer);

		if (seenNames.has(name.toLowerCase())) continue;
		seenNames.add(name.toLowerCase());

		products.push({
			imageUrl,
			name,
			brand: "",
			price,
			color: "",
			size: "",
			itemNumber: "",
			material: "",
			onSale: false,
		});
	}

	return products;
}

/**
 * Strategy: Shopify standard order email layout (SKIMS, and any Shopify-powered store).
 *
 * Shopify's default order confirmation template uses consistent CSS class names:
 *   <span class="order-list__item-title">  — "PRODUCT NAME | COLOR × QTY"
 *   <span class="order-list__item-variant"> — "COLOR / SIZE"
 *   <p class="order-list__item-price">     — current price (after discounts)
 *   <del class="order-list__item-original-price"> — struck-through original (sale indicator)
 *
 * The discount allocation span inside the description cell contains "$" amounts
 * (e.g. "3+ FOR $12 EACH (-$40.00)"), which breaks generic column-detection strategies
 * that identify the price column by scanning for "$". This strategy avoids that entirely
 * by using Shopify's class names directly.
 *
 * SKIMS encodes color in the title as "PRODUCT NAME | COLOR × QTY". We strip both
 * the quantity suffix ("× N") and the color suffix ("| COLOR") from the display name
 * since color is captured separately from the variant span.
 */
function extractFromShopifyLayout(doc: Document): ExtractedProduct[] {
	const titleSpans = doc.querySelectorAll("span.order-list__item-title");
	if (titleSpans.length === 0) return [];

	const products: ExtractedProduct[] = [];
	const seenKeys = new Set<string>();

	for (const titleSpan of titleSpans) {
		const row = titleSpan.closest("tr");
		if (!row) continue;

		// Image
		const img = row.querySelector("img");
		const imageUrl = img && isProductImage(img as HTMLImageElement) ? (img.getAttribute("src") ?? "") : "";

		// Name: strip "× N" quantity suffix then "| COLOR" color suffix
		// Raw: "FITS EVERYBODY HIGH WAISTED THONG | ONYX × 5"
		// → strip qty: "FITS EVERYBODY HIGH WAISTED THONG | ONYX"
		// → strip color segment: "FITS EVERYBODY HIGH WAISTED THONG"
		const rawTitle = (titleSpan.textContent ?? "")
			.replace(/&nbsp;/g, " ")
			.trim()
			.replace(/\s+/g, " ");
		const qtyMatch = rawTitle.match(/[×x]\s*(\d+)\s*$/);
		const qty = qtyMatch ? parseInt(qtyMatch[1], 10) : 1;
		const withoutQty = rawTitle.replace(/\s*[×x]\s*\d+\s*$/, "").trim();
		const pipeIdx = withoutQty.lastIndexOf(" | ");
		const name = pipeIdx !== -1 ? withoutQty.slice(0, pipeIdx).trim() : withoutQty;

		if (!name || name.length < 3) continue;

		// Variant: "ONYX / S" → color = "onyx", size = "S"
		const variantSpan = row.querySelector("span.order-list__item-variant");
		const variantText = variantSpan ? (variantSpan.textContent ?? "").trim().replace(/\s+/g, " ") : "";

		let color = "";
		let size = "";

		if (variantText.includes("/")) {
			const parts = variantText.split("/").map((p) => p.trim());
			for (const part of parts) {
				if (looksLikeSize(part) && !size) {
					size = part;
				} else if (!color) {
					color = part.toLowerCase();
				}
			}
		} else if (variantText) {
			if (looksLikeSize(variantText)) {
				size = variantText;
			} else {
				color = variantText.toLowerCase();
			}
		}

		// Price: read directly from the dedicated price element, divide by qty for per-unit
		const priceEl = row.querySelector("p.order-list__item-price");
		const priceText = priceEl ? (priceEl.textContent ?? "").trim() : "";
		const prices = extractPrices(priceText);
		const totalPrice = prices[0] ?? "";
		const price = totalPrice && qty > 1
			? `$${(parseFloat(totalPrice.replace("$", "")) / qty).toFixed(2)}`
			: totalPrice;

		// Sale detection: struck-through original price present
		const delEl = row.querySelector("del.order-list__item-original-price");
		const onSale = Boolean(delEl);
		const delPrices = delEl ? extractPrices(delEl.textContent ?? "") : [];
		const originalPriceTotal = delPrices[0] ?? "";
		const originalPrice = originalPriceTotal && qty > 1
			? `$${(parseFloat(originalPriceTotal.replace("$", "")) / qty).toFixed(2)}`
			: originalPriceTotal;

		const dedupeKey = `${name.toLowerCase()}|${color}|${size}`;
		if (seenKeys.has(dedupeKey)) continue;
		seenKeys.add(dedupeKey);

		products.push({
			imageUrl,
			name,
			brand: "",
			price,
			...(originalPrice ? { originalPrice } : {}),
			color,
			size,
			itemNumber: "",
			material: "",
			onSale,
			...(qty > 1 ? { qty } : {}),
		});
	}

	return products;
}

/**
 * Strategy: Single-column bold-paragraph layout (Banana Republic Factory, Gap, Old Navy).
 *
 * Each product occupies a single <td> containing:
 *   <img width="20"> (tiny brand logo — filtered by isProductImage)
 *   <p style="font-weight:bold"> — product name
 *   <p style="font-size:12px">  — SKU (6+ digit number)
 *   <p> with <span style="line-through">Was $X</span> + <span style="color:...">$Y</span>
 *   <p> — "SIZE | COLOR" (e.g. "S | Red Plaid", "2 | Black & White Plaid")
 *
 * Guard: requires both a bold-name <p> and a SIZE|COLOR <p> (or price) to avoid
 * false-positives on shipping/promo rows that also contain bold text.
 */

/**
 * Parse order-level discount fraction from raw HTML before the DOM is pruned.
 * Looks for a Subtotal + Promotions pair in the raw text (works even if the
 * DOM pre-processor removes nodes).
 */
function parseBRDiscountFraction(html: string): number {
	// Non-greedy scan: find the first $ after "Subtotal" and the first -$ after "Promotions".
	// Using [\s\S]*? so HTML tag content (which may contain hyphens) doesn't break the match.
	const subtotalMatch = html.match(/[Ss]ubtotal[\s\S]*?\$([\d,.]+)/);
	const promoMatch = html.match(/[Pp]romotions[\s\S]*?-\$([\d,.]+)/);
	if (!subtotalMatch || !promoMatch) return 0;
	const subtotal = parseFloat(subtotalMatch[1].replace(/,/g, ""));
	const promo = parseFloat(promoMatch[1].replace(/,/g, ""));
	if (subtotal <= 0 || promo <= 0 || promo >= subtotal) return 0;
	return promo / subtotal;
}

/**
 * Strategy: Banana Republic / Gap Inc. 2020 labeled-attribute layout with order-level discount.
 *
 * Signal: a <td> containing <b>YOUR ORDER</b> (item count header) is present.
 * Each item has a <b>ItemName</b> followed by a nested Color:/Size:/Price:/Qty: label table.
 * The discount fraction is pre-computed from the raw HTML before DOM pruning.
 */
function extractFromBananaRepublic2020Layout(doc: Document, discountFraction: number): ExtractedProduct[] {
	// Signal: must have a bold "YOUR ORDER" header to avoid false-positives
	const allBolds = Array.from(doc.querySelectorAll("td b, td strong"));
	const hasYourOrder = allBolds.some((b) => /^YOUR ORDER$/i.test((b.textContent ?? "").trim()));
	if (!hasYourOrder) return [];

	const products: ExtractedProduct[] = [];
	const seen = new Set<string>();
	const skipPattern = /\b(order|summary|charges|subtotal|total|qty|quantity|price|color|size|shipping|promotions)\b/i;

	for (const bold of allBolds) {
		const name = getCellText(bold);
		if (!name || name.length < 3) continue;
		if (/^\$/.test(name) || /^\d/.test(name)) continue;
		if (skipPattern.test(name)) continue;

		const block = bold.closest("table");
		if (!block) continue;

		const color = getAttributeByLabel(block, "color");
		const size = getAttributeByLabel(block, "size");
		const priceRaw = getAttributeByLabel(block, "price");
		if (!color || !size || !priceRaw) continue;

		const listPrice = extractPrices(priceRaw)[0] ?? "";
		if (!listPrice) continue;

		let price = listPrice;
		let originalPrice: string | undefined;
		let onSale = false;

		if (discountFraction > 0) {
			const listNum = parseFloat(listPrice.replace(/[^0-9.]/g, ""));
			const saleNum = parseFloat((listNum * (1 - discountFraction)).toFixed(2));
			price = `$${saleNum.toFixed(2)}`;
			originalPrice = listPrice.startsWith("$") ? listPrice : `$${listPrice}`;
			onSale = true;
		}

		const dedupeKey = `${name}|${color}|${size}`.toLowerCase();
		if (seen.has(dedupeKey)) continue;
		seen.add(dedupeKey);

		products.push({
			imageUrl: "",
			name,
			brand: "",
			price,
			color: color.toLowerCase(),
			size,
			itemNumber: "",
			material: "",
			onSale,
			...(originalPrice ? { originalPrice } : {}),
		});
	}

	return products;
}

function extractFromBoldParagraphLayout(doc: Document): ExtractedProduct[] {
	const products: ExtractedProduct[] = [];
	const seenKeys = new Set<string>();

	// Find all <p> elements whose style contains font-weight:bold
	const boldPs = Array.from(doc.querySelectorAll("p[style*='font-weight:bold'], p[style*='font-weight: bold']"));

	for (const boldP of boldPs) {
		const name = (boldP.textContent ?? "").trim();
		if (!name || name.length < 3) continue;

		// Must sit inside a <td>
		const parentTd = boldP.closest("td");
		if (!parentTd) continue;

		// Collect sibling <p> elements that follow the bold name in this <td>
		const allPs = Array.from(parentTd.querySelectorAll("p"));
		const boldIdx = allPs.findIndex((p) => p === boldP);
		if (boldIdx === -1) continue;
		const siblings = allPs.slice(boldIdx + 1);

		let price = "";
		let originalPrice = "";
		let color = "";
		let size = "";
		let onSale = false;
		let itemNumber = "";
		let hasSizeColor = false;

		for (const p of siblings) {
			const text = (p.textContent ?? "").replace(/\s+/g, " ").trim();

			// Price line: contains a strikethrough span ("Was $90.00" struck + colored sale price)
			const strikeEl = p.querySelector("span[style*='line-through'], s, del");
			if (strikeEl) {
				onSale = true;
				originalPrice = extractPrices(strikeEl.textContent ?? "")[0] ?? "";
				// Sale price: colored span or last price in the paragraph
				const coloredSpan = p.querySelector("span[style*='color']");
				if (coloredSpan) {
					const m = (coloredSpan.textContent ?? "").match(/\$[\d.]+/);
					if (m) price = m[0];
				}
				if (!price) {
					const prices = extractPrices(text);
					const origPrice = parseFloat((originalPrice || "0").replace("$", ""));
					price = prices.find((p) => parseFloat(p.replace("$", "")) < origPrice) ?? prices[prices.length - 1] ?? "";
				}
				continue;
			}

			// SKU: exactly 6+ digits
			if (/^\d{6,}$/.test(text)) {
				itemNumber = text;
				continue;
			}

			// SIZE | COLOR (or SIZE / COLOR): "S | Red Plaid", "M | Brown"
			if (text.includes("|") || text.includes("/")) {
				const parsed = parseSizeColorLine(text);
				if (parsed.size) {
					size = parsed.size;
					color = parsed.color;
					hasSizeColor = true;
					continue;
				}
			}
		}

		// Require at minimum either a price OR a size|color to confirm product row
		if (!hasSizeColor && !price) continue;

		const dedupeKey = `${name}|${color}|${size}`.toLowerCase();
		if (seenKeys.has(dedupeKey)) continue;
		seenKeys.add(dedupeKey);

		products.push({
			imageUrl: "",
			name,
			brand: "",
			price,
			...(originalPrice ? { originalPrice } : {}),
			color,
			size,
			itemNumber,
			material: "",
			onSale,
		});
	}

	return products;
}

/**
 * Strategy: Poshmark 3-cell row layout.
 *
 * Poshmark order emails use a 3-cell <tr>:
 *   <td class="item"> — product image (75×75)
 *   <td>              — nested table (width="360") with name row, Size: row, and a
 *                       hidden <span class="price" display:none> (skipped)
 *   <td class="price"> — visible price text (e.g. "$24.00")
 *
 * Guard: requires td.price class on the price cell — specific to Poshmark's template.
 */
function extractFromPoshmarkLayout(doc: Document): ExtractedProduct[] {
	const priceCells = Array.from(doc.querySelectorAll("td.price")).filter((td) => {
		const style = td.getAttribute("style") ?? "";
		return !style.includes("display:none") && !style.includes("display: none");
	});

	if (priceCells.length === 0) return [];

	const products: ExtractedProduct[] = [];
	const seenKeys = new Set<string>();

	for (const priceCell of priceCells) {
		const row = priceCell.closest("tr");
		if (!row) continue;

		const cells = directChildren(row, "td");
		if (cells.length !== 3) continue;

		let imageUrl = "";
		let detailsCell: Element | null = null;

		for (const cell of cells) {
			if (cell === priceCell) continue;

			const img = cell.querySelector("img");
			if (img && isProductImage(img as HTMLImageElement)) {
				imageUrl = img.getAttribute("src") ?? "";
				continue;
			}

			if (!detailsCell && (cell.textContent ?? "").trim().length > 3) {
				detailsCell = cell;
			}
		}

		if (!detailsCell) continue;

		const nestedRows = Array.from(detailsCell.querySelectorAll("tr"));

		let name = "";
		let size = "";

		for (const nRow of nestedRows) {
			// Skip rows whose content is entirely hidden
			if (nRow.querySelector("[style*='display:none']")) continue;

			const text = getCellText(nRow);
			if (!text) continue;

			const sizeMatch = text.match(/^Size\s*:\s*(.+)/i);
			if (sizeMatch && !size) {
				size = sizeMatch[1].trim();
				continue;
			}

			if (!name && text.length > 3) {
				name = text;
			}
		}

		if (!name) continue;

		const priceText = getCellText(priceCell as Element);
		const price = priceText.startsWith("$") ? priceText : priceText ? `$${priceText}` : "";

		const dedupeKey = `${name.toLowerCase()}|${price}`;
		if (seenKeys.has(dedupeKey)) continue;
		seenKeys.add(dedupeKey);

		products.push({
			imageUrl,
			name,
			brand: "",
			price,
			color: "",
			size,
			itemNumber: "",
			material: "",
			onSale: false,
		});
	}

	return products;
}

/**
 * Strategy: SHEIN side-by-side 30%/69% table layout.
 *
 * SHEIN order emails pair a 30%-width image table with a 69%-width details
 * table inside the same container element. The details table contains:
 *   <span style="color:#939393"> — product name (grey text)
 *   SKU: …<br>
 *   SIZE: COLOR-SIZE<br>   (e.g. "Dark Grey-Petite S" or "Black-S")
 *   QTY: 1
 *
 * Guard: requires the image URL to come from ltwebstatic.com (SHEIN's CDN),
 * preventing false-positive matches on other email layouts.
 */
function extractFromSHEINLayout(doc: Document): ExtractedProduct[] {
	const productImgs = Array.from(doc.querySelectorAll("img[src*='ltwebstatic.com']")).filter((img) => isProductImage(img as HTMLImageElement));

	if (productImgs.length === 0) return [];

	const products: ExtractedProduct[] = [];
	const seenKeys = new Set<string>();

	for (const img of productImgs) {
		const imageUrl = img.getAttribute("src") ?? "";

		// Walk up to the image's containing table (the 30% one)
		const imgTable = (img as Element).closest("table");
		if (!imgTable) continue;

		const parent = imgTable.parentElement;
		if (!parent) continue;

		// Find the sibling table that has the grey product-name span
		let detailsTable: Element | null = null;
		for (const sibling of Array.from(parent.children)) {
			if (sibling === imgTable || sibling.tagName !== "TABLE") continue;
			if (sibling.querySelector("span[style*='color:#939393'], span[style*='color: #939393']")) {
				detailsTable = sibling;
				break;
			}
		}

		if (!detailsTable) continue;

		const greySpan = detailsTable.querySelector("span[style*='color:#939393'], span[style*='color: #939393']");
		if (!greySpan) continue;

		const name = (greySpan.textContent ?? "").trim();
		if (!name || name.length < 3) continue;

		const detailsTd = greySpan.closest("td");
		if (!detailsTd) continue;

		const lines = getTextLines(detailsTd);

		let size = "";
		let color = "";

		for (const line of lines) {
			const sizeMatch = line.match(/^SIZE\s*:\s*(.+)/i);
			if (sizeMatch && !size) {
				const parsed = parseSHEINSizeField(sizeMatch[1].trim());
				color = parsed.color;
				size = parsed.size;
				break;
			}
		}

		const dedupeKey = `${name.toLowerCase()}|${size}|${color}`;
		if (seenKeys.has(dedupeKey)) continue;
		seenKeys.add(dedupeKey);

		products.push({
			imageUrl,
			name,
			brand: "",
			price: "",
			color,
			size,
			itemNumber: "",
			material: "",
			onSale: false,
		});
	}

	return products;
}

/**
 * Strategy: Target order email two-column product blocks.
 *
 * Each item is a `<!-- PRODUCT BLOCK -->` with a 2-column layout: a left
 * `td.product-image` holding the photo (target.scene7.com) and a right
 * `td.product-details` holding `<h2><a>` (the product name) and a `Qty: N`
 * paragraph. No price is included in these emails.
 *
 * Name comes from the <h2> link (the image `alt` is sometimes mangled, e.g.
 * the shower-liner alt is broken across HTML attributes). Guard: requires a
 * `td.product-details` containing an <h2>, so it won't fire on generic emails.
 */
function extractFromTargetLayout(doc: Document): ExtractedProduct[] {
	const detailCells = Array.from(doc.querySelectorAll("td.product-details"));
	if (detailCells.length === 0) return [];

	const products: ExtractedProduct[] = [];
	const seen = new Set<string>();

	for (const cell of detailCells) {
		const heading = cell.querySelector("h2 a") ?? cell.querySelector("h2");
		const name = heading ? getCellText(heading) : "";
		if (!name || name.length < 3) continue;

		// The image lives in the sibling product-col-left table inside the same
		// wrapping <td>. Walk up to that wrapper, then find the product image.
		let imageUrl = "";
		const wrapper = cell.closest("table")?.parentElement ?? null;
		if (wrapper) {
			const img = wrapper.querySelector("td.product-image img") ?? wrapper.querySelector("img");
			if (img && isProductImage(img as HTMLImageElement)) {
				imageUrl = img.getAttribute("src") ?? "";
			}
		}

		if (seen.has(name.toLowerCase())) continue;
		seen.add(name.toLowerCase());

		products.push({
			imageUrl,
			name,
			brand: "",
			price: "",
			color: "",
			size: "",
			itemNumber: "",
			material: "",
			onSale: false,
		});
	}

	return products;
}

/**
 * Strategy: monospace plaintext register receipt (Old Navy / Gap Inc. POS).
 *
 * In-store receipts are emailed as a single monospace block where each line is
 * <br>-separated and space-padded. A purchased item is two consecutive lines:
 *   "Cozy Crew Socks for Women      1.00 N"   ← name + net price + tax code
 *   "608308-151-0000          1 @ 5.00"       ← SKU + qty @ unit (original) price
 * followed by optional "Item Discount …" and a department-code line.
 *
 * Guard: an item line must be immediately followed by a SKU line in the exact
 * NNNNNN-NNN-NNNN "1 @ price" form, and at least two items must be found. This
 * filters non-product lines (e.g. "Bag fee … 0.05 N", whose next line is "108
 * 1 @ 0.05") and prevents the barcode <img> from being mistaken for a product
 * by the image fallback.
 */
function extractFromReceiptText(doc: Document): ExtractedProduct[] {
	const lines = getTextLines(doc.body);

	// "Name<spaces>1.00 N" — net (post-discount) price, trailing tax code letter.
	const ITEM_RE = /^(.+?)\s+(\d+\.\d{2})\s+[A-Z]$/;
	// "608308-151-0000   1 @ 5.00" — SKU then quantity @ unit (pre-discount) price.
	const SKU_RE = /^(\d{6}-\d{3}-\d{4})\s+(\d+)\s*@\s*(\d+\.\d{2})$/;

	const products: ExtractedProduct[] = [];
	const seen = new Set<string>();

	for (let i = 0; i < lines.length - 1; i++) {
		const itemMatch = lines[i].match(ITEM_RE);
		if (!itemMatch) continue;

		const skuMatch = lines[i + 1].match(SKU_RE);
		if (!skuMatch) continue; // require the SKU line to confirm a real product

		const name = itemMatch[1].trim();
		const paid = parseFloat(itemMatch[2]);
		const itemNumber = skuMatch[1];
		const original = parseFloat(skuMatch[3]);

		// SKU embeds the colorway, so distinct lines stay distinct; identical
		// repeats collapse.
		if (seen.has(itemNumber)) continue;
		seen.add(itemNumber);

		products.push({
			imageUrl: "",
			name,
			brand: "",
			price: `$${paid.toFixed(2)}`,
			color: "",
			size: "",
			itemNumber,
			material: "",
			onSale: original > paid,
		});
	}

	// Require ≥2 items so a stray "label  0.00 X" line can't trigger a match.
	return products.length >= 2 ? products : [];
}

/**
 * Extract the current (sale) price from a cell that may carry a "Price:" /
 * "Total:" label and a strikethrough original. Amounts may be written
 * "$7.46" or bare "7.46". Returns the non-struck amount, the struck original
 * (when present), and a sale flag.
 */
function parseLabeledStruckPrice(cell: Element | null | undefined): { price: string; originalPrice: string; onSale: boolean } {
	if (!cell) return { price: "", originalPrice: "", onSale: false };

	const strikeEl = cell.querySelector(".strike, s, strike, del, [style*='line-through']");
	const struckText = strikeEl ? getCellText(strikeEl) : "";
	const origMatch = struckText.match(/(\d{1,6}(?:\.\d{2})?)/);
	const originalPrice = origMatch ? `$${origMatch[1]}` : "";

	let text = getCellText(cell).replace(/^(price|total)\s*:?\s*/i, "");
	if (struckText) text = text.replace(struckText, " ");

	const m = text.match(/(\d{1,6}(?:\.\d{2})?)/);
	const price = m ? `$${m[1]}` : "";
	return { price, originalPrice, onSale: Boolean(struckText) };
}

/** Parse a quantity from a cell like "Qty: 5" or a bare "5". Defaults to 1. */
function parseQuantity(cell: Element | null | undefined): number {
	if (!cell) return 1;
	const m = getCellText(cell).match(/(\d{1,4})/);
	const qty = m ? parseInt(m[1], 10) : 1;
	return qty > 0 ? qty : 1;
}

/**
 * Resolve unit price + original price for an Anthropologie product container.
 *
 * The struck original may appear on the per-unit price cell (single-qty orders)
 * OR only on the line-total cells (multi-qty orders). When only the total is
 * struck, the per-unit original is derived as `totalOriginal / qty`.
 */
function resolveAnthroPricing(container: Element): { price: string; originalPrice: string; onSale: boolean } {
	const largeCells = Array.from(container.querySelectorAll("td.item-price-large"));
	// 3-column layout is [unit price, qty, line total].
	const unitCell = largeCells[0] ?? container.querySelector("td.product-price");
	const totalCell = (largeCells.length >= 3 ? largeCells[2] : null) ?? container.querySelector("td.product-total");
	const qtyCell = largeCells[1] ?? container.querySelector("td.product-qty");

	const unit = parseLabeledStruckPrice(unitCell);
	let { price, originalPrice, onSale } = unit;

	// Per-unit original missing but the line total is struck → derive unit original.
	if (!originalPrice && totalCell) {
		const total = parseLabeledStruckPrice(totalCell);
		if (total.originalPrice) {
			const qty = parseQuantity(qtyCell);
			const origNum = parseFloat(total.originalPrice.replace("$", ""));
			if (qty > 0 && origNum > 0) {
				originalPrice = `$${(origNum / qty).toFixed(2)}`;
				onSale = true;
			}
		}
	}

	return { price, originalPrice, onSale };
}

/**
 * Strategy: Anthropologie / Demandware "item-detail-row" layout.
 *
 * Each product is a multi-column <tr> inside <td class="item-table-container">:
 *   <td class="item-image">      — product photo (≈129px)
 *   <td class="item-details">    — nested table of labeled rows:
 *       td.product-name (<h4>), td.product-style, td.product-color, td.product-size
 *   <td class="item-price-large"> ×3 — unit price / qty / line total
 * A sibling <td class="product-specs"> repeats Price/Qty/Total in small text.
 *
 * Prices may be "$7.46" or bare "7.46"; the struck-through value is the
 * original (pre-sale) price. Without a dedicated strategy the generic 4+-cell
 * table parser dumped the whole details blob into the name and mistook the
 * bare price for the color.
 *
 * Guard: requires td.product-name plus a product-color or product-size cell,
 * so it only fires on this specific template.
 */
function extractFromAnthropologieLayout(doc: Document): ExtractedProduct[] {
	const nameCells = Array.from(doc.querySelectorAll("td.product-name"));
	if (nameCells.length === 0) return [];

	const products: ExtractedProduct[] = [];
	const seen = new Set<string>();

	const stripLabel = (el: Element | null | undefined, label: RegExp): string => (el ? getCellText(el).replace(label, "").trim() : "");

	for (const nameCell of nameCells) {
		const detailsCell = nameCell.closest("td.item-details");
		const colorCell = detailsCell?.querySelector("td.product-color");
		const sizeCell = detailsCell?.querySelector("td.product-size");
		// Require a labeled attribute to confirm this is the Anthropologie layout.
		if (!colorCell && !sizeCell) continue;

		const name = getCellText(nameCell);
		if (!name) continue;

		const color = stripLabel(colorCell, /^color\s*:?\s*/i).toLowerCase();
		const size = stripLabel(sizeCell, /^size\s*:?\s*/i);
		const itemNumber = stripLabel(detailsCell?.querySelector("td.product-style"), /^style\s*no\.?\s*:?\s*/i);

		let price = "";
		let originalPrice = "";
		let onSale = false;
		let imageUrl = "";

		const container = nameCell.closest("td.item-table-container");
		if (container) {
			({ price, originalPrice, onSale } = resolveAnthroPricing(container));

			const img = container.querySelector("td.item-image img");
			if (img && isProductImage(img as HTMLImageElement)) {
				imageUrl = img.getAttribute("src") ?? "";
			}
		}

		const dedupeKey = `${name.toLowerCase()}|${color}|${size}`;
		if (seen.has(dedupeKey)) continue;
		seen.add(dedupeKey);

		products.push({ imageUrl, name, brand: "", price, ...(originalPrice ? { originalPrice } : {}), color, size, itemNumber, material: "", onSale });
	}

	return products;
}

// ── Column-header table strategy ─────────────────────────

type ColumnField = "name" | "price" | "size" | "color" | "itemNumber" | "qty";

// Header label → field. Checked against the lowercased, punctuation-stripped
// header cell text (exact match) so "Price" maps but "Price each" does not.
const COLUMN_HEADER_LABELS: Record<string, ColumnField> = {
	description: "name",
	item: "name",
	product: "name",
	"item description": "name",
	price: "price",
	amount: "price",
	size: "size",
	color: "color",
	colour: "color",
	reference: "itemNumber",
	style: "itemNumber",
	ref: "itemNumber",
	sku: "itemNumber",
	qty: "qty",
	quantity: "qty",
	units: "qty",
	unit: "qty",
};

// Rows whose name cell is one of these are order summary lines, not products.
const SUMMARY_ROW_RE = /^(sub\s?total|total|shipping|delivery|estimated\s+tax|sales\s+tax|tax|discount|grand\s+total)\b/i;

function classifyColumnHeader(text: string): ColumnField | undefined {
	const key = text.trim().toLowerCase().replace(/[:#*]/g, "").replace(/\s+/g, " ").trim();
	return COLUMN_HEADER_LABELS[key];
}

function priceFromCell(text: string): string {
	const fromExtract = extractPrices(text)[0];
	if (fromExtract) return fromExtract;
	// Bare decimal/integer ("3.90") with no $ or currency code.
	const m = text.match(/(\d{1,6}(?:\.\d{2})?)/);
	return m ? `$${m[1]}` : "";
}

/**
 * Strategy: Generic column-header order table.
 *
 * Handles plain tabular receipts where a header row (<thead> or the first <tr>)
 * names the columns — Description / Price / Size / Color / Reference(SKU) /
 * Qty / Amount — and each body <tr> is a product mapped positionally to those
 * columns. Covers American Apparel (Qty|Style|Description|Size|Color|Price|
 * Amount) and older Zara order tables (Description|Reference|Size|Units|Amount,
 * currency-code prices). No product images.
 *
 * Guard: a header row must resolve BOTH a name column and a price column. Runs
 * after the image/bold/labeled layouts so it only intercepts what would
 * otherwise fall through to the loose text-only fallback. Summary rows
 * (Subtotal/Total/Tax/Shipping) and colspan footer rows are skipped.
 */
function extractFromColumnHeaderTable(doc: Document): ExtractedProduct[] {
	const products: ExtractedProduct[] = [];
	const seen = new Set<string>();

	for (const table of Array.from(doc.querySelectorAll("table"))) {
		// Collect rows from direct table sections only (thead, tbody, tfoot, or direct tr).
		// This avoids mixing rows from nested tables.
		let rows: Element[] = [];

		// Direct <tr> children (if table has no section wrappers)
		rows.push(...directChildren(table, "tr"));

		// Rows from <thead>, <tbody>, <tfoot> sections
		for (const section of directChildren(table, "thead").concat(
			directChildren(table, "tbody"),
			directChildren(table, "tfoot")
		)) {
			rows.push(...directChildren(section, "tr"));
		}

		if (rows.length < 2) continue;

		// Skip very large tables (likely layout containers, not product tables).
		// Product tables typically have header + 2-20 items, layout tables have 20+ rows.
		if (rows.length > 30) continue;

		// Find the header row and build field → column-index map.
		let headerRow: Element | null = null;
		const fieldCol: Partial<Record<ColumnField, number>> = {};

		for (const row of rows) {
			const ths = directChildren(row, "th");
			const cells = ths.length > 0 ? ths : directChildren(row, "td");
			if (cells.length < 3) continue;

			const map: Partial<Record<ColumnField, number>> = {};
			cells.forEach((cell, i) => {
				const field = classifyColumnHeader(getCellText(cell));
				if (field && map[field] === undefined) map[field] = i;
			});

			if (map.name !== undefined && map.price !== undefined) {
				headerRow = row;
				Object.assign(fieldCol, map);
				break;
			}
		}

		if (!headerRow) continue;

		const maxCol = Math.max(...Object.values(fieldCol).filter((v): v is number => v !== undefined));
		let pastHeader = false;

		for (const row of rows) {
			if (row === headerRow) {
				pastHeader = true;
				continue;
			}
			if (!pastHeader) continue;

			const cells = directChildren(row, "td");
			// Footer/summary rows use colspan and have fewer cells than the header.
			if (cells.length <= maxCol) continue;

			const name = getCellText(cells[fieldCol.name as number]);
			if (!name || SUMMARY_ROW_RE.test(name)) continue;

			const price = fieldCol.price !== undefined ? priceFromCell(getCellText(cells[fieldCol.price])) : "";
			const size = fieldCol.size !== undefined ? getCellText(cells[fieldCol.size]) : "";
			const color = fieldCol.color !== undefined ? getCellText(cells[fieldCol.color]).toLowerCase() : "";
			const itemNumber = fieldCol.itemNumber !== undefined ? getCellText(cells[fieldCol.itemNumber]) : "";

			const dedupeKey = `${name}|${color}|${size}|${itemNumber}`.toLowerCase();
			if (seen.has(dedupeKey)) continue;
			seen.add(dedupeKey);

			products.push({ imageUrl: "", name, brand: "", price, color, size, itemNumber, material: "", onSale: false });
		}
	}

	return products;
}

/**
 * Strategy: Banana Republic / Athleta (older Gap Inc. template).
 *
 * Each item is a bold name (<b>) followed by a nested 2-column attribute table
 * of labeled rows: "Color:" / "Size:" / "Price:" / "Qty:". There are no product
 * images and no SKU line.
 *
 * Guard: requires the <b> name to resolve Color + Size + a "Price:" label. The
 * "Price:" label distinguishes it from Victoria's Secret (no Price: label, has a
 * 6-digit SKU) and CUUP (uses <th> + a bold span). Header/price bolds (e.g.
 * "YOUR ORDER", "$70.97") are filtered by name guards.
 */
/**
 * Like getAttributeByLabel but requires the label cell to end with a colon
 * ("Color:" not "Color"). This distinguishes real BR/Athleta attribute blocks
 * from column-header tables (American Apparel) whose header row has bare
 * "Size"/"Color"/"Price" cells that would otherwise be misread as labels.
 */
function getAttributeByColonLabel(cell: Element, label: string): string {
	const cells = Array.from(cell.querySelectorAll("td"));
	for (let i = 0; i < cells.length - 1; i++) {
		const raw = getCellText(cells[i]).trim();
		if (!raw.endsWith(":")) continue;
		if (raw.replace(/:$/, "").trim().toLowerCase() === label) {
			return getCellText(cells[i + 1]).trim();
		}
	}
	return "";
}

function extractFromGapIncLabeledLayout(doc: Document): ExtractedProduct[] {
	const bolds = Array.from(doc.querySelectorAll("td b, td strong"));
	const products: ExtractedProduct[] = [];
	const seen = new Set<string>();

	for (const bold of bolds) {
		const name = getCellText(bold);
		if (!name || name.length < 3) continue;
		// Skip prices ("$70.97") and order/summary headers ("YOUR ORDER (2 items)").
		if (/^\$/.test(name) || /^\d/.test(name)) continue;
		if (/\b(order|items?|subtotal|total|qty|quantity|price|color|size|shipping)\b/i.test(name)) continue;

		const block = bold.closest("table");
		if (!block) continue;

		const color = getAttributeByColonLabel(block, "color");
		const size = getAttributeByColonLabel(block, "size");
		const priceRaw = getAttributeByColonLabel(block, "price");
		// Require all three labels — this is what makes the layout unambiguous.
		if (!color || !size || !priceRaw) continue;

		const price = extractPrices(priceRaw)[0] ?? "";

		const dedupeKey = `${name}|${color}|${size}`.toLowerCase();
		if (seen.has(dedupeKey)) continue;
		seen.add(dedupeKey);

		products.push({
			imageUrl: "",
			name,
			brand: "",
			price,
			color: color.toLowerCase(),
			size,
			itemNumber: "",
			material: "",
			onSale: false,
		});
	}

	return products;
}

/**
 * Strategy: Zara MJML single-column layout (newer Zara order/shipping emails).
 *
 * Unlike the older `rd-product-col` div layout, each product is a vertical run
 * of sibling <tr> rows distinguished by class:
 *   td.product-img    — product photo (anchors each item)
 *   td.product-size   — size ("S", "8")
 *   (plain row)       — UPPERCASE product name
 *   (plain row)       — "Color SKU" (e.g. "Black 0/7901/290/800/02")
 *   td.product-unit / td.product-unit-label — quantity
 *   td.product-price  — "21.54 USD" (currency-code form, no $)
 *
 * Items are segmented by the product-img rows; "Products" titles, item counters,
 * and "Shipping NNNNN" headers sit outside any product run and are skipped.
 */
function extractFromZaraMjmlLayout(doc: Document): ExtractedProduct[] {
	const imgCells = Array.from(doc.querySelectorAll("td.product-img"));
	if (imgCells.length === 0) return [];

	const products: ExtractedProduct[] = [];
	const seen = new Set<string>();

	for (const imgCell of imgCells) {
		const imgRow = imgCell.closest("tr");
		const img = imgCell.querySelector("img");
		if (!imgRow || !img || !isProductImage(img as HTMLImageElement)) continue;

		const imageUrl = img.getAttribute("src") ?? "";

		let size = "";
		let price = "";
		let name = "";
		let color = "";

		// Walk following sibling rows until the next product image.
		for (let row = imgRow.nextElementSibling; row; row = row.nextElementSibling) {
			if (row.querySelector("td.product-img")) break;

			const cell = row.querySelector("td");
			if (!cell) continue;

			if (cell.classList.contains("product-size")) {
				if (!size) size = getCellText(cell);
			} else if (cell.classList.contains("product-price")) {
				if (!price) price = extractPrices(getCellText(cell))[0] ?? "";
			} else if (
				cell.classList.contains("product-unit") ||
				cell.classList.contains("product-unit-label") ||
				cell.classList.contains("product-custom-warn")
			) {
				continue;
			} else {
				const text = getCellText(cell);
				if (!text) continue;
				// Color line carries a Zara SKU ("Black 0/7901/290/800/02").
				if (/\d\/\d{3,4}\//.test(text)) {
					if (!color) color = parseColorFromSkuLine(text);
				} else if (!name) {
					name = text;
				}
			}
		}

		if (!name) continue;

		const dedupeKey = `${name}|${color}|${size}`.toLowerCase();
		if (seen.has(dedupeKey)) continue;
		seen.add(dedupeKey);

		products.push({
			imageUrl,
			name,
			brand: "",
			price,
			color,
			size,
			itemNumber: "",
			material: "",
			onSale: false,
		});
	}

	return products;
}

/** Strip a leading VS color code ("54A2 Black" -> "black", "Black" -> "black"). */
function cleanVSColor(raw: string): string {
	const parts = raw.trim().split(/\s+/);
	if (parts.length > 1 && /\d/.test(parts[0])) parts.shift();
	return parts.join(" ").toLowerCase();
}

/**
 * Strategy: Victoria's Secret order confirmation (Salesforce Marketing Cloud).
 *
 * Each item is a single-column block whose per-item <table> holds:
 *   <b>Product Name</b>
 *   123456            (6+ digit SKU, on its own line)
 *   a nested Color / Size / Qty / Status attribute table
 *   a price block: <span>$paid</span> <span>-$discount</span> $original
 *
 * VS repeats the same SKU across shipment sections, so items are de-duplicated
 * by SKU with the LAST occurrence winning (the consolidated/final line). There
 * are no per-item product images (only marketing banners), so imageUrl is empty.
 *
 * Guard: requires a <b> name plus Color + Size labels + a 6-digit SKU, so it
 * won't fire on other layouts (H&M's attribute rows lack the <b> name and are
 * already handled earlier).
 */
function extractFromVictoriasSecretLayout(doc: Document): ExtractedProduct[] {
	const bolds = Array.from(doc.querySelectorAll("td b"));
	if (bolds.length === 0) return [];

	const order: string[] = [];
	const bySku = new Map<string, ExtractedProduct>();

	for (const bold of bolds) {
		const name = getCellText(bold);
		if (!name || name.length < 3) continue;

		const block = bold.closest("table");
		if (!block) continue;

		const color = cleanVSColor(getAttributeByLabel(block, "color"));
		const size = getAttributeByLabel(block, "size");
		if (!color || !size) continue;

		// SKU: a cell whose text is only 6+ digits.
		const skuCell = Array.from(block.querySelectorAll("td")).find((td) => /^\d{6,}$/.test(getCellText(td)));
		const itemNumber = skuCell ? getCellText(skuCell) : "";
		if (!itemNumber) continue;

		// Price block: first $ amount is the paid line total; the highest trailing
		// amount is the struck original (sale). A middle "-$X (Offers & Discounts)"
		// line is the discount and is ignored for the original.
		const prices = extractPrices(getCellText(block));
		const price = prices[0] ?? "";
		const amounts = prices.map((p) => parseFloat(p.replace("$", "")));
		const maxAmount = amounts.length > 0 ? Math.max(...amounts) : 0;
		const onSale = amounts.length > 1 && maxAmount > amounts[0];
		const originalPrice = onSale ? `$${maxAmount.toFixed(2)}` : "";

		const product: ExtractedProduct = {
			imageUrl: "",
			name,
			brand: "",
			price,
			...(originalPrice ? { originalPrice } : {}),
			color,
			size,
			itemNumber,
			material: "",
			onSale,
		};

		if (!bySku.has(itemNumber)) order.push(itemNumber);
		bySku.set(itemNumber, product); // last occurrence wins
	}

	return order.map((sku) => bySku.get(sku) as ExtractedProduct);
}

// Post-processing applied to every extracted product regardless of strategy.
// Infer-from-raw first, then clean for storage — per advisor guidance.
function enrichProduct(p: ExtractedProduct): ExtractedProduct {
	const rawName = p.name;

	// Extract inline color/size suffix ("...in burgundy size M") before cleaning
	const inline = parseInlineColorSize(rawName);
	const color = p.color || inline.color;
	const size = p.size || inline.size;

	// Strip brand prefix from name, then clean SEO junk
	const nameWithoutBrand = stripBrandFromName(rawName, p.brand);
	const name = cleanProductName(nameWithoutBrand) || nameWithoutBrand;

	// Infer clothing attributes from raw (un-cleaned) name
	const attrs = inferProductAttributes(rawName);

	return { ...p, name, color, size, ...attrs };
}

export function parseProductsFromEmail(html: string): ExtractedProduct[] {
	if (!html.trim()) return [];

	// Parse order-level discount from raw HTML BEFORE DOMParser and pruning —
	// removePostTotalContent strips the Subtotal sibling td and Promotions rows.
	const brDiscountFraction = parseBRDiscountFraction(html);

	const parser = new DOMParser();
	const doc = parser.parseFromString(html, "text/html");

	// Banana Republic / Gap Inc. order emails place an "Order total:" summary box
	// ABOVE the itemized "YOUR ORDER" section, so removePostTotalContent would
	// strip the products. This strategy has a strong signal (YOUR ORDER bold +
	// Color/Size/Price labels), so run it on the un-pruned DOM first.
	const brItems = extractFromBananaRepublic2020Layout(doc, brDiscountFraction);
	if (brItems.length > 0) return brItems.map(enrichProduct);

	// Pre-process: strip content after order total markers so suggested/
	// recommended product sections don't produce false positive detections.
	removePostTotalContent(doc);

	// Strategy order: most-specific first to avoid false positives.
	//
	//  1. Nested two-cell tables (ThredUp) — "Size X Name" link pattern
	//  2. Labeled-field <th> layout (CUUP) — bold span + Color:/Size:/Price:
	//  3. React Email sections (Cider) — data-id="react-email-section"
	//  4. Amazon MJML columns — img.productImage + mj-column divs
	//  5. SHEIN side-by-side tables — ltwebstatic.com CDN + grey span name
	//  6. H&M nested attribute table — two-cell rows with Color+Size table
	//  7. Banana Republic 2020 labeled-attribute layout with order-level promotion discount
	//  7b. Bold-paragraph single-column (Gap/Banana Republic Factory)
	//  8. Paragraph-based two-cell rows (Princess Polly) — <p> elements
	//  9. Poshmark 3-cell rows — td.item image + nested name table + td.price
	// 10. Anthropologie item-detail-row — labeled product-name/color/size cells
	// 11. Table rows with 4+ cells (Aritzia, Nordstrom)
	// 12. Shopify order template (SKIMS) — order-list__item-title class
	// 13. Order-ID container 3-column rows (AliExpress, Wish)
	// 14. Div-based layouts (Zara)
	// 15. Text-only product rows (Express) — no images, ≥2 matches
	// 16. Monospace POS receipt (Old Navy / Gap Inc.) — SKU line-pattern
	// 17. Image fallback

	const strategies = [
		extractFromNestedTables,
		extractFromLabeledFieldLayout,
		extractFromReactEmailLayout,
		extractFromAmazonLayout,
		extractFromSHEINLayout, // SHEIN ltwebstatic CDN
		extractFromAttributeTableRows,
		extractFromBoldParagraphLayout, // Gap / Banana Republic Factory
		extractFromParagraphLayout,
		extractFromPoshmarkLayout, // Poshmark td.price 3-cell rows
		extractFromAnthropologieLayout, // Anthropologie item-detail-row labeled tables
		extractFromVictoriasSecretLayout, // VS bold name + Color/Size/Qty attribute table
		extractFromGapIncLabeledLayout, // Banana Republic / Athleta bold name + Color:/Size:/Price: labels
		extractFromTargetLayout, // Target product-block 2-column layout
		extractFromTableRows,
		extractFromShopifyLayout, // Shopify order template (SKIMS, etc.)
		extractFromOrderContainerRows,
		extractFromZaraMjmlLayout, // Zara MJML single-column rows (product-img/size/price classes)
		extractFromDivLayout,
		extractFromColumnHeaderTable, // Generic header-mapped order tables (American Apparel, older Zara)
		extractFromTextOnlyRows,
		extractFromReceiptText, // Old Navy / Gap Inc. monospace POS receipt
		extractFromImages,
	];

	for (const strategy of strategies) {
		const raw = strategy(doc);
		if (raw.length > 0) return raw.map(enrichProduct);
	}

	return [];
}
