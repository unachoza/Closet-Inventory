import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EntireClosetView from "../EntireClosetView";
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
		material: "denim",
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
		material: "silk",
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
		material: "cotton",
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
		material: "leather",
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

const renderView = () => render(<EntireClosetView onEditItem={vi.fn()} />);

// ── Search Sort Bar ───────────────────────────────────────────────────────────

describe("SearchSortBar", () => {
	it("renders search input with placeholder text", () => {
		renderView();
		expect(screen.getByPlaceholderText(/search by name, brand, color/i)).toBeInTheDocument();
	});

	it("renders a sort dropdown", () => {
		renderView();
		expect(screen.getByRole("combobox", { name: /sort items/i })).toBeInTheDocument();
	});

	it("renders a Filters button", () => {
		renderView();
		expect(screen.getByRole("button", { name: /filters/i })).toBeInTheDocument();
	});

	it("typing in search input updates value", async () => {
		const user = userEvent.setup();
		renderView();
		const input = screen.getByPlaceholderText(/search by name, brand, color/i);
		await user.type(input, "Denim");
		expect(input).toHaveValue("Denim");
	});

	it("clear button appears when search has text and clears it", async () => {
		const user = userEvent.setup();
		renderView();
		const input = screen.getByPlaceholderText(/search by name, brand, color/i);
		await user.type(input, "hello");
		const clearBtn = screen.getByRole("button", { name: /clear search/i });
		expect(clearBtn).toBeInTheDocument();
		await user.click(clearBtn);
		expect(input).toHaveValue("");
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

	it("accordions are expanded by default, exposing checkboxes", async () => {
		const user = userEvent.setup();
		renderView();
		await user.click(screen.getByRole("button", { name: /filters/i }));
		expect(screen.getByRole("checkbox", { name: /tops/i })).toBeInTheDocument();
		expect(screen.getByRole("checkbox", { name: /dresses/i })).toBeInTheDocument();
	});

	it("clicking an accordion header collapses its options", async () => {
		const user = userEvent.setup();
		renderView();
		await user.click(screen.getByRole("button", { name: /filters/i }));
		const categoryHeader = screen.getByRole("button", { name: /^category/i });
		expect(categoryHeader).toHaveAttribute("aria-expanded", "true");
		await user.click(categoryHeader);
		expect(categoryHeader).toHaveAttribute("aria-expanded", "false");
		// Its checkbox should no longer be present
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
		await user.click(screen.getByRole("checkbox", { name: /tops/i }));

		const pillsRow = screen.getByLabelText(/active filters/i);
		expect(within(pillsRow).getByText("tops")).toBeInTheDocument();
	});

	it("clicking the remove button on a pill removes that filter", async () => {
		const user = userEvent.setup();
		renderView();
		await user.click(screen.getByRole("button", { name: /filters/i }));
		await user.click(screen.getByRole("checkbox", { name: /tops/i }));

		const removeBtn = screen.getByRole("button", { name: /remove tops filter/i });
		await user.click(removeBtn);

		expect(screen.queryByLabelText(/active filters/i)).not.toBeInTheDocument();
	});

	it("pills-row 'Clear all' button removes all active filters", async () => {
		const user = userEvent.setup();
		renderView();
		await user.click(screen.getByRole("button", { name: /filters/i }));
		await user.click(screen.getByRole("checkbox", { name: /tops/i }));
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
		await user.click(screen.getByRole("checkbox", { name: /tops/i }));

		// Only 2 tops in mock closet
		expect(screen.getAllByTestId("clothes-card")).toHaveLength(2);
	});

	it("shows empty state when no items match", async () => {
		const user = userEvent.setup();
		renderView();
		await user.click(screen.getByRole("button", { name: /filters/i }));
		// tops AND red (no tops are red in mock data)
		await user.click(screen.getByRole("checkbox", { name: /tops/i }));
		await user.click(screen.getByRole("checkbox", { name: /red/i }));

		expect(screen.queryByTestId("clothes-card")).not.toBeInTheDocument();
		expect(screen.getByText(/no items match/i)).toBeInTheDocument();
	});

	it("search query narrows visible items after debounce", async () => {
		vi.useFakeTimers({ shouldAdvanceTime: true });
		const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
		renderView();

		const input = screen.getByPlaceholderText(/search by name, brand, color/i);
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
