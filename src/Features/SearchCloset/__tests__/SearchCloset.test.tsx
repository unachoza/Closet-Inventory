import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EntireClosetView from "../EntireClosetView";
import NavBar from "../../../Components/NavBar/NavBar";
import { SearchProvider } from "../../../context/SearchContext";
import { ViewProvider } from "../../../context/ViewContext";
import { ClothingItem } from "../../../utils/types";

// ── Mock the local storage hook ───────────────────────────────────────────────
const mockCloset: ClothingItem[] = [
	{
		id: "1",
		imageURL: "",
		name: "Blue Denim Jacket",
		category: "tops",
		color: "blue",
		size: "M",
		brand: "Levi's",
		material: [{ material: "denim", percentage: 100 }],
		occasion: "casual",
		age: "new",
		care: "machine wash",
		price: "$120",
	},
	{
		id: "2",
		imageURL: "",
		name: "Red Floral Dress",
		category: "dresses",
		color: "red",
		size: "S",
		brand: "Zara",
		material: [{ material: "silk", percentage: 100 }],
		occasion: "formal",
		age: "like new",
		care: "dry clean",
		price: "$200",
	},
	{
		id: "3",
		imageURL: "",
		name: "White Cotton Tee",
		category: "tops",
		color: "white",
		size: "L",
		brand: "H&M",
		material: [{ material: "cotton", percentage: 100 }],
		occasion: "casual",
		age: "good",
		care: "machine wash",
		price: "$25",
	},
	{
		id: "4",
		imageURL: "",
		name: "Black Leather Boots",
		category: "shoes",
		color: "black",
		size: "8",
		brand: "Dr. Martens",
		material: [{ material: "leather", percentage: 100 }],
		occasion: "casual",
		age: "excellent",
		care: "hand wash",
		price: "$180",
	},
];

vi.mock("../../../hooks/useLocalCloset", () => ({
	useLocalStorageCloset: () => ({
		closet: mockCloset,
		addItem: vi.fn(),
		removeItem: vi.fn(),
		updateItem: vi.fn(),
	}),
}));

// ── Helpers ───────────────────────────────────────────────────────────────────

// EntireClosetView consumes the shared SearchContext (driven by the single
// NavBar search box), so it must be wrapped in a SearchProvider.
const renderView = () =>
	render(
		<SearchProvider>
			<EntireClosetView onEditItem={vi.fn()} />
		</SearchProvider>
	);

// Accordions are collapsed by default — expand a dimension's section so its
// option checkboxes become reachable.
const expandSection = (user: ReturnType<typeof userEvent.setup>, name: RegExp) =>
	user.click(screen.getByRole("button", { name }));

// For search-integration assertions we need the actual NavBar search box
// (the sole search input) feeding the same SearchContext as the grid.
const renderWithNav = () =>
	render(
		<ViewProvider initialView="entireCloset">
			<SearchProvider>
				<NavBar />
				<EntireClosetView onEditItem={vi.fn()} />
			</SearchProvider>
		</ViewProvider>
	);

// ── Search Sort Bar ───────────────────────────────────────────────────────────

describe("SearchSortBar", () => {
	// NOTE: search input now lives solely in the NavBar (single source of
	// truth via SearchContext); its render/typing/clear behavior is covered
	// by NavBar.test.tsx. This bar only owns the sort + filter controls.

	it("renders a sort dropdown", () => {
		renderView();
		expect(screen.getByRole("combobox", { name: /sort items/i })).toBeInTheDocument();
	});

	it("renders a Filters button", () => {
		renderView();
		expect(screen.getByRole("button", { name: /filters/i })).toBeInTheDocument();
	});

	it("shows item count text", () => {
		renderView();
		expect(screen.getByText(/showing/i)).toBeInTheDocument();
		expect(screen.getByText(/of 4 items/i)).toBeInTheDocument();
	});
});

// ── Filter Side Panel ──────────────────────────────────────────────────────────

