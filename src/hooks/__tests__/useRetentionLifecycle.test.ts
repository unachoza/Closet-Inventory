import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useRetentionLifecycle } from "../useRetentionLifecycle";
import { REVEAL_THRESHOLD } from "../retentionLifecycle";
import { ClothingItem } from "../../utils/types";

const mockUseCloset = vi.fn();
vi.mock("../../context/ClosetContext", () => ({
	useCloset: () => mockUseCloset(),
}));

const makeItem = (overrides: Partial<ClothingItem>): ClothingItem => ({
	id: crypto.randomUUID(),
	imageURL: "",
	name: "Test Item",
	category: "tops",
	color: "black",
	size: "M",
	brand: "Nike",
	material: [],
	occasion: "casual",
	age: "new",
	care: "machine wash",
	...overrides,
});

describe("useRetentionLifecycle", () => {
	beforeEach(() => {
		localStorage.clear();
	});

	it("does not show the reveal below the threshold", () => {
		mockUseCloset.mockReturnValue({ closet: Array.from({ length: REVEAL_THRESHOLD - 1 }, () => makeItem({})) });
		const { result } = renderHook(() => useRetentionLifecycle());
		expect(result.current.showReveal).toBe(false);
	});

	it("shows the reveal once the own-item count crosses the threshold", () => {
		mockUseCloset.mockReturnValue({ closet: Array.from({ length: REVEAL_THRESHOLD }, () => makeItem({})) });
		const { result } = renderHook(() => useRetentionLifecycle());
		expect(result.current.showReveal).toBe(true);
	});

	it("never shows for a demo-only closet", () => {
		mockUseCloset.mockReturnValue({ closet: Array.from({ length: REVEAL_THRESHOLD }, () => makeItem({ isDemo: true })) });
		const { result } = renderHook(() => useRetentionLifecycle());
		expect(result.current.showReveal).toBe(false);
	});

	it("persists dismissal so it never shows again, even after remount", () => {
		mockUseCloset.mockReturnValue({ closet: Array.from({ length: REVEAL_THRESHOLD }, () => makeItem({})) });
		const { result, unmount } = renderHook(() => useRetentionLifecycle());
		expect(result.current.showReveal).toBe(true);

		act(() => result.current.dismissReveal());
		expect(result.current.showReveal).toBe(false);
		unmount();

		const { result: result2 } = renderHook(() => useRetentionLifecycle());
		expect(result2.current.showReveal).toBe(false);
	});
});
