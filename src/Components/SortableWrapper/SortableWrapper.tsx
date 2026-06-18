import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";
import "./SortableWrapper.css";

interface SortableWrapperProps {
	id: string;
	children: ReactNode;
	variants?: Variants;
	role?: string;
}

const GripIcon = () => (
	<svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
		<circle cx="4" cy="3" r="1.25" fill="currentColor" />
		<circle cx="4" cy="7" r="1.25" fill="currentColor" />
		<circle cx="4" cy="11" r="1.25" fill="currentColor" />
		<circle cx="10" cy="3" r="1.25" fill="currentColor" />
		<circle cx="10" cy="7" r="1.25" fill="currentColor" />
		<circle cx="10" cy="11" r="1.25" fill="currentColor" />
	</svg>
);

/**
 * Wraps a card so it can be reordered via drag-and-drop.
 *
 * The dnd-kit sortable node (inner div) and the framer-motion node (outer div)
 * are intentionally SEPARATE elements. Both libraries write to the CSS
 * `transform` property; if they share one element, framer-motion's animation
 * loop overrides dnd-kit's drag transform and the card never follows the
 * cursor. Keeping them on different elements lets framer own entrance/exit and
 * dnd-kit own the drag translation.
 */
export const SortableWrapper = ({ id, children, variants, role }: SortableWrapperProps) => {
	const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id });

	const dragStyle = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	return (
		<motion.div variants={variants} exit="exit" layout role={role}>
			<div ref={setNodeRef} style={dragStyle} className={`sortable-wrapper${isDragging ? " sortable-wrapper--dragging" : ""}`}>
				<button
					ref={setActivatorNodeRef}
					{...listeners}
					{...attributes}
					className="drag-handle"
					aria-label="Drag to reorder"
					tabIndex={0}
					type="button"
				>
					<GripIcon />
				</button>
				{children}
			</div>
		</motion.div>
	);
};
