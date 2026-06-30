import { getSupabase } from "../lib/supabaseClient";

const BUCKET = "item-photos";

/** Belt-and-suspenders client-side check — the bucket itself also enforces
 *  file_size_limit + allowed_mime_types server-side (see migration
 *  20260629000001_storage_validation.sql), so a bypassed client can't smuggle
 *  through an oversized or non-image object. This just gives a fast, friendly
 *  error before spending a network round trip. */
const MAX_RAW_BYTES = 20 * 1024 * 1024; // 20MB — generous; compression runs before upload anyway

export function validateImageFile(file: File): string | null {
	if (!file.type.startsWith("image/")) return "Please choose an image file.";
	if (file.size > MAX_RAW_BYTES) return "That image is too large (max 20MB).";
	return null;
}

/** E1-4.11: short-lived signed URLs — re-signed by useSignedImageUrl before they expire. */
const SIGNED_URL_TTL_SECONDS = 300;

/**
 * E1-2.1: Upload a compressed photo blob to the `item-photos` Storage bucket.
 *
 * Path: `<userId>/<uuid>.<ext>` — first segment satisfies the RLS ownership
 * check (`(storage.foldername(name))[1] = auth.uid()::text`).
 *
 * Returns the bare storage path (not a signed URL). Callers that need a
 * displayable src should use `signItemPhotoPath`. Storing the path instead of
 * a signed URL means it survives URL expiry without a migration.
 */
export async function uploadItemPhoto(blob: Blob, userId: string, ext: string): Promise<string> {
	const path = `${userId}/${crypto.randomUUID()}.${ext}`;
	const supabase = getSupabase();

	const { error } = await supabase.storage.from(BUCKET).upload(path, blob, {
		upsert: false,
		contentType: blob.type || `image/${ext}`,
	});
	if (error) throw new Error(`Photo upload failed: ${error.message}`);

	return path;
}

/**
 * E1-2.1 / E1-4.11: Get a short-lived signed URL for a storage path.
 *
 * Pass-through: if `src` starts with `http` or `data:` it is returned as-is
 * so callers can be agnostic about whether a value is a path or a legacy URL.
 */
export async function signItemPhotoPath(src: string, expiresIn = SIGNED_URL_TTL_SECONDS): Promise<string> {
	if (!src || src.startsWith("http") || src.startsWith("data:")) return src;

	const supabase = getSupabase();
	const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(src, expiresIn);
	if (error) throw new Error(`Failed to sign photo URL: ${error.message}`);

	return data.signedUrl;
}

/**
 * E1-2.1: Delete a stored photo. No-op for base64/http URLs.
 */
export async function deleteItemPhoto(src: string): Promise<void> {
	if (!src || src.startsWith("http") || src.startsWith("data:")) return;

	const supabase = getSupabase();
	await supabase.storage.from(BUCKET).remove([src]);
}
