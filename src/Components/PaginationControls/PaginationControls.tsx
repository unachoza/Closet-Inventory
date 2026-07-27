import { useEffect, useId, useState } from "react";
import type { FormEvent } from "react";
import "./PaginationControls.css";

interface PaginationControlsProps {
	currentPage: number;
	totalPages: number;
	onNext: () => void;
	onPrev: () => void;

	/**
	 * Jump directly to a page.
	 * When provided, page-number controls and a jump field are shown so large
	 * closets aren't navigable only one step at a time.
	 */
	onGoToPage?: (page: number) => void;

	/** Total number of items across all pages. */
	totalItems?: number;

	/**
	 * Number of items shown per page.
	 * Used with totalItems to display the visible item range. Must match the
	 * page size actually in use, or the range will lie about what's on screen.
	 */
	itemsPerPage?: number;
}

type PaginationItem = number | "ellipsis-start" | "ellipsis-end";

/** Page-number slots rendered once truncation kicks in: 1 … w w w … N. */
const MAX_SLOTS = 7;

const range = (start: number, end: number): number[] =>
	Array.from({ length: end - start + 1 }, (_, index) => start + index);

/**
 * Build the page-number sequence.
 *
 * Written as a sliding window clamped inside the first and last page rather
 * than as hand-written per-branch literals: the clamps make it structurally
 * impossible to emit a duplicate page number (the bug where the current page
 * appeared twice, as `… 8 9 9 10`) or a number outside 1..totalPages.
 *
 * Exported for direct testing — the invariants matter more than the markup.
 */
export const getPaginationItems = (
	currentPage: number,
	totalPages: number,
): PaginationItem[] => {
	if (totalPages < 1) return [];

	// Show every page when the page count is small: 1 2 3 4 5 6 7
	if (totalPages <= MAX_SLOTS) return range(1, totalPages);

	const safeCurrent = Math.min(Math.max(currentPage, 1), totalPages);

	// The window always sits strictly between page 1 and the last page, and is
	// pushed inward at the edges so the slot count stays constant.
	const windowStart = Math.max(2, Math.min(safeCurrent - 1, totalPages - 4));
	const windowEnd = Math.min(totalPages - 1, Math.max(safeCurrent + 1, 5));

	return [
		1,
		...(windowStart > 2 ? (["ellipsis-start"] as const) : []),
		...range(windowStart, windowEnd),
		...(windowEnd < totalPages - 1 ? (["ellipsis-end"] as const) : []),
		totalPages,
	];
};

