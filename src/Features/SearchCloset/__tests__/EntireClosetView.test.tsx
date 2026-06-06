/**
 * EntireClosetView integration tests.
 *
 * FilteredItemGrid uses AnimatePresence mode="wait" which holds the old item
 * list in the DOM during exit animations. In jsdom those animations never
 * complete so we mock FilteredItemGrid to a plain counter — what we're testing
 * here is the data pipeline (filter → search → sort), not the animation layer.
 */
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { SearchProvider } from "../../../context/SearchContext";
import { ViewProvider } from "../../../context/ViewContext";
import EntireClosetView from "../EntireClosetView";
import type { ClothingItem } from "../../../utils/types";

// ── Mocks ─────────────────────────────────────────────────────────────────────
// Render a simple count + list so we can assert on filtered/sorted output
vi.mock("../FilteredItemGrid", () => ({
	default: ({ items }: { items: ClothingItem[] }) => (
		<div data-testid="item-grid">
			{items.map((item) => (
				<div key={item.id} data-testid="card" data-category={item.category}>
					{item.name}
				</div>
			))}
		</div>
	),
}));

const CLOSET: ClothingItem[] = [
	{
		id: "1", name: "Nike Top", brand: "Nike", category: "tops",
		color: "black", size: "M", material: "cotton", occasion: "casual",
		age: "new", care: "machine wash", imageURL: "", price: "$30",
	},
	{
		id: "2", name: "Zara Dress", brand: "Zara", category: "dresses",
		color: "red", size: "S", material: "silk", occasion: "formal",
		age: "1 year", care: "dry clean", imageURL: "", price: "$80",
	},
	{
		id: "3", name: "Levi Jeans", brand: "Levi's", category: "bottoms",
		color: "blue", size: "28", material: "denim", occasion: "casual",
		age: "2 years", care: "machine wash", imageURL: "", price: "$60",
	},
];

vi.mock("../../../hooks/useLocalCloset", () => ({
	useLocalStorageCloset: () => ({ closet: CLOSET }),
}));

// ── Helpers ───────────────────────────────────────────────────────────────────
function renderView() {
	return render(
		<ViewProvider>
			<SearchProvider>
				<EntireClosetView />
			</SearchProvider>
		</ViewProvider>,
	);
}

beforeEach(() => vi.clearAllMocks());

// ── Tests ─────────────────────────────────────────────────────────────────────
describe("EntireClosetView — data pipeline", () => {
	it("renders all closet items on load", () => {
		renderView();
		expect(screen.getAllByTestId("card")).toHaveLength(3);
	});

	it("applying a category filter narrows displayed items", () => {
		renderView();
		fireEvent.click(screen.getByRole("button", { name: /filters/i }));
		// Accordion starts collapsed — expand it
		fireEvent.click(screen.getByRole("button", { name: /^category$/i }));
		// Checkbox label includes the count: "tops (1)"
		fireEvent.click(screen.getByRole("checkbox", { name: /^tops/i }));

		expect(screen.getAllByTestId("card")).toHaveLength(1);
		expect(screen.getByText("Nike Top")).toBeInTheDocument();
	});

	it("filter pills appear after a filter is applied", () => {
		renderView();
		fireEvent.click(screen.getByRole("button", { name: /filters/i }));
		fireEvent.click(screen.getByRole("button", { name: /^category$/i }));
		fireEvent.click(screen.getByRole("checkbox", { name: /^dresses/i }));

		expect(screen.getByLabelText("Remove dresses filter")).toBeInTheDocument();
	});

	it("Clear all resets filters and restores all items", () => {
		renderView();
		// Apply filter
		fireEvent.click(screen.getByRole("button", { name: /filters/i }));
		fireEvent.click(screen.getByRole("button", { name: /^category$/i }));
		fireEvent.click(screen.getByRole("checkbox", { name: /^tops/i }));
		expect(screen.getAllByTestId("card")).toHaveLength(1);

		// The pill row "Clear all" button (not the disabled panel footer one)
		fireEvent.click(screen.getByLabelText("Active filters").querySelector("button:last-child")!);
		expect(screen.getAllByTestId("card")).toHaveLength(3);
	});

	it("sort A→Z changes the display order", () => {
		renderView();
		fireEvent.change(screen.getByRole("combobox", { name: /sort items/i }), {
			target: { value: "nameAZ" },
		});
		const cards = screen.getAllByTestId("card");
		// Alphabetical: Levi Jeans < Nike Top < Zara Dress
		expect(cards[0]).toHaveTextContent("Levi Jeans");
		expect(cards[1]).toHaveTextContent("Nike Top");
		expect(cards[2]).toHaveTextContent("Zara Dress");
	});

	it("sort Z→A reverses alphabetical order", () => {
		renderView();
		fireEvent.change(screen.getByRole("combobox", { name: /sort items/i }), {
			target: { value: "nameZA" },
		});
		const cards = screen.getAllByTestId("card");
		expect(cards[0]).toHaveTextContent("Zara Dress");
		expect(cards[2]).toHaveTextContent("Levi Jeans");
	});

	it("filter + sort work together", () => {
		renderView();
		// Filter to casual items (Nike Top + Levi Jeans)
		fireEvent.click(screen.getByRole("button", { name: /filters/i }));
		fireEvent.click(screen.getByRole("button", { name: /^occasion$/i }));
		fireEvent.click(screen.getByRole("checkbox", { name: /^casual/i }));
		expect(screen.getAllByTestId("card")).toHaveLength(2);

		// Sort Z→A: Nike Top before Levi Jeans
		fireEvent.change(screen.getByRole("combobox", { name: /sort items/i }), {
			target: { value: "nameZA" },
		});
		const cards = screen.getAllByTestId("card");
		expect(cards[0]).toHaveTextContent("Nike Top");
		expect(cards[1]).toHaveTextContent("Levi Jeans");
	});
});
