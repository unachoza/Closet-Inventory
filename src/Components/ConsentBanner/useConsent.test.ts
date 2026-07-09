import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";

const { initMonitoring } = vi.hoisted(() => ({ initMonitoring: vi.fn() }));
vi.mock("../../lib/monitoring", () => ({ initMonitoring }));

import { useConsent } from "./useConsent";

describe("useConsent", () => {
	beforeEach(() => {
		localStorage.clear();
		initMonitoring.mockClear();
	});

	it("shows the banner when consent is undecided, and does not init monitoring", async () => {
		const { result } = renderHook(() => useConsent());
		await waitFor(() => expect(result.current.consent).toBe("undecided"));
		expect(result.current.showBanner).toBe(true);
		expect(initMonitoring).not.toHaveBeenCalled();
	});

	it("does not show the banner and inits monitoring when consent was already granted", async () => {
		localStorage.setItem("closetly-analytics-consent", "granted");
		const { result } = renderHook(() => useConsent());
		await waitFor(() => expect(result.current.consent).toBe("granted"));
		expect(result.current.showBanner).toBe(false);
		expect(initMonitoring).toHaveBeenCalledTimes(1);
	});

	it("accept: hides the banner, persists consent, and inits monitoring", async () => {
		const { result } = renderHook(() => useConsent());
		await waitFor(() => expect(result.current.consent).toBe("undecided"));

		act(() => result.current.accept());

		expect(result.current.showBanner).toBe(false);
		expect(localStorage.getItem("closetly-analytics-consent")).toBe("granted");
		expect(initMonitoring).toHaveBeenCalledTimes(1);
	});

	it("decline: hides the banner, persists consent, and never inits monitoring", async () => {
		const { result } = renderHook(() => useConsent());
		await waitFor(() => expect(result.current.consent).toBe("undecided"));

		act(() => result.current.decline());

		expect(result.current.showBanner).toBe(false);
		expect(localStorage.getItem("closetly-analytics-consent")).toBe("declined");
		expect(initMonitoring).not.toHaveBeenCalled();
	});
});
