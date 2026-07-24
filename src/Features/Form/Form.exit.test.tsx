import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

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
vi.mock("./ImageUploader/ImageUploader", () => ({
	default: () => <div data-testid="image-uploader">ImageUploader</div>,
}));

import MultiStepForm from "./Form";

beforeEach(() => vi.clearAllMocks());

describe("MultiStepForm — exit", () => {
	it("exits straight to the closet when nothing has been filled in", () => {
		render(<MultiStepForm setView={mockSetView} />);
		fireEvent.click(screen.getByRole("button", { name: /close and discard/i }));
		expect(mockSetView).toHaveBeenCalledWith("overview");
		expect(screen.queryByText(/discard this item\?/i)).not.toBeInTheDocument();
	});

	it("confirms before discarding once the user has entered something", () => {
		render(<MultiStepForm setView={mockSetView} />);

		// Make it dirty: color is on step 1 (Basics) now.
		fireEvent.click(screen.getByText("red"));

		// The ✕ now asks first instead of silently discarding.
		fireEvent.click(screen.getByRole("button", { name: /close and discard/i }));
		expect(screen.getByText(/discard this item\?/i)).toBeInTheDocument();
		expect(mockSetView).not.toHaveBeenCalled();

		// "Keep editing" backs out, no navigation.
		fireEvent.click(screen.getByRole("button", { name: /keep editing/i }));
		expect(mockSetView).not.toHaveBeenCalled();

		// Re-open and confirm Discard leaves.
		fireEvent.click(screen.getByRole("button", { name: /close and discard/i }));
		fireEvent.click(screen.getByRole("button", { name: /^discard$/i }));
		expect(mockSetView).toHaveBeenCalledWith("overview");
	});
});
