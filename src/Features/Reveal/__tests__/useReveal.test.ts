import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useReveal } from "../useReveal";
import type { ClothingItem } from "../../../utils/types";

const makeItem = (overrides: Partial<ClothingItem>): ClothingItem => ({
	id: crypto.randomUUID(),
	imageURL: "",
	name: "Test Item",
	category: "tops",
	color: "black",
	size: "M",
	brand: "Aritzia",
	material: [],
	occasion: "",
	age: "new",
	care: "",
	...overrides,
});

describe("useReveal", () => {
	beforeEach(() => {
		localStorage.clear();
	});

	it("does not show until handleTrigger is called", () => {
		const { result } = renderHook(() => useReveal([makeItem({})]));

		expect(result.current.show).toBe(false);
	});

	it("shows once handleTrigger fires, with stats computed from the closet", () => {
		const closet = [makeItem({ brand: "Aritzia" }), makeItem({ brand: "Zara" })];
		const { result } = renderHook(() => useReveal(closet));

		act(() => result.current.handleTrigger());

		expect(result.current.show).toBe(true);
		expect(result.current.stats.pieceCount).toBe(2);
		expect(result.current.stats.brandCount).toBe(2);
	});

	it("dismiss hides it again", () => {
		const { result } = renderHook(() => useReveal([makeItem({})]));

		act(() => result.current.handleTrigger());
		expect(result.current.show).toBe(true);

		act(() => result.current.dismiss());
		expect(result.current.show).toBe(false);
	});

	it("never shows again once already shown, even across remounts", () => {
		const { result, unmount } = renderHook(() => useReveal([makeItem({})]));
		act(() => result.current.handleTrigger());
		act(() => result.current.dismiss());
		unmount();

		// A fresh mount (e.g. next session) — idle fires again, but the
		// lifecycle already recorded day0 as shown, so it must not re-show.
		const { result: fresh } = renderHook(() => useReveal([makeItem({})]));
		act(() => fresh.current.handleTrigger());

		expect(fresh.current.show).toBe(false);
	});
});
