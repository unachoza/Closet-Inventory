import "./PaginationControls.css";

interface PaginationControlsProps {
	currentPage: number;
	totalPages: number;
	onNext: () => void;
	onPrev: () => void;
	/** Jump directly to a page. When provided, a page selector is shown so large
	 *  closets aren't navigable only one step at a time. */
	onGoToPage?: (page: number) => void;
	/** Total number of items across all pages, shown as a count on the closet. */
	totalItems?: number;
}

const PaginationControls = ({ currentPage, totalPages, onNext, onPrev, onGoToPage, totalItems }: PaginationControlsProps) => {
	// Show the item count even for a single page (it's useful context on its own),
	// but only render the page-navigation row when there's more than one page.
	const showCount = typeof totalItems === "number";
	const showNav = totalPages > 1;

	if (!showCount && !showNav) return null;

	return (
		<div className="pagination">
			{showCount && (
				<p className="pagination-count">
					{totalItems} {totalItems === 1 ? "item" : "items"}
				</p>
			)}
			{showNav && (
				<div className="pagination-controls">
					<button onClick={onPrev} disabled={currentPage === 1}>
						← Previous
					</button>
					{onGoToPage ? (
						<label className="pagination-jump">
							<span>Page</span>
							<select
								className="pagination-jump__select"
								value={currentPage}
								onChange={(e) => onGoToPage(Number(e.target.value))}
								aria-label={`Page ${currentPage} of ${totalPages}. Jump to page`}
							>
								{Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
									<option key={page} value={page}>
										{page}
									</option>
								))}
							</select>
							<span>of {totalPages}</span>
						</label>
					) : (
						<span>
							Page {currentPage} of {totalPages}
						</span>
					)}
					<button onClick={onNext} disabled={currentPage === totalPages}>
						Next →
					</button>
				</div>
			)}
		</div>
	);
};

export default PaginationControls;
