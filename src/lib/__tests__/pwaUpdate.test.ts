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

	/**
	 * Without an `onNeedReload` callback, vite-plugin-pwa's autoUpdate mode calls
	 * `window.location.reload()` the instant a new service worker activates
	 * (register.js: `if (onNeedReload) onNeedReload(); else window.location.reload()`).
	 * Combined with the visibilitychange check above, backgrounding the app
	 * mid-import and returning would silently destroy the in-memory import queue.
	 * The reload must never happen without a user gesture.
	 */
	describe("update-ready notification", () => {
		type RegisterOptions = {
			onRegisteredSW?: (url: string, reg?: ServiceWorkerRegistration) => void;
			onNeedReload?: () => void;
		};
		let capturedOptions: RegisterOptions;

		beforeEach(() => {
			capturedOptions = {};
			registerSW.mockImplementation((options: RegisterOptions) => {
				capturedOptions = options;
				options.onRegisteredSW?.("/sw.js", { update: vi.fn() } as unknown as ServiceWorkerRegistration);
				return vi.fn();
			});
		});

		it("passes an onNeedReload callback, which is what suppresses the automatic reload", async () => {
			const { setupPwaUpdateCheck } = await import("../pwaUpdate");

			setupPwaUpdateCheck();

			expect(capturedOptions.onNeedReload).toBeTypeOf("function");
		});

		it("is not update-ready until a new service worker actually activates", async () => {
			const { setupPwaUpdateCheck, isUpdateReady } = await import("../pwaUpdate");

			setupPwaUpdateCheck();

			expect(isUpdateReady()).toBe(false);
		});

		it("becomes update-ready and notifies subscribers when a new worker activates", async () => {
			const { setupPwaUpdateCheck, isUpdateReady, subscribeToUpdateReady } = await import("../pwaUpdate");
			const onChange = vi.fn();
			setupPwaUpdateCheck();
			subscribeToUpdateReady(onChange);

			capturedOptions.onNeedReload?.();

			expect(isUpdateReady()).toBe(true);
			expect(onChange).toHaveBeenCalledTimes(1);
		});

		// The banner can mount after the update lands, so a late subscriber must
		// still be able to read the current state rather than wait for a 2nd event.
		it("a subscriber added after the update still reads update-ready", async () => {
			const { setupPwaUpdateCheck, isUpdateReady } = await import("../pwaUpdate");
			setupPwaUpdateCheck();
			capturedOptions.onNeedReload?.();

			expect(isUpdateReady()).toBe(true);
		});

		it("unsubscribing stops further notifications", async () => {
			const { setupPwaUpdateCheck, subscribeToUpdateReady } = await import("../pwaUpdate");
			const onChange = vi.fn();
			setupPwaUpdateCheck();
			const unsubscribe = subscribeToUpdateReady(onChange);

			unsubscribe();
			capturedOptions.onNeedReload?.();

			expect(onChange).not.toHaveBeenCalled();
		});

		it("never reloads the page on its own — only applyPendingUpdate() does", async () => {
			const reload = vi.fn();
			vi.stubGlobal("location", { reload });
			const { setupPwaUpdateCheck, applyPendingUpdate } = await import("../pwaUpdate");

			setupPwaUpdateCheck();
			capturedOptions.onNeedReload?.();
			document.dispatchEvent(new Event("visibilitychange"));
			expect(reload).not.toHaveBeenCalled();

			applyPendingUpdate();

			expect(reload).toHaveBeenCalledTimes(1);
			vi.unstubAllGlobals();
		});
	});
});
