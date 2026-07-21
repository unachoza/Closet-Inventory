import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
	setupInstallPromptCapture,
	resetInstallPromptForTests,
	useInstallPrompt,
	detectStandalone,
	detectIOS,
} from "../useInstallPrompt";

function fireBeforeInstallPrompt(outcome: "accepted" | "dismissed" = "accepted") {
	const event = new Event("beforeinstallprompt") as Event & {
		prompt: () => Promise<void>;
		userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
	};
	event.prompt = vi.fn().mockResolvedValue(undefined);
	event.userChoice = Promise.resolve({ outcome });
	window.dispatchEvent(event);
	return event;
}

describe("useInstallPrompt", () => {
	beforeEach(() => {
		resetInstallPromptForTests();
		setupInstallPromptCapture();
	});

	it("cannot prompt before the browser offers installation", () => {
		const { result } = renderHook(() => useInstallPrompt());
		expect(result.current.canPrompt).toBe(false);
	});

	it("can prompt after beforeinstallprompt fires, even before the hook mounts", () => {
		fireBeforeInstallPrompt();
		const { result } = renderHook(() => useInstallPrompt());
		expect(result.current.canPrompt).toBe(true);
	});

	it("updates canPrompt when the event fires after mount", async () => {
		const { result } = renderHook(() => useInstallPrompt());
		expect(result.current.canPrompt).toBe(false);
		act(() => {
			fireBeforeInstallPrompt();
		});
		await waitFor(() => expect(result.current.canPrompt).toBe(true));
	});

	it("promptInstall shows the native prompt and reports the user's choice", async () => {
		const event = fireBeforeInstallPrompt("accepted");
		const { result } = renderHook(() => useInstallPrompt());

		let outcome: string | undefined;
		await act(async () => {
			outcome = await result.current.promptInstall();
		});
		expect(event.prompt).toHaveBeenCalled();
		expect(outcome).toBe("accepted");
		expect(result.current.canPrompt).toBe(false);
	});

	it("promptInstall reports dismissal", async () => {
		fireBeforeInstallPrompt("dismissed");
		const { result } = renderHook(() => useInstallPrompt());
		let outcome: string | undefined;
		await act(async () => {
			outcome = await result.current.promptInstall();
		});
		expect(outcome).toBe("dismissed");
	});

	it("promptInstall is unavailable with no captured event", async () => {
		const { result } = renderHook(() => useInstallPrompt());
		let outcome: string | undefined;
		await act(async () => {
			outcome = await result.current.promptInstall();
		});
		expect(outcome).toBe("unavailable");
	});
});

describe("platform detection", () => {
	it("detectStandalone is true in display-mode standalone", () => {
		const matchMedia = vi.fn().mockReturnValue({ matches: true });
		expect(detectStandalone({ matchMedia } as unknown as Window, {} as Navigator)).toBe(true);
	});

	it("detectStandalone is false in a regular browser tab", () => {
		const matchMedia = vi.fn().mockReturnValue({ matches: false });
		expect(detectStandalone({ matchMedia } as unknown as Window, {} as Navigator)).toBe(false);
	});

	it("detectStandalone tolerates a missing matchMedia", () => {
		expect(detectStandalone({} as Window, {} as Navigator)).toBe(false);
	});

	it("detectStandalone respects iOS navigator.standalone", () => {
		expect(detectStandalone({} as Window, { standalone: true } as unknown as Navigator)).toBe(true);
	});

	it("detectIOS recognises an iPhone user agent", () => {
		expect(
			detectIOS({ userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)", maxTouchPoints: 5 } as Navigator),
		).toBe(true);
	});

	it("detectIOS recognises iPadOS masquerading as macOS", () => {
		expect(
			detectIOS({ userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15)", platform: "MacIntel", maxTouchPoints: 5 } as Navigator),
		).toBe(true);
	});

	it("detectIOS is false on desktop Chrome", () => {
		expect(
			detectIOS({ userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)", platform: "Win32", maxTouchPoints: 0 } as Navigator),
		).toBe(false);
	});
});
