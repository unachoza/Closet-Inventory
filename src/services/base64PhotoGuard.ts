import { uploadItemPhoto } from "./storageService";

/**
 * E1-2.2 — base64 → Storage guard.
 *
 * The offline/signed-out uploader stores photos as base64 data URLs in
 * localStorage (`ImageUploader.tsx`). Those must NOT reach Supabase: writing a
 * multi-MB base64 blob into `items.primary_photo_url` bloats the row and is the
 * "no orphaned/oversized legacy data" launch gate (Tea App lesson #4).
 *
 * This converts a base64 data URL to a Storage object at the remote-write
 * boundary and returns the bare Storage path. Anything that is already a path,
 * an http(s) URL (stock photos), empty, or written while signed-out is returned
 * untouched — so it is safe to call on every value.
 *
 * Never throws / never loses the image: if the upload fails, the original
 * base64 is returned so the write still carries a usable src (it just stays
 * base64 until the next sync retries).
 */
export async function ensureStoredPhoto(imageURL: string, userId: string | null): Promise<string>;
export async function ensureStoredPhoto(imageURL: string | undefined, userId: string | null): Promise<string | undefined>;
export async function ensureStoredPhoto(
	imageURL: string | undefined,
	userId: string | null,
): Promise<string | undefined> {
	if (!imageURL || !imageURL.startsWith("data:image")) return imageURL;
	// Signed-out: no owner folder to upload into; leave as base64 (local only).
	if (!userId) return imageURL;

	try {
		const { blob, ext } = dataUrlToBlob(imageURL);
		return await uploadItemPhoto(blob, userId, ext);
	} catch {
		// Upload failed — keep the base64 so the image isn't lost. A later sync
		// (reconcile / re-save) will retry the conversion.
		return imageURL;
	}
}

/** Decode a `data:image/<subtype>;base64,<payload>` URL into a Blob + file ext. */
function dataUrlToBlob(dataUrl: string): { blob: Blob; ext: string } {
	const match = /^data:(image\/([a-zA-Z0-9.+-]+));base64,(.*)$/.exec(dataUrl);
	if (!match) throw new Error("Unrecognized base64 image data URL");

	const [, mime, subtype, payload] = match;
	const binary = atob(payload);
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);

	return { blob: new Blob([bytes], { type: mime }), ext: subtype };
}
