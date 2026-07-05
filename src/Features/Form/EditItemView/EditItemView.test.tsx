import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ChangeEventHandler } from "react";
import EditItemView from "./EditItemView";

vi.mock("framer-motion");

// Accessible mock functions for assertions
const mockUpdateItem = vi.fn();
const mockAddItem = vi.fn();
const mockAddFullItem = vi.fn();
const mockShowToast = vi.fn();
const mockSetView = vi.fn();

vi.mock("../TextInput/TextInput", () => ({
	default: ({
		name,
		label,
		value,
		handleFormUpdate,
	}: {
		name: string;
		label: string;
		value?: string;
		handleFormUpdate: ChangeEventHandler<HTMLInputElement>;
	}) => (
		<label>
			{label}
			<input aria-label={label} name={name} value={value ?? ""} onChange={handleFormUpdate} />
		</label>
	),
}));

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

	/////TODO: add back in Material Blend
	// material is now MaterialBlend[] — the migration util also handles legacy strings,
	// but tests should use the canonical shape.
	// material: [{ material: "cotton", percentage: 100 }],

	material: [{ material: "cotton", percentage: 100 }],

	occasion: "casual",
	age: "",
	condition: "good",
	purchaseDate: "2024-03-15T00:00:00.000Z",
	care: "Machine Wash",
	imageURL: "https://example.com/image.jpg",
	color: "Red",
	category: "Tops",
	price: "$20",
	onSale: true,
	notes: ["This is a test item."],
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
		// Material is now a blend builder (MaterialBlendInput) — assert the first
		// row's name and percentage inputs reflect the item's MaterialBlend[].
		expect(screen.getByLabelText("Material 1 name")).toHaveValue(mockItem.material[0].material);
		expect(screen.getByLabelText("Material 1 percentage")).toHaveValue(mockItem.material[0].percentage);
		expect(screen.getByLabelText("occasion")).toHaveValue(mockItem.occasion);
		// "age" is no longer a generic text input — condition is a fixed-option selector,
		// and purchase date is a read-only display (factual age derived from it).
		expect(screen.getByLabelText("condition")).toHaveValue(mockItem.condition);
		expect(screen.getByLabelText("care")).toHaveValue(mockItem.care);
	});

	it("renders condition as an editable selector and purchase date as a read-only display", () => {
		render(<EditItemView item={mockItem} setView={mockSetView} />);
		const condition = screen.getByLabelText("condition") as HTMLSelectElement;
		expect(condition.tagName).toBe("SELECT");
		// All six WearState condition options are offered.
		expect(condition.querySelectorAll("option")).toHaveLength(6);

		const purchaseDate = screen.getByLabelText("purchase date") as HTMLInputElement;
		expect(purchaseDate).toBeDisabled();
		expect(purchaseDate.value).toMatch(/2024/);
	});

	it("offers a manual date entry when the item has no purchase date", () => {
		render(<EditItemView item={{ ...mockItem, purchaseDate: undefined }} setView={mockSetView} mode="create" />);
		const purchaseDate = screen.getByLabelText("purchase date") as HTMLInputElement;
		expect(purchaseDate).not.toBeDisabled();
		expect(purchaseDate.type).toBe("date");
	});

	it("persists condition and purchaseDate when adding an imported item to the closet", () => {
		render(<EditItemView item={mockItem} setView={mockSetView} mode="create" />);
		fireEvent.click(screen.getByText("Add to Closet"));
		expect(mockAddFullItem).toHaveBeenCalledWith(expect.objectContaining({ condition: "good", purchaseDate: "2024-03-15T00:00:00.000Z" }));
	});

	it("calls updateItem with updated values on form submission", () => {
		render(<EditItemView item={mockItem} setView={mockSetView} />);
		fireEvent.change(screen.getByLabelText("name"), {
			target: { value: "Updated Item" },
		});
		fireEvent.click(screen.getByText("Save Changes"));
		expect(mockUpdateItem).toHaveBeenCalledWith(mockItem.id, expect.objectContaining({ name: "Updated Item" }));
	});

	it("renders additional detail fields when editing an item", () => {
		render(<EditItemView item={mockItem} setView={mockSetView} />);
		expect(screen.getByLabelText("price")).toBeInTheDocument();
		// onSale checkbox is temporarily disabled in EditItemView (see "re-enable onSale" TODO).
		// expect(screen.getByRole("checkbox")).toBeInTheDocument();
		expect(screen.getByLabelText("notes")).toBeInTheDocument();
	});

	it("triggers toast notification on successful update", () => {
		render(<EditItemView item={mockItem} setView={mockSetView} />);
		fireEvent.click(screen.getByText("Save Changes"));
		expect(mockShowToast).toHaveBeenCalledWith("Test Item updated");
	});

	it("renders image preview in create mode when imageURL is provided", () => {
		render(<EditItemView item={mockItem} setView={mockSetView} mode="create" />);
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
		render(<EditItemView item={mockItem} setView={mockSetView} mode="create" />);
		expect(screen.getByText("Import Item")).toBeInTheDocument();
	});
});
