import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import ExportClosetModal from "./ExportClosetModal";

function renderModal(overrides: Partial<React.ComponentProps<typeof ExportClosetModal>> = {}) {
	const props = {
		isOpen: true,
		itemCount: 12,
		onConfirm: vi.fn(),
		onCancel: vi.fn(),
		...overrides,
	};
	return { ...render(<ExportClosetModal {...props} />), props };
}

describe("ExportClosetModal", () => {
	describe("visibility", () => {
		it("renders when isOpen is true", () => {
			renderModal({ isOpen: true });
			expect(screen.getByRole("dialog")).toBeInTheDocument();
		});

		it("renders nothing when isOpen is false", () => {
			renderModal({ isOpen: false });
			expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
		});
	});

	describe("content", () => {
		it("shows the modal title", () => {
			renderModal();
			expect(screen.getByText("Download Your Closet")).toBeInTheDocument();
		});

		it("shows a spreadsheet-friendly description with no CSV jargon", () => {
			renderModal();
			const desc = screen.getByText(/save your wardrobe as a spreadsheet/i);
			expect(desc).toBeInTheDocument();
			expect(desc.textContent).not.toMatch(/csv/i);
		});

		it("shows the item count badge with correct singular form", () => {
			renderModal({ itemCount: 1 });
			expect(screen.getByText("1 item will be exported")).toBeInTheDocument();
		});

		it("shows the item count badge with correct plural form", () => {
			renderModal({ itemCount: 12 });
			expect(screen.getByText("12 items will be exported")).toBeInTheDocument();
		});

		it("lists the 'What's included' field categories", () => {
			renderModal();
			expect(screen.getByText(/item name & brand/i)).toBeInTheDocument();
			expect(screen.getByText(/price & purchase date/i)).toBeInTheDocument();
			expect(screen.getByText(/material composition/i)).toBeInTheDocument();
		});

		it("renders the Download Spreadsheet confirm button", () => {
			renderModal();
			expect(screen.getByRole("button", { name: /download spreadsheet/i })).toBeInTheDocument();
		});

		it("renders the Cancel button", () => {
			renderModal();
			expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
		});
	});

	describe("interactions", () => {
		it("calls onConfirm when Download Spreadsheet is clicked", () => {
			const { props } = renderModal();
			fireEvent.click(screen.getByRole("button", { name: /download spreadsheet/i }));
			expect(props.onConfirm).toHaveBeenCalledTimes(1);
		});

		it("calls onCancel when Cancel button is clicked", () => {
			const { props } = renderModal();
			fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
			expect(props.onCancel).toHaveBeenCalledTimes(1);
		});

		it("calls onCancel when the modal overlay is clicked", () => {
			const { props } = renderModal();
			// The Modal component closes on overlay click — overlay is the dialog's parent
			const overlay = screen.getByRole("dialog").parentElement!;
			fireEvent.click(overlay);
			expect(props.onCancel).toHaveBeenCalledTimes(1);
		});

		it("calls onCancel when Escape key is pressed", () => {
			const { props } = renderModal();
			fireEvent.keyDown(document, { key: "Escape" });
			expect(props.onCancel).toHaveBeenCalledTimes(1);
		});

		it("does not call onConfirm when only Cancel is clicked", () => {
			const { props } = renderModal();
			fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
			expect(props.onConfirm).not.toHaveBeenCalled();
		});
	});
});
