import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import FilterAccordion from "./FilterAccordion";
import type { FilterOption } from "../../hooks/useClosetFilters";

const options: FilterOption[] = [
	{ value: "tops", count: 5 },
	{ value: "dresses", count: 3 },
];

describe("FilterAccordion", () => {
	it("is collapsed by default and shows no options", () => {
		render(<FilterAccordion label="Category" options={options} selected={[]} onToggle={vi.fn()} />);
		expect(screen.queryByText("tops")).not.toBeInTheDocument();
	});

	it("expands and shows options on header click", () => {
		render(<FilterAccordion label="Category" options={options} selected={[]} onToggle={vi.fn()} />);
		fireEvent.click(screen.getByRole("button", { name: /category/i }));
		expect(screen.getByText("tops")).toBeInTheDocument();
		expect(screen.getByText("dresses")).toBeInTheDocument();
	});

	it("shows option counts", () => {
		render(<FilterAccordion label="Category" options={options} selected={[]} onToggle={vi.fn()} defaultOpen />);
		expect(screen.getByText("(5)")).toBeInTheDocument();
		expect(screen.getByText("(3)")).toBeInTheDocument();
	});

	it("calls onToggle with the correct value when a checkbox is clicked", () => {
		const onToggle = vi.fn();
		render(<FilterAccordion label="Category" options={options} selected={[]} onToggle={onToggle} defaultOpen />);
		fireEvent.click(screen.getByRole("checkbox", { name: /tops/i }));
		expect(onToggle).toHaveBeenCalledWith("tops");
	});

	it("shows selected count badge on the header when selections are active", () => {
		render(<FilterAccordion label="Category" options={options} selected={["tops", "dresses"]} onToggle={vi.fn()} />);
		expect(screen.getByText("2")).toBeInTheDocument();
	});

	it("collapses again on second header click", () => {
		render(<FilterAccordion label="Category" options={options} selected={[]} onToggle={vi.fn()} />);
		const header = screen.getByRole("button", { name: /category/i });
		fireEvent.click(header); // expand
		fireEvent.click(header); // collapse
		expect(screen.queryByText("tops")).not.toBeInTheDocument();
	});

	it("renders nothing when options array is empty", () => {
		const { container } = render(<FilterAccordion label="Category" options={[]} selected={[]} onToggle={vi.fn()} />);
		expect(container.firstChild).toBeNull();
	});
});
