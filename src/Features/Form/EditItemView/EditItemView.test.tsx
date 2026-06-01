import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import EditItemView from "./EditItemView";

// Accessible mock functions for assertions
const mockUpdateItem = vi.fn();
const mockAddItem = vi.fn();
const mockAddFullItem = vi.fn();
const mockShowToast = vi.fn();
const mockSetView = vi.fn();

vi.mock("../../../hooks/useLocalCloset", () => ({
	useLocalStorageCloset: () => ({
		updateItem: mockUpdateItem,
		addItem: mockAddItem,
		addFullItem: mockAddFullItem,
	}),
}));

vi.mock("../../../Components/Toast/Toast", () => ({
	useToast: () => ({
		showToast: mockShowToast,
	}),
}));

const mockItem = {
	id: "1",
	name: "Test Item",
	size: "M",
	brand: "Test Brand",
	// material is now MaterialBlend[] — the migration util also handles legacy strings,
	// but tests should use the canonical shape.
	material: [{ material: "cotton", percentage: 100 }],
	occasion: "Casual",
	age: "New",
	care: "Machine Wash",
	imageURL: "https://example.com/image.jpg",
	color: "Red",
	category: "Tops",
	price: "$20",
	onSale: true,
	notes: "This is a test item.",
};

describe("EditItemView", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("renders the form with pre-filled values", () => {
		render(<EditItemView item={mockItem} setView={mockSetView} />);
		expect(screen.getByLabelText("name")).toHaveValue(mockItem.name);
		expect(screen.getByLabelText("size")).toHaveValue(mockItem.size);
		expect(screen.getByLabelText("brand")).toHaveValue(mockItem.brand);
		// material is now a blend builder — check the first material row input
		expect(screen.getByLabelText("Material 1 name")).toHaveValue("cotton");
		expect(screen.getByLabelText("occasion")).toHaveValue(mockItem.occasion);
		expect(screen.getByLabelText("age")).toHaveValue(mockItem.age);
		expect(screen.getByLabelText("care")).toHaveValue(mockItem.care);
	});

	it("calls updateItem with updated values on form submission", () => {
		render(<EditItemView item={mockItem} setView={mockSetView} />);
		fireEvent.change(screen.getByLabelText("name"), {
			target: { value: "Updated Item" },
		});
		fireEvent.click(screen.getByText("Save Changes"));
		expect(mockUpdateItem).toHaveBeenCalledWith(
			mockItem.id,
			expect.objectContaining({ name: "Updated Item" }),
		);
	});

	it("renders additional detail fields when editing an item", () => {
		render(<EditItemView item={mockItem} setView={mockSetView} />);
		expect(screen.getByLabelText("price")).toBeInTheDocument();
		expect(screen.getByRole("checkbox")).toBeInTheDocument();
		expect(screen.getByLabelText("notes")).toBeInTheDocument();
	});

	it("triggers toast notification on successful update", () => {
		render(<EditItemView item={mockItem} setView={mockSetView} />);
		fireEvent.click(screen.getByText("Save Changes"));
		expect(mockShowToast).toHaveBeenCalledWith("Test Item updated");
	});

	it("renders image preview in create mode when imageURL is provided", () => {
		render(
			<EditItemView item={mockItem} setView={mockSetView} mode="create" />,
		);
		const previewImage = screen.getByAltText("Test Item") as HTMLImageElement;
		expect(previewImage.src).toBe("https://example.com/image.jpg");
	});

	it("has a close icon to close the edit form", () => {
		render(<EditItemView item={mockItem} setView={mockSetView} />);
		const closeIcon = screen.getByTestId("close-icon");
		expect(closeIcon).toBeInTheDocument();
		fireEvent.click(closeIcon);
		expect(mockSetView).toHaveBeenCalledWith("carousel");
	});

	it("displays the item name as the card title in edit mode", () => {
		render(<EditItemView item={mockItem} setView={mockSetView} />);
		expect(screen.getByText("Test Item")).toBeInTheDocument();
	});

	it("displays Import Item as the card title in create mode", () => {
		render(
			<EditItemView item={mockItem} setView={mockSetView} mode="create" />,
		);
		expect(screen.getByText("Import Item")).toBeInTheDocument();
	});
});
