import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import EditItemView from "./EditItemView";
import { useLocalStorageCloset } from "../../../hooks/useLocalCloset";

vi.mock("../../../hooks/useLocalCloset", () => ({
	useLocalStorageCloset: () => ({
		updateItem: vi.fn(),
	}),
}));

describe("EditItemView", () => {
	const mockItem = {
		id: "1",
		name: "Test Item",
		size: "M",
		brand: "Test Brand",
		material: "Cotton",
		occasion: "Casual",
		age: "New",
		care: "Machine Wash",
		imageURL: "https://example.com/image.jpg",
		color: "Red",
		category: "Tops",
	};

	it("renders the form with pre-filled values", () => {
		render(<EditItemView item={mockItem} />);
		expect(screen.getByLabelText("Name")).toHaveValue(mockItem.name);
		expect(screen.getByLabelText("Size")).toHaveValue(mockItem.size);
		expect(screen.getByLabelText("Brand")).toHaveValue(mockItem.brand);
		expect(screen.getByLabelText("Material")).toHaveValue(mockItem.material);
		expect(screen.getByLabelText("Occasion")).toHaveValue(mockItem.occasion);
		expect(screen.getByLabelText("Age")).toHaveValue(mockItem.age);
		expect(screen.getByLabelText("Care")).toHaveValue(mockItem.care);
	});

	it("calls the update function with updated values on form submission", () => {
		const mockUpdateItem = vi.fn();
		render(<EditItemView item={mockItem} updateItem={mockUpdateItem} />);
		fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Updated Item" } });
		fireEvent.click(screen.getByText("Save Changes"));
		expect(mockUpdateItem).toHaveBeenCalledWith(mockItem.id, expect.objectContaining({ name: "Updated Item" }));
	});
	it(" additional detail fields are available when editing an item ", () => {
		render(<EditItemView item={mockItem} />);
		expect(screen.getByLabelText("Price")).toBeInTheDocument();
		expect(screen.getByLabelText("On Sale")).toBeInTheDocument();
		expect(screen.getByLabelText("Notes")).toBeInTheDocument();
	});
	it("triggers toast notification on successful update", () => {
		const mockUpdateItem = vi.fn();
		const mockToast = vi.fn();
		render(<EditItemView item={mockItem} updateItem={mockUpdateItem} toast={mockToast} />);
		fireEvent.click(screen.getByText("Save Changes"));
		expect(mockToast).toHaveBeenCalledWith("Item updated successfully!");
	});

	it("displays validation errors when invalid data is entered", () => {
		render(<EditItemView item={mockItem} />);
		fireEvent.change(screen.getByLabelText("Size"), { target: { value: "Invalid Size" } });
		fireEvent.click(screen.getByText("Save Changes"));
		expect(screen.getByText("Invalid size")).toBeInTheDocument();
	});

	it("displays a preview of the new image when a valid URL is entered", () => {
		render(<EditItemView item={mockItem} />);
		fireEvent.change(screen.getByLabelText("Image URL"), { target: { value: "https://example.com/new-image.jpg" } });
		const previewImage = screen.getByAltText("Image Preview") as HTMLImageElement;
		expect(previewImage.src).toBe("https://example.com/new-image.jpg");
	});
});
