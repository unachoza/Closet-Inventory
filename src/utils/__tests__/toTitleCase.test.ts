import { describe, it, expect } from "vitest";
import { toTitleCase } from "../toTitleCase";

describe("toTitleCase", () => {
	it.each([
		["COTTON MODAL TANK TOP", "Cotton Modal Tank Top"],
		["STYLIST HIGH WAISTED PLEATED SHORTS", "Stylist High Waisted Pleated Shorts"],
		["V-NECK T-SHIRT", "V-Neck T-Shirt"],
		["short-sleeved t-shirt", "Short-Sleeved T-Shirt"],
		["Already Title Case", "Already Title Case"],
		["Black & White Plaid", "Black & White Plaid"],
	])('"%s" -> "%s"', (input, expected) => {
		expect(toTitleCase(input)).toBe(expected);
	});

	it("capitalizes the letter after a slash", () => {
		expect(toTitleCase("BLACK/WHITE DRESS")).toBe("Black/White Dress");
	});

	it("leaves digits and trailing words intact", () => {
		expect(toTitleCase("COTTON 2 PACK CREW")).toBe("Cotton 2 Pack Crew");
	});

	it("returns empty/whitespace input unchanged", () => {
		expect(toTitleCase("")).toBe("");
	});

	// Regression: retailer names arrive ALL CAPS from Zara/Aritzia/Shein emails.
	// toTitleCase is applied at import time (GmailImport.tsx) so stored names are clean.
	it.each([
		["RIBBED KNIT MIDI SKIRT", "Ribbed Knit Midi Skirt"],
		["SCULPT KNIT RACER MINI DRESS", "Sculpt Knit Racer Mini Dress"],
		["OVERSIZED PRINTED T-SHIRT", "Oversized Printed T-Shirt"],
		["RELAXED FIT JEANS WITH BELT", "Relaxed Fit Jeans With Belt"],
	])('retailer ALL CAPS "%s" -> "%s"', (input, expected) => {
		expect(toTitleCase(input)).toBe(expected);
	});
});
