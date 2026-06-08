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
});
