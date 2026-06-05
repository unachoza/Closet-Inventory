import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import MaterialCompositionBar from "./MaterialCompositionBar";

describe("MaterialCompositionBar", () => {
	it("renders nothing for an empty blend", () => {
		const { container } = render(<MaterialCompositionBar blend={[]} />);
		expect(container.firstChild).toBeNull();
	});

	it("renders one segment per material", () => {
		render(
			<MaterialCompositionBar
				blend={[
					{ material: "cotton", percentage: 80 },
					{ material: "spandex", percentage: 20 },
				]}
			/>,
		);
		const segments = document.querySelectorAll(".mcb__segment");
		expect(segments).toHaveLength(2);
	});

	it("single material segment fills 100% width", () => {
		render(<MaterialCompositionBar blend={[{ material: "silk", percentage: 100 }]} />);
		const segment = document.querySelector(".mcb__segment") as HTMLElement;
		expect(segment.style.width).toBe("100%");
	});

	it("normalises widths so they always fill the bar even if percentages don't sum to 100", () => {
		// 60 + 30 = 90 total — widths should scale to 66.67% and 33.33%
		render(
			<MaterialCompositionBar
				blend={[
					{ material: "cotton", percentage: 60 },
					{ material: "polyester", percentage: 30 },
				]}
			/>,
		);
		const [first, second] = Array.from(document.querySelectorAll(".mcb__segment")) as HTMLElement[];
		expect(parseFloat(first.style.width)).toBeCloseTo(66.67, 1);
		expect(parseFloat(second.style.width)).toBeCloseTo(33.33, 1);
	});

	it("shows legend with capitalized material names and percentages by default", () => {
		render(<MaterialCompositionBar blend={[{ material: "cotton", percentage: 80 }]} />);
		expect(screen.getByText(/80%/)).toBeInTheDocument();
		expect(screen.getByText(/Cotton/)).toBeInTheDocument();
	});

	it("hides legend when showLegend is false", () => {
		render(
			<MaterialCompositionBar
				blend={[{ material: "cotton", percentage: 100 }]}
				showLegend={false}
			/>,
		);
		expect(document.querySelector(".mcb__legend")).toBeNull();
	});
});
