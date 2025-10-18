import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { carouselCategories } from "../../utils/constants";
import { CategoryType, CarouselProps } from "../../utils/types";
import "./Carousel.css";

const Carousel = ({ setCategory }: CarouselProps) => {
	const [visibleIndices, setVisibleIndices] = useState([0, 1, 2]);

	// Move the carousel forward by removing the leftmost item and adding the next item on the right
	const handleNext = () => {
		setVisibleIndices(([a, b, c]) => {
			const nextIndex = (c + 1) % carouselCategories.length; // next item after c
			return [b, c, nextIndex]; // shift left; add new item on the right
		});
	};

	// Move the carousel backward by removing the rightmost item and adding a new item on the left
	const handlePrev = () => {
		setVisibleIndices(([a, b, c]) => {
			const prevIndex = (a - 1 + carouselCategories.length) % carouselCategories.length; // item before a
			return [prevIndex, a, b]; // shift right; prepend the new item
		});
	};

	return (
		<motion.div className="carousel-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
			{/* Background / Closet Imagery */}

			{/* Carousel */}
			<div className="group-with-arrow-buttons">
				<button onClick={handlePrev} className="arrow-button left">
					◀
				</button>
				<div className="view-three">
					<AnimatePresence>
						{visibleIndices.map((index, i) => {
							const item = carouselCategories[index];
							return (
								<motion.div
									key={index}
									initial={{ x: i === 2 ? 200 : -200, opacity: 0 }}
									animate={{ x: 0, opacity: 1 }}
									exit={{ x: i === 0 ? -200 : 200, opacity: 0 }}
									transition={{ duration: 0.3 }}
									className="clothes-card"
									onClick={() => setCategory(item.label as CategoryType)}
								>
									<div className="emoji">{item.icon}</div>
									<div className="emoji-text">{item.label}</div>
								</motion.div>
							);
						})}
					</AnimatePresence>
				</div>
				<button onClick={handleNext} className="arrow-button right">
					▶
				</button>
			</div>
		</motion.div>
	);
};

export default Carousel;
