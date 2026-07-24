import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import ColorSwatchGrid from "../ColorSwatchGrid";
import { colorOptions } from "../../../../utils/constants";

describe("ColorSwatchGrid", () => {
	it("renders one labelled button per color", () => {
		render(<ColorSwatchGrid options={colorOptions} selected="" onSelect={() => {}} />);
		colorOptions.forEach((color) => {
			expect(screen.getByRole("button", { name: color })).toBeInTheDocument();
		});
	});

	it("marks only the selected swatch as pressed", () => {
		render(<ColorSwatchGrid options={colorOptions} selected="blue" onSelect={() => {}} />);
		expect(screen.getByRole("button", { name: "blue" })).toHaveAttribute("aria-pressed", "true");
		expect(screen.getByRole("button", { name: "red" })).toHaveAttribute("aria-pressed", "false");
	});

	it("selects on tap and deselects on tapping the selected swatch", () => {
		const onSelect = vi.fn();
		const { rerender } = render(<ColorSwatchGrid options={colorOptions} selected="" onSelect={onSelect} />);
		fireEvent.click(screen.getByRole("button", { name: "pink" }));
		expect(onSelect).toHaveBeenCalledWith("pink");

		rerender(<ColorSwatchGrid options={colorOptions} selected="pink" onSelect={onSelect} />);
		fireEvent.click(screen.getByRole("button", { name: "pink" }));
		expect(onSelect).toHaveBeenLastCalledWith("");
	});
});
