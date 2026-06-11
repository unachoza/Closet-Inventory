import { describe, it, expect } from "vitest";
import { parseEmailToFormData } from "../parseEmailToFormData";

// Mirrors the per-product import path: GmailImport.handleImportProduct calls
// parseEmailToFormData(emailSubject, product.name, …) — the product NAME is
// passed as the `body` argument. Style words live in the product name, not the
// retailer's generic subject line.
describe("parseEmailToFormData — style attributes reach the item", () => {
	const subject = "Your ZARA order has been received";
	const productName = "Ribbed Long Sleeve Crew Neck Top";

	it("infers neckline + sleeve from the product name", () => {
		const result = parseEmailToFormData(subject, productName, "no-reply@zara.com");
		expect(result).toMatchObject({
			neckline: "crew neck",
			sleeveLength: "long sleeve",
		});
	});

	it("infers fit + rise from a bottoms product name", () => {
		const result = parseEmailToFormData(subject, "High Waist Wide Leg Trousers", "no-reply@zara.com");
		expect(result).toMatchObject({
			fit: "wide leg",
			rise: "high waist",
		});
	});
});
