import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

const LAST_SEEN_KEY = "closetly-last-seen-version";

vi.mock("../releaseNotes", () => ({
	RELEASE_NOTES: [{ version: "0.9.0", bullets: ["First bullet", "Second bullet"] }],
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
		// No last-seen-version recorded yet at all.
		const { useWhatsChanged } = await import("../useWhatsChanged");
		const { result } = renderHook(() => useWhatsChanged());

		expect(result.current.show).toBe(false);
		// Silently baselines so the NEXT version bump is what triggers it.
		expect(localStorage.getItem(LAST_SEEN_KEY)).toBe("0.9.0");
	});

	it("shows the release's bullets to a returning user on a version they haven't seen", async () => {
		localStorage.setItem(LAST_SEEN_KEY, "0.8.0");
		const { useWhatsChanged } = await import("../useWhatsChanged");
		const { result } = renderHook(() => useWhatsChanged());

		expect(result.current.show).toBe(true);
		expect(result.current.bullets).toEqual(["First bullet", "Second bullet"]);
	});

	it("does not show again once the current version has already been seen", async () => {
		localStorage.setItem(LAST_SEEN_KEY, "0.9.0");
		const { useWhatsChanged } = await import("../useWhatsChanged");
		const { result } = renderHook(() => useWhatsChanged());

		expect(result.current.show).toBe(false);
	});

	it("dismiss() marks the version seen so it won't show again this session or next", async () => {
		localStorage.setItem(LAST_SEEN_KEY, "0.8.0");
		const { useWhatsChanged } = await import("../useWhatsChanged");
		const { result } = renderHook(() => useWhatsChanged());
		expect(result.current.show).toBe(true);

		act(() => result.current.dismiss());

		expect(result.current.show).toBe(false);
		expect(localStorage.getItem(LAST_SEEN_KEY)).toBe("0.9.0");
	});

	it("silently baselines and stays hidden when there are no release notes for this version", async () => {
		vi.doMock("../releaseNotes", () => ({ RELEASE_NOTES: [{ version: "0.7.0", bullets: ["Old bullet"] }] }));
		localStorage.setItem(LAST_SEEN_KEY, "0.8.0");
		const { useWhatsChanged } = await import("../useWhatsChanged");
		const { result } = renderHook(() => useWhatsChanged());

		expect(result.current.show).toBe(false);
		expect(localStorage.getItem(LAST_SEEN_KEY)).toBe("0.9.0");
	});

	it("is off entirely when the feature flag is disabled", async () => {
		vi.stubEnv("VITE_SHOW_WHATS_CHANGED", "false");
		localStorage.setItem(LAST_SEEN_KEY, "0.8.0");
		const { useWhatsChanged } = await import("../useWhatsChanged");
		const { result } = renderHook(() => useWhatsChanged());

		expect(result.current.show).toBe(false);
		// A disabled flag shouldn't silently consume the "haven't seen this
		// version" state either — re-enabling later should still show it.
		expect(localStorage.getItem(LAST_SEEN_KEY)).toBe("0.8.0");
	});
});
