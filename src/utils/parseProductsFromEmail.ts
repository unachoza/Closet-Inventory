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
}

const PRICE_REGEX = /\$\d{1,5}(?:\.\d{2})?/g;
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
	return Array.from(text.matchAll(PRICE_REGEX)).map((m) => m[0]);
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
 * Strategy 1: Find <tr> rows that contain a product image, then read
 * sibling <td> cells for size, color, price, etc.
 */
function extractFromTableRows(doc: Document): ExtractedProduct[] {
	const allRows = doc.querySelectorAll("tr");
	const products: ExtractedProduct[] = [];
	const seenItems = new Set<string>();

	for (const row of allRows) {
		const cells = Array.from(row.querySelectorAll(":scope > td"));
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
		// or the one with the most content after the image
		const textCells = cells.filter((td) => {
			const text = getCellText(td);
			return text.length > 10 && td !== imgCell;
		});

		if (textCells.length === 0) continue;

		// The name cell is usually the one with the most text content
		const nameCell = textCells.reduce((best, td) => (getCellText(td).length > getCellText(best).length ? td : best));

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
 * Strategy 2: Div-based layouts (Zara, etc.).
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

		products.push({ imageUrl, name, brand: "", price, color, size, itemNumber: "" });
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

		products.push({ imageUrl, name, brand: "", price, color, size, itemNumber: "" });
	}

	return products;
}

/**
 * Strategy 3: Fallback for non-table layouts. Find product images and
 * read nearby text.
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
		});
	}

	return products;
}

export function parseProductsFromEmail(html: string): ExtractedProduct[] {
	if (!html.trim()) return [];

	const parser = new DOMParser();
	const doc = parser.parseFromString(html, "text/html");

	// Try table-row extraction first (most common for retailer emails)
	const tableProducts = extractFromTableRows(doc);
	if (tableProducts.length > 0) return tableProducts;

	// Try div-based extraction (Zara, etc.)
	const divProducts = extractFromDivLayout(doc);
	if (divProducts.length > 0) return divProducts;

	// Fallback to image-based extraction
	return extractFromImages(doc);
}
