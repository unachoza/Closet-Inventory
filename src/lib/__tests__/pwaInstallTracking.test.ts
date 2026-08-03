import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const { track } = vi.hoisted(() => ({ track: vi.fn() }));
vi.mock("../analytics", () => ({ track }));

describe("pwaInstallTracking", () => {
	beforeEach(() => {
		track.mockClear();
		vi.resetModules();
	});

	// The listener lives on the real `window`, which vi.resetModules() cannot
	// clean up — an orphaned listener from a prior test would double-fire on
	// the next test's dispatch, so it must be torn down explicitly.
	afterEach(async () => {
		const { resetPwaInstallTrackingForTests } = await import("../pwaInstallTracking");
		resetPwaInstallTrackingForTests();
	});

	it("tracks pwa_installed when the appinstalled event fires", async () => {
		const { setupPwaInstallTracking } = await import("../pwaInstallTracking");

		setupPwaInstallTracking();
		window.dispatchEvent(new Event("appinstalled"));

		expect(track).toHaveBeenCalledWith("pwa_installed");
	});

	it("is idempotent — calling setup twice does not attach duplicate listeners", async () => {
		const { setupPwaInstallTracking } = await import("../pwaInstallTracking");

		setupPwaInstallTracking();
		setupPwaInstallTracking();
		window.dispatchEvent(new Event("appinstalled"));

		expect(track).toHaveBeenCalledTimes(1);
	});
});
