import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

const LAST_SEEN_KEY = "closetly-last-seen-version";
// Referencing the real build-time version, not a hardcoded string, so these
// tests don't silently drift out of sync on every package.json version bump.
const CURRENT_VERSION = __APP_SEMVER__;
const OLD_VERSION = "0.0.0-old";
const UNRELATED_VERSION = "0.0.0-no-notes-for-this-one";

vi.mock("../releaseNotes", () => ({
	RELEASE_NOTES: [{ version: __APP_SEMVER__, bullets: ["First bullet", "Second bullet"] }],
}));

describe("useWhatsChanged", () => {
	beforeEach(() => {
		localStorage.clear();
		vi.resetModules();
	});

	afterEach(() => {
		vi.unstubAllEnvs();
	});

	it("does not show on a brand-new install — that's onboarding's job, not this screen's", async () => {
		// No last-seen-version recorded yet, and onboarding was never completed
		// either — this is a genuinely first-ever run.
		const { useWhatsChanged } = await import("../useWhatsChanged");
		const { result } = renderHook(() => useWhatsChanged());

		expect(result.current.show).toBe(false);
		// Silently baselines so the NEXT version bump is what triggers it.
		expect(localStorage.getItem(LAST_SEEN_KEY)).toBe(CURRENT_VERSION);
	});

	// Every existing tester today has no last-seen-version key at all (this
	// feature has never shipped), so without this case NO ONE would ever see
	// the card on its first release — they'd all silently baseline, same as a
	// brand-new install, and the card would only ever fire starting the
	// release *after* whichever one first ships it.
	it("shows the card to a returning user who has no last-seen-version yet", async () => {
		localStorage.setItem("closetly-onboarding-complete", "true");
		const { useWhatsChanged } = await import("../useWhatsChanged");
		const { result } = renderHook(() => useWhatsChanged());

		expect(result.current.show).toBe(true);
		expect(result.current.bullets).toEqual(["First bullet", "Second bullet"]);
		// Not yet marked seen — that happens on dismiss(), same as any other
		// "shown" case (see the dismiss() test below).
		expect(localStorage.getItem(LAST_SEEN_KEY)).toBeNull();
	});

	it("shows the release's bullets to a returning user on a version they haven't seen", async () => {
		localStorage.setItem(LAST_SEEN_KEY, OLD_VERSION);
		const { useWhatsChanged } = await import("../useWhatsChanged");
		const { result } = renderHook(() => useWhatsChanged());

		expect(result.current.show).toBe(true);
		expect(result.current.bullets).toEqual(["First bullet", "Second bullet"]);
	});

	it("does not show again once the current version has already been seen", async () => {
		localStorage.setItem(LAST_SEEN_KEY, CURRENT_VERSION);
		const { useWhatsChanged } = await import("../useWhatsChanged");
		const { result } = renderHook(() => useWhatsChanged());

		expect(result.current.show).toBe(false);
	});

	it("dismiss() marks the version seen so it won't show again this session or next", async () => {
		localStorage.setItem(LAST_SEEN_KEY, OLD_VERSION);
		const { useWhatsChanged } = await import("../useWhatsChanged");
		const { result } = renderHook(() => useWhatsChanged());
		expect(result.current.show).toBe(true);

		act(() => result.current.dismiss());

		expect(result.current.show).toBe(false);
		expect(localStorage.getItem(LAST_SEEN_KEY)).toBe(CURRENT_VERSION);
	});

	it("silently baselines and stays hidden when there are no release notes for this version", async () => {
		vi.doMock("../releaseNotes", () => ({ RELEASE_NOTES: [{ version: UNRELATED_VERSION, bullets: ["Old bullet"] }] }));
		localStorage.setItem(LAST_SEEN_KEY, OLD_VERSION);
		const { useWhatsChanged } = await import("../useWhatsChanged");
		const { result } = renderHook(() => useWhatsChanged());

		expect(result.current.show).toBe(false);
		expect(localStorage.getItem(LAST_SEEN_KEY)).toBe(CURRENT_VERSION);
	});

	it("exposes the current version so callers can tag analytics events with it", async () => {
		localStorage.setItem(LAST_SEEN_KEY, OLD_VERSION);
		const { useWhatsChanged } = await import("../useWhatsChanged");
		const { result } = renderHook(() => useWhatsChanged());

		expect(result.current.version).toBe(CURRENT_VERSION);
	});

	it("is off entirely when the feature flag is disabled", async () => {
		vi.stubEnv("VITE_SHOW_WHATS_CHANGED", "false");
		localStorage.setItem(LAST_SEEN_KEY, OLD_VERSION);
		const { useWhatsChanged } = await import("../useWhatsChanged");
		const { result } = renderHook(() => useWhatsChanged());

		expect(result.current.show).toBe(false);
		// A disabled flag shouldn't silently consume the "haven't seen this
		// version" state either — re-enabling later should still show it.
		expect(localStorage.getItem(LAST_SEEN_KEY)).toBe(OLD_VERSION);
	});
});
