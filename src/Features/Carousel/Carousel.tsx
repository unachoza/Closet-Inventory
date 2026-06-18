import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { carouselCategories } from "../../utils/constants";
import { CategoryType, CarouselProps } from "../../utils/types";
import "./Carousel.css";
import leftIcon from "../../assets/directions-icons/left-arrow.svg"
import rightIcon from "../../assets/directions-icons/right-arrow.svg"

const Carousel = ({ setCategory }: CarouselProps) => {
	const [visibleIndices, setVisibleIndices] = useState([0, 1, 2]);
	// True only for the first mount, so the "rack of clothes" entrance (slide in
	// from the right, staggered, with a subtle overshoot) plays once on load.
	// After mount, next/prev use the quick directional slide below.
	const [isInitial, setIsInitial] = useState(true);
	useEffect(() => {
		setIsInitial(false);
	}, []);

	// Move the carousel forward by removing the leftmost item and adding the next item on the right
	const handleNext = () => {
		setVisibleIndices(([, b, c]) => {
			const nextIndex = (c + 1) % carouselCategories.length; // next item after c
			return [b, c, nextIndex]; // shift left; add new item on the right
		});
	};

	// Move the carousel backward by removing the rightmost item and adding a new item on the left
	const handlePrev = () => {
		setVisibleIndices(([a, b]) => {
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
					<img src={leftIcon} alt={leftIcon} className="directions-icons" />
				</button>
				<div className="view-three">
					<AnimatePresence>
						{visibleIndices.map((index, i) => {
							const item = carouselCategories[index];
							const icon = item.icon;
							return (
								// TODO: Change the clothes cards to buttons that update the category state when clicked.
								<motion.div
									key={index}
									initial={isInitial ? { x: 360, opacity: 0 } : { x: i === 2 ? 200 : -200, opacity: 0 }}
									animate={{ x: 0, opacity: 1 }}
									exit={{ x: i === 0 ? -200 : 200, opacity: 0 }}
									transition={
										isInitial
											? {
													// "Rack of clothes" entrance: pause so the closet photo
													// shines, then cards rail in left-to-right with a subtle
													// overshoot (spring damping ratio ~0.75 ≈ ~3% overshoot).
													delay: 0.75 + i * 0.12,
													type: "spring",
													stiffness: 200,
													damping: 21,
											  }
											: { duration: 0.3 }
									}
									className="clothes-card"
									onClick={() => setCategory(item.label as CategoryType)}
								>
									<img src={icon} alt={icon} className="carousel-icons" />
									{/* <div className="emoji">{item.icon}</div> */}
									<div className="emoji-text">{item.label}</div>
								</motion.div>
							);
						})}
					</AnimatePresence>
				</div>
				<button onClick={handleNext} className="arrow-button right">
				<img src={rightIcon} alt={rightIcon} className="directions-icons" />
				</button>
			</div>
		</motion.div>
	);
};

export default Carousel;
