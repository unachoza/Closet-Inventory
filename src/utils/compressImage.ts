/**
 * Client-side image downscaling + recompression, run before a photo is stored
 * as base64. Phone photos are multi-MB; persisting them raw quickly exhausts
 * Safari's ~5MB localStorage cap. This caps the longest edge and re-encodes to
 * JPEG, typically shrinking a 3–5MB photo to a few hundred KB.
 *
 * Always resolves to a usable data URL — if anything fails (no canvas, decode
 * error, non-image file) it falls back to the original so uploads never break.
 */

export interface CompressOptions {
	/** Longest edge in pixels. Larger images are scaled down to fit. */
	readonly maxDimension?: number;
	/** JPEG quality, 0–1. */
	readonly quality?: number;
}

const DEFAULT_MAX_DIMENSION = 1200;
const DEFAULT_QUALITY = 0.8;

/** Read a File as a base64 data URL. */
function fileToDataURL(file: Blob): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(reader.result as string);
		reader.onerror = () => reject(reader.error ?? new Error("Failed to read file"));
		reader.readAsDataURL(file);
	});
}

/** Load a File into an <img> element (fallback when createImageBitmap is absent). */
function loadImageElement(file: Blob): Promise<HTMLImageElement> {
	return new Promise((resolve, reject) => {
		const url = URL.createObjectURL(file);
		const img = new Image();
		img.onload = () => {
			URL.revokeObjectURL(url);
			resolve(img);
		};
		img.onerror = () => {
			URL.revokeObjectURL(url);
			reject(new Error("Failed to decode image"));
		};
		img.src = url;
	});
}

/**
 * Decode the image, honoring EXIF orientation so portrait phone photos aren't
 * rotated. Prefers createImageBitmap (Safari 15+), falls back to <img>.
 */
async function decodeImage(file: Blob): Promise<ImageBitmap | HTMLImageElement> {
	if (typeof createImageBitmap === "function") {
		try {
			return await createImageBitmap(file, { imageOrientation: "from-image" });
		} catch {
			// Fall through to the <img> path.
		}
	}
	return loadImageElement(file);
}

/** Scale dimensions so the longest edge is at most max, preserving aspect ratio. Never upscales. */
export function scaledSize(width: number, height: number, max: number): { width: number; height: number } {
	const longest = Math.max(width, height);
	if (longest <= max) return { width, height };
	const ratio = max / longest;
	return { width: Math.round(width * ratio), height: Math.round(height * ratio) };
}

/** Decode + downscale onto a canvas. Returns null on any failure so callers can fall back. */
async function prepareCanvas(file: File, maxDimension: number): Promise<HTMLCanvasElement | null> {
	try {
		const source = await decodeImage(file);
		const { width, height } = scaledSize(source.width, source.height, maxDimension);

		const canvas = document.createElement("canvas");
		canvas.width = width;
		canvas.height = height;

		const ctx = canvas.getContext("2d");
		if (!ctx) return null;

		ctx.drawImage(source, 0, 0, width, height);
		if (typeof ImageBitmap !== "undefined" && source instanceof ImageBitmap) {
			source.close();
		}
		return canvas;
	} catch (error) {
		console.warn("compressImage: falling back to the original image", error);
		return null;
	}
}

export async function compressImage(file: File, options: CompressOptions = {}): Promise<string> {
	// Non-image files (shouldn't happen via accept="image/*") pass through untouched.
	if (!file.type.startsWith("image/")) {
		return fileToDataURL(file);
	}

	const maxDimension = options.maxDimension ?? DEFAULT_MAX_DIMENSION;
	const quality = options.quality ?? DEFAULT_QUALITY;

	const canvas = await prepareCanvas(file, maxDimension);
	if (!canvas) return fileToDataURL(file);

	const compressed = canvas.toDataURL("image/jpeg", quality);
	// Guard against environments where toDataURL is stubbed/empty.
	return compressed && compressed.startsWith("data:image/jpeg") ? compressed : fileToDataURL(file);
}

function canvasToBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob | null> {
	return new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
}

export interface CompressedPhoto {
	blob: Blob;
	ext: string;
}

/**
 * Same downscale/recompress pipeline as `compressImage`, but returns a Blob
 * (for Storage upload) instead of a base64 string. Falls back to the original
 * file untouched if decoding/canvas/encoding fails at any step.
 */
export async function compressImageToBlob(file: File, options: CompressOptions = {}): Promise<CompressedPhoto> {
	if (!file.type.startsWith("image/")) {
		return { blob: file, ext: file.name.split(".").pop() ?? "bin" };
	}

	const maxDimension = options.maxDimension ?? DEFAULT_MAX_DIMENSION;
	const quality = options.quality ?? DEFAULT_QUALITY;

	const canvas = await prepareCanvas(file, maxDimension);
	if (canvas) {
		const blob = await canvasToBlob(canvas, quality);
		if (blob) return { blob, ext: "jpg" };
	}

	return { blob: file, ext: file.name.split(".").pop() ?? "jpg" };
}
