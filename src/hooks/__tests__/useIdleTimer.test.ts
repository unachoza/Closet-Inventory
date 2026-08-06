import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useIdleTimer } from "../useIdleTimer";

describe("useIdleTimer", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("fires onIdle once the timeout elapses with no activity", () => {
		const onIdle = vi.fn();
		renderHook(() => useIdleTimer(1000, onIdle, true, "signal-a"));

		vi.advanceTimersByTime(999);
		expect(onIdle).not.toHaveBeenCalled();

		vi.advanceTimersByTime(1);
		expect(onIdle).toHaveBeenCalledTimes(1);
	});

	it("resets the countdown when activitySignal changes", () => {
		const onIdle = vi.fn();
		const { rerender } = renderHook(({ signal }) => useIdleTimer(1000, onIdle, true, signal), {
			initialProps: { signal: "a" },
		});

		vi.advanceTimersByTime(900);
		rerender({ signal: "b" }); // activity — restarts the clock
		vi.advanceTimersByTime(900);
		expect(onIdle).not.toHaveBeenCalled();

		vi.advanceTimersByTime(100);
		expect(onIdle).toHaveBeenCalledTimes(1);
	});

	it("never fires while disabled", () => {
		const onIdle = vi.fn();
		renderHook(() => useIdleTimer(1000, onIdle, false, "signal-a"));

		vi.advanceTimersByTime(5000);
		expect(onIdle).not.toHaveBeenCalled();
	});

	it("stops firing once disabled after being enabled", () => {
		const onIdle = vi.fn();
		const { rerender } = renderHook(({ enabled }) => useIdleTimer(1000, onIdle, enabled, "signal-a"), {
			initialProps: { enabled: true },
		});

		vi.advanceTimersByTime(500);
		rerender({ enabled: false });
		vi.advanceTimersByTime(5000);

		expect(onIdle).not.toHaveBeenCalled();
	});

	it("clears its timer on unmount, never firing after", () => {
		const onIdle = vi.fn();
		const { unmount } = renderHook(() => useIdleTimer(1000, onIdle, true, "signal-a"));

		unmount();
		vi.advanceTimersByTime(5000);

		expect(onIdle).not.toHaveBeenCalled();
	});
});
