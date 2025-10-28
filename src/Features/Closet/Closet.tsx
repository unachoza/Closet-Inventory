import { useEffect } from "react";
import { AnimatePresence, motion, Variants } from "framer-motion";
import ClothingCard from "../../Components/ClothesCard/Card";
import { useLocalStorageCloset } from "../../hooks/useLocalCloset";
import { ClothingItem } from "../../utils/types";
import "./Closet.css";
import usePagination from "../../hooks/usePagination";
import PaginationControls from "../../Components/PaginationControls/PaginationControls";

interface ClosetProps {
	selectedCategory: string | null;
}

const ITEMS_PER_PAGE = 6;
const Closet = ({ selectedCategory }: ClosetProps) => {
	const { closet } = useLocalStorageCloset();

	const normalizedCategory = selectedCategory?.trim().toLowerCase() || "";
	const filteredItems = closet.filter((item: ClothingItem) => {
		const itemCategory = (item.category || "").toString().toLowerCase();
		return itemCategory.includes(normalizedCategory) || normalizedCategory.includes(itemCategory);
	});

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

	const containerVariants: Variants = {
		hidden: { opacity: 0 },
		show: {
			opacity: 1,
			transition: {
				staggerChildren: 0.12,
				delayChildren: 0.12,
			},
		},
		exit: { opacity: 0, transition: { duration: 0.2 } },
	};

	const cardVariants: Variants = {
		hidden: { opacity: 0, y: 12 },
		show: {
			opacity: 1,
			y: 0,
			transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }, // "easeOut"
		},
		exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
	};

	if (selectedCategory === null) {
		return (
			<div className="items-overview">
				<div className="items-grid empty-grid" />
			</div>
		);
	}

	console.log("has closet updated", { closet });

	return (
		<div className="items-overview">
			<AnimatePresence mode="wait">
				<motion.div
					key={`${normalizedCategory}-${currentPage}`} // <--- important: remounts when category changes
					className="items-grid"
					variants={containerVariants}
					initial="hidden"
					animate="show"
					exit="exit"
				>
					{paginatedItems.length > 0 ? (
						paginatedItems.map((item: ClothingItem) => (
							<motion.div key={item.id} variants={cardVariants}>
								<ClothingCard item={item} />
							</motion.div>
						))
					) : (
						<p className="no-results">No items found for “{selectedCategory}”</p>
					)}
				</motion.div>
			</AnimatePresence>
			<PaginationControls currentPage={currentPage} totalPages={totalPages} onNext={handleNextPage} onPrev={handlePrevPage} />
		</div>
	);
};

export default Closet;
