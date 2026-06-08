import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MY_CLOSET_DATA } from "../../../utils/constants";
import Closet from "./../Closet";

/**
 * Regression tests for the pagination "click Next/Previous → new items don't
 * appear" bug.
 *
 * Root cause: the animated grid container keyed only on category. Framer
 * Motion's `staggerChildren` only orchestrates its children from `hidden`→`show`
 * when the parent mounts or re-keys, so paging in new cards left them stuck at
 * the `hidden` variant (in the DOM but invisible). The fix re-keys the grid on
 * `currentPage`, forcing a remount + replay of the enter animation per page.
 *
 * These tests use the REAL pagination + REAL filter (only the card and storage
 * hook are stubbed) and assert that the rendered card set actually CHANGES when
 * paging, which is the user-facing wiring the bug broke.
 */
vi.mock("../../../Components/ClothesCard/Card/Card", () => ({
	default: ({ item }: { item: any }) => <div data-testid="clothes-card">{item.name}</div>,
}));

vi.mock("../../../hooks/useLocalCloset", () => ({
	useLocalStorageCloset: () => ({ closet: MY_CLOSET_DATA, removeItem: vi.fn() }),
}));

const ITEMS_PER_PAGE = 6;

const renderedNames = () => screen.getAllByTestId("clothes-card").map((el) => el.textContent);

// No category → whole closet (13 seed items → 3 pages), guaranteeing multiple pages.
describe("Closet — pagination shows new items on Next/Previous", () => {
	it("seed data spans multiple pages (precondition)", () => {
		expect(MY_CLOSET_DATA.length).toBeGreaterThan(ITEMS_PER_PAGE);
	});

	it("renders a different set of items after clicking Next", () => {
		render(<Closet selectedCategory={null} />);
		const page1 = renderedNames();
		expect(page1.length).toBe(ITEMS_PER_PAGE);

		fireEvent.click(screen.getByRole("button", { name: /next/i }));

		const page2 = renderedNames();
		expect(page2.length).toBeGreaterThan(0);
		// New items must actually appear — page 2 differs from page 1.
		expect(page2).not.toEqual(page1);
	});

	it("returns to the original items after Next then Previous", () => {
		render(<Closet selectedCategory={null} />);
		const page1 = renderedNames();

		fireEvent.click(screen.getByRole("button", { name: /next/i }));
		const page2 = renderedNames();
		expect(page2).not.toEqual(page1);

		fireEvent.click(screen.getByRole("button", { name: /prev/i }));
		expect(renderedNames()).toEqual(page1);
	});

	it("re-keys the grid per page so the enter animation replays (remount)", () => {
		const { container } = render(<Closet selectedCategory={null} />);
		const gridBefore = container.querySelector(".items-grid");
		expect(gridBefore).not.toBeNull();

		fireEvent.click(screen.getByRole("button", { name: /next/i }));

		const gridAfter = container.querySelector(".items-grid");
		expect(gridAfter).not.toBeNull();
		// A changed key forces React to mount a fresh element — different node identity.
		expect(gridAfter).not.toBe(gridBefore);
	});
});
