import { useState, useEffect } from "react";
import { signItemPhotoPath } from "../services/storageService";

/**
 * E1-2.1: Resolve a displayable src from an imageURL field value.
 *
 * - `http…` or `data:…` → returned as-is (stock photos, legacy base64, external URLs)
 * - bare storage path (e.g. `<userId>/<uuid>.jpg`) → signed 1-hour URL, refreshed on change
 * - empty / undefined → empty string
 *
 * Components use this hook so they stay agnostic about whether `imageURL`
 * holds a path or a URL. E1-4.11 will tune expiry and add lazy refresh.
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
		signItemPhotoPath(src)
			.then((url) => {
				if (!cancelled) setDisplaySrc(url);
			})
			.catch(() => {
				if (!cancelled) setDisplaySrc("");
			});

		return () => {
			cancelled = true;
		};
	}, [src]);

	return displaySrc;
}
