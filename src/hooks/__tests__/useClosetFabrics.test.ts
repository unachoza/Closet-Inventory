import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { useClosetFabrics } from "../useClosetFabrics";
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
	material: [{ material: "cotton", percentage: 100 }],
	occasion: "casual",
	age: "new",
	care: "machine wash",
	...overrides,
});

describe("useClosetFabrics", () => {
	it("counts fabrics matching useClosetFilters' material extraction", () => {
		mockUseCloset.mockReturnValue({
			closet: [
				makeItem({ material: [{ material: "cotton", percentage: 100 }] }),
				makeItem({ material: [{ material: "cotton", percentage: 100 }] }),
				makeItem({ material: [{ material: "wool", percentage: 100 }] }),
			],
		});

		const { result } = renderHook(() => useClosetFabrics());

		const cotton = result.current.fabrics.find((f) => f.name === "Cotton");
		const wool = result.current.fabrics.find((f) => f.name === "Wool");
		expect(cotton?.count).toBe(2);
		expect(wool?.count).toBe(1);
		expect(cotton?.pctOfCloset).toBe(67);
	});

	it("excludes demo items from counts", () => {
		mockUseCloset.mockReturnValue({
			closet: [
				makeItem({ material: [{ material: "cotton", percentage: 100 }] }),
				makeItem({ material: [{ material: "cotton", percentage: 100 }], isDemo: true }),
			],
		});

		const { result } = renderHook(() => useClosetFabrics());

		expect(result.current.fabrics.find((f) => f.name === "Cotton")?.count).toBe(1);
	});

	it("skips minor blend components under the 6% threshold, same as useClosetFilters", () => {
		mockUseCloset.mockReturnValue({
			closet: [
				makeItem({
					material: [
						{ material: "cotton", percentage: 95 },
						{ material: "elastane", percentage: 5 },
					],
				}),
			],
		});

		const { result } = renderHook(() => useClosetFabrics());

		expect(result.current.fabrics.map((f) => f.name)).toEqual(["Cotton"]);
	});

	it("resolvableCount reflects only fabrics that map to a known fiber", () => {
		mockUseCloset.mockReturnValue({
			closet: [
				makeItem({ material: [{ material: "cotton", percentage: 100 }] }),
				makeItem({ material: [{ material: "leather", percentage: 100 }] }),
			],
		});

		const { result } = renderHook(() => useClosetFabrics());

		// leather has no FIBERS entry (resolveFiber returns null for it)
		const leather = result.current.fabrics.find((f) => f.name === "Leather");
		expect(leather?.fiber).toBeNull();
		expect(result.current.resolvableCount).toBeLessThan(result.current.fabrics.length);
	});

	it("returns an empty summary for a closet with no material data", () => {
		mockUseCloset.mockReturnValue({
			closet: [makeItem({ material: [] })],
		});

		const { result } = renderHook(() => useClosetFabrics());

		expect(result.current.fabrics).toEqual([]);
		expect(result.current.resolvableCount).toBe(0);
	});

	it("falls under the Phase-1 empty-state threshold (<3 resolvable) for a bare closet", () => {
		mockUseCloset.mockReturnValue({
			closet: [makeItem({ material: [{ material: "cotton", percentage: 100 }] })],
		});

		const { result } = renderHook(() => useClosetFabrics());

		expect(result.current.resolvableCount).toBeLessThan(3);
	});
});
