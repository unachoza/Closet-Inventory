import { renderHook, act } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import usePagination from "../usePagination";

const items = Array.from({ length: 23 }, (_, i) => `item-${i + 1}`);

describe("usePagination", () => {
	it("starts on page 1 and returns the first page slice", () => {
		const { result } = renderHook(() => usePagination(items, 10));
		expect(result.current.currentPage).toBe(1);
		expect(result.current.currentPageData).toEqual(items.slice(0, 10));
	});

	it("calculates totalPages correctly (rounds up for remainder)", () => {
		const { result } = renderHook(() => usePagination(items, 10));
		// 23 items / 10 per page = 3 pages
		expect(result.current.totalPages).toBe(3);
	});

	it("last page returns only the remaining items, not a full page", () => {
		const { result } = renderHook(() => usePagination(items, 10));
		act(() => result.current.goToPage(3));
		// Page 3 of 23 items with 10/page → items 21-23 (3 items)
		expect(result.current.currentPageData).toHaveLength(3);
		expect(result.current.currentPageData[0]).toBe("item-21");
	});

	it("handleNextPage advances the page", () => {
		const { result } = renderHook(() => usePagination(items, 10));
		act(() => result.current.handleNextPage());
		expect(result.current.currentPage).toBe(2);
		expect(result.current.currentPageData[0]).toBe("item-11");
	});

	it("handlePrevPage goes back a page", () => {
		const { result } = renderHook(() => usePagination(items, 10));
		act(() => result.current.goToPage(3));
		act(() => result.current.handlePrevPage());
		expect(result.current.currentPage).toBe(2);
	});

	it("goToPage does not go below page 1", () => {
		const { result } = renderHook(() => usePagination(items, 10));
		act(() => result.current.goToPage(0));
		expect(result.current.currentPage).toBe(1);
	});

	it("goToPage does not exceed totalPages", () => {
		const { result } = renderHook(() => usePagination(items, 10));
		act(() => result.current.goToPage(99));
		expect(result.current.currentPage).toBe(1); // unchanged
	});

	it("handleNextPage does not advance past the last page", () => {
		const { result } = renderHook(() => usePagination(items, 10));
		act(() => result.current.goToPage(3));
		act(() => result.current.handleNextPage());
		expect(result.current.currentPage).toBe(3);
	});

	it("handles 0 items — totalPages is 0, currentPageData is empty", () => {
		const { result } = renderHook(() => usePagination([], 10));
		expect(result.current.totalPages).toBe(0);
		expect(result.current.currentPageData).toEqual([]);
	});

	it("handles items that fit exactly on one page", () => {
		const exact = Array.from({ length: 10 }, (_, i) => i);
		const { result } = renderHook(() => usePagination(exact, 10));
		expect(result.current.totalPages).toBe(1);
		expect(result.current.currentPageData).toHaveLength(10);
	});
});
