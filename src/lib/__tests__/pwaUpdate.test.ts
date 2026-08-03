import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const { registerSW } = vi.hoisted(() => ({ registerSW: vi.fn() }));
vi.mock("virtual:pwa-register", () => ({ registerSW }));

describe("pwaUpdate", () => {
	let visibilityState: DocumentVisibilityState = "visible";

	beforeEach(() => {
		registerSW.mockClear();
		vi.resetModules();
		visibilityState = "visible";
		vi.spyOn(document, "visibilityState", "get").mockImplementation(() => visibilityState);
	});

	afterEach(() => {
		vi.restoreAllMocks();
		document.removeEventListener("visibilitychange", () => {});
	});

	// A backgrounded PWA that's reopened without a full navigation would otherwise
	// never re-check for a new build — `registerType: "autoUpdate"` only takes
	// effect on the *next* navigation, and an installed app can go weeks without one.
	it("checks for an update when the tab becomes visible again", async () => {
		const registration = { update: vi.fn() } as unknown as ServiceWorkerRegistration;
		registerSW.mockImplementation((options: { onRegisteredSW?: (url: string, reg?: ServiceWorkerRegistration) => void }) => {
			options.onRegisteredSW?.("/sw.js", registration);
			return vi.fn();
		});
		const { setupPwaUpdateCheck } = await import("../pwaUpdate");

		setupPwaUpdateCheck();
		visibilityState = "visible";
		document.dispatchEvent(new Event("visibilitychange"));

		expect(registration.update).toHaveBeenCalledTimes(1);
	});

	it("does not check when the tab becomes hidden", async () => {
		const registration = { update: vi.fn() } as unknown as ServiceWorkerRegistration;
		registerSW.mockImplementation((options: { onRegisteredSW?: (url: string, reg?: ServiceWorkerRegistration) => void }) => {
			options.onRegisteredSW?.("/sw.js", registration);
			return vi.fn();
		});
		const { setupPwaUpdateCheck } = await import("../pwaUpdate");

		setupPwaUpdateCheck();
		visibilityState = "hidden";
		document.dispatchEvent(new Event("visibilitychange"));

		expect(registration.update).not.toHaveBeenCalled();
	});

	it("does nothing if the service worker never registered (no SW support / dev mode)", async () => {
		registerSW.mockImplementation((options: { onRegisteredSW?: (url: string, reg?: ServiceWorkerRegistration) => void }) => {
			options.onRegisteredSW?.("/sw.js", undefined);
			return vi.fn();
		});
		const { setupPwaUpdateCheck } = await import("../pwaUpdate");

		// Must not throw when there's no registration to call `.update()` on.
		expect(() => {
			setupPwaUpdateCheck();
			document.dispatchEvent(new Event("visibilitychange"));
		}).not.toThrow();
	});

	it("is safe to call more than once — does not attach duplicate listeners", async () => {
		const registration = { update: vi.fn() } as unknown as ServiceWorkerRegistration;
		registerSW.mockImplementation((options: { onRegisteredSW?: (url: string, reg?: ServiceWorkerRegistration) => void }) => {
			options.onRegisteredSW?.("/sw.js", registration);
			return vi.fn();
		});
		const { setupPwaUpdateCheck } = await import("../pwaUpdate");

		setupPwaUpdateCheck();
		setupPwaUpdateCheck();
		document.dispatchEvent(new Event("visibilitychange"));

		expect(registration.update).toHaveBeenCalledTimes(1);
	});
});