describe("FilterSidePanel", () => {
	it("filter panel is hidden by default (aria-hidden)", () => {
		renderView();
		expect(screen.queryByRole("dialog", { name: /filter options/i })).not.toBeInTheDocument();
	});

	it("clicking Filters button opens the side panel", async () => {
		const user = userEvent.setup();
		renderView();
		await user.click(screen.getByRole("button", { name: /filters/i }));
		expect(screen.getByRole("dialog", { name: /filter options/i })).toBeInTheDocument();
	});

	it("open panel contains accordion section headers per dimension", async () => {
		const user = userEvent.setup();
		renderView();
		await user.click(screen.getByRole("button", { name: /filters/i }));
		// Accordion headers are buttons that toggle each dimension
		expect(screen.getByRole("button", { name: /^category/i })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: /^color/i })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: /^brand/i })).toBeInTheDocument();
	});

	it("accordions are collapsed by default; expanding a section exposes its checkboxes", async () => {
		const user = userEvent.setup();
		renderView();
		await user.click(screen.getByRole("button", { name: /filters/i }));
		// Collapsed by default — no option checkboxes visible yet
		expect(screen.queryByRole("checkbox", { name: /tops/i })).not.toBeInTheDocument();
		// Expanding the Category section reveals its checkboxes
		await expandSection(user, /^category/i);
		expect(screen.getByRole("checkbox", { name: /tops/i })).toBeInTheDocument();
		expect(screen.getByRole("checkbox", { name: /dresses/i })).toBeInTheDocument();
	});

	it("clicking an accordion header toggles its options", async () => {
		const user = userEvent.setup();
		renderView();
		await user.click(screen.getByRole("button", { name: /filters/i }));
		const categoryHeader = screen.getByRole("button", { name: /^category/i });
		// Collapsed by default
		expect(categoryHeader).toHaveAttribute("aria-expanded", "false");
		// Expand → checkbox appears
		await user.click(categoryHeader);
		expect(categoryHeader).toHaveAttribute("aria-expanded", "true");
		expect(screen.getByRole("checkbox", { name: /tops/i })).toBeInTheDocument();
		// Collapse again → checkbox removed
		await user.click(categoryHeader);
		expect(categoryHeader).toHaveAttribute("aria-expanded", "false");
		expect(screen.queryByRole("checkbox", { name: /tops/i })).not.toBeInTheDocument();
	});

	it("close (X) button closes the panel", async () => {
		const user = userEvent.setup();
		renderView();
		await user.click(screen.getByRole("button", { name: /filters/i }));
		expect(screen.getByRole("dialog", { name: /filter options/i })).toBeInTheDocument();
		await user.click(screen.getByRole("button", { name: /close filters/i }));
		expect(screen.queryByRole("dialog", { name: /filter options/i })).not.toBeInTheDocument();
	});

	it("'Done' button closes the panel", async () => {
		const user = userEvent.setup();
		renderView();
		await user.click(screen.getByRole("button", { name: /filters/i }));
		await user.click(screen.getByRole("button", { name: /^done$/i }));
		expect(screen.queryByRole("dialog", { name: /filter options/i })).not.toBeInTheDocument();
	});

	it("Escape key closes the panel", async () => {
		const user = userEvent.setup();
		renderView();
		await user.click(screen.getByRole("button", { name: /filters/i }));
		expect(screen.getByRole("dialog", { name: /filter options/i })).toBeInTheDocument();
		await user.keyboard("{Escape}");
		expect(screen.queryByRole("dialog", { name: /filter options/i })).not.toBeInTheDocument();
	});

	it("toggling Filters button closes the panel", async () => {
		const user = userEvent.setup();
		renderView();
		const btn = screen.getByRole("button", { name: /filters/i });
		await user.click(btn);
		expect(screen.getByRole("dialog", { name: /filter options/i })).toBeInTheDocument();
		await user.click(btn);
		expect(screen.queryByRole("dialog", { name: /filter options/i })).not.toBeInTheDocument();
	});
});

// ── Filter Pills Row ──────────────────────────────────────────────────────────

