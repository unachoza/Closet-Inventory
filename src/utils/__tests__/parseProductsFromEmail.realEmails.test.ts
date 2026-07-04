import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parseProductsFromEmail, type ExtractedProduct } from "../parseProductsFromEmail";
import { parseEmailToFormData, categoryFromName } from "../parseEmailToFormData";

/**
 * Regression tests built from real order-confirmation email HTML captured from
 * the retailers below. Each fixture is the exact markup the Gmail import feeds
 * the parser, so these lock the end-to-end extraction for whole emails (not
 * just isolated rows).
 */

function loadFixture(name: string): string {
	const body = readFileSync(join(__dirname, "__fixtures__", name), "utf-8");
	return `<html><body>${body}</body></html>`;
}

function byName(products: ExtractedProduct[], name: string): ExtractedProduct | undefined {
	return products.find((p) => p.name === name);
}

// ---------------------------------------------------------------------------
// Express — text-only line items (no product photos), <font> wrapped cells
// ---------------------------------------------------------------------------

describe("real emails > Express (no photos)", () => {
	const products = parseProductsFromEmail(loadFixture("express-no-photo.html"));

	it("detects all 4 line items", () => {
		expect(products).toHaveLength(4);
	});

	it("extracts each name and price", () => {
		expect(products.map((p) => [p.name, p.price])).toEqual([
			["STYLIST HIGH WAISTED PLEATED SHORTS", "$34.00"],
			["EDITOR SUPER HIGH WAISTED TAILORED MINI SKORT", "$29.00"],
			["BODY CONTOUR VELVET MOCK NECK LONG SLEEVE BODYSUIT", "$19.00"],
			["BODY CONTOUR HIGH COMPRESSION MOCK NECK LONG SLEEVE BODYSUIT", "$19.00"],
		]);
	});

	it("leaves imageUrl/color/size empty (none present in this format)", () => {
		for (const p of products) {
			expect(p.imageUrl).toBe("");
			expect(p.color).toBe("");
			expect(p.size).toBe("");
		}
	});

	it("infers attributes from the bodysuit names", () => {
		const bodysuit = byName(products, "BODY CONTOUR VELVET MOCK NECK LONG SLEEVE BODYSUIT");
		expect(bodysuit?.sleeveLength).toBe("long sleeve");
		expect(bodysuit?.neckline).toBe("mock neck");
	});
});

// ---------------------------------------------------------------------------
// Express — FULL email (header banners, hero image, summary, huge footer grid)
// Reproduces the real-inbox failure: surrounding markup must not pre-empt the
// text-only item rows.
// ---------------------------------------------------------------------------

describe("real emails > Express (full email body)", () => {
	const products = parseProductsFromEmail(loadFixture("express-full-email.html"));

	it("still finds exactly the 4 purchased items (ignores banners/footer)", () => {
		expect(products.map((p) => [p.name, p.price])).toEqual([
			["STYLIST HIGH WAISTED PLEATED SHORTS", "$34.00"],
			["EDITOR SUPER HIGH WAISTED TAILORED MINI SKORT", "$29.00"],
			["BODY CONTOUR VELVET MOCK NECK LONG SLEEVE BODYSUIT", "$19.00"],
			["BODY CONTOUR HIGH COMPRESSION MOCK NECK LONG SLEEVE BODYSUIT", "$19.00"],
		]);
	});
});

// ---------------------------------------------------------------------------
// Banana Republic Factory — bold-paragraph single column, no product photos
// ---------------------------------------------------------------------------

describe("real emails > Banana Republic Factory (no photos)", () => {
	const products = parseProductsFromEmail(loadFixture("banana-republic-no-photo.html"));

	it("detects all 4 items and ignores the Promos/Rewards/Quantity rows", () => {
		expect(products).toHaveLength(4);
		expect(products.map((p) => p.name)).toEqual([
			"Alys Slim Flannel Shirt",
			"Piazza Flannel Shirt",
			"Serres Sherpa Car Coat",
			"Plaid Mini Skirt",
		]);
	});

	it("reads the sale price from the colored span (not the struck original)", () => {
		expect(products.map((p) => p.price)).toEqual(["$51.97", "$29.97", "$189.97", "$27.97"]);
		expect(products.every((p) => p.onSale)).toBe(true);
	});

	it("splits SIZE | COLOR into size and color", () => {
		const skirt = byName(products, "Plaid Mini Skirt");
		expect(skirt?.size).toBe("2");
		expect(skirt?.color).toBe("black & white plaid");
		expect(byName(products, "Alys Slim Flannel Shirt")?.size).toBe("S");
		expect(byName(products, "Alys Slim Flannel Shirt")?.color).toBe("neutral plaid");
	});

	it("captures the SKU as the item number", () => {
		expect(byName(products, "Alys Slim Flannel Shirt")?.itemNumber).toBe("5060670120001");
	});
});

// ---------------------------------------------------------------------------
// American Apparel — header-mapped column table (Qty|Style|Description|Size|Color|Price|Amount)
// ---------------------------------------------------------------------------

