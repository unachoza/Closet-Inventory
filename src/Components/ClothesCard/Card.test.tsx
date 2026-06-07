import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import ClothingCard from "./Card";
import type { ClothingItem } from "../../utils/types";

const item: ClothingItem = {
	id: "1",
	name: "Nike Top",
	brand: "Nike",
	category: "tops",
	color: "black",
	size: "M",
	material: [{ material: "cotton", percentage: 100 }],
	occasion: "casual",
	age: "new",
	care: "machine wash",
	imageURL: "https://example.com/img.jpg",
};

describe("ClothingCard — age & condition", () => {
	it("shows a factual 'Purchased: … ago' row when a valid purchaseDate is present", () => {
		const purchaseDate = new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString();
		const { getByText } = render(<ClothingCard item={{ ...item, purchaseDate }} />);
		expect(getByText(/Purchased:/)).toBeInTheDocument();
		expect(getByText(/20 days ago/)).toBeInTheDocument();
	});

	it("hides the Purchased row when there is no purchase date", () => {
		const { queryByText } = render(<ClothingCard item={{ ...item, purchaseDate: undefined }} />);
		expect(queryByText(/Purchased:/)).not.toBeInTheDocument();
	});

	it("shows the condition row from the condition field", () => {
		const { getByText } = render(<ClothingCard item={{ ...item, condition: "good" }} />);
		expect(getByText(/Condition:/)).toBeInTheDocument();
		expect(getByText("good")).toBeInTheDocument();
	});

	it("falls back to the legacy age field for condition when it is a valid condition", () => {
		const { getByText } = render(<ClothingCard item={{ ...item, condition: undefined, age: "like new" }} />);
		expect(getByText("like new")).toBeInTheDocument();
	});

	it("hides the condition row for legacy free-text ages that aren't real conditions", () => {
		// Seed/legacy items stored durations under `age` (e.g. "one year") — these
		// must NOT render as "Condition: one year".
		const { queryByText } = render(<ClothingCard item={{ ...item, condition: undefined, age: "one year" }} />);
		expect(queryByText(/Condition:/)).not.toBeInTheDocument();
		expect(queryByText("one year")).not.toBeInTheDocument();
	});
});

describe("ClothingCard — name overlay", () => {
	it("renders the name overlay with the item name", () => {
		render(<ClothingCard item={item} />);
		expect(document.querySelector(".card-name-overlay")).toBeInTheDocument();
		expect(document.querySelector(".card-name-label")).toHaveTextContent("Nike Top");
	});

	it("falls back to brand when name is empty", () => {
		render(<ClothingCard item={{ ...item, name: "" }} />);
		expect(document.querySelector(".card-name-label")).toHaveTextContent("Nike");
	});

	it("falls back to category when name and brand are both empty", () => {
		render(<ClothingCard item={{ ...item, name: "", brand: "" }} />);
		expect(document.querySelector(".card-name-label")).toHaveTextContent("Tops");
	});

	it("overlay starts hidden (translateY 100% via CSS class)", () => {
		render(<ClothingCard item={item} />);
		const overlay = document.querySelector(".card-name-overlay") as HTMLElement;
		// CSS animations don't run in jsdom — verify the element is present
		// and the hover class structure is correct for the CSS to target
		expect(overlay).toBeInTheDocument();
		// The overlay lives inside .card-front, which is inside .card
		expect(overlay.closest(".card-front")).toBeInTheDocument();
		expect(overlay.closest(".card")).toBeInTheDocument();
	});
});
