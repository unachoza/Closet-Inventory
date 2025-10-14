import { AnimatePresence, motion, Variants } from "framer-motion";
import ClothingCard from "../../Components/ClothesCard/Card";
import { MY_CLOSET_DATA } from "../../utils/constants";
import { ClothingItem } from "../../utils/types";
import "./Closet.css";

interface ClosetProps {
	selectedCategory: string | null;
}

function Closet({ selectedCategory }: ClosetProps) {
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

	const normalizedCategory = selectedCategory.trim().toLowerCase();

	const filteredItems = MY_CLOSET_DATA.filter((item) => {
		const itemCategory = (item.category || "").toString().toLowerCase();
		return itemCategory.includes(normalizedCategory) || normalizedCategory.includes(itemCategory);
	});

	return (
		<div className="items-overview">
			<AnimatePresence mode="wait">
				<motion.div
					key={normalizedCategory} // <--- important: remounts when category changes
					className="items-grid"
					variants={containerVariants}
					initial="hidden"
					animate="show"
					exit="exit"
				>
					{filteredItems.length > 0 ? (
						filteredItems.slice(0, 6).map((item: ClothingItem) => (
							<motion.div key={item.id} variants={cardVariants}>
								<ClothingCard item={item} />
							</motion.div>
						))
					) : (
						<p className="no-results">No items found for “{selectedCategory}”</p>
					)}
				</motion.div>
			</AnimatePresence>
		</div>
	);
}

export default Closet;
