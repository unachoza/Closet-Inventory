import { describe, it, expect } from "vitest";
import { inferCareFromAttributes } from "../inferCareFromAttributes";

describe("inferCareFromAttributes — name rules", () => {
	it("adds 'Wash inside out' for jeans (and singular jean)", () => {
		expect(inferCareFromAttributes("High Rise Skinny Jeans", "Blue")).toContain("Wash inside out");
		expect(inferCareFromAttributes("Denim jean jacket", "")).toContain("Wash inside out");
	});

	it("adds inside-out + air dry for fleece/sherpa", () => {
		expect(inferCareFromAttributes("Sherpa Fleece Pullover")).toEqual(
			expect.arrayContaining(["Wash inside out", "Air dry"]),
		);
	});

	it("adds mesh bag + hand wash for beaded/sequined/embroidered", () => {
		expect(inferCareFromAttributes("Sequined Mini Dress")).toEqual(
			expect.arrayContaining(["Wash in a mesh laundry bag", "Hand wash only"]),
		);
		expect(inferCareFromAttributes("Embroidered Blouse")).toContain("Hand wash only");
	});

	it("adds laundry bag for raw hem / distressed", () => {
		expect(inferCareFromAttributes("Distressed Boyfriend Jeans")).toContain("Wash in a laundry bag");
		expect(inferCareFromAttributes("Raw Hem Top")).toContain("Wash in a laundry bag");
	});

	it("adds 'Close fasteners before washing' for metal hardware", () => {
		expect(inferCareFromAttributes("Moto Jacket with Zippers")).toContain("Close fasteners before washing");
		expect(inferCareFromAttributes("Studded Belt")).toContain("Close fasteners before washing");
	});

	it("is case-insensitive and does not match unrelated names", () => {
		expect(inferCareFromAttributes("WIDE LEG JEANS")).toContain("Wash inside out");
		expect(inferCareFromAttributes("Linen Blazer", "Brown")).toEqual([]);
	});
});

describe("inferCareFromAttributes — color rules", () => {
	it("adds 'Wash with like colors' for white (and white-family)", () => {
		expect(inferCareFromAttributes("Oxford Shirt", "White")).toContain("Wash with like colors");
		expect(inferCareFromAttributes("Tee", "ivory")).toContain("Wash with like colors");
	});

	it("adds 'Wash with dark colors' for black/navy/indigo", () => {
		expect(inferCareFromAttributes("Tee", "Black")).toContain("Wash with dark colors");
		expect(inferCareFromAttributes("Chinos", "Navy")).toContain("Wash with dark colors");
	});

	it("adds 'Wash separately before first use' for red/neon/bright pink", () => {
		expect(inferCareFromAttributes("Tee", "Red")).toContain("Wash separately before first use");
		expect(inferCareFromAttributes("Top", "Neon Green")).toContain("Wash separately before first use");
		expect(inferCareFromAttributes("Top", "Bright Pink")).toContain("Wash separately before first use");
	});

	it("does not add a color tag for neutral colors", () => {
		expect(inferCareFromAttributes("Tee", "Brown")).toEqual([]);
	});
});

describe("inferCareFromAttributes — combined + edge cases", () => {
	it("combines name and color rules (white jeans), name first, deduped", () => {
		expect(inferCareFromAttributes("White Wide Leg Jeans", "White")).toEqual([
			"Wash inside out",
			"Wash with like colors",
		]);
	});

	it("returns an empty list when nothing matches and tolerates undefined", () => {
		expect(inferCareFromAttributes()).toEqual([]);
		expect(inferCareFromAttributes("Silk Cami", "Brown")).toEqual([]);
	});
});
