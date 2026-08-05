import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import PillComboField from "./PillComboField";

const options = ["formal", "casual", "wedding"];

describe("PillComboField", () => {
	it("renders selected values as chips", () => {
		render(<PillComboField label="occasion" options={options} selected={["casual"]} onAdd={vi.fn()} onRemove={vi.fn()} />);
		expect(screen.getByText("casual")).toBeInTheDocument();
	});

	it("opens the option panel on click and hides already-selected values", () => {
		render(<PillComboField label="occasion" options={options} selected={["casual"]} onAdd={vi.fn()} onRemove={vi.fn()} />);
		fireEvent.click(screen.getByRole("button", { name: /occasion selector/i }));
		expect(screen.getByRole("button", { name: "formal" })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "wedding" })).toBeInTheDocument();
		expect(screen.queryByRole("button", { name: "casual" })).not.toBeInTheDocument();
	});

	it("calls onAdd when an option is selected", () => {
		const onAdd = vi.fn();
		render(<PillComboField label="occasion" options={options} selected={[]} onAdd={onAdd} onRemove={vi.fn()} />);
		fireEvent.click(screen.getByRole("button", { name: /occasion selector/i }));
		fireEvent.click(screen.getByRole("button", { name: "formal" }));
		expect(onAdd).toHaveBeenCalledWith("formal");
	});

	it("single-select mode replaces the previous selection", () => {
		const onRemove = vi.fn();
		const onAdd = vi.fn();
		render(
			<PillComboField
				label="occasion"
				options={options}
				selected={["casual"]}
				onAdd={onAdd}
				onRemove={onRemove}
				multiSelect={false}
			/>,
		);
		fireEvent.click(screen.getByRole("button", { name: /occasion selector/i }));
		fireEvent.click(screen.getByRole("button", { name: "formal" }));
		expect(onRemove).toHaveBeenCalledWith("casual");
		expect(onAdd).toHaveBeenCalledWith("formal");
	});

	it("calls onRemove when a chip's remove button is clicked", () => {
		const onRemove = vi.fn();
		render(<PillComboField label="care" options={options} selected={["casual"]} onAdd={vi.fn()} onRemove={onRemove} />);
		fireEvent.click(screen.getByRole("button", { name: /remove casual/i }));
		expect(onRemove).toHaveBeenCalledWith("casual");
	});

	// The panel plays an exit animation (AnimatePresence), so it stays mounted
	// for a beat after Done — assert on eventual removal, not synchronously.
	it("closes the panel when Done is clicked", async () => {
		render(<PillComboField label="occasion" options={options} selected={[]} onAdd={vi.fn()} onRemove={vi.fn()} />);
		fireEvent.click(screen.getByRole("button", { name: /occasion selector/i }));
		expect(screen.getByRole("button", { name: "formal" })).toBeInTheDocument();
		fireEvent.click(screen.getByRole("button", { name: "Done" }));
		await waitFor(() => expect(screen.queryByRole("button", { name: "formal" })).not.toBeInTheDocument());
	});

	// Closing unmounts the panel that focus was inside. Without an explicit
	// hand-back, focus falls to <body> — a keyboard or screen-reader user is
	// dumped at the top of the document mid-form and has to Tab all the way
	// back. Escape must close too; there was previously no keyboard way out.
	it("returns focus to the field after Done", async () => {
		render(<PillComboField label="occasion" options={options} selected={[]} onAdd={vi.fn()} onRemove={vi.fn()} />);
		const box = screen.getByRole("button", { name: /occasion selector/i });
		fireEvent.click(box);
		const done = screen.getByRole("button", { name: "Done" });
		done.focus();
		fireEvent.click(done);
		await waitFor(() => expect(document.activeElement).toBe(box));
	});

	it("Escape closes the panel and returns focus to the field", async () => {
		render(<PillComboField label="occasion" options={options} selected={[]} onAdd={vi.fn()} onRemove={vi.fn()} />);
		const box = screen.getByRole("button", { name: /occasion selector/i });
		fireEvent.click(box);
		expect(screen.getByRole("button", { name: "formal" })).toBeInTheDocument();
		fireEvent.keyDown(box, { key: "Escape" });
		await waitFor(() => expect(screen.queryByRole("button", { name: "formal" })).not.toBeInTheDocument());
		expect(document.activeElement).toBe(box);
	});

	// The visible label must be tied to the control. A bare <label> with no
	// `for` and no form element under it names nothing — the field was relying
	// entirely on aria-label, leaving the on-screen text as a stray node.
	it("associates the visible label with the field", () => {
		render(<PillComboField label="occasion" options={options} selected={[]} onAdd={vi.fn()} onRemove={vi.fn()} />);
		expect(screen.getAllByLabelText(/occasion/i).length).toBeGreaterThan(0);
		expect(document.querySelector("label:not([for])")).toBeNull();
	});

	it("shows Done even when every option is already selected", () => {
		render(<PillComboField label="care" options={options} selected={options} onAdd={vi.fn()} onRemove={vi.fn()} />);
		fireEvent.click(screen.getByRole("button", { name: /care selector/i }));
		expect(screen.getByRole("button", { name: "Done" })).toBeInTheDocument();
		expect(screen.getByText(/all options selected/i)).toBeInTheDocument();
	});
});
