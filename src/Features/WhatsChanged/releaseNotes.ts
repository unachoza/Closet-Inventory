/**
 * Per-release bullet points for the "what's changed" screen (useWhatsChanged.ts).
 *
 * Keyed by semver (`__APP_SEMVER__`, no git sha — see vite.config.ts), so a
 * version only shows its card once even across multiple deploys of the same
 * release. Max 3 bullets, plain language — this is read by testers, not
 * engineers, so no internal terms (no "PWA", "consent", "buffer", "SW").
 *
 * Bumping package.json's version alone does NOT make a new entry visible —
 * useWhatsChanged.ts also needs a matching entry here, or a version with no
 * notes silently baselines without showing anything.
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
	{
		version: "0.9.1",
		bullets: [
			"Care tips now match the fabrics actually in your closet",
			"Fixed a problem that could sign you out unexpectedly",
			"When a new version is ready you'll see a Refresh button, instead of the app reloading on its own",
		],
	},
];
