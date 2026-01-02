import { describe, it, expect, vi, Mock } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ClothingItem } from "../../utils/types";
import usePagination from "../../hooks/usePagination";
import Closet from "./Closet";

const mockCloset: ClothingItem[] = [
	{ id: "1", name: "black jeans", category: "bottoms" } as ClothingItem,
	{ id: "2", name: "black shirt", category: "tops" } as ClothingItem,
	{ id: "3", name: "white top", category: "tops" } as ClothingItem,
	{ id: "4", name: "white sheath", category: "dresses" } as ClothingItem,
	{ id: "5", name: "white ballgown", category: "dresses" } as ClothingItem,
];

const mockGoToPage = vi.fn();
const mockNextPage = vi.fn();
const mockPrevPage = vi.fn();

vi.mock("../../Components/ClothesCard/Card", () => ({
	default: ({ item }: { item: ClothingItem }) => <div data-testid="clothes-card">{item.name}</div>,
}));

vi.mock("../../hooks/useLocalCloset", () => ({
	useLocalStorageCloset: () => ({
		closet: mockCloset,
	}),
}));

vi.mock("../../hooks/usePagination", () => ({
	default: vi.fn(),
}));

const stablePaginationMock = {
	currentPage: 2,
	currentPageData: mockCloset,
	totalPages: 4,
	handleNextPage: mockNextPage,
	handlePrevPage: mockPrevPage,
	goToPage: mockGoToPage,
};

const mockUsePagination = (overrides = {}) => {
	vi.mocked(usePagination).mockImplementation(() => ({
		...stablePaginationMock,
		...overrides,
	}));
};

describe("Closet Integration Tests with Mocks", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockUsePagination(); 
	});

	it("only renders items that match the selected categroy", () => {
		vi.mocked(usePagination).mockImplementation((items) => ({
			currentPage: 1,
			currentPageData: items,
			totalPages: 1,
			handleNextPage: mockNextPage,
			handlePrevPage: mockPrevPage,
			goToPage: mockGoToPage,
		}));

		render(<Closet selectedCategory="tops" />);

		const cards = screen.getAllByTestId("clothes-card");
		const cardText = cards.map((card) => card.textContent);

		expect(cardText).toEqual(expect.arrayContaining(["black shirt", "white top"]));
		console.log(mockCloset);
		console.log({ cardText });
		expect(cardText).not.toContain("black jeans");
	});

	it("calls pagination handlers when clicking buttons", async () => {
		const user = userEvent.setup();

		render(<Closet selectedCategory="tops" />);
		const nextButton = screen.getByRole("button", { name: /next/i });
		const prevButton = screen.getByRole("button", { name: /previous/i });
		await user.click(nextButton);
		await user.click(prevButton);

		expect(mockNextPage).toHaveBeenCalledTimes(1);
		expect(mockPrevPage).toHaveBeenCalledTimes(1);
	});

	it("resets pagination when selectedCategory changes", () => {
		const { rerender } = render(<Closet selectedCategory="tops" />);

		rerender(<Closet selectedCategory="bottoms" />);

		expect(mockGoToPage).toHaveBeenCalledWith(1);
	});
});

// describe("Closet Component", () => {
// 	it("Should see clothing cards, no more than 9 with cool animation", () => {});
// 	it("Cards should be hoverable, to reveal details", () => {});
// 	it("Cards should be clickable to reveal back, with MORE BUTTON", () => {});
// });
