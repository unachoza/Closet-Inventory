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

function getSalePrice(td: Element): string {
	// Look for colored/styled price spans (sale price indicators)
	const coloredSpans = td.querySelectorAll("span[style]");
	for (const span of coloredSpans) {
		const style = span.getAttribute("style") ?? "";
		// Sale prices often use red/pink colors, not line-through
		if ((style.includes("color") && !style.includes("line-through")) || style.includes("#ff") || style.includes("red")) {
			const prices = extractPrices(span.textContent ?? "");
			if (prices.length > 0) return prices[0];
		}
	}

	// Fallback: get the last price in the cell (usually the current price)
	const allPrices = extractPrices(td.textContent ?? "");
	return allPrices.length > 0 ? allPrices[allPrices.length - 1] : "";
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

		for (const td of otherCells) {
			const text = getCellText(td);
			if (!text) continue;

			// Check if this cell has a price
			const cellPrice = getSalePrice(td);
			if (cellPrice && !price) {
				price = cellPrice;
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
			color,
			size,
			itemNumber,
			material: "",
			onSale: false,
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
 * Parse "1 unit / $ 14.90" or "2 units / $ 29.80" into "$14.90"
 */
function parsePriceFromUnitLine(text: string): string {
	const match = text.match(/\$\s*(\d{1,5}(?:\.\d{2})?)/);
	return match ? `$${match[1]}` : "";
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

	// "US 4 / DUSTY PINK", "S / Black", "XL / Navy"
	const match = cleaned.match(/^(?:US\s+)?(\S+)\s*\/\s*(.+)$/i);
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
		const key = getCellText(cells[i])
			.replace(/:$/, "")
			.trim()
			.toLowerCase();
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
		const struck = struckEl ? extractPrices(struckEl.textContent ?? "")[0] ?? "" : "";
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

				// Regular price (no strikethrough): standalone number like "$71.25" or "71.25"
				if (!price) {
					const priceMatch = line.match(/^\$?\s*(\d{1,5}(?:\.\d{2})?)\s*$/);
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

		// If paid < list, item is on sale
		const paidNum = paidPrice ? parseFloat(paidPrice.replace("$", "")) : 0;
		const onSale = listPrice > 0 && paidNum > 0 && paidNum < listPrice;

		// Deduplicate by name + color + size (same style in different colors are separate items)
		const dedupeKey = `${name}|${color}|${size}`.toLowerCase();
		if (seenKeys.has(dedupeKey)) continue;
		seenKeys.add(dedupeKey);

		products.push({
			imageUrl,
			name,
			brand: "",
			price,
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
			let onSale = false;

			if (priceCol) {
				const strikeDiv = priceCol.querySelector("div[style*='line-through']");
				if (strikeDiv) {
					onSale = true;
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
							if (last < first) onSale = true;
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
		let onSale = false;
		if (priceCol) {
			const strikeEl = priceCol.querySelector("[style*='line-through'], s, strike, del");
			if (strikeEl) onSale = true;

			const allPrices = extractPrices(priceCol.textContent ?? "");
			if (allPrices.length > 0) {
				price = allPrices[allPrices.length - 1];
				if (allPrices.length >= 2) {
					const first = parseFloat(allPrices[0].replace("$", ""));
					const last = parseFloat(price.replace("$", ""));
					if (last < first) onSale = true;
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

	const parser = new DOMParser();
	const doc = parser.parseFromString(html, "text/html");

	// Pre-process: strip content after order total markers so suggested/
	// recommended product sections don't produce false positive detections.
	removePostTotalContent(doc);

	// Strategy order: most-specific first to avoid false positives.
	//
	//  1. Nested two-cell tables (ThredUp) — "Size X Name" link pattern
	//  2. Labeled-field <th> layout (CUUP) — bold span + Color:/Size:/Price:
	//  3. React Email sections (Cider) — data-id="react-email-section"
	//  4. Amazon MJML columns — img.productImage + mj-column divs
	//  5. Paragraph-based two-cell rows (Princess Polly) — <p> elements
	//  6. Table rows with 4+ cells (Aritzia, Nordstrom)
	//  7. Order-ID container 3-column rows (AliExpress, Wish)
	//  8. Div-based layouts (Zara)
	//  9. Text-only product rows (Express) — no images, ≥2 matches
	// 10. Image fallback

	const strategies = [
		extractFromNestedTables,
		extractFromLabeledFieldLayout,
		extractFromReactEmailLayout,
		extractFromAmazonLayout,
		extractFromAttributeTableRows,
		extractFromParagraphLayout,
		extractFromTableRows,
		extractFromOrderContainerRows,
		extractFromDivLayout,
		extractFromTextOnlyRows,
		extractFromImages,
	];

	for (const strategy of strategies) {
		const raw = strategy(doc);
		if (raw.length > 0) return raw.map(enrichProduct);
	}

	return [];
}
