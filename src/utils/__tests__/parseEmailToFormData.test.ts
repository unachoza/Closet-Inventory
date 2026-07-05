import { describe, it, expect } from "vitest";
import { parseEmailToFormData, extractForwardedSender, extractForwardedPurchaseDate } from "../parseEmailToFormData";

// ── Helpers ───────────────────────────────────────────────────────────────────
const parse = (subject: string, body = "", from = "") => parseEmailToFormData(subject, body, from);

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

	it("falls back to the sender domain as the brand when no brand keyword is found", () => {
		// Per product requirement: if no known brand is detected, assume the
		// email sender is the brand (here, the domain "unknownstore").
		const result = parse("Your order is ready", "", "hello@unknownstore.com");
		expect(result.brand).toBe("unknownstore");
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

	it('infers "athleisure" from "legging"', () => {
		// "active" was a legacy orphan label (never a valid CategoryType); it now
		// folds into the canonical "athleisure" bucket.
		expect(parse("High Waist Leggings").category).toBe("athleisure");
	});

	it('infers "body" from "jumpsuit"', () => {
		expect(parse("TENCEL Flight Jumpsuit").category).toBe("body");
	});

	it('infers "body" from "bodysuit"', () => {
		expect(parse("Ribbed Bodysuit").category).toBe("body");
	});

	it('infers "intimates" from "bra"', () => {
		expect(parse("The Bra").category).toBe("intimates");
	});

	// "underwear" was retired as a category; bras/briefs/underwear now fold into intimates.
	it('infers "intimates" from "briefs"', () => {
		expect(parse("Cotton Briefs 3-Pack").category).toBe("intimates");
	});

	it('infers "intimates" from "teddy"', () => {
		expect(parse("Floral Lace Zip Up Teddy").category).toBe("intimates");
	});

	it('defaults occasion to "everyday" for underwear', () => {
		expect(parse("Cotton Briefs 3-Pack").occasion).toBe("everyday");
	});

	it('defaults occasion to "everyday" for intimates', () => {
		expect(parse("Floral Lace Zip Up Teddy").occasion).toBe("everyday");
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
	it('sets condition to "new" when there is no purchase date', () => {
		expect(parse("anything").condition).toBe("new");
	});

	it("seeds condition from the order's age — a years-old email is not 'new'", () => {
		// An order from 2018 is well over 3 years old → defaults to "good".
		const result = parseEmailToFormData("Order", "", "", "Thu, 21 Jun 2018 12:00:00 +0000");
		expect(result.condition).toBe("good");
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

describe("parseEmailToFormData — attribute-driven care", () => {
	it("adds 'Wash inside out' when the product is jeans", () => {
		const result = parse("Levi's High Rise Skinny Jeans", "", "");
		expect(result.care).toContain("Wash inside out");
	});

	it("adds 'Wash with like colors' when the item is white", () => {
		const result = parse("Cotton Tee in White", "", "");
		expect(result.color).toBe("White");
		expect(result.care).toContain("Wash with like colors");
	});

	it("adds both tags for white jeans", () => {
		const result = parse("White Wide Leg Jeans", "", "");
		expect(result.care).toContain("Wash inside out");
		expect(result.care).toContain("Wash with like colors");
	});

	it("does not add attribute care tags for an unrelated item", () => {
		const result = parse("Black Silk Cami", "", "");
		expect(result.care).not.toContain("Wash inside out");
		expect(result.care).not.toContain("Wash with like colors");
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

describe("parseEmailToFormData — color extraction from subject", () => {
	it("extracts teal from subject and normalizes to Blue", () => {
		const result = parse("Aritzia Teal Long-Sleeve Square Neck Bodycon Dress", "", "aritzia@aritzia.com");
		expect(result.color).toBe("Blue");
	});

	it("extracts deep taupe from subject and normalizes to Brown", () => {
		const result = parse("Babaton Deep Taupe Contour Scoop Stretch Cami Mini Dress Medium NWT", "", "aritzia@aritzia.com");
		expect(result.color).toBe("Brown");
	});

	it("extracts single-word color (navy) from subject", () => {
		const result = parse("Zara Navy Blazer Size M", "", "sales@zara.com");
		expect(result.color).toBe("Blue");
	});

	it("prefers inline 'in <color>' pattern over name scan", () => {
		const result = parse("Silk blouse in ivory size S", "", "store@store.com");
		expect(result.color).toBe("White");
	});

	it("leaves color empty when no color word is found", () => {
		const result = parse("Order Confirmation #12345", "", "store@store.com");
		expect(result.color).toBeFalsy();
	});
});

describe("parse augmented style data", () => {
	it("gleans style data from context clues and item name", () => {});
	//wide leg
	//weave pattern - herringbone, houndstooth, plaid, tweed
});
describe("parseEmailToFormData — material inference", () => {
	it("infers a single material from the item name", () => {
		const result = parse("Thanks for your purchase", "POLYAMIDE BLEND STRAPPY DRESS", "sales@zara.com");

		expect(result.material).toEqual([
			{
				material: "polyamide",
				percentage: 100,
			},
		]);
	});

	it("infers multiple materials from the item name", () => {
		const result = parse("Thanks for your purchase", "COTTON MODAL TANK TOP", "sales@zara.com");

		expect(result.material).toEqual([
			{
				material: "cotton",
				percentage: 50,
			},
			{
				material: "modal",
				percentage: 50,
			},
		]);
	});

	it("infers percentage-based blends", () => {
		const result = parse("Thanks for your purchase", "95% Cotton, 5% Spandex Leggings", "sales@zara.com");

		expect(result.material).toContainEqual({
			material: "cotton",
			percentage: 95,
		});

		expect(result.material).toContainEqual({
			material: "spandex",
			percentage: 5,
		});
	});

	it("returns an empty material array when no material is found", () => {
		const result = parse("Thanks for your purchase", "SLEEVELESS TOP", "sales@zara.com");

		expect(result.material).toEqual([]);
	});
	it("infers materials when the product name is passed as the email body", () => {
		const result = parse("Thanks for your purchase", "COTTON MODAL TANK TOP", "sales@zara.com");

		expect(result.material).toEqual([
			{ material: "cotton", percentage: 50 },
			{ material: "modal", percentage: 50 },
		]);
	});
});

describe("parseEmailToFormData — forwarded email brand detection", () => {
	it("extracts Nordstrom brand from a Gmail-forwarded email (Begin forwarded message format)", () => {
		const body = `
---------- Forwarded message ---------
From: NORDSTROM <nordstrom@eml.nordstrom.com>
Reply-To: Nordstrom <reply@eml.nordstrom.com>

Your Nordstrom order has shipped.
		`.trim();
		// outer from is the user's gmail — should NOT be the brand
		const result = parse("Fwd: Your Nordstrom order", body, "me@gmail.com");
		expect(result.brand).toBe("nordstrom");
	});

	it("extracts icebreaker brand from a forwarded email via customer-care domain fallback", () => {
		const body = `
Begin forwarded message:

From: icebreaker <noreply@orders.icebreaker.com>

Order I538721
If you have any questions, contact us at us_customer_care@icebreaker.com
		`.trim();
		const result = parse("Fwd: Your icebreaker order", body, "me@gmail.com");
		expect(result.brand).toBe("icebreaker");
	});
});

describe("extractForwardedSender — recovers retailer from forwarded HTML body", () => {
	it("pulls the icebreaker sender from a Gmail-forwarded HTML body", () => {
		const html = `<div dir="ltr">---------- Forwarded message ---------<br>From: <strong>icebreaker</strong> <span>&lt;noreply@orders.icebreaker.com&gt;</span><br>Date: Sun, Jan 25, 2026<br>Subject: Order I538735 confirmed</div>`;
		const sender = extractForwardedSender(html);
		// The display name "icebreaker" is recoverable from the inner From: line.
		expect(sender.toLowerCase()).toContain("icebreaker");
		// And it resolves to the icebreaker brand when fed through the parser.
		expect(parse("Fwd: Order confirmed", "Merino Zip Jacket", sender).brand).toBe("icebreaker");
	});

	it("pulls the Nordstrom sender from a Begin-forwarded HTML body", () => {
		const html = `<div dir="ltr"><br>Begin forwarded message:<br></div><blockquote><div dir="ltr"><b>From:</b> NORDSTROM &lt;nordstrom@eml.nordstrom.com&gt;<br><b>Date:</b> June 5, 2026<br></div></blockquote>`;
		const sender = extractForwardedSender(html);
		expect(sender.toLowerCase()).toContain("nordstrom");
		expect(parse("Fwd: Your package has arrived", "Cotton On Graphic T-Shirt", sender).brand).toBe("nordstrom");
	});

	it("returns empty string for a non-forwarded body", () => {
		expect(extractForwardedSender("<p>Thanks for your order!</p>")).toBe("");
	});
});

describe("extractForwardedPurchaseDate — recovers the original send date from a forwarded HTML body", () => {
	it("pulls the forwarded date, not the date the user forwarded it", () => {
		const html = `<div dir="ltr">---------- Forwarded message ---------<br>From: REI Co-op &lt;rei@notices.rei.com&gt;<br>Date: Mon, May 31, 2021 at 7:42 PM<br>Subject: Your Shipment Confirmation for Order #A220391194<br>To: &lt;maggieannclark@gmail.com&gt;</div>`;
		const iso = extractForwardedPurchaseDate(html);
		expect(iso).toBeTruthy();
		expect(new Date(iso).getUTCFullYear()).toBe(2021);
		expect(new Date(iso).getUTCMonth()).toBe(4); // May (0-indexed)
		expect(new Date(iso).getUTCDate()).toBe(31);
	});

	it("handles the second REI order confirmation date", () => {
		const html = `<div dir="ltr">---------- Forwarded message ---------<br>From: REI Co-op &lt;rei@notices.rei.com&gt;<br>Date: Fri, Nov 4, 2022 at 2:22 PM<br>Subject: REI Order Confirmation #A256438779<br>To: &lt;maggieannclark@gmail.com&gt;</div>`;
		const iso = extractForwardedPurchaseDate(html);
		expect(new Date(iso).getUTCFullYear()).toBe(2022);
		expect(new Date(iso).getUTCMonth()).toBe(10); // November
		expect(new Date(iso).getUTCDate()).toBe(4);
	});

	it("returns empty string for a non-forwarded body", () => {
		expect(extractForwardedPurchaseDate("<p>Thanks for your order!</p>")).toBe("");
	});

	it("returns empty string when the forwarded header has no parseable Date: line", () => {
		const html = `<div>---------- Forwarded message ---------<br>From: REI Co-op &lt;rei@notices.rei.com&gt;<br>Subject: No date here</div>`;
		expect(extractForwardedPurchaseDate(html)).toBe("");
	});
});

describe("parseEmailToFormData — purchase date from forwarded emails", () => {
	it("uses the forwarded send date instead of the outer forward date when the full body is passed", () => {
		const body = `
---------- Forwarded message ---------
From: REI Co-op <rei@notices.rei.com>
Date: Mon, May 31, 2021 at 7:42 PM
Subject: Your Shipment Confirmation for Order #A220391194
To: <maggieannclark@gmail.com>

We've shipped your order.
		`.trim();
		// Outer date is when Maggie forwarded it (2026); the real purchase date is 2021.
		const result = parseEmailToFormData(
			"Fwd: Your Shipment Confirmation for Order #A220391194",
			body,
			"maggieannclark@gmail.com",
			"Thu, 2 Jul 2026 11:29:40 -0700",
		);
		expect(result.purchaseDate).toBeDefined();
		expect(new Date(result.purchaseDate as string).getUTCFullYear()).toBe(2021);
	});

	it("falls back to the outer date when the body has no forwarded header", () => {
		const result = parseEmailToFormData("Order Confirmation", "Thanks for your order", "sales@gap.com", "Fri, 15 Mar 2024 10:30:00 -0700");
		expect(new Date(result.purchaseDate as string).getUTCFullYear()).toBe(2024);
	});
});

describe("parseEmailToFormData — color-driven care", () => {
	it("adds the like-colors tag when 'white' is in the product name, not the subject", () => {
		const result = parse("Thanks for your purchase", "White Cotton Oxford Shirt", "sales@gap.com");
		const care = Array.isArray(result.care) ? result.care : [result.care];
		expect(care).toContain("Wash with like colors only");
	});

	it("does not add the like-colors tag for a non-white item", () => {
		const result = parse("Thanks for your purchase", "Black Cotton Oxford Shirt", "sales@gap.com");
		const care = Array.isArray(result.care) ? result.care : [result.care];
		expect(care).not.toContain("Wash with like colors only");
	});
});
