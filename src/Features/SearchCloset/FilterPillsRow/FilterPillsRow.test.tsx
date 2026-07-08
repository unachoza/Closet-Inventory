import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import FilterPillsRow from "./FilterPillsRow";
import type { FilterState } from "../../../hooks/useClosetFilters";

const emptyFilters: FilterState = {
	category: [],
	color: [],
	brand: [],
	material: [],
	occasion: [],
	care: [],
	status: [],
	location: [],
};

const activeFilters: FilterState = {
	...emptyFilters,
	category: ["tops"],
	color: ["Black", "White"],
};

describe("FilterPillsRow", () => {
	it("renders nothing when no filters are active", () => {
		const { container } = render(
			<FilterPillsRow filters={emptyFilters} activeFilterCount={0} onRemove={vi.fn()} onClearAll={vi.fn()} />,
		);
		expect(container.firstChild).toBeNull();
	});

	it("renders a pill for each active filter value", () => {
		render(
			<FilterPillsRow filters={activeFilters} activeFilterCount={3} onRemove={vi.fn()} onClearAll={vi.fn()} />,
		);
		expect(screen.getByText("tops")).toBeInTheDocument();
		expect(screen.getByText("Black")).toBeInTheDocument();
		expect(screen.getByText("White")).toBeInTheDocument();
	});

	it("calls onRemove with the correct dimension and value when X is clicked", () => {
		const onRemove = vi.fn();
		render(
			<FilterPillsRow filters={activeFilters} activeFilterCount={3} onRemove={onRemove} onClearAll={vi.fn()} />,
		);
		fireEvent.click(screen.getByLabelText("Remove tops filter"));
		expect(onRemove).toHaveBeenCalledWith("category", "tops");
	});

	it("calls onClearAll when Clear all is clicked", () => {
		const onClearAll = vi.fn();
		render(
			<FilterPillsRow filters={activeFilters} activeFilterCount={3} onRemove={vi.fn()} onClearAll={onClearAll} />,
		);
		fireEvent.click(screen.getByRole("button", { name: /clear all/i }));
		expect(onClearAll).toHaveBeenCalled();
	});
});
