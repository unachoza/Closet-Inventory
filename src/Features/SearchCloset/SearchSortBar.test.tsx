import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import SearchSortBar from "./SearchSortBar";
import { SORT_LABELS } from "../../hooks/useClosetSort";

const baseProps = {
	sortKey: "dateAdded" as const,
	onSortChange: vi.fn(),
	showFilters: false,
	onToggleFilters: vi.fn(),
	activeFilterCount: 0,
};

describe("SearchSortBar", () => {
	it("renders all sort options in the select", () => {
		render(<SearchSortBar {...baseProps} />);
		Object.values(SORT_LABELS).forEach((label) => {
			expect(screen.getByRole("option", { name: label })).toBeInTheDocument();
		});
	});

	it("changing the sort select calls onSortChange with the selected key", () => {
		const onSortChange = vi.fn();
		render(<SearchSortBar {...baseProps} onSortChange={onSortChange} />);
		fireEvent.change(screen.getByRole("combobox", { name: /sort items/i }), {
			target: { value: "nameAZ" },
		});
		expect(onSortChange).toHaveBeenCalledWith("nameAZ");
	});

	it("filter button calls onToggleFilters when clicked", () => {
		const onToggleFilters = vi.fn();
		render(<SearchSortBar {...baseProps} onToggleFilters={onToggleFilters} />);
		fireEvent.click(screen.getByRole("button", { name: /filters/i }));
		expect(onToggleFilters).toHaveBeenCalled();
	});

	it("shows active filter count badge when filters are applied", () => {
		render(<SearchSortBar {...baseProps} activeFilterCount={3} />);
		expect(screen.getByLabelText("3 active")).toBeInTheDocument();
	});

	it("does not show badge when no filters are active", () => {
		render(<SearchSortBar {...baseProps} activeFilterCount={0} />);
		expect(screen.queryByLabelText(/active/i)).not.toBeInTheDocument();
	});
});
