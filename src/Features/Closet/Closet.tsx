import { useEffect, useMemo } from "react";
import { AnimatePresence, motion, Variants } from "framer-motion";
import { DndContext, DragEndEvent, PointerSensor, KeyboardSensor, useSensor, useSensors, closestCenter } from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, rectSortingStrategy } from "@dnd-kit/sortable";
import { SortableWrapper } from "../../Components/SortableWrapper/SortableWrapper";
import ClothingCard from "../../Components/ClothesCard/Card/Card";
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
	exit: {
		opacity: 0,
		scale: 0.85,
		transition: { duration: 0.2, ease: "easeIn" },
	},
};

const ITEMS_PER_PAGE = 6;

const Closet = ({ selectedCategory, onEditItem }: ClosetProps) => {
	const { closet, removeItem, reorderItems } = useLocalStorageCloset();

	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
		useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
	);

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

	const handleDragEnd = ({ active, over }: DragEndEvent) => {
		if (!over || active.id === over.id) return;
		reorderItems(active.id as string, over.id as string);
	};

	const hasItems = paginatedItems.length > 0;
	const emptyLabel = selectedCategory?.trim() ? selectedCategory : "your closet";

	return (
		<>
			<div className="items-overview">
				{hasItems ? (
					<DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
						<SortableContext items={paginatedItems.map((i) => i.id)} strategy={rectSortingStrategy}>
							<motion.div
								key={`${normalizedCategory || "all"}-${currentPage}`}
								className="items-grid"
								variants={containerVariants}
								initial="hidden"
								animate="show"
							>
								<AnimatePresence mode="popLayout">
									{paginatedItems.map((item: ClothingItem) => (
										<SortableWrapper key={item.id} id={item.id} variants={cardVariants}>
											<ClothingCard item={item} onEditItem={onEditItem} onRemoveItem={removeItem} />
										</SortableWrapper>
									))}
								</AnimatePresence>
							</motion.div>
						</SortableContext>
					</DndContext>
				) : (
					<p className="no-results">{`No items found for "${emptyLabel}"`}</p>
				)}
			</div>
			<PaginationControls currentPage={currentPage} totalPages={totalPages} onNext={handleNextPage} onPrev={handlePrevPage} />
		</>
	);
};

export default Closet;