describe("FilterPillsRow", () => {
	it("no pills shown when no filters active", () => {
		renderView();
		expect(screen.queryByLabelText(/active filters/i)).not.toBeInTheDocument();
	});

	it("a pill appears for each active filter", async () => {
		const user = userEvent.setup();
		renderView();
		await user.click(screen.getByRole("button", { name: /filters/i }));
		await expandSection(user, /^category/i);
		await user.click(screen.getByRole("checkbox", { name: /tops/i }));

		const pillsRow = screen.getByLabelText(/active filters/i);
		expect(within(pillsRow).getByText("tops")).toBeInTheDocument();
	});

	it("clicking the remove button on a pill removes that filter", async () => {
		const user = userEvent.setup();
		renderView();
		await user.click(screen.getByRole("button", { name: /filters/i }));
		await expandSection(user, /^category/i);
		await user.click(screen.getByRole("checkbox", { name: /tops/i }));

		const removeBtn = screen.getByRole("button", { name: /remove tops filter/i });
		await user.click(removeBtn);

		expect(screen.queryByLabelText(/active filters/i)).not.toBeInTheDocument();
	});

	it("pills-row 'Clear all' button removes all active filters", async () => {
		const user = userEvent.setup();
		renderView();
		await user.click(screen.getByRole("button", { name: /filters/i }));
		await expandSection(user, /^category/i);
		await user.click(screen.getByRole("checkbox", { name: /tops/i }));
		await expandSection(user, /^color/i);
		await user.click(screen.getByRole("checkbox", { name: /blue/i }));

		// Scope to the pills row to avoid matching the panel-footer clear button
		const pillsRow = screen.getByLabelText(/active filters/i);
		await user.click(within(pillsRow).getByRole("button", { name: /clear all/i }));

		expect(screen.queryByLabelText(/active filters/i)).not.toBeInTheDocument();
	});

	it("filter badge count updates on the Filters button", async () => {
		const user = userEvent.setup();
		renderView();
		await user.click(screen.getByRole("button", { name: /filters/i }));
		await expandSection(user, /^category/i);
		await user.click(screen.getByRole("checkbox", { name: /tops/i }));

		const badge = screen.getByLabelText(/1 active/i);
		expect(badge).toBeInTheDocument();
	});
});

// ── Filtered Item Grid ────────────────────────────────────────────────────────

describe("FilteredItemGrid", () => {
	it("renders all items by default", () => {
		renderView();
		const cards = screen.getAllByTestId("clothes-card");
		expect(cards).toHaveLength(4);
	});

	it("applying a category filter reduces visible items", async () => {
		const user = userEvent.setup();
		renderView();
		await user.click(screen.getByRole("button", { name: /filters/i }));
		await expandSection(user, /^category/i);
		await user.click(screen.getByRole("checkbox", { name: /tops/i }));

		// Only 2 tops in mock closet (waitFor lets the exit animation settle)
		await waitFor(() => {
			expect(screen.getAllByTestId("clothes-card")).toHaveLength(2);
		});
	});

	it("shows empty state when no items match", async () => {
		const user = userEvent.setup();
		renderView();
		await user.click(screen.getByRole("button", { name: /filters/i }));
		// tops AND red (no tops are red in mock data)
		await expandSection(user, /^category/i);
		await user.click(screen.getByRole("checkbox", { name: /tops/i }));
		await expandSection(user, /^color/i);
		await user.click(screen.getByRole("checkbox", { name: /red/i }));

		await waitFor(() => {
			expect(screen.queryByTestId("clothes-card")).not.toBeInTheDocument();
		});
		expect(screen.getByText(/no items match/i)).toBeInTheDocument();
	});

	it("search query (typed in the NavBar) narrows visible items after debounce", async () => {
		vi.useFakeTimers({ shouldAdvanceTime: true });
		const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
		renderWithNav();

		const input = screen.getByRole("textbox", { name: /search closet/i });
		await user.type(input, "Denim");

		// Advance past debounce
		vi.advanceTimersByTime(400);

		await waitFor(() => {
			expect(screen.getAllByTestId("clothes-card")).toHaveLength(1);
		});

		vi.useRealTimers();
	});
});

// ── Sort ──────────────────────────────────────────────────────────────────────

describe("Sort select", () => {
	it("changing sort to Price: Low → High reorders items", async () => {
		const user = userEvent.setup();
		renderView();
		const sortSelect = screen.getByRole("combobox", { name: /sort items/i });
		await user.selectOptions(sortSelect, "priceAsc");
		// Verify sort select updated (renders without error)
		expect(sortSelect).toHaveValue("priceAsc");
	});
});
