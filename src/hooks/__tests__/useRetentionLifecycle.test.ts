import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useRetentionLifecycle } from "../useRetentionLifecycle";

const STORAGE_KEY = "ntw-retention-lifecycle";

describe("useRetentionLifecycle", () => {
	beforeEach(() => {
		localStorage.clear();
	});

	it("starts with every horizon unshown", () => {
		const { result } = renderHook(() => useRetentionLifecycle());

		expect(result.current.hasShown("day0")).toBe(false);
		expect(result.current.hasShown("day2_3")).toBe(false);
		expect(result.current.hasShown("day14")).toBe(false);
		expect(result.current.hasShown("day30")).toBe(false);
	});

	it("marking a horizon shown persists across remounts", () => {
		const { result, unmount } = renderHook(() => useRetentionLifecycle());

		act(() => result.current.markShown("day0"));
		expect(result.current.hasShown("day0")).toBe(true);

		unmount();

		const { result: fresh } = renderHook(() => useRetentionLifecycle());
		expect(fresh.current.hasShown("day0")).toBe(true);
		expect(fresh.current.hasShown("day2_3")).toBe(false);
	});

	it("persists to the documented storage key", () => {
		const { result } = renderHook(() => useRetentionLifecycle());

		act(() => result.current.markShown("day30"));

		const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
		expect(stored.day30).not.toBeNull();
		expect(typeof stored.day30).toBe("string");
	});

	it("survives corrupted localStorage without throwing", () => {
		localStorage.setItem(STORAGE_KEY, "{not json");

		const { result } = renderHook(() => useRetentionLifecycle());

		expect(result.current.hasShown("day0")).toBe(false);
	});
});
