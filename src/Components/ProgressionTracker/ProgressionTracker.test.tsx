import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import StepTabsTracker from "./ProgressionTracker";
import { steps } from "../../utils/constants";

describe("StepTabsTracker", () => {
	it("renders all step labels", () => {
		render(<StepTabsTracker currentStep={1} onStepClick={vi.fn()} />);
		steps.forEach((label) => expect(screen.getByText(label)).toBeInTheDocument());
	});

	it("marks the current step as active", () => {
		render(<StepTabsTracker currentStep={3} onStepClick={vi.fn()} />);
		const items = screen.getAllByRole("listitem");
		// step 3 is index 2
		expect(items[2].className).toContain("active");
	});

	it("only one step is active at a time", () => {
		render(<StepTabsTracker currentStep={2} onStepClick={vi.fn()} />);
		const activeItems = screen.getAllByRole("listitem").filter((li) => li.className.includes("active"));
		expect(activeItems).toHaveLength(1);
	});

	it("clicking a step calls onStepClick with the correct step number", () => {
		const onStepClick = vi.fn();
		render(<StepTabsTracker currentStep={1} onStepClick={onStepClick} />);
		fireEvent.click(screen.getByText(steps[3])); // step 4
		expect(onStepClick).toHaveBeenCalledWith(4);
	});
});
