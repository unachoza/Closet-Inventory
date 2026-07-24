import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import PillGroup from "./PillGroup";
import { formItem } from "../../../utils/constants";
import { getColorSwatchFill } from "../../../utils/colorSwatches";

describe("PillGroup", () => {
	it("renders one pill per option", () => {
		render(
			<PillGroup
				label="Color"
				fieldName="color"
				options={["red", "blue"]}
				formData={{ ...formItem }}
				onToggle={vi.fn()}
			/>
		);
		expect(screen.getByText("red")).toBeInTheDocument();
		expect(screen.getByText("blue")).toBeInTheDocument();
	});

	it("marks the pill matching formData as active", () => {
		render(
			<PillGroup
				label="Color"
				fieldName="color"
				options={["red", "blue"]}
				formData={{ ...formItem, color: "blue" }}
				onToggle={vi.fn()}
			/>
		);
		expect(screen.getByText("blue").closest("button")).toHaveClass("active");
		expect(screen.getByText("red").closest("button")).not.toHaveClass("active");
	});

	it("calls onToggle with value and field name when a pill is clicked", () => {
		const onToggle = vi.fn();
		render(
			<PillGroup label="Color" fieldName="color" options={["red", "blue"]} formData={{ ...formItem }} onToggle={onToggle} />
		);
		fireEvent.click(screen.getByText("red"));
		expect(onToggle).toHaveBeenCalledWith("red", "color");
	});

	it("renders a swatch dot when getSwatch is provided", () => {
		const { container } = render(
			<PillGroup
				label="Color"
				fieldName="color"
				options={["red"]}
				formData={{ ...formItem }}
				onToggle={vi.fn()}
				getSwatch={getColorSwatchFill}
			/>
		);
		expect(container.querySelector(".pill-swatch")).toBeInTheDocument();
	});

	it("does not render a swatch dot when getSwatch is omitted", () => {
		const { container } = render(
			<PillGroup label="Size" fieldName="size" options={["m"]} formData={{ ...formItem }} onToggle={vi.fn()} />
		);
		expect(container.querySelector(".pill-swatch")).not.toBeInTheDocument();
	});
});
