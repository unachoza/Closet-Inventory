import React, { useMemo } from "react";
import { AnimatePresence, motion, Variants } from "framer-motion";

export type AnimationDirection = "fromBottom" | "fromTop" | "fromLeft" | "fromRight";

interface AnimatedContainerProps {
	children: React.ReactNode;
	/** Changing this value triggers an exit + re-enter animation on the container. */
	cacheKey?: React.Key;
	className?: string;
	/** Direction cards slide in from. Default: "fromBottom". */
	direction?: AnimationDirection;
	/** AnimatePresence mode. Default: "wait". */
	mode?: "sync" | "wait" | "popLayout";
	// Accessibility props forwarded to the outer motion.div
	id?: string;
	role?: string;
	"aria-label"?: string;
}

export const containerVariants: Variants = {
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

// Entry offset per direction; exit is the mirror (so fromBottom enters rising, exits by
// continuing upward rather than reversing back down).
const DIRECTION_OFFSETS: Record<AnimationDirection, { hidden: object; exit: object }> = {
	fromBottom: { hidden: { y: 12 }, exit: { y: -8 } },
	fromTop: { hidden: { y: -12 }, exit: { y: 8 } },
	fromLeft: { hidden: { x: -12 }, exit: { x: 8 } },
	fromRight: { hidden: { x: 12 }, exit: { x: -8 } },
};

export const makeCardVariants = (direction: AnimationDirection): Variants => {
	const { hidden, exit } = DIRECTION_OFFSETS[direction];
	return {
		hidden: { opacity: 0, ...hidden },
		show: {
			opacity: 1,
			x: 0,
			y: 0,
			transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] },
		},
		exit: { opacity: 0, ...exit, transition: { duration: 0.2 } },
	};
};

/**
 * Wraps children in an AnimatePresence + staggered motion container.
 * Each direct child is automatically wrapped in a motion.div so callers
 * don't need to import framer-motion themselves.
 *
 * Change `cacheKey` to trigger an exit/re-enter animation (e.g. when the
 * page or filter changes).
 */
const AnimatedContainer = ({
	children,
	cacheKey,
	className,
	direction = "fromBottom",
	mode = "wait",
	id,
	role,
	"aria-label": ariaLabel,
}: AnimatedContainerProps) => {
	const cardVariants = useMemo(() => makeCardVariants(direction), [direction]);

	return (
		<AnimatePresence mode={mode}>
			<motion.div
				key={cacheKey}
				className={className}
				variants={containerVariants}
				initial="hidden"
				animate="show"
				exit="exit"
				id={id}
				role={role}
				aria-label={ariaLabel}
			>
				{React.Children.map(children, (child, i) => (
					<motion.div key={i} variants={cardVariants}>
						{child}
					</motion.div>
				))}
			</motion.div>
		</AnimatePresence>
	);
};

export default AnimatedContainer;
