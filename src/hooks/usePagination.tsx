import { useState, useMemo } from "react";

const usePagination = <T,>(data: T[], itemsPerPage: number) => {
	const [currentPage, setCurrentPage] = useState(1);

	const totalPages = useMemo(() => Math.ceil(data.length / itemsPerPage), [data, itemsPerPage]);

	const currentPageData = useMemo(() => {
		const startIndex = (currentPage - 1) * itemsPerPage;
		const endIndex = startIndex + itemsPerPage;
		return data.slice(startIndex, endIndex);
	}, [data, currentPage, itemsPerPage]);

	const goToPage = (pageNumber: number) => {
		if (pageNumber >= 1 && pageNumber <= totalPages) {
			setCurrentPage(pageNumber);
		}
	};

	const handleNextPage = () => {
		goToPage(currentPage + 1);
	};

	const handlePrevPage = () => {
		goToPage(currentPage - 1);
	};

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
