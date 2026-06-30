import { useState, useEffect } from "react";
import { signItemPhotoPath } from "../services/storageService";

/** E1-4.11: signed URLs are short-lived (5 min, see storageService). Re-sign a
 *  little before they expire so an image that stays mounted doesn't go dark. */
const TTL_SECONDS = 300;
const REFRESH_MARGIN_MS = 30_000;

/**
 * E1-2.1 / E1-4.11: Resolve a displayable src from an imageURL field value.
 *
 * - `http…` or `data:…` → returned as-is (stock photos, legacy base64, external URLs)
 * - bare storage path (e.g. `<userId>/<uuid>.jpg`) → short-lived signed URL,
 *   transparently re-signed on a timer for as long as the component is mounted
 * - empty / undefined → empty string
 *
 * Components use this hook so they stay agnostic about whether `imageURL`
 * holds a path or a URL.
 */
export function useSignedImageUrl(src: string | undefined): string {
	const [displaySrc, setDisplaySrc] = useState<string>(
		// Passthrough values can be used immediately; paths need a round-trip first.
		!src || src.startsWith("http") || src.startsWith("data:") ? (src ?? "") : "",
	);

	useEffect(() => {
		if (!src) {
			setDisplaySrc("");
			return;
		}

		if (src.startsWith("http") || src.startsWith("data:")) {
			setDisplaySrc(src);
			return;
		}

		let cancelled = false;
		let timer: ReturnType<typeof setTimeout> | undefined;

		const signAndScheduleRefresh = () => {
			signItemPhotoPath(src, TTL_SECONDS)
				.then((url) => {
					if (cancelled) return;
					setDisplaySrc(url);
					timer = setTimeout(signAndScheduleRefresh, TTL_SECONDS * 1000 - REFRESH_MARGIN_MS);
				})
				.catch(() => {
					if (!cancelled) setDisplaySrc("");
				});
		};
		signAndScheduleRefresh();

		return () => {
			cancelled = true;
			if (timer) clearTimeout(timer);
		};
	}, [src]);

	return displaySrc;
}
