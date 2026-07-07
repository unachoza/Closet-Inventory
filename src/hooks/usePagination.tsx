import { useState, useMemo, useCallback } from "react";

const usePagination = <T,>(data: T[], itemsPerPage: number) => {
	const [currentPage, setCurrentPage] = useState(1);

	const totalPages = useMemo(() => Math.ceil(data.length / itemsPerPage), [data, itemsPerPage]);

	const currentPageData = useMemo(() => {
		const startIndex = (currentPage - 1) * itemsPerPage;
		const endIndex = startIndex + itemsPerPage;
		return data.slice(startIndex, endIndex);
	}, [data, currentPage, itemsPerPage]);

	// Memoized so a stable identity can safely go in consumers' effect deps
	// (e.g. Closet's "reset to page 1 on category change"). Without this,
	// `goToPage` was a fresh closure every render — listing it as a dep would
	// re-run the reset effect on EVERY render and strand the user on page 1.
	const goToPage = useCallback(
		(pageNumber: number) => {
			if (pageNumber >= 1 && pageNumber <= totalPages) {
				setCurrentPage(pageNumber);
			}
		},
		[totalPages],
	);

	const handleNextPage = useCallback(() => {
		goToPage(currentPage + 1);
	}, [goToPage, currentPage]);

	const handlePrevPage = useCallback(() => {
		goToPage(currentPage - 1);
	}, [goToPage, currentPage]);

	return {
		currentPage,
		currentPageData,
		goToPage,
		handleNextPage,
		handlePrevPage,
		totalPages,
	};
};

export default usePagination;
