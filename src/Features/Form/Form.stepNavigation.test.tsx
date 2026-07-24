import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ItemFormData } from "../../utils/types";

// ── Mocks ─────────────────────────────────────────────────────────────────────
const mockAddItem = vi.fn();
const mockShowToast = vi.fn();
const mockSetView = vi.fn();

vi.mock("../../context/ClosetContext", () => ({
	useCloset: () => ({ addItem: mockAddItem }),
}));

vi.mock("../../Components/Toast/Toast", () => ({
	useToast: () => ({ showToast: mockShowToast }),
}));

vi.mock("../../hooks/useLocalStorage", () => ({
	useLocalStorage: (_key: string, init: unknown) => [init, vi.fn()],
}));

// ImageUploader uses FileReader — stub it with a button that "uploads" a photo
vi.mock("./ImageUploader/ImageUploader", () => ({
	default: ({ onImageSelect }: { onImageSelect: (src: string) => void }) => (
		<button type="button" data-testid="mock-upload" onClick={() => onImageSelect("data:image/jpeg;base64,abc")}>
			upload
		</button>
	),
}));

import MultiStepForm from "./Form";

// New tight flow: Photo → Category → Basics → Details
const STEP_LABELS = ["Photo", "Category", "Basics", "Details"];

beforeEach(() => vi.clearAllMocks());

// ── Helpers ───────────────────────────────────────────────────────────────────
function renderForm(initialData?: Partial<ItemFormData>) {
	return render(<MultiStepForm setView={mockSetView} initialData={initialData} />);
}

function activeTabIndex() {
	const tabs = screen.getAllByRole("listitem");
	return tabs.findIndex((tab) => tab.className.includes("active"));
}

function clickNext() {
	fireEvent.click(screen.getByRole("button", { name: /next/i }));
}

function providePhoto() {
	fireEvent.click(screen.getByTestId("mock-upload"));
}

function pickCategory(label = "Tops") {
	fireEvent.click(screen.getByRole("button", { name: label }));
}

/** Photo → Category → Basics with the two required gates satisfied. */
function advanceToBasics() {
	providePhoto();
	clickNext();
	pickCategory();
	clickNext();
}

// ── Tests ─────────────────────────────────────────────────────────────────────
describe("MultiStepForm — step navigation", () => {
	it("renders exactly the 4 tight steps", () => {
		renderForm();
		const tabs = screen.getAllByRole("listitem");
		expect(tabs.map((tab) => tab.textContent)).toEqual(STEP_LABELS);
	});

	it("starts on the Photo step with no Back button", () => {
		renderForm();
		expect(activeTabIndex()).toBe(0);
		expect(screen.queryByRole("button", { name: /back/i })).not.toBeInTheDocument();
	});

	it("blocks Next until a photo is provided", () => {
		renderForm();
		expect(screen.getByRole("button", { name: /next/i })).toBeDisabled();
		providePhoto();
		expect(screen.getByRole("button", { name: /next/i })).toBeEnabled();
		clickNext();
		expect(activeTabIndex()).toBe(1);
	});

	it("the explicit stock-photo choice also satisfies the photo gate", () => {
		renderForm();
		fireEvent.click(screen.getByRole("button", { name: /use a stock photo/i }));
		expect(screen.getByRole("button", { name: /next/i })).toBeEnabled();
	});

	it("blocks Next on Category until one is picked", () => {
		renderForm();
		providePhoto();
		clickNext();
		expect(screen.getByRole("button", { name: /next/i })).toBeDisabled();
		pickCategory();
		expect(screen.getByRole("button", { name: /next/i })).toBeEnabled();
	});

	it("tab tracker cannot jump past an unmet required step", () => {
		renderForm();
		fireEvent.click(screen.getByText("Details"));
		expect(activeTabIndex()).toBe(0); // photo gate not met — clamped

		providePhoto();
		fireEvent.click(screen.getByText("Details"));
		expect(activeTabIndex()).toBe(1); // clamped at category gate
	});

	it("Back returns from Category to Photo", () => {
		renderForm();
		providePhoto();
		clickNext();
		fireEvent.click(screen.getByRole("button", { name: /back/i }));
		expect(activeTabIndex()).toBe(0);
	});

	it("Basics is optional — Next passes straight through to Details", () => {
		renderForm();
		advanceToBasics();
		expect(activeTabIndex()).toBe(2);
		clickNext();
		expect(activeTabIndex()).toBe(3);
		expect(screen.getByRole("button", { name: /add to closet/i })).toBeInTheDocument();
		expect(screen.queryByRole("button", { name: /next/i })).not.toBeInTheDocument();
	});
});

describe("MultiStepForm — skip & submit", () => {
	it("Skip & add on Basics submits immediately with just photo + category", () => {
		renderForm();
		advanceToBasics();
		fireEvent.click(screen.getByRole("button", { name: /skip & add/i }));
		expect(mockAddItem).toHaveBeenCalledTimes(1);
		expect(mockAddItem.mock.calls[0][0]).toMatchObject({ category: "tops", imageURL: "data:image/jpeg;base64,abc" });
	});

	it("submit auto-generates the item name from color/brand/category", () => {
		renderForm();
		advanceToBasics();
		fireEvent.click(screen.getByRole("button", { name: "blue" })); // color swatch
		clickNext();
		fireEvent.click(screen.getByRole("button", { name: /add to closet/i }));
		expect(mockAddItem.mock.calls[0][0].name).toBe("Blue Tops");
	});

	it("a user-edited name is kept as typed, not regenerated", () => {
		renderForm();
		advanceToBasics();
		clickNext();
		fireEvent.change(screen.getByLabelText("Item name"), { target: { value: "Favorite tee" } });
		fireEvent.click(screen.getByRole("button", { name: /add to closet/i }));
		expect(mockAddItem.mock.calls[0][0].name).toBe("Favorite tee");
	});

	it("price entered in Details is submitted as a number", () => {
		renderForm();
		advanceToBasics();
		clickNext();
		fireEvent.change(screen.getByLabelText("Price"), { target: { value: "49.99" } });
		fireEvent.click(screen.getByRole("button", { name: /add to closet/i }));
		expect(mockAddItem.mock.calls[0][0].price).toBe(49.99);
	});

	it("submit calls addItem + showToast exactly once and resets to step 1", async () => {
		renderForm();
		advanceToBasics();
		clickNext();
		fireEvent.click(screen.getByRole("button", { name: /add to closet/i }));
		expect(mockAddItem).toHaveBeenCalledTimes(1);
		expect(mockShowToast).toHaveBeenCalledTimes(1);
		await waitFor(() => expect(mockSetView).toHaveBeenCalledWith("overview"));
		expect(activeTabIndex()).toBe(0);
	});

	it("Gmail-prefilled photo + category satisfy the gates immediately", () => {
		renderForm({ imageURL: "https://img", category: "tops" });
		expect(screen.getByRole("button", { name: /next/i })).toBeEnabled();
		fireEvent.click(screen.getByText("Details"));
		expect(activeTabIndex()).toBe(3);
	});
});
