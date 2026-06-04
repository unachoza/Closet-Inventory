import { useEffect, useMemo } from "react";
import { motion, Variants } from "framer-motion";
import ClothingCard from "../../Components/ClothesCard/Card";
import PaginationControls from "../../Components/PaginationControls/PaginationControls";
import { useLocalStorageCloset } from "../../hooks/useLocalCloset";
import usePagination from "../../hooks/usePagination";
import { ClothingItem } from "../../utils/types";
import "./Closet.css";

interface ClosetProps {
	selectedCategory: string | null;
	onEditItem?: (item: ClothingItem) => void;
}

// Static — no need to recreate on every render
const containerVariants: Variants = {
	hidden: { opacity: 0 },
	show: {
		opacity: 1,
		transition: {
			staggerChildren: 0.08,
			delayChildren: 0.05,
		},
	},
};

const cardVariants: Variants = {
	hidden: { opacity: 0, y: 12 },
	show: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] },
	},
};

const ITEMS_PER_PAGE = 6;

const Closet = ({ selectedCategory, onEditItem }: ClosetProps) => {
	const { closet } = useLocalStorageCloset();

	const normalizedCategory = selectedCategory?.trim().toLowerCase() || "";

	// Only re-filter when closet data or category actually changes.
	const filteredItems = useMemo(() => {
		// No category selected → show the whole closet.
		if (!normalizedCategory) return closet;

		return closet.filter((item: ClothingItem) => {
			const itemCategory = (item.category || "").toString().trim().toLowerCase();
			// An item with no category must NOT match a specific filter. (Previously
			// `normalizedCategory.includes("")` was always true, so empty-category
			// items leaked into every category.)
			if (!itemCategory) return false;
			// Substring match both directions handles singular/plural mismatches
			// e.g. "coats" ⊇ "coat", "tops" ⊇ "top".
			return itemCategory.includes(normalizedCategory) || normalizedCategory.includes(itemCategory);
		});
	}, [closet, normalizedCategory]);

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

	const hasItems = paginatedItems.length > 0;
	const emptyLabel = selectedCategory?.trim() ? selectedCategory : "your closet";

	return (
		<>
			<div className="items-overview">
				{hasItems ? (
					<motion.div
						// Remount on category OR page change so the stagger replays. The
						// container's `staggerChildren` only orchestrates its children from
						// `hidden`→`show` when the parent mounts/re-keys; without `currentPage`
						// in the key, paging in new cards left them stuck at the `hidden`
						// variant (opacity:0 — present in the DOM but invisible). No
						// `mode="wait"` AnimatePresence here, so remounting is safe and can
						// never strand the grid waiting on an exit (the blank-screen bug).
						key={`${normalizedCategory || "all"}-${currentPage}`}
						className="items-grid"
						variants={containerVariants}
						initial="hidden"
						animate="show"
					>
						{paginatedItems.map((item: ClothingItem) => (
							<motion.div key={item.id} variants={cardVariants}>
								<ClothingCard item={item} onEditItem={onEditItem} />
							</motion.div>
						))}
					</motion.div>
				) : (
					<p className="no-results">{`No items found for "${emptyLabel}"`}</p>
				)}
			</div>
			<PaginationControls currentPage={currentPage} totalPages={totalPages} onNext={handleNextPage} onPrev={handlePrevPage} />
		</>
	);
};

export default Closet;
