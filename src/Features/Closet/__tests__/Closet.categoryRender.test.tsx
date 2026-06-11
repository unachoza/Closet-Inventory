import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MY_CLOSET_DATA } from "../../../utils/constants";
import Closet from "./../Closet";

/**
 * Regression tests for the carousel "click category → blank screen" bug.
 *
 * The carousel sends Title-Cased, plural labels ("Coats") while the seed data
 * uses singular, lower-case categories ("coat"). Closet must always render
 * EITHER matching cards OR a "no items" message for every category — never a
 * blank screen. Uses the REAL filter + REAL pagination (only the card and
 * storage hook are stubbed) so the actual matching + render path is exercised.
 */
vi.mock("../../Components/ClothesCard/Card/Card", () => ({
	default: ({ item }: { item: any }) => <div data-testid="clothes-card">{item.name}</div>,
}));

vi.mock("../../hooks/useLocalCloset", () => ({
	useLocalStorageCloset: () => ({ closet: MY_CLOSET_DATA, removeItem: vi.fn() }),
}));

// Labels exactly as the Carousel passes them via setCategory(item.label)
const carouselLabels = [
	"Tops",
	"Bottoms",
	"Dresses",
	"Coats",
	"Sweaters",
	"Athleisure",
	"Lingerie",
	"Socks",
	"Underwear",
	"body",
	"Shoes",
	"Sleep",
];

describe("Closet — carousel category clicks never blank the screen", () => {
	it.each(carouselLabels)("renders cards or a no-items message for '%s'", (label) => {
		render(<Closet selectedCategory={label} />);
		const cards = screen.queryAllByTestId("clothes-card");
		const noResults = screen.queryByText(/No items found/);
		expect(cards.length > 0 || noResults !== null).toBe(true);
	});

	it("shows coat items for 'Coats' (singular/plural mismatch handled)", () => {
		render(<Closet selectedCategory="Coats" />);
		expect(screen.getAllByTestId("clothes-card").length).toBeGreaterThan(0);
	});

	it("shows sweater items for 'Sweaters'", () => {
		render(<Closet selectedCategory="Sweaters" />);
		expect(screen.getAllByTestId("clothes-card").length).toBeGreaterThan(0);
	});

	it("shows an explicit empty-state for a category with no items ('Sleep')", () => {
		render(<Closet selectedCategory="Sleep" />);
		expect(screen.queryAllByTestId("clothes-card")).toHaveLength(0);
		expect(screen.getByText(/No items found for "Sleep"/)).toBeInTheDocument();
	});

	// The REAL carousel scenario is a transition, not a fresh mount.
	it("renders content after transitioning null → 'Coats'", () => {
		const { rerender } = render(<Closet selectedCategory={null} />);
		rerender(<Closet selectedCategory="Coats" />);
		expect(screen.getAllByTestId("clothes-card").length).toBeGreaterThan(0);
	});

	it("renders content after transitioning 'Tops' → 'Sweaters'", () => {
		const { rerender } = render(<Closet selectedCategory="Tops" />);
		rerender(<Closet selectedCategory="Sweaters" />);
		const cards = screen.queryAllByTestId("clothes-card");
		const noResults = screen.queryByText(/No items found/);
		expect(cards.length > 0 || noResults !== null).toBe(true);
	});
});
