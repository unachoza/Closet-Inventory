/**
 * Best-effort dominant color detection from a product image URL.
 *
 * CORS LIMITATION:
 * Browser security blocks reading pixel data from images hosted on different
 * origins (e.g. ThredUp's CDN at cf-assets-thredup.thredup.com) unless the
 * server sends Access-Control-Allow-Origin headers. Many retailer CDNs do NOT
 * send these headers, so color detection will silently fail for those images.
 *
 * When detection fails, the color field stays empty and the user can manually
 * select a color in the EditItemView form. This is a fundamental browser
 * limitation — a server-side proxy would be needed to fully solve it.
 *
 * Two strategies (tried in order, first success wins):
 *   1. Fetch the image as a blob → create same-origin object URL → canvas
 *      (bypasses tainted-canvas restriction IF the CDN allows CORS on fetch)
 *   2. Direct canvas load with crossOrigin="anonymous"
 *      (works when CDN sends Access-Control-Allow-Origin headers)
 *
 * Returns "" if both strategies fail (CORS blocked, network error, etc.)
 */

interface RGB {
	readonly r: number;
	readonly g: number;
	readonly b: number;
}

const COLOR_MAP: ReadonlyArray<{ readonly name: string; readonly rgb: RGB }> = [
	{ name: "black", rgb: { r: 0, g: 0, b: 0 } },
	{ name: "white", rgb: { r: 255, g: 255, b: 255 } },
	{ name: "red", rgb: { r: 200, g: 30, b: 30 } },
	{ name: "dark red", rgb: { r: 139, g: 0, b: 0 } },
	{ name: "pink", rgb: { r: 230, g: 130, b: 150 } },
	{ name: "orange", rgb: { r: 230, g: 130, b: 30 } },
	{ name: "yellow", rgb: { r: 230, g: 210, b: 50 } },
	{ name: "green", rgb: { r: 50, g: 150, b: 50 } },
	{ name: "olive", rgb: { r: 128, g: 128, b: 0 } },
	{ name: "teal", rgb: { r: 0, g: 128, b: 128 } },
	{ name: "blue", rgb: { r: 40, g: 80, b: 200 } },
	{ name: "navy", rgb: { r: 20, g: 20, b: 80 } },
	{ name: "purple", rgb: { r: 130, g: 50, b: 160 } },
	{ name: "brown", rgb: { r: 130, g: 80, b: 40 } },
	{ name: "tan", rgb: { r: 210, g: 180, b: 140 } },
	{ name: "beige", rgb: { r: 230, g: 220, b: 200 } },
	{ name: "cream", rgb: { r: 255, g: 253, b: 235 } },
	{ name: "gray", rgb: { r: 128, g: 128, b: 128 } },
	{ name: "charcoal", rgb: { r: 54, g: 54, b: 54 } },
	{ name: "light gray", rgb: { r: 200, g: 200, b: 200 } },
	{ name: "burgundy", rgb: { r: 128, g: 0, b: 32 } },
	{ name: "coral", rgb: { r: 255, g: 127, b: 80 } },
	{ name: "lavender", rgb: { r: 180, g: 160, b: 220 } },
	{ name: "mint", rgb: { r: 150, g: 220, b: 180 } },
	{ name: "gold", rgb: { r: 212, g: 175, b: 55 } },
];

function colorDistance(a: RGB, b: RGB): number {
	// Weighted Euclidean — human eyes are more sensitive to green
	const dr = a.r - b.r;
	const dg = a.g - b.g;
	const db = a.b - b.b;
	return Math.sqrt(2 * dr * dr + 4 * dg * dg + 3 * db * db);
}

function nearestColorName(pixel: RGB): string {
	let bestName = "";
	let bestDist = Infinity;

	for (const entry of COLOR_MAP) {
		const dist = colorDistance(pixel, entry.rgb);
		if (dist < bestDist) {
			bestDist = dist;
			bestName = entry.name;
		}
	}

	return bestName;
}

/**
 * Returns true if the pixel is likely background (white, near-white, or
 * light neutral gray typical of clothing photo backgrounds).
 */
function isBackground(pixel: RGB): boolean {
	const { r, g, b } = pixel;
	if (r > 220 && g > 220 && b > 220) return true;
	if (r > 190 && g > 190 && b > 190 && Math.abs(r - g) < 15 && Math.abs(g - b) < 15) return true;
	return false;
}

