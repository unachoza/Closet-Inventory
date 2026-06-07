import { describe, it, expect } from "vitest";
import { parseEmailToFormData } from "../parseEmailToFormData";

// ── Helpers ───────────────────────────────────────────────────────────────────
const parse = (subject: string, body = "", from = "") =>
	parseEmailToFormData(subject, body, from);

describe("parseEmailToFormData — brand extraction", () => {
	it("extracts brand from sender display name", () => {
		const result = parse("Your order", "", "Princess Polly <noreply@princesspolly.com>");
		expect(result.brand).toBe("princess polly");
	});

	it("extracts brand from email domain when display name is generic", () => {
		const result = parse("Order confirmed", "", "no-reply@aritzia.com");
		expect(result.brand).toBe("aritzia");
	});

	it("extracts brand from subject line", () => {
		const result = parse("Your Zara order is confirmed", "", "");
		expect(result.brand).toBe("zara");
	});

	it("extracts brand from body text", () => {
		const result = parse("", "Thank you for shopping with H&M", "");
		expect(result.brand).toBe("h&m");
	});

	it("normalises lululemon variant to canonical form", () => {
		const result = parse("", "Your lululemon bag is on its way", "");
		expect(result.brand).toBe("lulu lemon");
	});

	it("extracts Shein from subject", () => {
		const result = parse("SHEIN order shipped", "", "");
		expect(result.brand).toBe("shein");
	});

	it("returns empty string when no brand is found", () => {
		const result = parse("Your order is ready", "", "hello@unknownstore.com");
		expect(result.brand).toBe("");
	});

	it("ignores generic sender names like 'no-reply'", () => {
		const result = parse("", "", "no-reply@gmail.com");
		expect(result.brand).toBe("");
	});
});

describe("parseEmailToFormData — category inference", () => {
	it('infers "tops" from item name containing "top"', () => {
		expect(parse("Cotton Modal Tank Top").category).toBe("tops");
	});

	it('infers "tops" from "t-shirt"', () => {
		expect(parse("Cotton Modal Crop T-Shirt").category).toBe("tops");
	});

	it('infers "tops" from "blouse"', () => {
		expect(parse("Silk Blouse").category).toBe("tops");
	});

	it('infers "tops" from "tee"', () => {
		expect(parse("Gym Girly Graphic Tee").category).toBe("tops");
	});

	it('infers "tops" from "tank"', () => {
		expect(parse("Sequin Halter Tank").category).toBe("tops");
	});

	it('infers "bottoms" from "pant"', () => {
		expect(parse("High-Rise Flare Tuxedo Pant").category).toBe("bottoms");
	});

	it('infers "bottoms" from "trouser"', () => {
		expect(parse("Straight Leg Trousers").category).toBe("bottoms");
	});

	it('infers "bottoms" from "jean"', () => {
		expect(parse("High Waist Flare Leg Jeans").category).toBe("bottoms");
	});

	it('infers "bottoms" from "skirt"', () => {
		expect(parse("Sequin Low Rise Mini Skirt").category).toBe("bottoms");
	});

	it('infers "bottoms" from "short"', () => {
		expect(parse("Linen Shorts").category).toBe("bottoms");
	});

	it('infers "dresses" from "dress"', () => {
		expect(parse("Fitted Midi Dress").category).toBe("dresses");
	});

	it('infers "sweaters" from "sweater"', () => {
		expect(parse("Cable Knit Sweater").category).toBe("sweaters");
	});

	it('infers "sweaters" from "hoodie"', () => {
		expect(parse("Oversized Hoodie").category).toBe("sweaters");
	});

	it('infers "sweaters" from "cardigan"', () => {
		expect(parse("Open Front Cardigan").category).toBe("sweaters");
	});

	it('infers "coats" from "coat"', () => {
		expect(parse("Wool Coat").category).toBe("coats");
	});

	it('infers "coats" from "jacket"', () => {
		expect(parse("Bomber Jacket").category).toBe("coats");
	});

	it('infers "coats" from "blazer"', () => {
		expect(parse("Double Breasted Blazer").category).toBe("coats");
	});

	it('infers "active" from "legging"', () => {
		expect(parse("High Waist Leggings").category).toBe("active");
	});

	it('infers "body" from "jumpsuit"', () => {
		expect(parse("TENCEL Flight Jumpsuit").category).toBe("body");
	});

	it('infers "body" from "bodysuit"', () => {
		expect(parse("Ribbed Bodysuit").category).toBe("body");
	});

	it('infers "lingerie" from "bra"', () => {
		expect(parse("The Bra").category).toBe("lingerie");
	});

	it('infers "shoes" from "sneaker"', () => {
		expect(parse("Classic Sneaker").category).toBe("shoes");
	});

	it("returns empty string when no category can be inferred", () => {
		expect(parse("Order Confirmed").category).toBe("");
	});
});

describe("parseEmailToFormData — HTML stripping", () => {
	it("strips HTML tags from body before parsing", () => {
		const html = "<p>Thank you for your <strong>Zara</strong> order</p>";
		const result = parse("", html, "");
		expect(result.brand).toBe("zara");
	});

	it("strips script tags and still extracts brand", () => {
		const html = '<script>alert("xss")</script><p>Aritzia order confirmed</p>';
		const result = parse("", html, "");
		expect(result.brand).toBe("aritzia");
	});
});

describe("parseEmailToFormData — default fields", () => {
	it('sets condition to "new" by default', () => {
		expect(parse("anything").condition).toBe("new");
	});

	it("returns all required formItem fields", () => {
		const result = parse("", "", "");
		expect(result).toHaveProperty("category");
		expect(result).toHaveProperty("color");
		expect(result).toHaveProperty("size");
		expect(result).toHaveProperty("brand");
		expect(result).toHaveProperty("material");
		expect(result).toHaveProperty("occasion");
		expect(result).toHaveProperty("condition");
		expect(result).toHaveProperty("care");
	});
});

describe("parseEmailToFormData — purchase date", () => {
	it("stores the email date as an ISO purchaseDate", () => {
		const result = parseEmailToFormData("Order", "", "", "Fri, 15 Mar 2024 10:30:00 -0700");
		expect(result.purchaseDate).toBeDefined();
		expect(new Date(result.purchaseDate as string).getUTCFullYear()).toBe(2024);
	});

	it("leaves purchaseDate empty when no date is provided", () => {
		const result = parseEmailToFormData("Order", "", "");
		expect(result.purchaseDate).toBeFalsy();
	});

	it("leaves purchaseDate empty when the date is unparseable", () => {
		const result = parseEmailToFormData("Order", "", "", "not-a-real-date");
		expect(result.purchaseDate).toBeFalsy();
	});
});

describe("parse augmented style data", () => {
	it("gleans style data from context clues and item name", () => {})
	//wide leg
	//weave pattern - herringbone, houndstooth, plaid, tweed
})