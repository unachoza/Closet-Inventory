import { describe, it, expect, vi, afterEach } from "vitest";
import { compressImage, scaledSize } from "../compressImage";

afterEach(() => vi.unstubAllGlobals());

describe("scaledSize", () => {
	it("never upscales an image smaller than the max", () => {
		expect(scaledSize(800, 600, 1200)).toEqual({ width: 800, height: 600 });
	});

	it("caps the longest edge while preserving aspect ratio (landscape)", () => {
		expect(scaledSize(4000, 3000, 1200)).toEqual({ width: 1200, height: 900 });
	});

	it("caps the longest edge while preserving aspect ratio (portrait)", () => {
		expect(scaledSize(3000, 4000, 1200)).toEqual({ width: 900, height: 1200 });
	});
});

describe("compressImage", () => {
	it("passes non-image files through as a data URL", async () => {
		const file = new File(["plain text"], "notes.txt", { type: "text/plain" });
		const result = await compressImage(file);
		expect(result.startsWith("data:")).toBe(true);
	});

	it("falls back to the original image when canvas is unavailable (no crash)", async () => {
		// Decode succeeds, but jsdom has no 2D canvas context → fall back to the
		// original data URL rather than throwing.
		vi.stubGlobal("createImageBitmap", vi.fn(async () => ({ width: 100, height: 100, close: () => {} })));

		const file = new File(["fake-bytes"], "photo.png", { type: "image/png" });
		const result = await compressImage(file);
		expect(result.startsWith("data:")).toBe(true);
	});
});
