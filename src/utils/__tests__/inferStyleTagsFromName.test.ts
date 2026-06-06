import { describe, it, expect } from "vitest";
import { inferStyleTagsFromName } from "../inferStyleTagsFromName";

describe("inferStyleTagsFromName — occasion inference", () => {
	it.each([
		// Formal
		["Black Tie Formal Gown", undefined, ["formal"]],
		["Prom Ball Gown", "dresses", ["formal"]],
		// Wedding
		["Wedding Guest Midi Dress", "dresses", ["wedding"]],
		["Bridal Shower Floral Dress", "dresses", ["wedding"]],
		// Cocktail / going-out
		["Cocktail Party Slip Dress", "dresses", ["cocktail"]],
		["Sequin Bodycon Mini Dress", "dresses", ["going-out"]],
		["Night Out Ruched Dress", "dresses", ["going-out"]],
		// Work
		["Work Wear Blazer", "coats", ["work wear"]],
		["Office Pencil Skirt", "bottoms", ["work wear"]],
		// Sports
		["Gym Yoga Leggings", "active", ["sports"]],
		["Running Workout Top", "active", ["sports"]],
		// Vacation / beach
		["Beach Cover-Up Resort Dress", "dresses", ["vacation"]],
		["Tropical Print Swimsuit", undefined, ["vacation"]],
		// Holiday / festive
		["Christmas Party Sequin Dress", "dresses", ["holiday"]],
		["NYE Sparkle Top", "tops", ["holiday"]],
		// Church
		["Sunday Church Midi Dress", "dresses", ["church"]],
		// Picnic
		["Garden Picnic Floral Dress", "dresses", ["picnic"]],
		// Casual / everyday / basics
		["Everyday Casual Tee", "tops", ["casual"]],
		["Basic White Tank", "tops", ["basics"]],
	] as [string, string | undefined, string[]][])('"%s" (cat=%s) → tags include %j', (name, category, expectedTags) => {
		const tags = inferStyleTagsFromName(name, category);
		for (const tag of expectedTags) {
			expect(tags).toContain(tag);
		}
	});

	it("returns empty array when no occasion keywords found", () => {
		expect(inferStyleTagsFromName("Ribbed Knit Top")).toEqual([]);
	});

	it("returns at most 2 tags", () => {
		const tags = inferStyleTagsFromName("Holiday Party Cocktail Sequin Dress Formal Gown");
		expect(tags.length).toBeLessThanOrEqual(2);
	});

	it("returns no duplicates", () => {
		const tags = inferStyleTagsFromName("Casual Everyday Lounge Set");
		expect(new Set(tags).size).toBe(tags.length);
	});

	it("defaults to everyday for underwear category", () => {
		expect(inferStyleTagsFromName("Ribbed High Waist Thong", "underwear")).toContain("everyday");
	});

	it("defaults to everyday for lingerie category", () => {
		expect(inferStyleTagsFromName("Floral Lace Zip Up Teddy", "lingerie")).toContain("everyday");
	});

	it("does not override a more specific occasion with everyday", () => {
		const tags = inferStyleTagsFromName("Sequin Bodycon Teddy", "lingerie");
		expect(tags).toContain("going-out");
		expect(tags).not.toContain("everyday");
	});

	it("only returns tags from the valid occasionExamples vocabulary", () => {
		const validVocab = new Set(["formal", "wedding", "cocktail", "going-out", "casual", "basics", "sports", "church", "picnic", "work wear", "everyday", "vacation", "holiday"]);
		const tags = inferStyleTagsFromName("Sports Casual Everyday Top", "active");
		for (const tag of tags) {
			expect(validVocab.has(tag)).toBe(true);
		}
	});
});
