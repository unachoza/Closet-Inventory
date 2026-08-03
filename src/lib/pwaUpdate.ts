import { registerSW } from "virtual:pwa-register";

/**
 * `registerType: "autoUpdate"` (vite.config.ts) checks for a new service worker
 * on the *next navigation* — but an installed PWA that's just backgrounded and
 * reopened, never fully closed, can go weeks without navigating. This forces an
 * extra check whenever the tab regains visibility, so reopening the app is
 * enough to pick up a new build without waiting on a stray navigation.
 */
let started = false;

export function setupPwaUpdateCheck(): void {
	if (started) return;
	started = true;

	let registration: ServiceWorkerRegistration | undefined;
	registerSW({
		immediate: true,
		onRegisteredSW(_url, reg) {
			registration = reg;
		},
	});

	document.addEventListener("visibilitychange", () => {
		if (document.visibilityState === "visible") void registration?.update();
	});
}
