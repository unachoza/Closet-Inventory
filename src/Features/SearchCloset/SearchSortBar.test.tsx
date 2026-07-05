import { render, screen, fireEvent } from "@testing-library/react";
import { ReactNode } from "react";
import { describe, it, expect, vi } from "vitest";
import SearchSortBar from "./SearchSortBar";
import { SORT_LABELS } from "../../hooks/useClosetSort";
import { SearchProvider, useSearch } from "../../context/SearchContext";

const baseProps = {
	sortKey: "dateAdded" as const,
	onSortChange: vi.fn(),
	showFilters: false,
	onToggleFilters: vi.fn(),
	activeFilterCount: 0,
	borderMode: "off" as const,
	onCycleBorderMode: vi.fn(),
};

// SearchSortBar now reads/writes SearchContext, so it must render inside a
// provider. This probe surfaces the live query for assertions.
function SearchProbe() {
	const { searchQuery } = useSearch();
	return <div data-testid="current-query">{searchQuery}</div>;
}

function renderBar(props: Partial<typeof baseProps> = {}, children?: ReactNode) {
	return render(
		<SearchProvider>
			<SearchSortBar {...baseProps} {...props} />
			{children}
		</SearchProvider>,
	);
}

describe("SearchSortBar", () => {
	it("renders all sort options in the select", () => {
		renderBar();
		Object.values(SORT_LABELS).forEach((label) => {
			expect(screen.getByRole("option", { name: label })).toBeInTheDocument();
		});
	});

	it("changing the sort select calls onSortChange with the selected key", () => {
		const onSortChange = vi.fn();
		renderBar({ onSortChange });
		fireEvent.change(screen.getByRole("combobox", { name: /sort items/i }), {
			target: { value: "nameAZ" },
		});
		expect(onSortChange).toHaveBeenCalledWith("nameAZ");
	});

	it("filter button calls onToggleFilters when clicked", () => {
		const onToggleFilters = vi.fn();
		renderBar({ onToggleFilters });
		fireEvent.click(screen.getByRole("button", { name: /filters/i }));
		expect(onToggleFilters).toHaveBeenCalled();
	});

	it("border toggle sits between the search box and the Filters button", () => {
		renderBar();
		const borderBtn = screen.getByRole("button", { name: /card borders/i });
		const filterBtn = screen.getByRole("button", { name: /filters/i });
		// DOM order: search input → border toggle → filter button.
		expect(borderBtn.compareDocumentPosition(filterBtn) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
	});

	it("border toggle labels the current mode and calls onCycleBorderMode when clicked", () => {
		const onCycleBorderMode = vi.fn();
		renderBar({ borderMode: "location", onCycleBorderMode });
		const borderBtn = screen.getByRole("button", { name: /card borders/i });
		expect(borderBtn).toHaveTextContent("Location");
		fireEvent.click(borderBtn);
		expect(onCycleBorderMode).toHaveBeenCalled();
	});

	it("shows active filter count badge when filters are applied", () => {
		renderBar({ activeFilterCount: 3 });
		expect(screen.getByLabelText("3 active")).toBeInTheDocument();
	});

	it("does not show badge when no filters are active", () => {
		renderBar({ activeFilterCount: 0 });
		expect(screen.queryByLabelText(/active/i)).not.toBeInTheDocument();
	});

	describe("search input", () => {
		it("renders the search box on the same row as the filter and sort controls", () => {
			renderBar();
			const row = screen.getByRole("textbox", { name: /search closet/i }).closest(".search-sort-bar");
			expect(row).not.toBeNull();
			// Filter + sort controls share that same row container.
			expect(row).toContainElement(screen.getByRole("button", { name: /filters/i }));
			expect(row).toContainElement(screen.getByRole("combobox", { name: /sort items/i }));
		});

		it("writes the typed value into SearchContext", () => {
			renderBar({}, <SearchProbe />);
			fireEvent.change(screen.getByRole("textbox", { name: /search closet/i }), { target: { value: "linen" } });
			expect(screen.getByTestId("current-query")).toHaveTextContent("linen");
		});

		it("shows a clear button only when there is a query, and clears it on click", () => {
			renderBar({}, <SearchProbe />);
			expect(screen.queryByRole("button", { name: /clear search/i })).not.toBeInTheDocument();

			fireEvent.change(screen.getByRole("textbox", { name: /search closet/i }), { target: { value: "wool" } });
			const clear = screen.getByRole("button", { name: /clear search/i });
			expect(clear).toBeInTheDocument();

			fireEvent.click(clear);
			expect(screen.getByTestId("current-query")).toHaveTextContent("");
		});
	});
});
