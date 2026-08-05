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

	// No free-text escape hatch: whatever's typed is force-matched to its
	// closest canonical option on commit, never kept as-is or offered as a
	// separate "custom value" choice. This only holds because the real
	// canonical list (materialUtils.ts) was reconciled to cover every material
	// FashionParser's own map produces — see that file's comment.
	it("has no 'use custom value' escape hatch", () => {
		render(<MaterialCombobox value="" onChange={vi.fn()} options={options} ariaLabel="Material 1 name" />);
		fireEvent.focus(screen.getByLabelText("Material 1 name"));
		fireEvent.change(screen.getByLabelText("Material 1 name"), { target: { value: "xyzzy" } });
		expect(screen.queryByRole("button", { name: /use "/i })).not.toBeInTheDocument();
	});

	it("force-matches a typo to the closest canonical option on Enter", () => {
		const onChange = vi.fn();
		render(<MaterialCombobox value="" onChange={onChange} options={options} ariaLabel="Material 1 name" />);
		const input = screen.getByLabelText("Material 1 name");
		fireEvent.focus(input);
		fireEvent.change(input, { target: { value: "cottton" } });
		fireEvent.keyDown(input, { key: "Enter" });
		expect(onChange).toHaveBeenCalledWith("cotton");
	});

	// Opening the field to look at (or edit something else near) an existing
	// value must not mutate it if nothing was typed — dismissing without
	// editing is a no-op, not an implicit re-commit.
	it("leaves an untouched value alone when opened and dismissed without edits", () => {
		const onChange = vi.fn();
		render(<MaterialCombobox value="wool" onChange={onChange} options={options} ariaLabel="Material 1 name" />);
		fireEvent.focus(screen.getByLabelText("Material 1 name"));
		fireEvent.click(document.body);
		expect(screen.getByDisplayValue("wool")).toBeInTheDocument();
		expect(onChange).not.toHaveBeenCalled();
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

	it("Done force-matches the current text and closes even without clicking a listed option", () => {
		const onChange = vi.fn();
		render(<MaterialCombobox value="" onChange={onChange} options={options} ariaLabel="Material 1 name" />);
		fireEvent.focus(screen.getByLabelText("Material 1 name"));
		fireEvent.change(screen.getByLabelText("Material 1 name"), { target: { value: "silkk" } });
		fireEvent.click(screen.getByRole("button", { name: "Done" }));

		expect(onChange).toHaveBeenCalledWith("silk");
		expect(screen.queryByRole("button", { name: "wool" })).not.toBeInTheDocument();
	});
});
