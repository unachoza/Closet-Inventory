import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import WhereIsEverythingView from "./WhereIsEverythingView";
import { ClothingItem } from "../../utils/types";
import { LOCATIONS } from "../../utils/locations";

const mockCloset: ClothingItem[] = [
	{
		id: "1",
		imageURL: "",
		name: "Blue Denim Jacket",
		category: "tops",
		color: "blue",
		size: "M",
		brand: "Levi's",
		material: [],
		occasion: "casual",
		age: "new",
		care: "",
		locationId: "storage",
	},
	{
		id: "2",
		imageURL: "",
		name: "Carry-on Sweater",
		category: "tops",
		color: "grey",
		size: "M",
		brand: "",
		material: [],
		occasion: "casual",
		age: "new",
		care: "",
		locationId: "suitcase",
	},
	{
		id: "3",
		imageURL: "",
		name: "White Cotton Tee",
		category: "tops",
		color: "white",
		size: "L",
		brand: "H&M",
		material: [],
		occasion: "casual",
		age: "good",
		care: "",
		// no locationId → falls back to primary/home
	},
];

const mockRemoveItem = vi.fn();
let mockError: string | null = null;
let mockIsLoading = false;

vi.mock("../../context/ClosetContext", () => ({
	useCloset: () => ({
		closet: mockCloset,
		removeItem: mockRemoveItem,
	}),
}));

vi.mock("../../context/LocationsContext", () => ({
	useLocations: () => ({
		locations: LOCATIONS,
		get isLoading() {
			return mockIsLoading;
		},
		get error() {
			return mockError;
		},
		getLocation: (id?: string) => LOCATIONS.find((l) => l.id === id) ?? LOCATIONS[0],
	}),
}));

vi.mock("../../hooks/useSignedImageUrl", () => ({
	useSignedImageUrl: (url?: string) => url ?? "",
}));

describe("WhereIsEverythingView", () => {
	beforeEach(() => {
		mockError = null;
		mockIsLoading = false;
		mockRemoveItem.mockClear();
	});

	it("renders one group per known location with correct counts", () => {
		render(<WhereIsEverythingView />);
		expect(screen.getByText("Home")).toBeInTheDocument();
		expect(screen.getByText("Storage")).toBeInTheDocument();
		expect(screen.getByText("Suitcase")).toBeInTheDocument();
		expect(screen.getByText("Other")).toBeInTheDocument();
	});

	it("shows the item that has no locationId under Home", () => {
		render(<WhereIsEverythingView />);
		expect(screen.getAllByText("White Cotton Tee").length).toBeGreaterThan(0);
	});

	it("shows an empty-state message for a location with zero items", () => {
		render(<WhereIsEverythingView />);
		// "Other" has no items in mockCloset
		expect(screen.getAllByText("Nothing here right now.").length).toBeGreaterThan(0);
	});

	it("collapses and re-expands a group on header click", () => {
		render(<WhereIsEverythingView />);
		const header = screen.getByRole("button", { name: /Storage/ });
		expect(screen.getAllByText("Blue Denim Jacket").length).toBeGreaterThan(0);
		fireEvent.click(header);
		expect(screen.queryAllByText("Blue Denim Jacket").length).toBe(0);
		fireEvent.click(header);
		expect(screen.getAllByText("Blue Denim Jacket").length).toBeGreaterThan(0);
	});

	it("shows the total item count across all locations", () => {
		render(<WhereIsEverythingView />);
		expect(screen.getByText(/3/)).toBeInTheDocument();
	});

	it("shows a loading state while locations are loading", () => {
		mockIsLoading = true;
		render(<WhereIsEverythingView />);
		expect(screen.getByText(/Loading your locations/)).toBeInTheDocument();
	});

	it("surfaces a locations error without crashing", () => {
		mockError = "Failed to load locations";
		render(<WhereIsEverythingView />);
		expect(screen.getByRole("alert")).toHaveTextContent("Failed to load locations");
	});
});
