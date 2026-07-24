import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

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

// ImageUploader uses FileReader — stub it
vi.mock("./ImageUploader/ImageUploader", () => ({
	default: () => <div data-testid="image-uploader">ImageUploader</div>,
}));

import MultiStepForm from "./Form";

// Step labels from constants
const STEP_LABELS = ["Basics", "Details", "Photo"];

beforeEach(() => vi.clearAllMocks());

// ── Helpers ───────────────────────────────────────────────────────────────────
function renderForm() {
	return render(<MultiStepForm setView={mockSetView} />);
}

function clickNext() {
	fireEvent.click(screen.getByRole("button", { name: /next/i }));
}

function clickBack() {
	fireEvent.click(screen.getByRole("button", { name: /back/i }));
}

function advanceToStep(n: number) {
	for (let i = 1; i < n; i++) clickNext();
}

// ── Tests ─────────────────────────────────────────────────────────────────────
describe("MultiStepForm — step navigation", () => {
	it("starts on step 1 and shows the Basics tab as active", () => {
		renderForm();
		const tabs = screen.getAllByRole("listitem");
		expect(tabs[0].className).toContain("active");
	});

	it("does not show a Back button on step 1", () => {
		renderForm();
		expect(screen.queryByRole("button", { name: /back/i })).not.toBeInTheDocument();
	});

	it("Next advances to step 2 and shows Back", () => {
		renderForm();
		clickNext();
		const tabs = screen.getAllByRole("listitem");
		expect(tabs[1].className).toContain("active");
		expect(screen.getByRole("button", { name: /back/i })).toBeInTheDocument();
	});

	it("Back returns from step 2 to step 1", () => {
		renderForm();
		clickNext();
		clickBack();
		const tabs = screen.getAllByRole("listitem");
		expect(tabs[0].className).toContain("active");
		expect(screen.queryByRole("button", { name: /back/i })).not.toBeInTheDocument();
	});

	it("can navigate forward through all 3 steps", () => {
		renderForm();
		STEP_LABELS.forEach((_, i) => {
			const tabs = screen.getAllByRole("listitem");
			expect(tabs[i].className).toContain("active");
			if (i < STEP_LABELS.length - 1) clickNext();
		});
	});

	it("shows Submit button only on step 3, not Next", () => {
		renderForm();
		advanceToStep(3);
		expect(screen.getByRole("button", { name: /submit/i })).toBeInTheDocument();
		expect(screen.queryByRole("button", { name: /next/i })).not.toBeInTheDocument();
	});

	it("clicking a step tab in the tracker jumps directly to that step", () => {
		renderForm();
		fireEvent.click(screen.getByText("Details")); // step 2
		const tabs = screen.getAllByRole("listitem");
		expect(tabs[1].className).toContain("active");
	});
});

describe("MultiStepForm — submit", () => {
	it("submit calls addItem and showToast", async () => {
		renderForm();
		advanceToStep(3);
		const form = screen.getByTestId("multistep-form").querySelector("form")!;
		fireEvent.submit(form);
		expect(mockAddItem).toHaveBeenCalled();
		expect(mockShowToast).toHaveBeenCalled();
	});

	it("after submit, form resets to step 1", async () => {
		renderForm();
		advanceToStep(3);
		const form = screen.getByTestId("multistep-form").querySelector("form")!;
		fireEvent.submit(form);
		await waitFor(() => {
			const tabs = screen.getAllByRole("listitem");
			expect(tabs[0].className).toContain("active");
		});
	});

	it("after submit, setView is called to navigate away", async () => {
		renderForm();
		advanceToStep(3);
		const form = screen.getByTestId("multistep-form").querySelector("form")!;
		fireEvent.submit(form);
		await waitFor(() => expect(mockSetView).toHaveBeenCalled());
	});

	// Regression: the submit button must NOT wire both onClick={handleSubmit} and
	// live inside <form onSubmit={handleSubmit}> — that double-fires addItem (and
	// creates duplicate items) the moment the click handler stops calling
	// preventDefault. Clicking the real button must add exactly one item.
	it("clicking the Submit button adds exactly one item (no double-submit)", () => {
		renderForm();
		advanceToStep(3);
		fireEvent.click(screen.getByRole("button", { name: /submit/i }));
		expect(mockAddItem).toHaveBeenCalledTimes(1);
	});
});
