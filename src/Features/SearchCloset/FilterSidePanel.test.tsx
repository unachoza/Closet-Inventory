import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import FilterSidePanel from "./FilterSidePanel";
import type { FilterState, FilterOptions } from "../../hooks/useClosetFilters";

const emptyFilters: FilterState = {
	category: [],
	color: [],
	brand: [],
	material: [],
	occasion: [],
};

const filterOptions: FilterOptions = {
	category: [{ value: "tops", count: 3 }],
	color: [{ value: "Black", count: 2 }],
	brand: [],
	material: [],
	occasion: [],
};

const baseProps = {
	filters: emptyFilters,
	filterOptions,
	activeFilterCount: 0,
	onToggle: vi.fn(),
	onClearAll: vi.fn(),
};

describe("FilterSidePanel", () => {
	it("panel is not visible when open is false", () => {
		render(<FilterSidePanel {...baseProps} open={false} onClose={vi.fn()} />);
		const panel = screen.getByRole("dialog", { hidden: true });
		expect(panel).not.toHaveClass("filter-side-panel--open");
	});

	it("panel is visible when open is true", () => {
		render(<FilterSidePanel {...baseProps} open={true} onClose={vi.fn()} />);
		const panel = screen.getByRole("dialog");
		expect(panel).toHaveClass("filter-side-panel--open");
	});

	it("close button calls onClose", () => {
		const onClose = vi.fn();
		render(<FilterSidePanel {...baseProps} open={true} onClose={onClose} />);
		fireEvent.click(screen.getByRole("button", { name: /close filters/i }));
		expect(onClose).toHaveBeenCalled();
	});

	it("pressing Escape calls onClose", () => {
		const onClose = vi.fn();
		render(<FilterSidePanel {...baseProps} open={true} onClose={onClose} />);
		fireEvent.keyDown(window, { key: "Escape" });
		expect(onClose).toHaveBeenCalled();
	});

	it("clicking the backdrop calls onClose", () => {
		const onClose = vi.fn();
		render(<FilterSidePanel {...baseProps} open={true} onClose={onClose} />);
		fireEvent.click(document.querySelector(".filter-panel-backdrop")!);
		expect(onClose).toHaveBeenCalled();
	});

	it("Done button calls onClose", () => {
		const onClose = vi.fn();
		render(<FilterSidePanel {...baseProps} open={true} onClose={onClose} />);
		fireEvent.click(screen.getByRole("button", { name: /done/i }));
		expect(onClose).toHaveBeenCalled();
	});

	it("Clear all button is disabled when no filters are active", () => {
		render(<FilterSidePanel {...baseProps} open={true} onClose={vi.fn()} activeFilterCount={0} />);
		expect(screen.getByRole("button", { name: /clear all/i })).toBeDisabled();
	});

	it("Clear all button shows count and is enabled when filters are active", () => {
		render(<FilterSidePanel {...baseProps} open={true} onClose={vi.fn()} activeFilterCount={2} />);
		const btn = screen.getByRole("button", { name: /clear all \(2\)/i });
		expect(btn).not.toBeDisabled();
	});
});
