import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import FabricProfileCard from "./FabricProfileCard";

const mockUseClosetFabrics = vi.fn();
vi.mock("../../hooks/useClosetFabrics", () => ({
	useClosetFabrics: () => mockUseClosetFabrics(),
}));

const mockSetView = vi.fn();
vi.mock("../../context/ViewContext", () => ({
	useView: () => ({ setView: mockSetView }),
}));

const makeFabric = (name: string, resolvable: boolean) => ({
	name,
	fiber: resolvable ? { category: "plant" } : null,
	count: 1,
	pctOfCloset: 25,
	careLabel: "Machine safe",
	careTone: "ok" as const,
	tip: "",
});

describe("FabricProfileCard", () => {
	// Regression: this card must hide on the same threshold InteractiveGuide.tsx
	// uses to decide the Care tab's default (resolvableCount), not fabrics.length
	// (every distinct material, resolved or not). Otherwise a closet with 3+
	// unresolvable materials shows the donut here while Care still defaults to
	// the encyclopedia tab, contradicting the "same rule" claim in both files.
	it("hides when fabrics.length is 3+ but resolvableCount is below the threshold", () => {
		mockUseClosetFabrics.mockReturnValue({
			fabrics: [makeFabric("Leather", false), makeFabric("Denim", false), makeFabric("Lace", false)],
			resolvableCount: 0,
		});

		const { container } = render(<FabricProfileCard />);

		expect(container).toBeEmptyDOMElement();
	});

	it("renders once resolvableCount reaches the threshold", () => {
		mockUseClosetFabrics.mockReturnValue({
			fabrics: [makeFabric("Cotton", true), makeFabric("Wool", true), makeFabric("Linen", true)],
			resolvableCount: 3,
		});

		render(<FabricProfileCard />);

		expect(screen.getByText("Fabric profile")).toBeInTheDocument();
	});
});
