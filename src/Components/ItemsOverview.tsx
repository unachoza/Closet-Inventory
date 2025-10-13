import { motion } from "framer-motion";
import { ClothingItem } from "../utils/types";
import "./ClothesCard/ClothingCard.css";
import { CHAT_CLOSET_DATA } from "../utils/constants";
import ClothingCard from "./ClothesCard/Card";

interface ItemsOverviewProps {
	clothingItems: ClothingItem[];
	category: string | null;
	onBack: () => void;
}

function ItemsOverview({ clothingItems, category, onBack }: ItemsOverviewProps) {
	// Framer Motion variants
	const containerVariants = {
		hidden: { opacity: 0 },
		show: {
			opacity: 1,
			transition: {
				staggerChildren: 0.15,
				delayChildren: 0.2,
			},
		},
	};

	const cardVariants = {
		hidden: { opacity: 0, y: 20 },
		show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
	};
	return (
		<div className="items-overview">
			<motion.div className="items-grid" variants={containerVariants} initial="hidden" animate="show">
				{clothingItems.slice(0, 3).map((item) => (
					<motion.div key={item.id} variants={cardVariants}>
						<ClothingCard key={item.id} item={item} />
					</motion.div>
				))}
			</motion.div>

			<motion.button className="back-button" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onBack}>
				Back to Carousel
			</motion.button>
		</div>
	);
}
export default ItemsOverview;
