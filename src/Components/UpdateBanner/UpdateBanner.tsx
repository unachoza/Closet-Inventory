import { useEffect, useRef, useState } from "react";
import { useAppUpdate } from "../../hooks/useAppUpdate";
import { track } from "../../lib/analytics";
import "./UpdateBanner.css";

/**
 * Fixed bottom prompt shown once a new build has activated in the background
 * (see hooks/useAppUpdate.ts, lib/pwaUpdate.ts). Never reloads on its own —
 * reload only happens on the user's own click, so an in-progress form or
 * import queue is never silently destroyed by a background update.
 */
export default function UpdateBanner() {
	const { updateReady, applyUpdate } = useAppUpdate();
	const [dismissed, setDismissed] = useState(false);
	// StrictMode double-mounts effects; guard so the "shown" event fires once
	// per actual appearance, not twice per render pass.
	const trackedShown = useRef(false);

	useEffect(() => {
		if (updateReady && !trackedShown.current) {
			trackedShown.current = true;
			track("app_update_prompt_shown");
		}
	}, [updateReady]);

	if (!updateReady || dismissed) return null;

	const handleRefresh = () => {
		track("app_update_refresh_clicked");
		applyUpdate();
	};

	return (
		<div className="update-banner" role="status">
			<p className="update-banner__text">A new version is ready.</p>
			<div className="update-banner__actions">
				<button type="button" className="btn btn--primary btn--sm" onClick={handleRefresh}>
					Refresh
				</button>
				<button type="button" className="update-banner__dismiss" aria-label="Dismiss" onClick={() => setDismissed(true)}>
					×
				</button>
			</div>
		</div>
	);
}
