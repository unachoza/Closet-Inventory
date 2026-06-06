import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parseProductsFromEmail, type ExtractedProduct } from "../parseProductsFromEmail";

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
		expect(products.map((p) => p.name)).toEqual([
			"Neha Seamless Ruffled Briefs",
			"Waverly High-Waisted Briefs",
		]);
	});

	it("emits a concrete color (so UI image-color detection won't guess)", () => {
		for (const p of products) expect(p.color).toBe("black");
	});

	it("reads the $-prefixed sale price, not the struck original", () => {
		expect(byName(products, "Neha Seamless Ruffled Briefs")?.price).toBe("$7.46");
		expect(byName(products, "Waverly High-Waisted Briefs")?.price).toBe("$11.21");
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
		expect(products.map((p) => p.name)).toEqual([
			"FITS EVERYBODY HIGH WAISTED THONG",
			"SUMMER MESH MID WAIST THONG",
		]);
	});

	it("parses color and size from the variant line", () => {
		expect(products[0].color).toBe("onyx");
		expect(products[0].size).toBe("S");
		expect(products[1].size).toBe("XS");
	});

	it("reads the line price from the price cell, not the in-description discount", () => {
		expect(products[0].price).toBe("$60.00");
		expect(products[1].price).toBe("$40.00");
	});

	it("flags sale only when a struck original price is present", () => {
		expect(products[0].onSale).toBe(true);
		expect(products[1].onSale).toBe(false);
	});
});
