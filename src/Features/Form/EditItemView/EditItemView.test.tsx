import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import EditItemView from "./EditItemView";
import { useLocalStorageCloset } from "../../../hooks/useLocalCloset";
import { desc } from "framer-motion/client";
import { text } from "stream/consumers";

vi.mock("../../../hooks/useLocalCloset", () => ({
	useLocalStorageCloset: () => ({
		updateItem: vi.fn(),
	}),
}));

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
	price: "$20",
	onSale: true,
	notes: "This is a test item.",
};

const mockUpdateItem = vi.fn();
const mockToast = vi.fn();

describe("EditItemView", () => {
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

	it("has an x button to close the edit form", () => {
		render(<EditItemView item={mockItem} />);
		const closeButton = screen.getByRole("button", { name: /close/i });
		expect(closeButton).toBeInTheDocument();
		fireEvent.click(closeButton);
		expect(screen.queryByText("Save Changes")).not.toBeInTheDocument();
	});

	it("follows accessibility best practices: contrast, keyboard navigation, screen reader support, focus management, text sizing, button labeling, button sizing", () => {
		render(<EditItemView item={mockItem} />);
		// Contrast
		const labels = screen.getAllByLabelText(/.*/);
		labels.forEach((label) => {
			const style = window.getComputedStyle(label);
			const color = style.color;
			const backgroundColor = style.backgroundColor;
			expect(color).not.toBe(backgroundColor); // Ensure text is visible against background
		});
		// Keyboard navigation
		const nameInput = screen.getByLabelText("Name");
		nameInput.focus();
		expect(nameInput).toHaveFocus();
		fireEvent.keyDown(nameInput, { key: "Tab" });
		const sizeInput = screen.getByLabelText("Size");
		expect(sizeInput).toHaveFocus();
		// Screen reader support
		expect(screen.getByLabelText("Name")).toBeInTheDocument();
		expect(screen.getByLabelText("Size")).toBeInTheDocument();
		expect(screen.getByLabelText("Brand")).toBeInTheDocument();
		expect(screen.getByLabelText("Material")).toBeInTheDocument();
		expect(screen.getByLabelText("Occasion")).toBeInTheDocument();
		expect(screen.getByLabelText("Age")).toBeInTheDocument();
		expect(screen.getByLabelText("Care")).toBeInTheDocument();
		// Focus management
		const saveButton = screen.getByText("Save Changes");
		saveButton.focus();
		expect(saveButton).toHaveFocus();
		// Text sizing
		const nameLabel = screen.getByLabelText("Name");
		const style = window.getComputedStyle(nameLabel);
		const fontSize = parseFloat(style.fontSize);
		expect(fontSize).toBeGreaterThanOrEqual(14); // Ensure text is large enough to read
		// Button labeling
		expect(saveButton).toHaveAccessibleName("Save Changes");
		// Button sizing
		const buttonStyle = window.getComputedStyle(saveButton);
		const padding = parseFloat(buttonStyle.padding);
		expect(padding).toBeGreaterThanOrEqual(10); // Ensure buttons are large enough to interact with
	});
});

// describe("EditItemView - separateFeilds function", () => {
// 	it("renders additional fields correctly", () => {
// 		render(<EditItemView item={mockItem} />);
// 		expect(screen.getByLabelText("Price")).toHaveValue(mockItem.price);
// 		expect(screen.getByLabelText("On Sale")).toBeChecked();
// 		expect(screen.getByLabelText("Notes")).toHaveValue(mockItem.notes);
// 	});
// });

// describe("EditItemView - handleSubmit function", () => {
// 	it("calls updateItem with correct data on form submission", () => {
// 		render(<EditItemView item={mockItem} updateItem={mockUpdateItem} />);
// 		fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Updated Item" } });
// 		fireEvent.change(screen.getByLabelText("Price"), { target: { value: "$25" } });
// 		fireEvent.click(screen.getByText("Save Changes"));
// 		expect(mockUpdateItem).toHaveBeenCalledWith(mockItem.id, expect.objectContaining({ name: "Updated Item", price: "$25" }));
// 	});
// });