/**
 * Analyze pixel data from a canvas and return the dominant non-background color.
 */
function analyzeCanvas(canvas: HTMLCanvasElement): string {
	const ctx = canvas.getContext("2d");
	if (!ctx) return "";

	const size = canvas.width;
	const margin = Math.floor(size * 0.3);
	const sampleSize = size - margin * 2;

	let imageData: ImageData;
	try {
		imageData = ctx.getImageData(margin, margin, sampleSize, sampleSize);
	} catch {
		// SecurityError: tainted canvas (CORS)
		return "";
	}

	const pixels = imageData.data;
	const colorCounts = new Map<string, number>();

	for (let i = 0; i < pixels.length; i += 4) {
		const pixel: RGB = { r: pixels[i], g: pixels[i + 1], b: pixels[i + 2] };

		if (isBackground(pixel)) continue;
		if (pixels[i + 3] < 128) continue;

		const name = nearestColorName(pixel);
		colorCounts.set(name, (colorCounts.get(name) ?? 0) + 1);
	}

	if (colorCounts.size === 0) return "";

	let topColor = "";
	let topCount = 0;
	for (const [name, count] of colorCounts) {
		if (count > topCount) {
			topCount = count;
			topColor = name;
		}
	}

	return topColor;
}

/**
 * Strategy 1: Fetch the image as a blob, convert to object URL, load into canvas.
 * This bypasses the tainted-canvas restriction because the blob URL is same-origin.
 *
 * NOTE: This still requires the CDN to allow CORS on the fetch() request itself.
 * CDNs like ThredUp's (cf-assets-thredup.thredup.com) block cross-origin fetch,
 * so this strategy will fail for those — we fall through to Strategy 2.
 */
async function detectViaFetch(imageUrl: string): Promise<string> {
	const response = await fetch(imageUrl, { mode: "cors" });
	if (!response.ok) return "";

	const blob = await response.blob();
	const objectUrl = URL.createObjectURL(blob);

	try {
		const img = await loadImageFromUrl(objectUrl);
		const canvas = drawToCanvas(img);
		return analyzeCanvas(canvas);
	} finally {
		URL.revokeObjectURL(objectUrl);
	}
}

/**
 * Strategy 2: Load the image with crossOrigin="anonymous" directly.
 * Works when the CDN sends Access-Control-Allow-Origin headers.
 *
 * If the CDN doesn't support CORS at all, the image won't load and
 * this rejects — the caller catches the error and returns "".
 */
async function detectViaCrossOrigin(imageUrl: string): Promise<string> {
	const img = new Image();
	img.crossOrigin = "anonymous";

	await new Promise<void>((resolve, reject) => {
		img.onload = () => resolve();
		img.onerror = () => reject(new Error("load failed"));
		img.src = imageUrl;
	});

	const canvas = drawToCanvas(img);
	return analyzeCanvas(canvas);
}

function loadImageFromUrl(url: string): Promise<HTMLImageElement> {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.onload = () => resolve(img);
		img.onerror = () => reject(new Error("Image load failed"));
		img.src = url;
	});
}

function drawToCanvas(img: HTMLImageElement): HTMLCanvasElement {
	const canvas = document.createElement("canvas");
	const size = 50;
	canvas.width = size;
	canvas.height = size;

	const ctx = canvas.getContext("2d");
	if (ctx) {
		ctx.drawImage(img, 0, 0, size, size);
	}

	return canvas;
}

/**
 * Attempt to detect the dominant clothing color from a product image.
 * Returns a color name string, or "" if detection fails.
 *
 * Tries fetch-as-blob first (handles most CORS scenarios), then falls
 * back to crossOrigin img load. Silently returns "" on any failure so
 * the import flow is never blocked by color detection issues.
 *
 * When this returns "", the product card shows no color tag and the user
 * can pick a color manually in the EditItemView form.
 */
export async function detectDominantColor(imageUrl: string): Promise<string> {
	if (!imageUrl) return "";

	// Strategy 1: Fetch as blob → object URL → canvas (bypasses tainted canvas)
	try {
		const color = await detectViaFetch(imageUrl);
		if (color) return color;
	} catch {
		// fetch blocked by CORS or network — try next strategy
	}

	// Strategy 2: crossOrigin img load (works if CDN sends CORS headers)
	try {
		const color = await detectViaCrossOrigin(imageUrl);
		if (color) return color;
	} catch {
		// CORS not supported — give up silently
	}

	return "";
}
