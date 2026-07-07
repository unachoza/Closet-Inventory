import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

vi.mock("../../../Components/ClothesCard/Card/Card", () => ({
	default: ({ item }: { item: { name: string } }) => <div data-testid="card">{item.name}</div>,
}));

vi.mock("../../../context/ClosetContext", () => ({
	useCloset: () => ({
		closet: [
			{ id: "1", name: "Nike Top", brand: "Nike", category: "tops", color: "black", material: [{ material: "cotton", percentage: 100 }], notes: [] },
			{ id: "2", name: "Zara Dress", brand: "Zara", category: "dresses", color: "red", material: [{ material: "silk", percentage: 100 }], notes: [] },
			{ id: "3", name: "Levi Jeans", brand: "Levi's", category: "bottoms", color: "blue", material: [{ material: "denim", percentage: 100 }], notes: [] },
		],
	}),
}));

import SearchBar from "./SearchBar";

describe("SearchBar", () => {
	it("renders all items on initial load", () => {
		render(<SearchBar />);
		expect(screen.getAllByTestId("card")).toHaveLength(3);
	});

	it("narrows results as the user types a query", () => {
		render(<SearchBar />);
		fireEvent.change(screen.getByPlaceholderText(/search items/i), { target: { value: "nike" } });
		expect(screen.getAllByTestId("card")).toHaveLength(1);
		expect(screen.getByText("Nike Top")).toBeInTheDocument();
	});

	it("shows no-results message when nothing matches", () => {
		render(<SearchBar />);
		fireEvent.change(screen.getByPlaceholderText(/search items/i), { target: { value: "xyzunknown" } });
		expect(screen.queryAllByTestId("card")).toHaveLength(0);
		expect(screen.getByText(/no items match/i)).toBeInTheDocument();
	});

	it("restores all items when query is cleared", () => {
		render(<SearchBar />);
		const input = screen.getByPlaceholderText(/search items/i);
		fireEvent.change(input, { target: { value: "nike" } });
		fireEvent.change(input, { target: { value: "" } });
		expect(screen.getAllByTestId("card")).toHaveLength(3);
	});

	it("shows result count text", () => {
		render(<SearchBar />);
		expect(screen.getByText(/showing/i)).toBeInTheDocument();
	});
});
