import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import userEvent from "@testing-library/user-event";
import Carousel from "./Carousel";

describe("Carousel Component", () => {
	const mockSetCategory = vi.fn();
	
	it("renders three carousel items at a time", () => {
		render(<Carousel setCategory={vi.fn()} />);
		expect(screen.getAllByText(/tops|dresses|bottoms/i).length).toBe(3);
	});

	it("rotates items when clicking next arrow", async () => {
		const user = userEvent.setup();
		render(<Carousel setCategory={vi.fn()} />);

		const nextButton = screen.getByRole("button", { name: "▶" });
		await user.click(nextButton);

		expect(screen.getByText(/coats|sweaters/i)).toBeInTheDocument();
	});

	it("clicking on carousel item should call setCategory with label", async () => {
		const user = userEvent.setup();
		render(<Carousel setCategory={mockSetCategory} />);

		const dressesCard = screen.getByText(/dresses/i);
		await user.click(dressesCard);

		expect(mockSetCategory).toHaveBeenCalledTimes(1);
		expect(mockSetCategory).toHaveBeenCalledWith("Dresses");
	});
});
