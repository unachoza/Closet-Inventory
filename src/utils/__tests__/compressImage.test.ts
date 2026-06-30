import { describe, it, expect, vi, afterEach } from "vitest";
import { compressImage, compressImageToBlob, scaledSize } from "../compressImage";

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

	// Documents the actual reduction: NOT a fixed output size — it's proportional
	// to how far the original exceeds the cap. A 4000x3000 source survives at
	// ~9% of its original pixel count; an already-small source is untouched.
	it("reduces pixel count proportionally to how far over the cap the source is", () => {
		const huge = scaledSize(6000, 4000, 1200); // far over cap
		const pixelRatioHuge = (huge.width * huge.height) / (6000 * 4000);
		expect(pixelRatioHuge).toBeCloseTo(0.04, 2); // ~4% of original pixels

		const moderate = scaledSize(2400, 1800, 1200); // 2x over cap
		const pixelRatioModerate = (moderate.width * moderate.height) / (2400 * 1800);
		expect(pixelRatioModerate).toBeCloseTo(0.25, 2); // 1/(2x)^2 = 25% of original pixels

		const small = scaledSize(600, 400, 1200); // under cap
		expect(small).toEqual({ width: 600, height: 400 }); // 100% — untouched
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

describe("compressImageToBlob", () => {
	it("passes non-image files through as a Blob, keeping the original extension", async () => {
		const file = new File(["plain text"], "notes.txt", { type: "text/plain" });
		const { blob, ext } = await compressImageToBlob(file);
		expect(blob).toBeInstanceOf(Blob);
		expect(ext).toBe("txt");
	});

	it("falls back to the original file (no crash) when canvas is unavailable, keeping its extension", async () => {
		// Same jsdom limitation as compressImage: decode succeeds, no 2D context → fall back.
		vi.stubGlobal("createImageBitmap", vi.fn(async () => ({ width: 100, height: 100, close: () => {} })));

		const file = new File(["fake-bytes"], "photo.png", { type: "image/png" });
		const { blob, ext } = await compressImageToBlob(file);
		expect(blob).toBeInstanceOf(Blob);
		expect(ext).toBe("png");
		expect(blob.size).toBe(file.size); // untouched fallback, not silently corrupted
	});

	it("falls back to a 'jpg' extension when the original filename has none", async () => {
		vi.stubGlobal("createImageBitmap", vi.fn(async () => ({ width: 100, height: 100, close: () => {} })));

		const file = new File(["fake-bytes"], "photo", { type: "image/png" });
		const { ext } = await compressImageToBlob(file);
		expect(ext).toBe("jpg");
	});

	it("re-encodes to a 'jpg' blob when the canvas pipeline succeeds", async () => {
		vi.stubGlobal("createImageBitmap", vi.fn(async () => ({ width: 4000, height: 3000, close: () => {} })));
		// Simulate a working 2D context + toBlob, which jsdom doesn't provide natively.
		const drawImage = vi.fn();
		vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({ drawImage } as unknown as CanvasRenderingContext2D);
		vi.spyOn(HTMLCanvasElement.prototype, "toBlob").mockImplementation(function (
			this: HTMLCanvasElement,
			callback: BlobCallback,
		) {
			callback(new Blob(["compressed"], { type: "image/jpeg" }));
		});

		const file = new File(["fake-bytes"], "photo.heic", { type: "image/heic" });
		const { blob, ext } = await compressImageToBlob(file);

		expect(ext).toBe("jpg");
		expect(blob.type).toBe("image/jpeg");
		// Canvas was sized to the downscaled (1200x900), not the original 4000x3000 — proof
		// the resize actually ran before encoding, not just a relabel of the original bytes.
		expect(drawImage).toHaveBeenCalledWith(expect.anything(), 0, 0, 1200, 900);
	});
});
