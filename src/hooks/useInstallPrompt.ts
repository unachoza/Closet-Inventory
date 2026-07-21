import { useCallback, useEffect, useState } from "react";

/** Chrome's non-standard install event; absent on Safari/Firefox. */
export interface BeforeInstallPromptEvent extends Event {
	prompt: () => Promise<void>;
	userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export type InstallPromptOutcome = "accepted" | "dismissed" | "unavailable";

// The browser fires beforeinstallprompt once, usually before React mounts, so
// the capture must live at module scope; setupInstallPromptCapture() is called
// from main.tsx. This singleton is the one place the event can be held.
let capturedEvent: BeforeInstallPromptEvent | null = null;
let captureRegistered = false;
const subscribers = new Set<() => void>();

function notifySubscribers(): void {
	subscribers.forEach((notify) => notify());
}

/** Register the one-shot beforeinstallprompt capture. Idempotent. */
export function setupInstallPromptCapture(): void {
	if (captureRegistered) return;
	captureRegistered = true;
	window.addEventListener("beforeinstallprompt", (event) => {
		event.preventDefault();
		capturedEvent = event as BeforeInstallPromptEvent;
		notifySubscribers();
	});
}

/** Test-only: clear the captured event and allow re-registration. */
export function resetInstallPromptForTests(): void {
	capturedEvent = null;
	captureRegistered = false;
	subscribers.clear();
}

/** True when running as an installed PWA (standalone display mode). */
export function detectStandalone(win: Window, nav: Navigator): boolean {
	if (typeof win.matchMedia === "function" && win.matchMedia("(display-mode: standalone)").matches) return true;
	return (nav as Navigator & { standalone?: boolean }).standalone === true;
}

/** True on iOS/iPadOS, where install is manual (Share → Add to Home Screen). */
export function detectIOS(nav: Navigator): boolean {
	if (/iPad|iPhone|iPod/.test(nav.userAgent)) return true;
	return nav.platform === "MacIntel" && nav.maxTouchPoints > 1;
}

export interface InstallPromptState {
	canPrompt: boolean;
	promptInstall: () => Promise<InstallPromptOutcome>;
	isStandalone: boolean;
	isIOS: boolean;
}

/**
 * Installability for the onboarding install card: native prompt where the
 * browser offers one, platform detection where it doesn't.
 */
export function useInstallPrompt(): InstallPromptState {
	const [canPrompt, setCanPrompt] = useState(capturedEvent !== null);

	useEffect(() => {
		const sync = () => setCanPrompt(capturedEvent !== null);
		subscribers.add(sync);
		sync();
		return () => {
			subscribers.delete(sync);
		};
	}, []);

	const promptInstall = useCallback(async (): Promise<InstallPromptOutcome> => {
		const event = capturedEvent;
		if (!event) return "unavailable";
		// The event is single-use per Chrome's spec — release it before prompting.
		capturedEvent = null;
		notifySubscribers();
		try {
			await event.prompt();
			const choice = await event.userChoice;
			return choice.outcome;
		} catch {
			return "unavailable";
		}
	}, []);

	return {
		canPrompt,
		promptInstall,
		isStandalone: detectStandalone(window, navigator),
		isIOS: detectIOS(navigator),
	};
}
