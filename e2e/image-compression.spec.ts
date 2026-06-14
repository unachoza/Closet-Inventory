import { test, expect } from "@playwright/test";

/**
 * Proves the real byte-reduction win in a real browser engine (WebKit + Chromium)
 * — jsdom has no canvas, so unit tests can only cover the fallback path. Runs the
 * app's actual compressImage util (served by Vite) on a large generated photo.
 */
test.describe("Image compression", () => {
	test("downscales a large photo to a fraction of its original size", async ({ page }) => {
		await page.goto("/");

		const result = await page.evaluate(async () => {
			// Build a large, NOISY JPEG so it can't trivially compress away — this
			// keeps the original genuinely large and forces real downscaling.
			const size = 3000;
			const canvas = document.createElement("canvas");
			canvas.width = size;
			canvas.height = size;
			const ctx = canvas.getContext("2d")!;
			const imgData = ctx.createImageData(size, size);
			for (let i = 0; i < imgData.data.length; i += 4) {
				imgData.data[i] = Math.random() * 255;
				imgData.data[i + 1] = Math.random() * 255;
				imgData.data[i + 2] = Math.random() * 255;
				imgData.data[i + 3] = 255;
			}
			ctx.putImageData(imgData, 0, 0);
			const blob: Blob = await new Promise((r) => canvas.toBlob((b) => r(b!), "image/jpeg", 0.95));
			const file = new File([blob], "big.jpg", { type: "image/jpeg" });

			const mod = await import("/src/utils/compressImage.ts");
			const compressed: string = await mod.compressImage(file, { maxDimension: 1200, quality: 0.8 });

			// Approximate the encoded byte size from the base64 data URL length.
			const base64 = compressed.slice(compressed.indexOf(",") + 1);
			const compressedBytes = Math.floor((base64.length * 3) / 4);

			return { originalBytes: file.size, compressedBytes, isJpeg: compressed.startsWith("data:image/jpeg") };
		});

		// Re-encoded as JPEG...
		expect(result.isJpeg).toBe(true);
		// ...the source really was large...
		expect(result.originalBytes).toBeGreaterThan(500_000);
		// ...and compression cut it down dramatically (well over 5x smaller).
		expect(result.compressedBytes).toBeLessThan(result.originalBytes / 5);
	});
});
