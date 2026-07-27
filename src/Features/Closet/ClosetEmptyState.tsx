import { Shirt, Plus } from "lucide-react";
import "./ClosetEmptyState.css";

interface ClosetEmptyStateProps {
	/** True when the closet has items but the active category filter matches none. */
	isFiltered: boolean;
	/** The category the user filtered by (only meaningful when isFiltered). */
	categoryLabel?: string;
	/** Opens the add-item flow. Omitted in read-only contexts. */
	onAddItem?: () => void;
}

/**
 * Replaces the old dead-end `No items found for "your closet"` string. Two modes:
 * - Truly empty closet → a welcoming empty state with an "Add your first piece" CTA.
 * - Filtered-to-empty → tells the user nothing matched the active category (no CTA,
 *   since the fix is to change the filter, not to add an item).
 */
const ClosetEmptyState = ({ isFiltered, categoryLabel, onAddItem }: ClosetEmptyStateProps) => {
	if (isFiltered) {
		return (
			<div className="closet-empty" role="status" data-testid="closet-empty">
				<div className="closet-empty__icon" aria-hidden="true">
					<Shirt size={40} strokeWidth={1.5} />
				</div>
				<p className="closet-empty__title">Nothing in {categoryLabel?.trim() || "this category"} yet</p>
				<p className="closet-empty__subtitle">Try a different category, or add a piece to fill it in.</p>
			</div>
		);
	}

	return (
		<div className="closet-empty" role="status">
			<div className="closet-empty__icon" aria-hidden="true">
				<Shirt size={40} strokeWidth={1.5} />
			</div>
			<p className="closet-empty__title">Your closet is empty</p>
			<p className="closet-empty__subtitle">Add your first piece to start building your digital closet.</p>
			{onAddItem && (
				<button className="closet-empty__cta" onClick={onAddItem} type="button">
					<Plus size={18} strokeWidth={2} />
					Add your first piece
				</button>
			)}
		</div>
	);
};

export default ClosetEmptyState;
