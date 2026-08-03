import { useState } from "react";
import { showWhatsChanged } from "../../config/features";
import { RELEASE_NOTES } from "./releaseNotes";

const LAST_SEEN_KEY = "closetly-last-seen-version";

export interface UseWhatsChanged {
	show: boolean;
	bullets: readonly string[];
	dismiss: () => void;
}

/**
 * Decides whether to show the "what's changed" card on this load.
 *
 * A brand-new install has no last-seen version at all — that case silently
 * baselines to the current version rather than showing anything, because a
 * first run is onboarding's job, not this screen's. The card only appears for
 * a *returning* user whose last-seen version differs from the current one AND
 * who has release notes defined for it; either way (shown or not) the
 * last-seen marker advances to the current version, so a version with no
 * notes doesn't get retried forever. The one exception is the feature flag:
 * disabling it must not consume the "haven't seen this version" state, so a
 * later re-enable still shows the card.
 */
export function useWhatsChanged(): UseWhatsChanged {
	const [dismissed, setDismissed] = useState(false);

	const currentVersion = __APP_SEMVER__;
	const lastSeen = localStorage.getItem(LAST_SEEN_KEY);
	const note = RELEASE_NOTES.find((n) => n.version === currentVersion);
	const isNewVersion = lastSeen !== null && lastSeen !== currentVersion;

	if (!showWhatsChanged()) {
		return { show: false, bullets: [], dismiss: () => {} };
	}

	if (lastSeen !== currentVersion && (lastSeen === null || !note)) {
		localStorage.setItem(LAST_SEEN_KEY, currentVersion);
	}

	const show = !dismissed && isNewVersion && Boolean(note);

	return {
		show,
		bullets: note?.bullets ?? [],
		dismiss: () => {
			localStorage.setItem(LAST_SEEN_KEY, currentVersion);
			setDismissed(true);
		},
	};
}
