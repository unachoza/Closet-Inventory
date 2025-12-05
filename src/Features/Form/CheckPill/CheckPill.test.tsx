import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, beforeEach, Mock } from "vitest";
import CheckPill from "./CheckPill";
import { ItemFormData } from "../../../utils/types";

describe("CheckPill component", () => {
	const mockToggle = vi.fn();

	beforeEach(() => {
		mockToggle.mockClear();
	});

	it("should behave like a checkbox with checked and unchecked state", () => {
		render(<CheckPill label={"color" as keyof ItemFormData} value="Red" checked={false} onToggle={mockToggle} />);

		const pill = screen.getByText("Red").closest("[role=checkbox]");
		expect(pill).toBeTruthy();

		expect(pill).toHaveAttribute("data-state", "unchecked");
		fireEvent.click(pill!);

		expect(mockToggle).toHaveBeenCalledWith("Red", "color");
		expect(pill).toHaveAttribute("data-state", "checked");
	});

	it("should render its label text inside the pill", () => {
		render(<CheckPill label={"brand" as keyof ItemFormData} value="Nike" checked={false} onToggle={mockToggle} />);

		expect(screen.getByText("Nike")).toBeInTheDocument();
	});

	it("should show an active state by applying the active class", () => {
		render(<CheckPill label={"size" as keyof ItemFormData} value="M" checked={true} onToggle={mockToggle} />);

		const pill = screen.getByText("M").closest("[role=checkbox]");
		expect(pill).toHaveClass("active");
	});
	it("should show active state by contrasting border label", () => {
		render(<CheckPill label={"color" as keyof ItemFormData} value="Blue" checked={true} onToggle={mockToggle} />);

		const label = screen.getByText("Blue");
		const pill = label.closest("[role=checkbox]");

		expect(pill).toHaveClass("active");
		expect(label).toHaveClass("checkbox-label");
	});
});
