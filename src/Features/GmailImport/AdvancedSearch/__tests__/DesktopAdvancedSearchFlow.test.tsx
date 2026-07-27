import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { DesktopSearchSplitPanel } from "../DesktopAdvancedSearchFlow/DesktopAdvancedSearchFlow";

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

describe("DesktopSearchSplitPanel — shopper-facing re-language", () => {
	it("uses shopper-facing step labels, not engineer jargon", () => {
		render(<DesktopSearchSplitPanel {...baseProps} />);
		expect(screen.getByText("Order Emails")).toBeInTheDocument();
		expect(screen.getByText("Email Contents")).toBeInTheDocument();
		expect(screen.getByText("Skip These Senders")).toBeInTheDocument();
		expect(screen.queryByText("Subject Patterns")).not.toBeInTheDocument();
		expect(screen.queryByText("Body Keywords")).not.toBeInTheDocument();
		expect(screen.queryByText("Exclude Senders")).not.toBeInTheDocument();
	});

	it("does not render editable chips for subjects/keywords even though data exists", () => {
		render(<DesktopSearchSplitPanel {...baseProps} />);
		fireEvent.click(screen.getByText("Order Emails"));
		expect(screen.queryByPlaceholderText(/add subject pattern/i)).not.toBeInTheDocument();
		expect(screen.getByText(/we automatically look for common order-confirmation subject lines/i)).toBeInTheDocument();

		fireEvent.click(screen.getByText("Email Contents"));
		expect(screen.queryByPlaceholderText(/add body keyword/i)).not.toBeInTheDocument();
		expect(screen.getByText(/we also scan each email for purchase details/i)).toBeInTheDocument();
	});

	it("shows no nav badge for the hidden subject/keyword steps despite non-empty data", () => {
		render(<DesktopSearchSplitPanel {...baseProps} />);
		// Only a real editable step (Skip These Senders, when excluded has items) should badge.
		expect(screen.queryByText(String(baseProps.subjects.length))).not.toBeInTheDocument();
		expect(screen.queryByText(String(baseProps.keywords.length))).not.toBeInTheDocument();
	});

	it("'Clear all filters' does not remove the hidden subjects/keywords", () => {
		const onRemoveSubject = vi.fn();
		const onRemoveKeyword = vi.fn();
		render(<DesktopSearchSplitPanel {...baseProps} onRemoveSubject={onRemoveSubject} onRemoveKeyword={onRemoveKeyword} />);
		fireEvent.click(screen.getByText("Clear all filters"));
		expect(onRemoveSubject).not.toHaveBeenCalled();
		expect(onRemoveKeyword).not.toHaveBeenCalled();
	});

	function goToSummary() {
		fireEvent.click(screen.getByText("Order Emails"));
		fireEvent.click(screen.getByText("Email Contents"));
		fireEvent.click(screen.getByText("Skip These Senders"));
		fireEvent.click(screen.getByText("Review"));
	}

	it("shows a single Search button (no fetch-vs-filter choice) and defaults to fetch with no cache", () => {
		const onSearch = vi.fn();
		render(<DesktopSearchSplitPanel {...baseProps} onSearch={onSearch} cachedCount={0} />);
		goToSummary();

		expect(screen.queryByText(/new search/i)).not.toBeInTheDocument();
		expect(screen.queryByText(/filter existing/i)).not.toBeInTheDocument();

		fireEvent.click(screen.getByRole("button", { name: /^search$/i }));
		expect(onSearch).toHaveBeenCalledWith("fetch");
	});

	it("auto-picks filter mode when cached results exist", () => {
		const onSearch = vi.fn();
		render(<DesktopSearchSplitPanel {...baseProps} onSearch={onSearch} cachedCount={7} />);
		goToSummary();

		fireEvent.click(screen.getByRole("button", { name: /^search$/i }));
		expect(onSearch).toHaveBeenCalledWith("filter");
	});

	it("summary describes subjects/keywords as automatic, not as editable counts", () => {
		render(<DesktopSearchSplitPanel {...baseProps} />);
		goToSummary();
		expect(screen.getByText("Order emails")).toBeInTheDocument();
		expect(screen.getByText("Matched automatically")).toBeInTheDocument();
		expect(screen.getByText("Email contents")).toBeInTheDocument();
		expect(screen.getByText("Scanned automatically")).toBeInTheDocument();
	});
});