const PaginationControls = ({
	currentPage,
	totalPages,
	onNext,
	onPrev,
	onGoToPage,
	totalItems,
	itemsPerPage,
}: PaginationControlsProps) => {
	const jumpInputId = useId();

	// Draft state for the jump field, so a half-typed page number doesn't
	// navigate on every keystroke. Committed on submit/blur, and re-synced
	// whenever the page changes from anywhere else (prev/next, a page button,
	// or a category filter resetting to page 1).
	const [jumpDraft, setJumpDraft] = useState(String(currentPage));

	useEffect(() => {
		setJumpDraft(String(currentPage));
	}, [currentPage]);

	// Show the item count even for a single page (it's useful context on its
	// own), but only render the navigation row when there's more than one page.
	const showCount = typeof totalItems === "number";
	const showNav = totalPages > 1;

	if (!showCount && !showNav) return null;

	const hasItemRange =
		showCount &&
		typeof itemsPerPage === "number" &&
		itemsPerPage > 0 &&
		totalItems > 0;

	const firstVisibleItem = hasItemRange ? (currentPage - 1) * itemsPerPage + 1 : 0;
	const lastVisibleItem = hasItemRange
		? Math.min(currentPage * itemsPerPage, totalItems)
		: 0;

	const goToPage = (page: number) => {
		if (!onGoToPage || page === currentPage) return;
		if (!Number.isInteger(page) || page < 1 || page > totalPages) return;

		onGoToPage(page);
	};

	const commitJump = () => {
		const parsed = Number(jumpDraft);

		if (
			jumpDraft.trim() === "" ||
			!Number.isInteger(parsed) ||
			parsed < 1 ||
			parsed > totalPages
		) {
			// Reject silently and restore — the field is bounded by min/max and
			// the only sensible recovery is the page the user is already on.
			setJumpDraft(String(currentPage));
			return;
		}

		goToPage(parsed);
	};

	const handleJumpSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		commitJump();
	};

	return (
		<nav className="pagination" aria-label="Closet pagination">
			{showCount && (
				<p className="pagination-count" role="status">
					{hasItemRange ? (
						<>
							Showing{" "}
							<strong>
								{firstVisibleItem} - {lastVisibleItem}
							</strong>{" "}
							of <strong>{totalItems}</strong>{" "}
							{totalItems === 1 ? "item" : "items"}
						</>
					) : (
						<>
							<strong>{totalItems}</strong>{" "}
							{totalItems === 1 ? "item" : "items"}
						</>
					)}
				</p>
			)}

			{showNav && (
				<div className="pagination-controls">
					<button
						className="pagination-nav pagination-nav--previous"
						type="button"
						onClick={onPrev}
						disabled={currentPage === 1}
						aria-label="Go to previous page"
					>
						<span aria-hidden="true">←</span>
						<span className="pagination-nav__label">Previous</span>
					</button>

					{/* Page numbers and the jump field are both jump affordances:
					    without onGoToPage neither can do anything, so the row
					    collapses to previous/next. */}
					{onGoToPage && (
						<>
							<div className="pagination-pages" role="group" aria-label="Pages">
								{getPaginationItems(currentPage, totalPages).map((item) => {
									if (typeof item !== "number") {
										return (
											<span
												key={item}
												className="pagination-ellipsis"
												aria-hidden="true"
											>
												•••
											</span>
										);
									}

									const isCurrentPage = item === currentPage;

									return (
										<button
											key={item}
											className={`pagination-page${
												isCurrentPage ? " pagination-page--current" : ""
											}`}
											type="button"
											onClick={() => goToPage(item)}
											// aria-disabled rather than disabled: the current
											// page stays focusable so screen-reader users can
											// reach it and hear aria-current.
											aria-disabled={isCurrentPage || undefined}
											aria-current={isCurrentPage ? "page" : undefined}
											aria-label={
												isCurrentPage
													? `Page ${item}, current page`
													: `Go to page ${item}`
											}
										>
											{item}
										</button>
									);
								})}
							</div>

							{/* Primary control below --bp-xs, where the number row is
							    hidden. A bounded number field rather than one <option>
							    per page: a 500-page closet shouldn't mean 500 nodes. */}
							<form
								className="pagination-jump"
								onSubmit={handleJumpSubmit}
								// Range checking happens in commitJump, not via the
								// browser: a native constraint violation (out-of-range
								// max) silently blocks the submit event before our
								// handler ever runs, leaving a bad value on screen.
								noValidate
							>
								<label className="pagination-jump__label" htmlFor={jumpInputId}>
									Page
								</label>

								<input
									id={jumpInputId}
									className="pagination-jump__input"
									type="number"
									inputMode="numeric"
									min={1}
									max={totalPages}
									step={1}
									value={jumpDraft}
									onChange={(event) => setJumpDraft(event.target.value)}
									onBlur={commitJump}
								/>

								<span className="pagination-jump__total">of {totalPages}</span>

								{/* Invisible submit control: jsdom (and some browsers) only
								    treat Enter in a lone text input as an implicit submit
								    when a submit control is present in the form. */}
								<button type="submit" className="pagination-jump__submit">
									Go
								</button>
							</form>
						</>
					)}

					<button
						className="pagination-nav pagination-nav--next"
						type="button"
						onClick={onNext}
						disabled={currentPage === totalPages}
						aria-label="Go to next page"
					>
						<span className="pagination-nav__label">Next</span>
						<span aria-hidden="true">→</span>
					</button>
				</div>
			)}
		</nav>
	);
};

export default PaginationControls;
