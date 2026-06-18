/**
 * Mobile-focused tests for FilterSidePanel.
 *
 * The footer (Clear all / Done) must always be present in the DOM when the
 * panel is open — the CSS bug that caused margin-bottom to push it off-screen
 * on narrow viewports is caught here structurally, since CSS doesn't run in
 * jsdom. Playwright E2E tests cover actual visual sticking behaviour.
 */
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import FilterSidePanel from "./FilterSidePanel";
import type { FilterState, FilterOptions } from "../../hooks/useClosetFilters";

const emptyFilters: FilterState = {
	category: [],
	color: [],
	brand: [],
	material: [],
	occasion: [],
	care: [],
};

const filterOptions: FilterOptions = {
	category: [
		{ value: "tops", count: 5 },
		{ value: "dresses", count: 3 },
		{ value: "bottoms", count: 4 },
		{ value: "coats", count: 2 },
		{ value: "sweaters", count: 6 },
		{ value: "active", count: 2 },
		{ value: "intimates", count: 1 },
		{ value: "socks", count: 1 },
	],
	color: [
		{ value: "Black", count: 8 },
		{ value: "White", count: 4 },
	],
	brand: [
		{ value: "Nike", count: 3 },
		{ value: "Zara", count: 2 },
	],
	material: [{ value: "cotton", count: 6 }],
	occasion: [
		{ value: "casual", count: 7 },
		{ value: "formal", count: 2 },
	],
	care: [],
};

const baseProps = {
	filters: emptyFilters,
	filterOptions,
	activeFilterCount: 0,
	onToggle: vi.fn(),
	onClearAll: vi.fn(),
	onClose: vi.fn(),
};

// Simulate mobile viewport width
function setViewportWidth(width: number) {
	Object.defineProperty(window, "innerWidth", { writable: true, configurable: true, value: width });
	window.dispatchEvent(new Event("resize"));
}

const MOBILE_WIDTHS = [375, 390, 414]; // iPhone SE, iPhone 14, iPhone 14 Plus

describe("FilterSidePanel — mobile footer always present", () => {
	beforeEach(() => vi.clearAllMocks());
	afterEach(() => setViewportWidth(1024)); // reset

	it.each(MOBILE_WIDTHS)("footer renders when panel is open at %ipx viewport", (width) => {
		setViewportWidth(width);
		render(<FilterSidePanel {...baseProps} open={true} />);

		// Both footer buttons must be in the DOM regardless of viewport width
		expect(screen.getByRole("button", { name: /done/i })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: /clear all/i })).toBeInTheDocument();
	});

	it("footer stays in the DOM when panel is closed (hidden via CSS, not unmounted)", () => {
		setViewportWidth(375);
		render(<FilterSidePanel {...baseProps} open={false} />);
		// Panel is aria-hidden when closed — use hidden:true to confirm the footer
		// is never conditionally removed from the tree (only visually hidden via CSS)
		expect(screen.getByRole("button", { name: /done/i, hidden: true })).toBeInTheDocument();
	});

	it("footer Done button calls onClose on mobile viewport", () => {
		setViewportWidth(375);
		const onClose = vi.fn();
		render(<FilterSidePanel {...baseProps} open={true} onClose={onClose} />);
		fireEvent.click(screen.getByRole("button", { name: /done/i }));
		expect(onClose).toHaveBeenCalled();
	});

	it("footer Clear all button is disabled when no filters active on mobile", () => {
		setViewportWidth(390);
		render(<FilterSidePanel {...baseProps} open={true} activeFilterCount={0} />);
		expect(screen.getByRole("button", { name: /clear all/i })).toBeDisabled();
	});

	it("footer Clear all is enabled and shows count when filters active on mobile", () => {
		setViewportWidth(390);
		render(<FilterSidePanel {...baseProps} open={true} activeFilterCount={3} />);
		expect(screen.getByRole("button", { name: /clear all \(3\)/i })).not.toBeDisabled();
	});

	it("panel renders all filter dimensions even with many options (long scroll body)", () => {
		setViewportWidth(375);
		render(<FilterSidePanel {...baseProps} open={true} />);
		// Panel body has many accordion sections — footer must still be in DOM
		expect(screen.getByRole("dialog")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: /done/i })).toBeInTheDocument();
	});

	it("Escape key closes panel on mobile", () => {
		setViewportWidth(375);
		const onClose = vi.fn();
		render(<FilterSidePanel {...baseProps} open={true} onClose={onClose} />);
		fireEvent.keyDown(window, { key: "Escape" });
		expect(onClose).toHaveBeenCalled();
	});

	it("backdrop tap closes panel on mobile", () => {
		setViewportWidth(390);
		const onClose = vi.fn();
		render(<FilterSidePanel {...baseProps} open={true} onClose={onClose} />);
		fireEvent.click(document.querySelector(".filter-panel-backdrop")!);
		expect(onClose).toHaveBeenCalled();
	});
});
