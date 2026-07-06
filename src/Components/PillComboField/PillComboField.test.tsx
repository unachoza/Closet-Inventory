import { render, screen, fireEvent } from "@testing-library/react";
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
});
