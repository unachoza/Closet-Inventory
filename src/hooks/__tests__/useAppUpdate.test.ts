import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

const { isUpdateReady, subscribeToUpdateReady, applyPendingUpdate } = vi.hoisted(() => ({
	isUpdateReady: vi.fn(() => false),
	subscribeToUpdateReady: vi.fn((_cb: () => void) => vi.fn()),
	applyPendingUpdate: vi.fn(),
}));
vi.mock("../../lib/pwaUpdate", () => ({ isUpdateReady, subscribeToUpdateReady, applyPendingUpdate }));

describe("useAppUpdate", () => {
	beforeEach(() => {
		isUpdateReady.mockReturnValue(false);
		subscribeToUpdateReady.mockClear();
		applyPendingUpdate.mockClear();
	});

	it("reflects not-ready when no update is pending", async () => {
		const { useAppUpdate } = await import("../useAppUpdate");
		const { result } = renderHook(() => useAppUpdate());

		expect(result.current.updateReady).toBe(false);
	});

	// The mount-time sync is load-bearing: onNeedReload can fire before this
	// component mounts (e.g. it fired while some other screen was showing), and
	// without an immediate read on mount the banner would never appear.
	it("picks up an update that was already ready before mount", async () => {
		isUpdateReady.mockReturnValue(true);
		const { useAppUpdate } = await import("../useAppUpdate");

		const { result } = renderHook(() => useAppUpdate());

		expect(result.current.updateReady).toBe(true);
	});

	it("updates when notified after mount", async () => {
		let notify: () => void = () => {};
		subscribeToUpdateReady.mockImplementation((cb: () => void) => {
			notify = cb;
			return vi.fn();
		});
		const { useAppUpdate } = await import("../useAppUpdate");
		const { result } = renderHook(() => useAppUpdate());
		expect(result.current.updateReady).toBe(false);

		isUpdateReady.mockReturnValue(true);
		act(() => notify());

		expect(result.current.updateReady).toBe(true);
	});

	it("unsubscribes on unmount", async () => {
		const unsubscribe = vi.fn();
		subscribeToUpdateReady.mockReturnValue(unsubscribe);
		const { useAppUpdate } = await import("../useAppUpdate");

		const { unmount } = renderHook(() => useAppUpdate());
		unmount();

		expect(unsubscribe).toHaveBeenCalled();
	});

	it("applyUpdate delegates to applyPendingUpdate()", async () => {
		const { useAppUpdate } = await import("../useAppUpdate");
		const { result } = renderHook(() => useAppUpdate());

		result.current.applyUpdate();

		expect(applyPendingUpdate).toHaveBeenCalled();
	});
});
