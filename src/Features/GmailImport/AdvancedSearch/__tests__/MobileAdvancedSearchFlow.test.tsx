import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { MobileSearchWizard } from "../MobileAdvancedSearchFlow/MobileAdvancedSearchFlow";

const baseProps = {
	fromSender: "",
	onFromSenderChange: vi.fn(),
	dateAfter: "",
	onDateAfterChange: vi.fn(),
	dateBefore: "",
	onDateBeforeChange: vi.fn(),
	subjects: ["Order Confirmation", "Your order has shipped"],
	onAddSubject: vi.fn(),
	onRemoveSubject: vi.fn(),
	keywords: ["receipt", "invoice"],
	onAddKeyword: vi.fn(),
	onRemoveKeyword: vi.fn(),
	excluded: [] as string[],
	onAddExcluded: vi.fn(),
	onRemoveExcluded: vi.fn(),
	onSearch: vi.fn(),
	loading: false,
	cachedCount: 0,
};

function goToSummary() {
	fireEvent.click(screen.getByText("Order Emails"));
	fireEvent.click(screen.getByText("Contents"));
	fireEvent.click(screen.getByText("Skip Senders"));
	fireEvent.click(screen.getByText("Review"));
}

describe("MobileSearchWizard — shopper-facing re-language", () => {
	it("uses shopper-facing step labels, not engineer jargon", () => {
		render(<MobileSearchWizard {...baseProps} />);
		expect(screen.getByText("Order Emails")).toBeInTheDocument();
		expect(screen.getByText("Contents")).toBeInTheDocument();
		expect(screen.getByText("Skip Senders")).toBeInTheDocument();
		expect(screen.queryByText("Subject")).not.toBeInTheDocument();
		expect(screen.queryByText("Keywords")).not.toBeInTheDocument();
		expect(screen.queryByText("Exclude")).not.toBeInTheDocument();
	});

	it("does not render editable chips for subjects/keywords even though data exists", () => {
		render(<MobileSearchWizard {...baseProps} />);
		fireEvent.click(screen.getByText("Order Emails"));
		expect(screen.queryByPlaceholderText(/add subject pattern/i)).not.toBeInTheDocument();
		expect(screen.getByText(/we automatically look for common order-confirmation subject lines/i)).toBeInTheDocument();

		fireEvent.click(screen.getByText("Contents"));
		expect(screen.queryByPlaceholderText(/add body keyword/i)).not.toBeInTheDocument();
		expect(screen.getByText(/we also scan each email for purchase details/i)).toBeInTheDocument();
	});

	it("'Reset' does not remove the hidden subjects/keywords", () => {
		const onRemoveSubject = vi.fn();
		const onRemoveKeyword = vi.fn();
		render(<MobileSearchWizard {...baseProps} onRemoveSubject={onRemoveSubject} onRemoveKeyword={onRemoveKeyword} />);
		fireEvent.click(screen.getByText("Reset"));
		expect(onRemoveSubject).not.toHaveBeenCalled();
		expect(onRemoveKeyword).not.toHaveBeenCalled();
	});

	it("subtitle filter count excludes the always-on hidden subjects/keywords", () => {
		render(<MobileSearchWizard {...baseProps} />);
		// Only Sender/Date + Skip-Senders count toward "N filters" — none are set here.
		expect(screen.queryByText(/filter/i)).not.toBeInTheDocument();
	});

	it("shows a single Search button (no fetch-vs-filter choice) and defaults to fetch with no cache", () => {
		const onSearch = vi.fn();
		render(<MobileSearchWizard {...baseProps} onSearch={onSearch} cachedCount={0} />);
		goToSummary();

		expect(screen.queryByText(/new search/i)).not.toBeInTheDocument();
		expect(screen.queryByText(/filter existing/i)).not.toBeInTheDocument();

		fireEvent.click(screen.getByRole("button", { name: /^search$/i }));
		expect(onSearch).toHaveBeenCalledWith("fetch");
	});

	it("auto-picks filter mode when cached results exist", () => {
		const onSearch = vi.fn();
		render(<MobileSearchWizard {...baseProps} onSearch={onSearch} cachedCount={7} />);
		goToSummary();

		fireEvent.click(screen.getByRole("button", { name: /^search$/i }));
		expect(onSearch).toHaveBeenCalledWith("filter");
	});

	it("summary describes subjects/keywords as automatic, not as editable counts", () => {
		render(<MobileSearchWizard {...baseProps} />);
		goToSummary();
		expect(screen.getByText("Order emails")).toBeInTheDocument();
		expect(screen.getByText("Matched automatically")).toBeInTheDocument();
		expect(screen.getByText("Email contents")).toBeInTheDocument();
		expect(screen.getByText("Scanned automatically")).toBeInTheDocument();
	});
});
