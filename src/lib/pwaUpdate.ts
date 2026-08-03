import { registerSW } from "virtual:pwa-register";

/**
 * `registerType: "autoUpdate"` (vite.config.ts) checks for a new service worker
 * on the *next navigation* — but an installed PWA that's just backgrounded and
 * reopened, never fully closed, can go weeks without navigating. This forces an
 * extra check whenever the tab regains visibility, so reopening the app is
 * enough to pick up a new build without waiting on a stray navigation.
 *
 * Without an `onNeedReload` callback, vite-plugin-pwa's autoUpdate mode calls
 * `window.location.reload()` the instant the new worker activates — combined
 * with the visibilitychange check above, that means backgrounding the app
 * mid-import and returning could silently wipe an in-progress import queue.
 * Passing `onNeedReload` disables that automatic reload entirely: the app is
 * responsible for reloading, on a user gesture, via `applyPendingUpdate()`.
 *
 * Reuses the module-singleton + subscriber-`Set` shape from
 * useInstallPrompt.ts, since this is the same problem: a module-scope browser
 * event (here, the SW lifecycle) needs to reach React components that mount
 * after the event has already fired.
 */
let started = false;
let updateReady = false;
const subscribers = new Set<() => void>();

function notifySubscribers(): void {
	subscribers.forEach((notify) => notify());
}

export function setupPwaUpdateCheck(): void {
	if (started) return;
	started = true;

	let registration: ServiceWorkerRegistration | undefined;
	registerSW({
		immediate: true,
		onRegisteredSW(_url, reg) {
			registration = reg;
		},
		onNeedReload() {
			updateReady = true;
			notifySubscribers();
		},
	});

	document.addEventListener("visibilitychange", () => {
		if (document.visibilityState === "visible") void registration?.update();
	});
}

/** True once a new service worker has activated and is waiting on a reload. */
export function isUpdateReady(): boolean {
	return updateReady;
}

/** Subscribe to update-ready changes; returns an unsubscribe function. */
export function subscribeToUpdateReady(callback: () => void): () => void {
	subscribers.add(callback);
	return () => {
		subscribers.delete(callback);
	};
}

/**
 * Reload to pick up the new build. Deliberately NOT `updateServiceWorker()` —
 * that helper is a no-op under `registerType: "autoUpdate"` (it only sends a
 * skip-waiting message when auto mode is off). The new worker has already
 * activated and taken control by the time `onNeedReload` fires, so a plain
 * reload is what actually shows the new build.
 */
export function applyPendingUpdate(): void {
	window.location.reload();
}

/** Test-only: reset module state so setup can be re-run across test cases. */
export function resetPwaUpdateForTests(): void {
	started = false;
	updateReady = false;
	subscribers.clear();
}
