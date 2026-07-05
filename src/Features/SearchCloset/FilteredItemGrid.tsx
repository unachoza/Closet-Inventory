import { ClothingItem } from "../../utils/types";
import { BorderMode } from "../../utils/borderMode";
import FilteredCard from "./FilteredCard";
import "./EntireCloset.css";
import { AnimatePresence, motion, Variants } from "framer-motion";
import { LayoutGrid, Grid3x3 } from "lucide-react";

interface FilteredItemGridProps {
	items: ClothingItem[];
	matchKeysById: Map<string, string[]>;
	totalCount: number;
	/** Signature of the active filter/search/sort state. Changing it remounts the
	 *  container so the entrance stagger replays. It intentionally does NOT include
	 *  item count, so removing an item animates in place (popLayout) instead of
	 *  blanking and re-staggering the whole grid. */
	gridKey: string;
	compact?: boolean;
	onToggleDensity?: () => void;
	onEditItem?: (item: ClothingItem) => void;
	onRemoveItem?: (id: string) => void;
	borderMode?: BorderMode;
}

// Per-card variants. The stagger is driven by a per-index `delay` (via `custom`)
// rather than the parent's `staggerChildren`, because the inner AnimatePresence
// (needed for in-place removal) breaks parent→child variant propagation — the
// children never inherit an orchestrated stagger. Each card owns its own
// initial/animate/exit instead, so it works through AnimatePresence.
//
// On a gridKey change the whole container remounts, so every card mounts fresh
// and replays the staggered entrance. On a single removal (same gridKey) the
// surviving cards keep their keys → their animate target ({opacity:1,y:0}) is
// unchanged → Framer doesn't replay them; only the removed card runs `exit` and
// the rest reflow via `layout`. The shifting `delay` on survivors is inert
// because no target value changed.
const STAGGER_STEP = 0.06;

const cardVariants: Variants = {
	hidden: { opacity: 0, y: 12 },
	show: (i: number) => ({
		opacity: 1,
		y: 0,
		transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1], delay: i * STAGGER_STEP },
	}),
	exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

const FilteredItemGrid = ({ items, matchKeysById, totalCount, gridKey, compact, onToggleDensity, onEditItem, onRemoveItem, borderMode = "off" }: FilteredItemGridProps) => {
	return (
		<>
			<div className="entire-closet__meta-row">
				<p className="entire-closet__meta">
					Showing <strong>{items.length}</strong> of {totalCount} items
				</p>
				{onToggleDensity && (
					<button className="density-toggle" onClick={onToggleDensity} aria-label="Toggle density">
						{compact ? <LayoutGrid size={15} /> : <Grid3x3 size={15} />}
						{compact ? "Comfortable" : "Compact"}
					</button>
				)}
			</div>
			<div className="filtered-items-parent" role="list">
				{/* Container is keyed by the filter/search/sort signature (gridKey, which
				    excludes item count). Changing the query remounts it, so every card
				    mounts fresh and replays the staggered entrance. The inner
				    AnimatePresence owns removal: a single delete animates out (exit) and
				    the rest reflow (popLayout + layout) without re-staggering the grid. */}
				<motion.div key={gridKey} className={`items-grid${compact ? " items-grid--compact" : ""}`} layout>
					<AnimatePresence mode="popLayout">
						{items.map((item, i) => (
							<motion.div
								key={item.id}
								role="listitem"
								custom={i}
								variants={cardVariants}
								initial="hidden"
								animate="show"
								exit="exit"
								layout
							>
								<FilteredCard
									item={item}
									matchKeys={matchKeysById.get(item.id) ?? []}
									onEditItem={onEditItem}
									onRemoveItem={onRemoveItem}
									borderMode={borderMode}
								/>
							</motion.div>
						))}
					</AnimatePresence>
				</motion.div>
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
