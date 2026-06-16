import { ClothingItem } from "../../utils/types";
import { DndContext, DragEndEvent, PointerSensor, KeyboardSensor, useSensor, useSensors, closestCenter } from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, rectSortingStrategy } from "@dnd-kit/sortable";
import { SortableWrapper } from "../../Components/SortableWrapper/SortableWrapper";
import { useLocalStorageCloset } from "../../hooks/useLocalCloset";
import FilteredCard from "./FilteredCard";
import "./EntireCloset.css";
import { AnimatePresence, motion, Variants } from "framer-motion";

interface FilteredItemGridProps {
	items: ClothingItem[];
	matchKeysById: Map<string, string[]>;
	totalCount: number;
	onEditItem?: (item: ClothingItem) => void;
}

// Static — no need to recreate on every render
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
		transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] },
	},
	exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

const FilteredItemGrid = ({ items, matchKeysById, totalCount, onEditItem }: FilteredItemGridProps) => {
	const { reorderItems } = useLocalStorageCloset();

	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
		useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
	);

	const handleDragEnd = ({ active, over }: DragEndEvent) => {
		if (!over || active.id === over.id) return;
		reorderItems(active.id as string, over.id as string);
	};

	return (
		<>
			<p className="entire-closet__meta">
				Showing <strong>{items.length}</strong> of {totalCount} items
			</p>
			<div className="filtered-items-parent" role="list">
				<DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
					<SortableContext items={items.map((i) => i.id)} strategy={rectSortingStrategy}>
						{/* Outer AnimatePresence crossfades the whole grid when the category/filter
						    swaps (keyed on the result counts). The INNER popLayout AnimatePresence
						    coordinates each card's `layout` animation — without it, the per-item
						    motion.divs animate freely during a drag, their rects keep shifting, and
						    dnd-kit's collision detection resolves `over` to null so the drop is a
						    no-op. This mirrors the working overview grid (Closet.tsx). */}
						<AnimatePresence mode="wait">
							<motion.div
								key={`${items.length}-${totalCount}`}
								className="items-grid"
								variants={containerVariants}
								initial="hidden"
								animate="show"
								exit="exit"
							>
								<AnimatePresence mode="popLayout">
									{items.map((item) => (
										<SortableWrapper key={item.id} id={item.id} variants={cardVariants} role="listitem">
											<FilteredCard
												item={item}
												matchKeys={matchKeysById.get(item.id) ?? []}
												onEditItem={onEditItem}
											/>
										</SortableWrapper>
									))}
								</AnimatePresence>
							</motion.div>
						</AnimatePresence>
					</SortableContext>
				</DndContext>
				{items.length === 0 && (
					<div className="filtered-item-grid__empty">
						<p>No items match your search or filters.</p>
						<p className="filtered-item-grid__empty-hint">Try adjusting your search query or clearing some filters.</p>
					</div>
				)}
			</div>
		</>
	);
};

export default FilteredItemGrid;
