import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, beforeEach, Mock } from "vitest";
import Carousel from "./Carousel";
import { CarouselProps, CategoryType } from "../../utils/types";

describe("Carousel Component", () => {
	const mockSetCategory: Mock<CarouselProps["setCategory"]> = vi.fn();
	// const mockSetCategory: Mock<(value: CategoryType) => void> = vi.fn();
	it("should have Category Title ", () => {
		render(<Carousel setCategory={mockSetCategory} />);

		const dressesButton = screen.getByRole("button", { name: /dresses/i });
		fireEvent.click(dressesButton);

		expect(mockSetCategory).toHaveBeenCalledTimes(1);
		expect(mockSetCategory).toHaveBeenCalledWith("dresses");
	});
});