describe("real emails > American Apparel (column-header table)", () => {
	const products = parseProductsFromEmail(loadFixture("american-apparel-table.html"));

	it("detects all 6 items using Description as the name (not the Style code)", () => {
		expect(products).toHaveLength(6);
		expect(products.map((p) => p.name)).toEqual([
			"Nylon Tricot Triangle Bikini Top",
			"Nylon Tricot Flat Bikini Bottom",
			"Triangle Bikini Top",
			"Crisscross Overall One-Piece Swimsu",
			"Cotton Spandex Mock Neck Cutout 'Ry",
			"Metallic Jersey Short Sleeve Tunic",
		]);
	});

	it("maps the Price, Size, Color, and Style columns", () => {
		const top = products[0];
		expect(top.price).toBe("$3.90");
		expect(top.size).toBe("S");
		expect(top.color).toBe("fuchsia");
		expect(top.itemNumber).toBe("RNT01");
		expect(products[2].price).toBe("$24.00");
		expect(products[3].color).toBe("ceramic green");
	});

	it("ignores the Subtotal / Shipping / Total summary rows", () => {
		expect(products.some((p) => /subtotal|shipping|total/i.test(p.name))).toBe(false);
	});
});

describe("real emails > American Apparel (full email with nested table)", () => {
	const products = parseProductsFromEmail(loadFixture("american-apparel-full-email.html"));

	it("detects all 4 items from the nested product table (not billing/shipping text)", () => {
		expect(products).toHaveLength(4);
		expect(products.map((p) => p.name)).toEqual([
			"Printed Cotton Spandex Jersey Sleev",
			"Sparkle Crop Tank",
			"Frankie Jumpsuit",
			"Ponte Foil Tank Dress",
		]);
	});

	it("correctly extracts price, size, and color", () => {
		expect(products[0]).toMatchObject({
			price: "$5.20",
			size: "L",
			color: "leopard",
			itemNumber: "8369P",
		});
		expect(products[1]).toMatchObject({
			price: "$12.40",
			size: "M/L",
			color: "black opal",
		});
	});

	it("ignores summary rows and address sections", () => {
		expect(products.some((p) => /billing|shipping|total|subtotal|thank you/i.test(p.name))).toBe(false);
	});
});

// Victoria's Secret 2018 — older template whose SKU is alphanumeric ("DE-369-810"),
// not a 6-digit code. Previously the SKU guard rejected the item and the image
// fallback emitted 3 junk banners; the relaxed SKU pattern now detects the item.
describe("real emails > Victoria's Secret 2018 (alphanumeric SKU)", () => {
	const products = parseProductsFromEmail(loadFixture("victorias-secret-2018.html"));

	it("detects the single real item (not banner images)", () => {
		expect(products).toHaveLength(1);
		expect(products[0]).toMatchObject({
			name: "Front-close Bralette",
			size: "M",
			price: "$14.50",
			originalPrice: "$24.50",
			onSale: true,
			itemNumber: "DE-369-810",
		});
	});
});

// Victoria's Secret 2021 — multi-quantity items. Qty is read from the "Qty"
// attribute row and surfaced on the card.
describe("real emails > Victoria's Secret 2021 (quantity)", () => {
	const products = parseProductsFromEmail(loadFixture("victorias-secret-2021-qty.html"));

	it("captures per-item quantity", () => {
		const cheeky = products.find((p) => /no-show cheeky/i.test(p.name));
		const brief = products.find((p) => /stretch cotton high-leg/i.test(p.name));
		expect(cheeky).toMatchObject({ qty: 4, price: "$24.00", originalPrice: "$42.00", color: "black" });
		expect(brief).toMatchObject({ qty: 2, price: "$12.00", originalPrice: "$21.00", color: "black" });
	});
});

// Shopbop 2021 — Description column embeds a nested image+name table, with a
// struck-through original price in a sibling cell. Previously the generic table
// strategy picked the price cell as the name and dedup collapsed both items to
// one ("$108.50 $155.00", size "1"). The dedicated strategy now detects both.
describe("real emails > Shopbop 2021 (nested description + sale price)", () => {
	const products = parseProductsFromEmail(loadFixture("shopbop-2021.html"));

	it("detects both FARM Rio items with sale + original price", () => {
		expect(products).toHaveLength(2);
		expect(products[0]).toMatchObject({
			brand: "FARM Rio",
			name: "Tie Dye Bananas Pajama Shirt",
			size: "M",
			color: "multi",
			price: "$108.50",
			originalPrice: "$155.00",
			onSale: true,
		});
		expect(products[1]).toMatchObject({
			name: "Tie Dye Bananas Pajama Pants",
			size: "S",
			price: "$108.50",
			originalPrice: "$155.00",
		});
	});

	it("does not emit a price string as a product name", () => {
		expect(products.some((p) => /^\$/.test(p.name))).toBe(false);
	});
});

