import { describe, it, expect } from "vitest";
import { getColorSwatchFill } from "../colorSwatches";
import { colorOptions } from "../constants";

describe("getColorSwatchFill", () => {
	it("returns a fill for every color option", () => {
		colorOptions.forEach((color) => {
			expect(getColorSwatchFill(color)).toBeTruthy();
		});
	});

	it("returns a gradient for floral", () => {
		expect(getColorSwatchFill("floral")).toContain("gradient");
	});

	it("returns transparent for an unknown color", () => {
		expect(getColorSwatchFill("not-a-color")).toBe("transparent");
	});
});
