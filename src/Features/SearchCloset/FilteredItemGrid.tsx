import { ClothingItem } from "../../utils/types";
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
	console.log({ items });
	return (
		<>
			<p className="entire-closet__meta">
				Showing <strong>{items.length}</strong> of {totalCount} items
			</p>
			<div className="filtered-items-parent"role="list">
				<AnimatePresence mode="wait">
					<motion.div
						key={`${items.length}-${totalCount}`} // <--- important: remounts when category changes
						className="items-grid"
						variants={containerVariants}
						initial="hidden"
						animate="show"
						exit="exit"
					>
						{items.map((item) => (
							<motion.div key={item.id} role="listitem" variants={cardVariants}>
								<FilteredCard item={item} matchKeys={matchKeysById.get(item.id) ?? []} onEditItem={onEditItem} />
							</motion.div>
						))}
					</motion.div>
				</AnimatePresence>
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
