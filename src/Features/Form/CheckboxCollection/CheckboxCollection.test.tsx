import { screen, render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import userEvent from "@testing-library/user-event";
import CheckboxCollection from "./CheckboxCollection.tsx";

describe("The Checkbox Component", () => {
	it("allows checking and unchecking a checkbox", async () => {
		const mockToggle = vi.fn();
		render(
			<CheckboxCollection
				label="color"
				detailOptions={["red", "blue", "green"]}
				onToggleDetail={mockToggle}
				formData={{
					type: "",
					color: "",
					size: "",
					brand: "",
					material: "",
					occasion: "",
					age: "",
					care: "",
				}}
			/>
		);

		const checkboxes = screen.getAllByRole("checkbox");
		const firstCheckbox = checkboxes[0];
		expect(firstCheckbox).not.toBeChecked();
		await userEvent.click(firstCheckbox);
		// verifies that the click triggers the callback
		expect(mockToggle).toHaveBeenCalledOnce();
		expect(mockToggle).toHaveBeenCalledWith("red", "color");
	});

	it("should allow users to tab through inputs using their keyboard", async () => {});
	it("if option is selected, it should no longer be in the options list", () => {});
	it("should have checkbox to the left and label to the right", () => {});
	it("should show a focus state");
	it("if color label, check should have background color match label", () => {});
	it("should allow only one value checked/ selected", () => {});
});
