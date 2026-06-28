import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parseProductsFromEmail } from "../parseProductsFromEmail";
import { categoryFromName } from "../parseEmailToFormData";
import { inferStyleTagsFromName } from "../inferStyleTagsFromName";
import normalizeCategory from "../normalizeCategories";
import { categoryOptions } from "../constants";

const loadFixture = (name: string): string => readFileSync(join(__dirname, "__fixtures__", name), "utf-8");

describe("Nordstrom — multi-size order keeps each size (dedup by name+color+size)", () => {
	const products = parseProductsFromEmail(loadFixture("nordstrom-cottonon-sizes.html"));

	it("detects all 5 line items, not 2", () => {
		expect(products).toHaveLength(5);
	});

	it("keeps the three t-shirt sizes as separate items", () => {
		const tees = products.filter((p) => /graphic t-shirt/i.test(p.name));
		expect(tees.map((p) => p.size).sort()).toEqual(["Large", "Medium", "X-Large"]);
	});

	it("keeps both jersey sizes as separate items", () => {
		const jerseys = products.filter((p) => /soccer jersey/i.test(p.name));
		expect(jerseys.map((p) => p.size).sort()).toEqual(["Medium", "X-Small"]);
	});
});

describe("Nordstrom Rack — sneaker detected with full product name", () => {
	const products = parseProductsFromEmail(loadFixture("nordstrom-rack-sneaker.html"));

	it("extracts exactly one product", () => {
		expect(products).toHaveLength(1);
	});

	it("uses the full name (not the 'Arrives …' link or the truncated mobile label)", () => {
		expect(products[0].name).toBe("Ilse Jacobsen Tulipu Perforated Slip-On Sneaker");
	});

	it("the name resolves to a clothing category (passes the not-clothing skip gate)", () => {
		expect(categoryFromName(products[0].name)).not.toBe("");
	});
});

describe("icebreaker (classless Shopify) — items detected", () => {
	it("two-item order yields both items", () => {
		const products = parseProductsFromEmail(loadFixture("icebreaker-two-items.html"));
		expect(products).toHaveLength(2);
		// The "Women's" gender prefix is stripped by name cleanup (same as
		// "Cotton On Men's …" → "Cotton On …").
		const names = products.map((p) => p.name).sort();
		expect(names).toEqual([
			"Merino 260 Quantum Long Sleeve Zip Hoodie",
			"Merino 260 Quantum Long Sleeve Zip Jacket",
		]);
	});

	it("parses variant color/size and per-unit price", () => {
		const products = parseProductsFromEmail(loadFixture("icebreaker-one-item.html"));
		expect(products).toHaveLength(1);
		expect(products[0]).toMatchObject({ color: "olive", size: "S", price: "$154.00" });
		expect(categoryFromName(products[0].name)).toBe("coats"); // "...Jacket" → coats
	});
});

describe("inference — soccer jersey", () => {
	it("infers a sports/athleisure occasion", () => {
		expect(inferStyleTagsFromName("Cotton On Men's Soccer Jersey", "tops")).toContain("athleisure");
	});

	it("resolves to the tops category", () => {
		expect(categoryFromName("Cotton On Men's Soccer Jersey")).toBe("tops");
	});
});

describe("taxonomy — shoes is first-class; active folds into athleisure", () => {
	it("a sneaker resolves to the shoes category", () => {
		expect(categoryFromName("Ilse Jacobsen Tulipu Perforated Slip-On Sneaker")).toBe("shoes");
	});

	it("shoes is a selectable/filterable category option", () => {
		expect(categoryOptions.some((o) => o.value === "shoes")).toBe(true);
	});

	it("legacy 'active' normalizes to 'athleisure'", () => {
		expect(normalizeCategory("active")).toBe("athleisure");
	});
});
