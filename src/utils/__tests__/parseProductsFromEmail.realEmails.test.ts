import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parseProductsFromEmail, type ExtractedProduct } from "../parseProductsFromEmail";
import { parseEmailToFormData } from "../parseEmailToFormData";

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

	it("does not pick up the barcode image or summary lines as products", () => {
		for (const p of products) expect(p.imageUrl).toBe("");
		expect(products.map((p) => p.name)).not.toContain("Bag fee");
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
