import { track } from "./analytics";

/**
 * There is no other real "this became an installed PWA" signal anywhere in
 * the app — `install_prompt_result` only records that a prompt was shown or
 * dismissed, not that install actually completed. `appinstalled` fires once,
 * reliably, on Chrome/Android and desktop. It never fires on iOS Safari
 * (no such event exists there), so this alone cannot answer "how many
 * testers installed" for an iOS-heavy beta — `is_standalone` (registered as
 * a PostHog super-property in monitoring.ts) is the cross-platform read:
 * distinct persons with any event where it's true.
 *
 * Deliberately its own module rather than living in useInstallPrompt.ts:
 * monitoring.ts also needs `detectStandalone` from that file, and importing
 * `track` (which reaches back into monitoring.ts) from the same file would
 * create hooks/useInstallPrompt → lib/analytics → lib/monitoring →
 * hooks/useInstallPrompt.
 */
let registered = false;

function handleAppInstalled(): void {
	track("pwa_installed");
}

export function setupPwaInstallTracking(): void {
	if (registered) return;
	registered = true;
	window.addEventListener("appinstalled", handleAppInstalled);
}

/** Test-only: undo the real `window` listener so `vi.resetModules()` doesn't leak it across cases. */
export function resetPwaInstallTrackingForTests(): void {
	window.removeEventListener("appinstalled", handleAppInstalled);
	registered = false;
}
