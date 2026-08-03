/**
 * Per-release bullet points for the "what's changed" screen (useWhatsChanged.ts).
 *
 * Keyed by semver (`__APP_SEMVER__`, no git sha — see vite.config.ts), so a
 * version only shows its card once even across multiple deploys of the same
 * release. Max 3 bullets, plain language — this is read by testers, not
 * engineers, so no internal terms (no "PWA", "consent", "buffer", "SW").
 *
 * PLACEHOLDER CONTENT — review before beta launch. These bullets exist so the
 * screen can be tested end-to-end; the actual copy for the current release
 * needs a pass before real users see it.
 */
export interface ReleaseNote {
	readonly version: string;
	readonly bullets: readonly string[];
}

export const RELEASE_NOTES: readonly ReleaseNote[] = [
	{
		version: "0.9.0",
		bullets: [
			"Care tips are now personalized to the fabrics actually in your closet",
			"Fixed an issue that could sign you out unexpectedly",
			"Smoother experience picking material types when adding an item",
		],
	},
];
