import type { ComponentProps } from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import PaginationControls, { getPaginationItems } from "./PaginationControls";

const renderControls = (
	props: Partial<ComponentProps<typeof PaginationControls>> = {},
) =>
	render(
		<PaginationControls
			currentPage={1}
			totalPages={5}
			onNext={vi.fn()}
			onPrev={vi.fn()}
			{...props}
		/>,
	);

/**
 * Queried by label, not by role: this testing-library version's role map
 * doesn't resolve input[type=number] to `spinbutton`.
 */
const jumpInput = () => screen.getByLabelText("Page");

/** The numbered buttons only — excludes previous/next and the jump field. */
const pageButtons = () =>
	within(screen.getByRole("group", { name: /pages/i }))
		.getAllByRole("button")
		.map((button) => button.textContent);

describe("getPaginationItems", () => {
	it("lists every page when the count is small", () => {
		expect(getPaginationItems(3, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
	});

	it("truncates the tail near the beginning", () => {
		expect(getPaginationItems(2, 20)).toEqual([1, 2, 3, 4, 5, "ellipsis-end", 20]);
	});

	it("truncates the head near the end", () => {
		expect(getPaginationItems(19, 20)).toEqual([
			1,
			"ellipsis-start",
			16,
			17,
			18,
			19,
			20,
		]);
	});

	it("truncates both sides in the middle", () => {
		expect(getPaginationItems(10, 20)).toEqual([
			1,
			"ellipsis-start",
			9,
			10,
			11,
			"ellipsis-end",
			20,
		]);
	});

	it("never repeats a page number at any position", () => {
		for (let totalPages = 1; totalPages <= 40; totalPages++) {
			for (let currentPage = 1; currentPage <= totalPages; currentPage++) {
				const numbers = getPaginationItems(currentPage, totalPages).filter(
					(item): item is number => typeof item === "number",
				);

				expect(
					new Set(numbers).size,
					`page ${currentPage} of ${totalPages}`,
				).toBe(numbers.length);
			}
		}
	});

	it("keeps a constant slot count once truncation kicks in", () => {
		for (let currentPage = 1; currentPage <= 20; currentPage++) {
			expect(getPaginationItems(currentPage, 20)).toHaveLength(7);
		}
	});

	it("clamps an out-of-range current page instead of emitting bad numbers", () => {
		expect(getPaginationItems(99, 20)).toEqual(getPaginationItems(20, 20));
		expect(getPaginationItems(0, 20)).toEqual(getPaginationItems(1, 20));
	});

	it("returns nothing when there are no pages", () => {
		expect(getPaginationItems(1, 0)).toEqual([]);
	});
});

describe("PaginationControls", () => {
	it("renders nothing without a count or a second page", () => {
		const { container } = renderControls({ totalPages: 1 });

		expect(container.firstChild).toBeNull();
	});

	it("disables Previous on the first page and Next on the last", () => {
		const { unmount } = renderControls({ currentPage: 1, totalPages: 3 });
		expect(screen.getByRole("button", { name: /previous/i })).toBeDisabled();
		unmount();

		renderControls({ currentPage: 3, totalPages: 3 });
		expect(screen.getByRole("button", { name: /next/i })).toBeDisabled();
	});

	it("calls onPrev and onNext when the nav buttons are clicked", async () => {
		const user = userEvent.setup();
		const onNext = vi.fn();
		const onPrev = vi.fn();

		renderControls({ currentPage: 2, totalPages: 3, onNext, onPrev });

		await user.click(screen.getByRole("button", { name: /previous/i }));
		await user.click(screen.getByRole("button", { name: /next/i }));

		expect(onPrev).toHaveBeenCalledTimes(1);
		expect(onNext).toHaveBeenCalledTimes(1);
	});

	it("shows the item count even on a single page (no nav row)", () => {
		renderControls({ totalPages: 1, totalItems: 3 });

		expect(screen.getByRole("status")).toHaveTextContent("3 items");
		expect(
			screen.queryByRole("button", { name: /next/i }),
		).not.toBeInTheDocument();
	});

	it("uses the singular label for a single item", () => {
		renderControls({ totalPages: 1, totalItems: 1 });

		expect(screen.getByRole("status")).toHaveTextContent("1 item");
	});

	it("shows the visible item range from itemsPerPage", () => {
		renderControls({
			currentPage: 3,
			totalPages: 5,
			totalItems: 28,
			itemsPerPage: 6,
		});

		expect(screen.getByRole("status")).toHaveTextContent(
			"Showing 13 - 18 of 28 items",
		);
	});

	it("clamps the range end to the total on the last page", () => {
		renderControls({
			currentPage: 5,
			totalPages: 5,
			totalItems: 28,
			itemsPerPage: 6,
		});

		expect(screen.getByRole("status")).toHaveTextContent(
			"Showing 25 - 28 of 28 items",
		);
	});

	it("falls back to a bare count when itemsPerPage is missing", () => {
		renderControls({ currentPage: 2, totalPages: 5, totalItems: 28 });

		expect(screen.getByRole("status")).toHaveTextContent("28 items");
		expect(screen.getByRole("status")).not.toHaveTextContent("Showing");
	});

	it("renders numbered pages with ellipses and jumps on click", async () => {
		const user = userEvent.setup();
		const onGoToPage = vi.fn();

		renderControls({ currentPage: 10, totalPages: 20, onGoToPage });

		expect(pageButtons()).toEqual(["1", "9", "10", "11", "20"]);

		await user.click(screen.getByRole("button", { name: /go to page 20/i }));
		expect(onGoToPage).toHaveBeenCalledWith(20);
	});

	it("marks the current page and does not re-navigate to it", async () => {
		const user = userEvent.setup();
		const onGoToPage = vi.fn();

		renderControls({ currentPage: 3, totalPages: 5, onGoToPage });

		const current = screen.getByRole("button", { name: /page 3, current page/i });
		expect(current).toHaveAttribute("aria-current", "page");
		// aria-disabled, not disabled — the current page stays focusable so screen
		// readers can reach it and hear the aria-current announcement.
		expect(current).toHaveAttribute("aria-disabled", "true");
		expect(current).not.toBeDisabled();

		await user.click(current);
		expect(onGoToPage).not.toHaveBeenCalled();
	});

	it("omits the page-number controls when jumping is unsupported", () => {
		renderControls({ currentPage: 2, totalPages: 20 });

		expect(screen.queryByRole("group", { name: /pages/i })).not.toBeInTheDocument();
		expect(screen.queryByLabelText("Page")).not.toBeInTheDocument();
		expect(screen.getByRole("button", { name: /next/i })).toBeInTheDocument();
	});

	describe("jump-to-page field", () => {
		it("does not build one option per page", () => {
			renderControls({ currentPage: 1, totalPages: 500, onGoToPage: vi.fn() });

			expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
			expect(jumpInput()).toHaveValue(1);
		});

		it("jumps on submit", async () => {
			const user = userEvent.setup();
			const onGoToPage = vi.fn();

			renderControls({ currentPage: 1, totalPages: 500, onGoToPage });

			const input = jumpInput();
			await user.clear(input);
			await user.type(input, "42");
			await user.keyboard("{enter}");

			expect(onGoToPage).toHaveBeenCalledWith(42);
		});

		it("rejects an out-of-range page and restores the current one", async () => {
			const user = userEvent.setup();
			const onGoToPage = vi.fn();

			renderControls({ currentPage: 7, totalPages: 20, onGoToPage });

			const input = jumpInput();
			await user.clear(input);
			await user.type(input, "999");
			await user.keyboard("{enter}");

			expect(onGoToPage).not.toHaveBeenCalled();
			expect(input).toHaveValue(7);
		});

		it("rejects an empty entry and restores the current page on blur", async () => {
			const user = userEvent.setup();
			const onGoToPage = vi.fn();

			renderControls({ currentPage: 7, totalPages: 20, onGoToPage });

			const input = jumpInput();
			await user.clear(input);
			await user.tab();

			expect(onGoToPage).not.toHaveBeenCalled();
			expect(input).toHaveValue(7);
		});

		it("follows the current page when it changes elsewhere", () => {
			const { rerender } = renderControls({
				currentPage: 2,
				totalPages: 20,
				onGoToPage: vi.fn(),
			});

			expect(jumpInput()).toHaveValue(2);

			rerender(
				<PaginationControls
					currentPage={9}
					totalPages={20}
					onNext={vi.fn()}
					onPrev={vi.fn()}
					onGoToPage={vi.fn()}
				/>,
			);

			expect(jumpInput()).toHaveValue(9);
		});
	});
});
