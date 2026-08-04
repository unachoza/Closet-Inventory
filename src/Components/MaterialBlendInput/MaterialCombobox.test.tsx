import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import MaterialCombobox from "./MaterialCombobox";

const options = ["cotton", "silk", "wool", "polyester"];

describe("MaterialCombobox", () => {
	it("renders the current value in the input", () => {
		render(<MaterialCombobox value="cotton" onChange={vi.fn()} options={options} ariaLabel="Material 1 name" />);
		expect(screen.getByDisplayValue("cotton")).toBeInTheDocument();
	});

	it("opens a filtered options panel on focus, filtered by typed text", () => {
		render(<MaterialCombobox value="" onChange={vi.fn()} options={options} ariaLabel="Material 1 name" />);
		fireEvent.focus(screen.getByLabelText("Material 1 name"));
		expect(screen.getByRole("button", { name: "cotton" })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "wool" })).toBeInTheDocument();

		fireEvent.change(screen.getByLabelText("Material 1 name"), { target: { value: "wo" } });
		expect(screen.getByRole("button", { name: "wool" })).toBeInTheDocument();
		expect(screen.queryByRole("button", { name: "cotton" })).not.toBeInTheDocument();
	});

	it("calls onChange when a canonical option is selected", () => {
		const onChange = vi.fn();
		render(<MaterialCombobox value="" onChange={onChange} options={options} ariaLabel="Material 1 name" />);
		fireEvent.focus(screen.getByLabelText("Material 1 name"));
		fireEvent.click(screen.getByRole("button", { name: "silk" }));
		expect(onChange).toHaveBeenCalledWith("silk");
	});

	it("offers a custom 'Use' option for text that isn't in the canonical list", () => {
		const onChange = vi.fn();
		render(<MaterialCombobox value="" onChange={onChange} options={options} ariaLabel="Material 1 name" />);
		fireEvent.focus(screen.getByLabelText("Material 1 name"));
		fireEvent.change(screen.getByLabelText("Material 1 name"), { target: { value: "merino wool" } });

		fireEvent.click(screen.getByRole("button", { name: /use "merino wool"/i }));
		expect(onChange).toHaveBeenCalledWith("merino wool");
	});

	// The critical case: an imported item can carry a material outside the
	// canonical list (FashionParser's MATERIAL_MAP has many the dropdown
	// doesn't — "twill", "organza", "merino wool", etc). Opening the field to
	// edit something else on the item must never blank an existing value the
	// dropdown doesn't happen to recognize.
	it("preserves a non-canonical existing value instead of blanking it", () => {
		render(<MaterialCombobox value="merino wool" onChange={vi.fn()} options={options} ariaLabel="Material 1 name" />);
		expect(screen.getByDisplayValue("merino wool")).toBeInTheDocument();

		fireEvent.focus(screen.getByLabelText("Material 1 name"));
		expect(screen.getByDisplayValue("merino wool")).toBeInTheDocument();
		expect(screen.queryByRole("button", { name: "merino wool" })).not.toBeInTheDocument(); // not a canonical option

		fireEvent.click(document.body);
		expect(screen.getByDisplayValue("merino wool")).toBeInTheDocument();
	});

	it("commits typed text lowercase on Enter and closes the panel", () => {
		const onChange = vi.fn();
		render(<MaterialCombobox value="" onChange={onChange} options={options} ariaLabel="Material 1 name" />);
		const input = screen.getByLabelText("Material 1 name");
		fireEvent.focus(input);
		fireEvent.change(input, { target: { value: "COTTON" } });
		fireEvent.keyDown(input, { key: "Enter" });

		expect(onChange).toHaveBeenCalledWith("cotton");
		expect(screen.queryByRole("button", { name: "silk" })).not.toBeInTheDocument();
	});

	it("Escape reverts to the last committed value without calling onChange", () => {
		const onChange = vi.fn();
		render(<MaterialCombobox value="cotton" onChange={onChange} options={options} ariaLabel="Material 1 name" />);
		const input = screen.getByLabelText("Material 1 name");
		fireEvent.focus(input);
		fireEvent.change(input, { target: { value: "something else" } });
		fireEvent.keyDown(input, { key: "Escape" });

		expect(onChange).not.toHaveBeenCalled();
		expect(screen.getByDisplayValue("cotton")).toBeInTheDocument();
	});

	it("closes the panel on outside pointerdown and commits the typed value", () => {
		const onChange = vi.fn();
		render(
			<div>
				<MaterialCombobox value="" onChange={onChange} options={options} ariaLabel="Material 1 name" />
				<button type="button">outside</button>
			</div>,
		);
		fireEvent.focus(screen.getByLabelText("Material 1 name"));
		fireEvent.change(screen.getByLabelText("Material 1 name"), { target: { value: "silk" } });

		fireEvent.pointerDown(screen.getByRole("button", { name: "outside" }));

		expect(onChange).toHaveBeenCalledWith("silk");
		expect(screen.queryByRole("button", { name: "wool" })).not.toBeInTheDocument();
	});

	it("Done commits the current text and closes even without selecting a listed option", () => {
		const onChange = vi.fn();
		render(<MaterialCombobox value="" onChange={onChange} options={options} ariaLabel="Material 1 name" />);
		fireEvent.focus(screen.getByLabelText("Material 1 name"));
		fireEvent.change(screen.getByLabelText("Material 1 name"), { target: { value: "leather" } });
		fireEvent.click(screen.getByRole("button", { name: "Done" }));

		expect(onChange).toHaveBeenCalledWith("leather");
		expect(screen.queryByRole("button", { name: "wool" })).not.toBeInTheDocument();
	});
});
