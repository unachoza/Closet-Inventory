import { useEffect, useMemo } from "react";
import ClothingCard from "../../Components/ClothesCard/Card";
import PaginationControls from "../../Components/PaginationControls/PaginationControls";
import { useLocalStorageCloset } from "../../hooks/useLocalCloset";
import usePagination from "../../hooks/usePagination";
import { ClothingItem } from "../../utils/types";
import AnimatedContainer from "../../Components/AnimatedContainer/AnimatedContainer";
import "./Closet.css";

interface ClosetProps {
	selectedCategory: string | null;
	onEditItem?: (item: ClothingItem) => void;
}


const ITEMS_PER_PAGE = 6;
const Closet = ({ selectedCategory, onEditItem }: ClosetProps) => {
	const { closet } = useLocalStorageCloset();

	const normalizedCategory = selectedCategory?.trim().toLowerCase() || "";

	// Only re-filter when closet data or category actually changes
	const filteredItems = useMemo(() =>
		closet.filter((item: ClothingItem) => {
			const itemCategory = (item.category || "").toString().toLowerCase();
			return itemCategory.includes(normalizedCategory) || normalizedCategory.includes(itemCategory);
		}),
	[closet, normalizedCategory]);

	const {
		currentPage,
		currentPageData: paginatedItems,
		handleNextPage,
		handlePrevPage,
		totalPages,
		goToPage,
	} = usePagination(filteredItems, ITEMS_PER_PAGE);

	useEffect(() => {
		goToPage(1);
	}, [selectedCategory]);

	const gridKey = `${normalizedCategory}-${currentPage}`;
	const items = selectedCategory === null ? (closet.length > 0 ? paginatedItems : []) : paginatedItems;
	const showEmpty = selectedCategory === null ? closet.length === 0 : paginatedItems.length === 0;

	return (
		<div className="items-overview">
			<AnimatedContainer cacheKey={gridKey} className="items-grid">
				{showEmpty ? (
					<p className="no-results">No items found for "{selectedCategory}"</p>
				) : (
					items.map((item: ClothingItem) => (
						<ClothingCard key={item.id} item={item} onEditItem={onEditItem} />
					))
				)}
			</AnimatedContainer>
			<PaginationControls currentPage={currentPage} totalPages={totalPages} onNext={handleNextPage} onPrev={handlePrevPage} />
		</div>
	);
};

export default Closet;
