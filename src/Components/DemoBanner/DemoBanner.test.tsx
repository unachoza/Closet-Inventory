import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import DemoBanner from "./DemoBanner";

describe("DemoBanner", () => {
	it("renders nothing when there are no sample items", () => {
		const { container } = render(<DemoBanner count={0} onClear={vi.fn()} />);
		expect(container).toBeEmptyDOMElement();
	});

	it("names the samples and clears them on click", () => {
		const onClear = vi.fn();
		render(<DemoBanner count={12} onClear={onClear} />);
		expect(screen.getByText(/These 12 pieces are/i)).toBeInTheDocument();
		fireEvent.click(screen.getByRole("button", { name: /clear samples/i }));
		expect(onClear).toHaveBeenCalledTimes(1);
	});
});
