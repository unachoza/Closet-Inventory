import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { carouselCategories } from "../../utils/constants";
import { CategoryType, CarouselProps } from "../../utils/types";
import "./Carousel.css";

const Carousel = ({ setCategory }: CarouselProps) => {
	// We store exactly 3 “visible” indices (initially [0,1,2])
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
			<div className="buttons-with-group">
				<button onClick={handlePrev} className="absolute left-0">
					◀
				</button>
				<div className="three-horz">
					<AnimatePresence>
						{visibleIndices.map((index, i) => {
							const item = carouselCategories[index];
							// We'll animate the item in from the right if it's newly added going forward,
							// and out to the left if it's the leftmost being removed.
							// For Prev, we do the reverse. We keep it simple here.
							return (
								<motion.div
									key={index}
									// We do a quick check: if i === 2, it's likely the new item on "Next"...
									// if i === 0, it's likely the item leaving.
									// This logic is simplistic – you can refine if needed.
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
				<button onClick={handleNext} className="absolute right-0">
					▶
				</button>
			</div>
		</motion.div>
	);
};

export default Carousel;
