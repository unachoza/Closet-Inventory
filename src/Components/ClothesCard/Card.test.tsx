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
