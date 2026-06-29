import { getSupabase } from "../lib/supabaseClient";

const BUCKET = "item-photos";

/**
 * E1-2.1: Upload a photo file to the `item-photos` Storage bucket.
 *
 * Path: `<userId>/<uuid>.<ext>` — first segment satisfies the RLS ownership
 * check (`(storage.foldername(name))[1] = auth.uid()::text`).
 *
 * Returns the bare storage path (not a signed URL). Callers that need a
 * displayable src should use `signItemPhotoPath`. Storing the path instead of
 * a signed URL means it survives URL expiry without a migration (E1-4.11).
 */
export async function uploadItemPhoto(file: File, userId: string): Promise<string> {
	const ext = file.name.split(".").pop() ?? "jpg";
	const path = `${userId}/${crypto.randomUUID()}.${ext}`;
	const supabase = getSupabase();

	const { error } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: false });
	if (error) throw new Error(`Photo upload failed: ${error.message}`);

	return path;
}

/**
 * E1-2.1: Get a time-limited signed URL for a storage path.
 *
 * Pass-through: if `src` starts with `http` or `data:` it is returned as-is
 * so callers can be agnostic about whether a value is a path or a legacy URL.
 */
export async function signItemPhotoPath(src: string, expiresIn = 3600): Promise<string> {
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