// describe("EditItemView Component follows accessibility best practices", () => {
// 	it("has appropriate ARIA attributes for form fields", () => {
// 		render(<EditItemView item={mockItem} />);
// 		expect(screen.getByLabelText("Name")).toBeInTheDocument();
// 		expect(screen.getByLabelText("Size")).toBeInTheDocument();
// 		expect(screen.getByLabelText("Brand")).toBeInTheDocument();
// 		expect(screen.getByLabelText("Material")).toBeInTheDocument();
// 		expect(screen.getByLabelText("Occasion")).toBeInTheDocument();
// 		expect(screen.getByLabelText("Age")).toBeInTheDocument();
// 		expect(screen.getByLabelText("Care")).toBeInTheDocument();
// 	});
// 	it("ensures all interactive elements are keyboard accessible", () => {
// 		render(<EditItemView item={mockItem} />);
// 		expect(screen.getByLabelText("Name")).toBeInTheDocument();
// 		expect(screen.getByLabelText("Size")).toBeInTheDocument();
// 		expect(screen.getByLabelText("Brand")).toBeInTheDocument();
// 		expect(screen.getByLabelText("Material")).toBeInTheDocument();
// 		expect(screen.getByLabelText("Occasion")).toBeInTheDocument();
// 		expect(screen.getByLabelText("Age")).toBeInTheDocument();
// 		expect(screen.getByLabelText("Care")).toBeInTheDocument();
// 	});
// 	test("provides sufficient color contrast for text and interactive elements", () => {
// 		render(<EditItemView item={mockItem} />);
// 		const labels = screen.getAllByLabelText(/.*/);
// 		labels.forEach((label) => {
// 			const style = window.getComputedStyle(label);
// 			const color = style.color;
// 			const backgroundColor = style.backgroundColor;
// 			expect(color).not.toBe(backgroundColor); // Ensure text is visible against background
// 		});
// 	});
// 	test("manages focus appropriately when interacting with the form", () => {
// 		render(<EditItemView item={mockItem} />);
// 		const nameInput = screen.getByLabelText("Name");
// 		nameInput.focus();
// 		expect(nameInput).toHaveFocus();
// 		fireEvent.keyDown(nameInput, { key: "Tab" });
// 		const sizeInput = screen.getByLabelText("Size");
// 		expect(sizeInput).toHaveFocus();
// 	});
// 	test("provides descriptive labels and instructions for screen readers", () => {
// 		render(<EditItemView item={mockItem} />);
// 		expect(screen.getByLabelText("Name")).toBeInTheDocument();
// 		expect(screen.getByLabelText("Size")).toBeInTheDocument();
// 		expect(screen.getByLabelText("Brand")).toBeInTheDocument();
// 		expect(screen.getByLabelText("Material")).toBeInTheDocument();
// 		expect(screen.getByLabelText("Occasion")).toBeInTheDocument();
// 		expect(screen.getByLabelText("Age")).toBeInTheDocument();
// 		expect(screen.getByLabelText("Care")).toBeInTheDocument();
// 	});
// 	test("ensures text is resizable without loss of content or functionality", () => {
// 		render(<EditItemView item={mockItem} />);
// 		const nameLabel = screen.getByLabelText("Name");
// 		const style = window.getComputedStyle(nameLabel);
// 		const fontSize = parseFloat(style.fontSize);
// 		expect(fontSize).toBeGreaterThanOrEqual(14); // Ensure text is large enough to read
// 	});
// 	test("ensures buttons and interactive elements are appropriately sized for touch interaction", () => {
// 		render(<EditItemView item={mockItem} />);
// 		const saveButton = screen.getByText("Save Changes");
// 		const buttonStyle = window.getComputedStyle(saveButton);
// 		const padding = parseFloat(buttonStyle.padding);
// 		expect(padding).toBeGreaterThanOrEqual(10); // Ensure buttons are large enough to interact with
// 	});
// });