// Brooks Brothers 2017 — scene7 product image + a detail cell with "PRODUCT NAME"
// then labeled "Color:/Size:/Item#:" rows. Previously the generic table strategy
// read the whole cell as the name with no size and a wrong inferred color.
describe("real emails > Brooks Brothers 2017 (labeled receipt)", () => {
	const single = parseProductsFromEmail(loadFixture("brooks-brothers-2017.html"));
	const two = parseProductsFromEmail(loadFixture("brooks-brothers-2017-two.html"));

	it("parses name/color/size/item# from the labeled detail cell", () => {
		expect(single).toHaveLength(1);
		expect(single[0]).toMatchObject({
			size: "8",
			color: "black",
			price: "$50.49",
			itemNumber: "WX00387",
		});
		expect(single[0].name).toMatch(/ponte knit fit-and-flare dress/i);
		expect(/color:|size:|item#/i.test(single[0].name)).toBe(false);
	});

	it("detects both items in a 2-item order", () => {
		expect(two).toHaveLength(2);
		expect(two.map((p) => p.color)).toEqual(["navy", "navy"]);
		expect(two.map((p) => p.size)).toEqual(["10", "10"]);
		expect(two.map((p) => p.itemNumber)).toEqual(["SX00046", "SX00023"]);
	});
});

// SwimOutlet 2017 — PRICE/QTY/TOTAL row with a separate "SKU | COLOR | SIZE"
// label row. Previously the QTY column ("1") was read as the size and the color
// was wrong; the label row is now parsed for color/size/SKU.
describe("real emails > SwimOutlet 2017 (label row color/size)", () => {
	const products = parseProductsFromEmail(loadFixture("swimoutlet-2017.html"));

	it("reads color and size from the label row, not the qty column", () => {
		expect(products).toHaveLength(1);
		expect(products[0]).toMatchObject({
			size: "32",
			color: "magenta",
			price: "$20.99",
			itemNumber: "SWC020-Magenta-32",
		});
	});
});

// Lulus 2021 — 2-cell rows (product image + <br>-delimited name/brand/color/size/
// price). Previously no structured strategy matched, so the image fallback emitted
// the 3 products plus a "Contact Us" footer image and an analytics pixel as junk,
// and color was wrong. Now detected directly with color/size, no junk.
describe("real emails > Lulus 2021 (br-delimited details)", () => {
	const products = parseProductsFromEmail(loadFixture("lulus-2021.html"));

	it("detects exactly the 3 products, no footer/analytics junk", () => {
		expect(products).toHaveLength(3);
		expect(products.some((p) => /contact us|remaining items|shipped/i.test(p.name))).toBe(false);
	});

	it("reads color (black, not tan) and size for each item", () => {
		expect(products.map((p) => p.color)).toEqual(["black", "black", "black"]);
		expect(products.map((p) => p.size)).toEqual(["Small", "Small", "Small"]);
		const xoxo = products.find((p) => /xoxo/i.test(p.name));
		expect(xoxo).toMatchObject({ color: "black", price: "$28.00", brand: "Lulus" });
	});
});

// Nike 2025 (forwarded) — dynamic product container with class-tagged name/price
// divs + a "Size:" line. Previously the swoosh logo ("Nike Logo") and product photo
// ("product") fell through to the image fallback as 2 junk items with no data.
describe("real emails > Nike 2025 (dynamic product container)", () => {
	const products = parseProductsFromEmail(loadFixture("nike-2025.html"));

	it("detects the single shoe, not the swoosh logo", () => {
		expect(products).toHaveLength(1);
		expect(products[0]).toMatchObject({
			brand: "Nike",
			size: "M 9.5 / W 11",
			color: "black",
			price: "$200.00",
		});
		expect(products[0].name).toMatch(/air jordan 3 retro/i);
		expect(products.some((p) => /nike logo|^product$/i.test(p.name))).toBe(false);
	});
});

// Blush Mark 2022 — /products/ anchors wrapping image + "Dress Color:/Size:/Qty:"
// labels. Previously a tracking paragraph was emitted as one junk item with no
// attributes; now all 4 items are detected with color/size.
describe("real emails > Blush Mark 2022", () => {
	const products = parseProductsFromEmail(loadFixture("blushmark-2022.html"));

	it("detects all 4 items with color and size", () => {
		expect(products).toHaveLength(4);
		expect(products[0]).toMatchObject({ size: "M", color: "multicolor", price: "$17.99" });
		expect(products[0].name).toMatch(/random print deep v neck/i);
		expect(products.map((p) => p.size)).toEqual(["M", "one-size", "S", "S"]);
	});
});

// Nordstrom 2026 (forwarded) — nordstrommedia image + name link + "Size X" / "Price: $X".
// Previously the image fallback dropped size and price.
describe("real emails > Nordstrom 2026 (forwarded)", () => {
	const products = parseProductsFromEmail(loadFixture("nordstrom-2026.html"));

	it("reads size and price for each item", () => {
		expect(products).toHaveLength(2);
		expect(products[0]).toMatchObject({ size: "Medium", price: "$29.99" });
		expect(products[1]).toMatchObject({ size: "Medium", price: "$33.74" });
		expect(products.every((p) => p.size && p.price)).toBe(true);
	});
});

// Brooks Brothers 2017 — order-level "Order Discount ($X)" applied evenly across
// items (originalPrice = list, price = discounted). Discount is parsed from raw
// HTML before pruning (the "ORDER TOTAL" header would otherwise strip the rows).
describe("real emails > Brooks Brothers 2017 (order discount)", () => {
	const products = parseProductsFromEmail(loadFixture("brooks-brothers-2017-discount.html"));

	it("applies the order discount evenly", () => {
		expect(products).toHaveLength(2);
		// subtotal 396.00, discount 278.19 → 70.25% off → 198 * 0.29749 = 58.90
		expect(products[0]).toMatchObject({ originalPrice: "$198.00", price: "$58.90", onSale: true });
		expect(products[1]).toMatchObject({ originalPrice: "$198.00", price: "$58.90", onSale: true });
	});

	it("leaves non-discount Brooks orders unchanged", () => {
		const plain = parseProductsFromEmail(loadFixture("brooks-brothers-2017.html"));
		expect(plain[0]).toMatchObject({ price: "$50.49", onSale: false });
		expect(plain[0].originalPrice).toBeUndefined();
	});
});

// Savage X Fenty 2023 — multiple order-level discount lines summed and applied
// evenly to the (already correctly detected) items.
describe("real emails > Savage X Fenty 2023 (multi-line discount)", () => {
	const products = parseProductsFromEmail(loadFixture("savagex-2023.html"));

	it("applies the summed discount evenly", () => {
		expect(products.length).toBeGreaterThanOrEqual(2);
		// subtotal 364.70, discounts 120.90 + 150.37 = 271.27 → 74.38% off
		const pant = products.find((p) => /sleep pant/i.test(p.name));
		expect(pant).toMatchObject({ originalPrice: "$49.95", price: "$12.80", onSale: true });
	});
});

// American Apparel 2013 — real full order-confirmation email. The outer 700px
// layout table holds bold headings ("Thank You.", "Billing Address", …) plus a
// Qty/Style/Description/Size/Color/Price column-header product table. Previously
// extractFromGapIncLabeledLayout misread the header row's bare Size/Color/Price
// cells as attribute labels and emitted 8 junk items; now the colon-strict label
// guard defers to the column-header table and all 9 line items are detected.
describe("real emails > American Apparel 2013 (full email)", () => {
	const products = parseProductsFromEmail(loadFixture("american-apparel-2013-full.html"));

	it("detects all 9 product line items", () => {
		expect(products).toHaveLength(9);
	});

	it("does not emit billing/shipping/footer headings as products", () => {
		expect(
			products.some((p) => /thank you|billing|charges|returns|customer service|or call|llc/i.test(p.name))
		).toBe(false);
	});

	it("reads size/color/price from the column-header table", () => {
		expect(products[0]).toMatchObject({
			name: "Nylon Tricot Side-Tie Bikini Bottom",
			size: "L",
			color: "coral ice",
			price: "$7.00",
		});
	});

	it("keeps the three Super Sheer Pantyhose distinct by color", () => {
		const sheer = products.filter((p) => /super sheer pantyhose/i.test(p.name));
		expect(sheer.map((p) => p.color).sort()).toEqual(["cactus", "snorkel", "virtual pink"]);
	});
});

// ---------------------------------------------------------------------------
// Zara (2015) — header-mapped table with currency-code prices, SKU reference
// ---------------------------------------------------------------------------

describe("real emails > Zara 2015 (column-header table)", () => {
	const products = parseProductsFromEmail(loadFixture("zara-2015-table.html"));

	it("detects all 5 items (regression: previously returned none)", () => {
		expect(products).toHaveLength(5);
		expect(products.map((p) => p.name)).toEqual(["CHECK TOP", "TRENCH-STYLE DRESS", "FAUX SUEDE DRESS", "MARL TOP", "DRAPED TOP"]);
	});

	it("reads currency-code prices and the SKU reference", () => {
		expect(products[0].price).toBe("$25.99");
		expect(products[1].price).toBe("$39.99");
		expect(products[0].itemNumber).toBe("0/3666/153/823/03");
		expect(products.every((p) => p.size === "M")).toBe(true);
	});

	it("does not parse the Total products / Total footer rows", () => {
		expect(products.some((p) => /total/i.test(p.name))).toBe(false);
	});
});

// ---------------------------------------------------------------------------
// Banana Republic / Athleta — older template: <b> name + Color:/Size:/Price: labels
// ---------------------------------------------------------------------------

describe("real emails > Banana Republic (labeled <b> layout, no photos)", () => {
	const products = parseProductsFromEmail(loadFixture("banana-republic-labeled.html"));

	it("detects the 2 items and ignores the 'YOUR ORDER' header and price bolds", () => {
		expect(products).toHaveLength(2);
		expect(products.map((p) => p.name)).toEqual(["High-Rise Flare Tuxedo Pant", "TENCEL Flight Jumpsuit"]);
	});

	it("strips the trademark mark from the name (TENCEL™ -> TENCEL)", () => {
		// The raw name is "TENCEL™ Flight Jumpsuit" (&#153 decodes to ™); the card
		// then title-cases it to "Tencel Flight Jumpsuit".
		expect(byName(products, "TENCEL Flight Jumpsuit")).toBeDefined();
		expect(products.some((p) => p.name.includes("™"))).toBe(false);
	});

	it("reads the labeled price, color, and size", () => {
		const pant = byName(products, "High-Rise Flare Tuxedo Pant");
		expect(pant?.price).toBe("$70.97");
		expect(pant?.color).toBe("black");
		expect(pant?.size).toBe("4 Regular");
		expect(byName(products, "TENCEL Flight Jumpsuit")?.price).toBe("$110.99");
	});
});

// ---------------------------------------------------------------------------
// Zara — newer MJML single-column layout (product-img / product-size / product-price)
// ---------------------------------------------------------------------------

describe("real emails > Zara (MJML single-column order)", () => {
	const products = parseProductsFromEmail(loadFixture("zara-mjml-order.html"));

	it("detects both items (regression: previously returned none)", () => {
		expect(products).toHaveLength(2);
		expect(products.map((p) => p.name)).toEqual(["PLEATED SHORTS", "PLATFORM HEELED ANKLE BOOTS"]);
	});

	it("reads the currency-code price (21.54 USD -> $21.54)", () => {
		expect(byName(products, "PLEATED SHORTS")?.price).toBe("$21.54");
		expect(byName(products, "PLATFORM HEELED ANKLE BOOTS")?.price).toBe("$41.94");
	});

	it("parses color from the 'Color SKU' line and size from the size row", () => {
		const shorts = byName(products, "PLEATED SHORTS");
		expect(shorts?.color).toBe("Black");
		expect(shorts?.size).toBe("S");
		expect(byName(products, "PLATFORM HEELED ANKLE BOOTS")?.size).toBe("8");
	});

	it("does not parse the 'Products' title or item counter as a product", () => {
		expect(products.some((p) => /products|items/i.test(p.name))).toBe(false);
	});
});

describe("real emails > Zara (MJML, 3 items across 2 shipments)", () => {
	const products = parseProductsFromEmail(loadFixture("zara-mjml-shipments.html"));

	it("detects all 3 items, keeping the two same-named tanks (different colors)", () => {
		expect(products).toHaveLength(3);
		expect(products.map((p) => p.name)).toEqual(["RIBBED TANK TOP", "RIBBED TANK TOP", "TEXTURED CROPPED T-SHIRT"]);
		expect(products.map((p) => p.color)).toEqual(["Blue", "Black", "Black"]);
	});

	it("does not parse 'Shipping NNNNN' headers as products", () => {
		expect(products.some((p) => /shipping/i.test(p.name))).toBe(false);
	});
});

// ---------------------------------------------------------------------------
// Anthropologie — item-detail-row labeled tables (bare and $-prefixed prices)
// ---------------------------------------------------------------------------

describe("real emails > Anthropologie (bare prices)", () => {
	const products = parseProductsFromEmail(loadFixture("anthropologie-nodollar.html"));

	it("detects all 4 items", () => {
		expect(products).toHaveLength(4);
	});

	it("extracts the name from the <h4>, not the whole details blob", () => {
		expect(products.map((p) => p.name)).toEqual([
			"Neha Seamless Ruffled Briefs",
			"Dee Seamless Ruffled Scoop-Neck Bralette",
			"Waverly High-Waisted Briefs",
			"Waverly V-Neck Bralette",
		]);
	});

	it("reads color from the Color label (regression: was the bare price)", () => {
		for (const p of products) expect(p.color).toBe("black");
	});

	it("reads size from the Size label (regression: was the quantity)", () => {
		expect(byName(products, "Neha Seamless Ruffled Briefs")?.size).toBe("XS/S");
		expect(byName(products, "Waverly High-Waisted Briefs")?.size).toBe("S");
	});

	it("reads the sale price (non-struck) even without a $ prefix", () => {
		expect(byName(products, "Neha Seamless Ruffled Briefs")?.price).toBe("$7.46");
		expect(byName(products, "Waverly High-Waisted Briefs")?.price).toBe("$11.21");
		expect(products.every((p) => p.onSale)).toBe(true);
	});

	it("captures the struck-through original price even without a $ prefix", () => {
		expect(byName(products, "Neha Seamless Ruffled Briefs")?.originalPrice).toBe("$9.95");
		expect(byName(products, "Waverly High-Waisted Briefs")?.originalPrice).toBe("$14.95");
	});

	it("captures the Style No. as the item number and the product image", () => {
		const neha = byName(products, "Neha Seamless Ruffled Briefs");
		expect(neha?.itemNumber).toBe("4140341870052");
		expect(neha?.imageUrl).toContain("images.anthropologie.com");
	});

	it("infers neckline from the bralette names", () => {
		expect(byName(products, "Dee Seamless Ruffled Scoop-Neck Bralette")?.neckline).toBe("scoop neck");
		expect(byName(products, "Waverly V-Neck Bralette")?.neckline).toBe("v-neck");
	});
});

describe("real emails > Anthropologie ($-prefixed prices)", () => {
	const products = parseProductsFromEmail(loadFixture("anthropologie-dollar.html"));

	it("detects both items with clean fields", () => {
		expect(products).toHaveLength(2);
		expect(products.map((p) => p.name)).toEqual(["Neha Seamless Ruffled Briefs", "Waverly High-Waisted Briefs"]);
	});

	it("emits a concrete color (so UI image-color detection won't guess)", () => {
		for (const p of products) expect(p.color).toBe("black");
	});

	it("reads the $-prefixed sale price, not the struck original", () => {
		expect(byName(products, "Neha Seamless Ruffled Briefs")?.price).toBe("$7.46");
		expect(byName(products, "Waverly High-Waisted Briefs")?.price).toBe("$11.21");
	});

	it("captures the struck original price and flags the sale", () => {
		expect(byName(products, "Neha Seamless Ruffled Briefs")?.originalPrice).toBe("$9.95");
		expect(byName(products, "Waverly High-Waisted Briefs")?.originalPrice).toBe("$14.95");
		expect(products.every((p) => p.onSale)).toBe(true);
	});
});

// ---------------------------------------------------------------------------
// Victoria's Secret — SFMC blocks: bold name + Color/Size/Qty attribute table
// ---------------------------------------------------------------------------

describe("real emails > Victoria's Secret", () => {
	const products = parseProductsFromEmail(loadFixture("victorias-secret.html"));

	it("de-duplicates repeated SKUs down to the 4 unique items", () => {
		expect(products.map((p) => p.name)).toEqual([
			"No-show Floral Lace Back Cheeky Panty",
			"No-show Cheeky Panty",
			"Lace Trim Thong Panty",
			"Stretch Cotton High-leg Brief Panty",
		]);
	});

	it("reads the SKU as the item number", () => {
		expect(products.map((p) => p.itemNumber)).toEqual(["26191609", "23835482", "26114919", "24587310"]);
	});

	it("strips the color code and lowercases (54A2 Black -> black)", () => {
		for (const p of products) expect(p.color).toBe("black");
	});

	it("reads size from the attribute table", () => {
		for (const p of products) expect(p.size).toBe("S");
	});

	it("uses the paid line total as the price and flags the sale", () => {
		// Stretch keeps the LAST occurrence (qty 2 / $12.00), not the qty-1 / $6.00 one.
		expect(products.map((p) => p.price)).toEqual(["$6.00", "$24.00", "$6.00", "$12.00"]);
		expect(products.every((p) => p.onSale)).toBe(true);
	});

	it("captures the trailing original price, ignoring the -$X discount line", () => {
		// Each block is "$paid / -$discount (Offers & Discounts) / $original".
		// The original is the highest amount, not the middle discount line.
		expect(products.map((p) => p.originalPrice)).toEqual(["$12.50", "$42.00", "$10.50", "$21.00"]);
	});

	it("has no per-item image (VS shows only marketing banners)", () => {
		for (const p of products) expect(p.imageUrl).toBe("");
	});
});

// ---------------------------------------------------------------------------
// SKIMS — Shopify order-notification template
// ---------------------------------------------------------------------------

describe("real emails > SKIMS (Shopify notification)", () => {
	const products = parseProductsFromEmail(loadFixture("skims-shopify.html"));

	it("detects both items", () => {
		expect(products).toHaveLength(2);
	});

	it("strips the '× N' quantity and '| COLOR' suffix from the name", () => {
		expect(products.map((p) => p.name)).toEqual(["FITS EVERYBODY HIGH WAISTED THONG", "SUMMER MESH MID WAIST THONG"]);
	});

	it("parses color and size from the variant line", () => {
		expect(products[0].color).toBe("onyx");
		expect(products[0].size).toBe("S");
		expect(products[1].size).toBe("XS");
	});

	it("reads per-unit price (line total ÷ qty) from the price cell", () => {
		// qty 5: $60.00 / 5 = $12.00, $40.00 / 5 = $8.00
		expect(products[0].price).toBe("$12.00");
		expect(products[1].price).toBe("$8.00");
	});

	it("captures the quantity from the × N suffix in the title", () => {
		expect(products[0].qty).toBe(5);
		expect(products[1].qty).toBe(5);
	});

	it("flags sale only when a struck original price is present", () => {
		expect(products[0].onSale).toBe(true);
		expect(products[1].onSale).toBe(false);
	});
});

// ---------------------------------------------------------------------------
// Old Navy — monospace in-store register receipt (plaintext line items)
// ---------------------------------------------------------------------------

describe("real emails > Old Navy (POS receipt)", () => {
	const products = parseProductsFromEmail(loadFixture("old-navy-receipt.html"));

	it("detects the 4 purchased items and excludes the bag fee", () => {
		expect(products).toHaveLength(4);
		expect(products.map((p) => p.name)).toEqual(["Cozy Crew Socks", "Cozy Crew Socks", "Low-Cut Socks 4-Pack", "Crew-Socks 4-Pack"]);
	});

	it("reads the net (post-discount) price, not the original", () => {
		expect(products.map((p) => p.price)).toEqual(["$1.00", "$1.00", "$4.99", "$4.99"]);
	});

	it("captures the register SKU as the item number", () => {
		expect(products.map((p) => p.itemNumber)).toEqual(["608308-151-0000", "608308-121-0000", "209795-021-0000", "209788-021-0000"]);
	});

	it("flags every item on sale (original unit price exceeds net)", () => {
		expect(products.every((p) => p.onSale)).toBe(true);
	});

	it("captures the original (pre-discount) unit price from the '1 @ X' line", () => {
		expect(products.map((p) => p.originalPrice)).toEqual(["$5.00", "$5.00", "$9.99", "$9.99"]);
	});

	it("derives quantity from the 'N-Pack' name (single socks have no qty)", () => {
		expect(products.map((p) => p.qty)).toEqual([undefined, undefined, 4, 4]);
	});

	it("does not pick up the barcode image or summary lines as products", () => {
		for (const p of products) expect(p.imageUrl).toBe("");
		expect(products.map((p) => p.name)).not.toContain("Bag fee");
	});
});

// ---------------------------------------------------------------------------
// Walmart — items table only; excludes decorative imagery + "Explore more savings"
// ---------------------------------------------------------------------------

describe("real emails > Walmart 2022 delivered (itemName span)", () => {
	const products = parseProductsFromEmail(loadFixture("walmart-2022-delivered.html"));

	it("extracts the single line item, not the header/feedback images", () => {
		expect(products).toHaveLength(1);
		expect(products[0].name).toBe("Hanger Central Velvet Heavy Weight Clothing Hanger, 100 Pack, Black");
		expect(products[0].price).toBe("$37.98");
	});

	it("does not import decorative imagery or the cross-sell tile", () => {
		const names = products.map((p) => p.name);
		expect(names).not.toContain("Walmart Home Page");
		expect(names).not.toContain("Feedback Image");
		expect(names).not.toContain("Wonder Hanger Max, Steel Grey, 10 Pack");
	});
});

describe("real emails > Walmart 2018 processing (Item | Qty | Total table)", () => {
	const products = parseProductsFromEmail(loadFixture("walmart-2018-processing.html"));

	it("reads the bold /ip/ product-link name, not the banner alt", () => {
		expect(products).toHaveLength(1);
		expect(products[0].name).toBe('Mainstays 9" High Velocity 3-Speed Fan, Model #MF-9, Black');
		expect(products[0].price).toBe("$14.24");
	});
});

describe("real emails > Walmart 2021 shipped (Items + Other items)", () => {
	const products = parseProductsFromEmail(loadFixture("walmart-2021-shipped.html"));

	it("captures both the primary item and the 'Other items' row", () => {
		expect(products.map((p) => p.name)).toEqual([
			// "for Women" is stripped as gender junk by cleanProductName.
			"Gilbin Ultra Soft High Waist Yoga Stretch Mini-Bike Shorts -Many Colors-One Size & Plus Size (Black S-L)",
			"High Weight Capacity Non-slip Velvet Clothes Hangers, Pack of 100, Black",
		]);
		expect(products.map((p) => p.price)).toEqual(["$11.95", "$33.99"]);
	});

	it("excludes the 'Explore more savings' recommendation tile (no Qty line)", () => {
		expect(products.map((p) => p.name)).not.toContain('Mainstays Flexible Black Laundry Hamper, 20"');
	});
});

// ---------------------------------------------------------------------------
// Target — 2-column product blocks (image + <h2> name, no price)
// ---------------------------------------------------------------------------

describe("real emails > Target (product blocks)", () => {
	const products = parseProductsFromEmail(loadFixture("target.html"));

	it("detects all 4 product blocks", () => {
		expect(products).toHaveLength(4);
	});

	it("reads the name from the <h2> link, not the (sometimes mangled) image alt", () => {
		expect(products.map((p) => p.name)).toEqual([
			"EcoTools Exfoliating Shower Gloves - Pink",
			"Native Body Wash - Eucalyptus & Mint - Sulfate Free - 18 fl oz",
			// Trademark marks are stripped during cleaning ("Room Essentials™" -> "Room Essentials").
			'70"x71" Lightweight Color Shower Liner Clay - Room Essentials : PEVA, Buttonhole Top, Easy to Clean',
			"Native Body Wash - Lavender & Rose - Sulfate Free - 18 fl oz",
		]);
	});

	it("captures the scene7 product image for each item", () => {
		for (const p of products) expect(p.imageUrl).toContain("target.scene7.com");
		expect(products[0].imageUrl).toContain("GUEST_fed2a379");
	});

	it("has no price (Target order emails omit it)", () => {
		for (const p of products) expect(p.price).toBe("");
	});
});

// ---------------------------------------------------------------------------
// Cross-cutting enrichment: brand-from-sender fallback + everyday occasion
// ---------------------------------------------------------------------------

describe("enrichment > brand falls back to the email sender", () => {
	it("uses the sender display name when no brand text is present", () => {
		const data = parseEmailToFormData("Cozy Crew Socks", "<p>Cozy Crew Socks</p>", "Old Navy <orders@oldnavy.com>");
		expect(data.brand).toBe("old navy");
	});

	it("uses the sender domain when the display name is generic", () => {
		const data = parseEmailToFormData("Some Item", "<p>Some Item</p>", "no-reply <no-reply@target.com>");
		expect(data.brand).toBe("target");
	});
});

describe("enrichment > socks/underwear/intimates default to everyday occasion", () => {
	it("defaults socks to everyday", () => {
		const data = parseEmailToFormData("Cozy Crew Socks", "<p>Cozy Crew Socks</p>", "Old Navy <orders@oldnavy.com>");
		expect(data.occasion).toBe("everyday");
	});

	it("defaults underwear to everyday", () => {
		const data = parseEmailToFormData("Waverly High-Waisted Briefs", "<p>briefs</p>", "Anthropologie <o@anthropologie.com>");
		expect(data.occasion).toBe("everyday");
	});
});

describe("banana-republic-2020", () => {
	// Subtotal $181.96, Promotions -$90.98 → 50% discount applied to each item's list price
	it("detects 2 items with promotion discount applied", () => {
		const products = parseProductsFromEmail(loadFixture("banana-republic-2020.html"));
		expect(products).toHaveLength(2);

		const pant = products.find((p) => /flare tuxedo pant/i.test(p.name));
		expect(pant).toBeDefined();
		expect(pant!.originalPrice).toBe("$70.97");
		expect(pant!.price).toBe("$35.48"); // 50% off $70.97, floating-point rounds down
		expect(pant!.onSale).toBe(true);
		expect(pant!.color).toBe("black");
		expect(pant!.size).toBe("4 Regular");

		const jumpsuit = products.find((p) => /flight jumpsuit/i.test(p.name));
		expect(jumpsuit).toBeDefined();
		expect(jumpsuit!.originalPrice).toBe("$110.99");
		expect(jumpsuit!.price).toBe("$55.49"); // 50% off $110.99, floating-point rounds down
		expect(jumpsuit!.onSale).toBe(true);
		expect(jumpsuit!.color).toBe("black");
		expect(jumpsuit!.size).toBe("4");
	});
});

// ---------------------------------------------------------------------------
// REI Co-op — two long-lived Responsys templates. Both previously returned 0
// real items: the 2022 layout has an "Order total" summary ABOVE the products
// and a detached price row; the 2019 layout's decorative images crowded out the
// real base layers. Fixtures are trimmed to the structural essentials.
// ---------------------------------------------------------------------------

describe("real emails > REI 2022 (order-total on top, detached price row)", () => {
	const products = parseProductsFromEmail(loadFixture("rei-2022-detached-price.html"));

	it("detects both Smartwool items (survives top-summary truncation)", () => {
		expect(products).toHaveLength(2);
	});

	it("extracts name, price, color, size, and item number", () => {
		const quarterZip = byName(products, "Smartwool Intraknit 200 Pattern Quarter-Zip Base Layer Top");
		expect(quarterZip).toBeDefined();
		expect(quarterZip!.price).toBe("$88.73");
		expect(quarterZip!.color).toBe("Deep Navy Polar Arc");
		expect(quarterZip!.size).toBe("M");
		expect(quarterZip!.itemNumber).toBe("199598");

		const tunic = byName(products, "Smartwool Shadow Pine Pointelle Stripe Tunic Sweater");
		expect(tunic).toBeDefined();
		expect(tunic!.price).toBe("$89.73");
		expect(tunic!.color).toBe("Blue Spruce Heather");
		expect(tunic!.size).toBe("S");
		expect(tunic!.itemNumber).toBe("213109");
	});
});

describe("real emails > REI 2019 (BOPUS, decorative images)", () => {
	const products = parseProductsFromEmail(loadFixture("rei-2019-bopus.html"));

	it("detects the two base layers and excludes the member-bonus card", () => {
		expect(products).toHaveLength(2);
		expect(products.every((p) => !/bonus card/i.test(p.name))).toBe(true);
	});

	it("extracts name, labeled item price, and item number", () => {
		const reiTop = byName(products, "REI Co-op Merino Midweight Base Layer Top");
		expect(reiTop).toBeDefined();
		expect(reiTop!.price).toBe("$54.93");
		expect(reiTop!.itemNumber).toBe("1013880032");

		const smartwool = byName(products, "Smartwool Merino 150 Pattern Base Layer Long-Sleeve Top");
		expect(smartwool).toBeDefined();
		expect(smartwool!.price).toBe("$80.00");
		expect(smartwool!.itemNumber).toBe("1116280037");
	});
});

describe("real emails > REI shipped (CSV alt name, no price)", () => {
	const products = parseProductsFromEmail(loadFixture("rei-shipped-csv-name.html"));

	it("detects the item from a 'Just shipped' email that carries no price", () => {
		expect(products).toHaveLength(1);
	});

	it("splits the comma-delimited alt into brand + name and reads color/size", () => {
		const item = products[0];
		expect(item.brand).toBe("Icebreaker");
		expect(item.name).toBe("Sphere LS Low Crewe");
		expect(item.color).toBe("Suede Heather");
		expect(item.size).toBe("L");
		expect(item.itemNumber).toBe("167343");
		expect(item.price).toBe(""); // shipping confirmations omit price
		expect(item.neckline).toBe("crew neck"); // "Crewe" (Icebreaker's alt spelling)
	});
});

describe("real emails > REI 2018 pickup (CSV names, no item#, no price)", () => {
	const products = parseProductsFromEmail(loadFixture("rei-2018-pickup.html"));

	it("detects both items despite an arrow <img> inside the name link", () => {
		expect(products).toHaveLength(2);
	});

	it("parses brand/name/color/size from the comma-delimited alt", () => {
		const silk = byName(products, "Silk L/S V-Neck");
		expect(silk).toBeDefined();
		expect(silk!.brand).toBe("REI Co-op");
		expect(silk!.color).toBe("BLACK");
		expect(silk!.size).toBe("M");
		expect(silk!.sleeveLength).toBe("long sleeve"); // "L/S" → long sleeve
		expect(silk!.material).toBe("silk");

		const hoody = byName(products, "Merino 250 1/2 Zip Hoody");
		expect(hoody).toBeDefined();
		expect(hoody!.brand).toBe("Smartwool");
		expect(hoody!.color).toBe("CHARCOAL");
		expect(hoody!.material).toBe("merino wool");
		expect(hoody!.season).toBe("winter");
		expect(hoody!.accents).toContain("hood"); // "Hoody" spelling
	});
});

describe("real emails > REI enrichment (material / season / pattern)", () => {
	const products = parseProductsFromEmail(loadFixture("rei-2022-detached-price.html"));

	it("infers wool material and winter season from Smartwool", () => {
		const quarterZip = byName(products, "Smartwool Intraknit 200 Pattern Quarter-Zip Base Layer Top");
		expect(quarterZip!.material).toBe("wool");
		expect(quarterZip!.season).toBe("winter");
	});

	it("captures pointelle construction and stripe pattern together", () => {
		const tunic = byName(products, "Smartwool Shadow Pine Pointelle Stripe Tunic Sweater");
		expect(tunic!.pattern).toBe("stripes");
		expect(tunic!.construction).toContain("pointelle");
	});
});

// ---------------------------------------------------------------------------
// eBay — order-status emails bury the ONE real purchase among several
// sponsored "complement your purchase" listings sharing the same image/
// title/price markup. Only the block carrying eBay's structured transaction
// labels together (Order number:/Item ID:/Seller:) is the genuine purchase.
// ---------------------------------------------------------------------------

describe("real emails > eBay (Eddie Bauer shoes, excludes sponsored items)", () => {
	const products = parseProductsFromEmail(loadFixture("ebay-eddie-bauer-shoes.html"));

	it("detects exactly the one purchased item, not the 4 sponsored 'complement your purchase' listings", () => {
		expect(products).toHaveLength(1);
	});

	it("extracts brand, size, price, and item ID from the labeled transaction block", () => {
		const item = products[0];
		expect(item.brand).toBe("Eddie Bauer");
		expect(item.size).toBe("9");
		expect(item.price).toBe("$25.72");
		expect(item.itemNumber).toBe("195511846811");
		expect(item.name).toMatch(/shoes/i);
		expect(item.imageUrl).toContain("i.ebayimg.com");
	});

	it("classifies as shoes via the retained garment word in the name", () => {
		expect(categoryFromName(products[0].name)).toBe("shoes");
	});

	it("does not import the sponsored LL Bean / Eddie Bauer boat shoe listings", () => {
		expect(byName(products, "LL Bean Slip On Wedge Loafers")).toBeUndefined();
		expect(products.some((p) => /boat shoes/i.test(p.name))).toBe(false);
	});
});
