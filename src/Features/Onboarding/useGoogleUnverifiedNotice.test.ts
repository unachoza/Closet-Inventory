import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useGoogleUnverifiedNotice } from "./useGoogleUnverifiedNotice";

describe("useGoogleUnverifiedNotice", () => {
	beforeEach(() => {
		localStorage.clear();
	});

	it("first call: opens the notice and does not run the action yet", () => {
		const { result } = renderHook(() => useGoogleUnverifiedNotice());
		const proceed = vi.fn();

		act(() => result.current.requestGoogleSignIn(proceed));

		expect(result.current.isOpen).toBe(true);
		expect(proceed).not.toHaveBeenCalled();
	});

	it("confirm: closes the notice, runs the pending action, and persists the seen flag", () => {
		const { result } = renderHook(() => useGoogleUnverifiedNotice());
		const proceed = vi.fn();

		act(() => result.current.requestGoogleSignIn(proceed));
		act(() => result.current.confirm());

		expect(result.current.isOpen).toBe(false);
		expect(proceed).toHaveBeenCalledTimes(1);
		expect(localStorage.getItem("closetly-google-notice-seen")).toBe("true");
	});

	it("dismiss: closes the notice without running the action", () => {
		const { result } = renderHook(() => useGoogleUnverifiedNotice());
		const proceed = vi.fn();

		act(() => result.current.requestGoogleSignIn(proceed));
		act(() => result.current.dismiss());

		expect(result.current.isOpen).toBe(false);
		expect(proceed).not.toHaveBeenCalled();
	});

	it("once the notice has been seen, the action runs immediately without opening it again", () => {
		localStorage.setItem("closetly-google-notice-seen", "true");
		const { result } = renderHook(() => useGoogleUnverifiedNotice());
		const proceed = vi.fn();

		act(() => result.current.requestGoogleSignIn(proceed));

		expect(result.current.isOpen).toBe(false);
		expect(proceed).toHaveBeenCalledTimes(1);
	});
});
