import { useState } from "react";
import { showWhatsChanged } from "../../config/features";
import { RELEASE_NOTES } from "./releaseNotes";

const LAST_SEEN_KEY = "closetly-last-seen-version";
const ONBOARDING_KEY = "closetly-onboarding-complete";

export interface UseWhatsChanged {
	show: boolean;
	bullets: readonly string[];
	version: string;
	dismiss: () => void;
}

/**
 * Decides whether to show the "what's changed" card on this load.
 *
 * A brand-new install has no last-seen version at all — that case silently
 * baselines to the current version rather than showing anything, because a
 * first run is onboarding's job, not this screen's. BUT this feature has
 * never shipped before, so every *existing* tester also has no last-seen
 * key — without the onboarding check below, they'd all be treated as
 * brand-new, silently baseline, and never see the card on the release that
 * first ships it. Checking `ONBOARDING_KEY` distinguishes "never used the
 * app" from "used it before this feature existed": a completed onboarding
 * means they're returning, so a missing last-seen version counts as "hasn't
 * seen this one" rather than "brand new."
 *
 * Otherwise: the card only appears for a returning user whose last-seen
 * version differs from the current one AND who has release notes defined for
 * it; either way (shown or not) the last-seen marker advances to the current
 * version, so a version with no notes doesn't get retried forever. The one
 * exception is the feature flag: disabling it must not consume the "haven't
 * seen this version" state, so a later re-enable still shows the card.
 */
export function useWhatsChanged(): UseWhatsChanged {
	const [dismissed, setDismissed] = useState(false);

	const currentVersion = __APP_SEMVER__;
	const lastSeen = localStorage.getItem(LAST_SEEN_KEY);
	const isReturningUser = lastSeen !== null || localStorage.getItem(ONBOARDING_KEY) === "true";
	const note = RELEASE_NOTES.find((n) => n.version === currentVersion);
	const isNewVersion = isReturningUser && lastSeen !== currentVersion;

	if (!showWhatsChanged()) {
		return { show: false, bullets: [], version: currentVersion, dismiss: () => {} };
	}

	if (lastSeen !== currentVersion && (!isReturningUser || !note)) {
		localStorage.setItem(LAST_SEEN_KEY, currentVersion);
	}

	const show = !dismissed && isNewVersion && Boolean(note);

	return {
		show,
		bullets: note?.bullets ?? [],
		version: currentVersion,
		dismiss: () => {
			localStorage.setItem(LAST_SEEN_KEY, currentVersion);
			setDismissed(true);
		},
	};
}
