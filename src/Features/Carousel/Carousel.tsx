import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./Carousel.css";
// import { Card, CardContent } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { closetImg } from "./constants";

function ClosetCarousel() {
	// const [view, setView] = React.useState<"carousel" | "addItem" | "overview">("carousel");
	const [currentIndex, setCurrentIndex] = React.useState(0);
	const [clothingItems, setClothingItems] = React.useState([]);
	const [statusMessage, setStatusMessage] = React.useState<string | null>(null);

	// Form state
	const [type, setType] = React.useState("");
	const [color, setColor] = React.useState("");
	const [size, setSize] = React.useState("");
	const [brand, setBrand] = React.useState("");
	const [material, setMaterial] = React.useState("");
	const [occasion, setOccasion] = React.useState("");
	const [age, setAge] = React.useState("");
	const [care, setCare] = React.useState("");

	// Carousel categories
	const categories = [
		{ label: "Tops", icon: "👕" },
		{ label: "Bottoms", icon: "👖" },
		{ label: "Dresses", icon: "👗" },
		{ label: "Coats", icon: "🧥" },
		{ label: "Sweaters", icon: "🧶" },
		{ label: "Lingerie", icon: "💃" },
		{ label: "Socks", icon: "🧦" },
		{ label: "Underwear", icon: "🩲" },
	];

	// We store exactly 3 “visible” indices (initially [0,1,2])
	const [visibleIndices, setVisibleIndices] = React.useState([0, 1, 2]);

	// Carousel navigation
	// Move the carousel forward by removing the leftmost item and adding the next item on the right
	const handleNext = () => {
		setVisibleIndices(([a, b, c]) => {
			const nextIndex = (c + 1) % categories.length; // next item after c
			return [b, c, nextIndex]; // shift left; add new item on the right
		});
	};

	// Move the carousel backward by removing the rightmost item and adding a new item on the left
	const handlePrev = () => {
		setVisibleIndices(([a, b, c]) => {
			const prevIndex = (a - 1 + categories.length) % categories.length; // item before a
			return [prevIndex, a, b]; // shift right; prepend the new item
		});
	};
	// // Carousel navigation
	// const handleNext = () => {
	// 	setCurrentIndex((prevIndex) => (prevIndex + 1) % categories.length);
	// };

	// const handlePrev = () => {
	// 	setCurrentIndex((prevIndex) => (prevIndex - 1 + categories.length) % categories.length);
	// };

	// Add item
	const handleAddItem = (e: React.FormEvent) => {
		e.preventDefault();
		const newItem = {
			id: Date.now(),
			type,
			color,
			size,
			brand,
			material,
			occasion,
			age,
			care,
		};
		setClothingItems([...clothingItems, newItem]);
		setStatusMessage("Item added successfully!");

		// Clear fields
		setType("");
		setColor("");
		setSize("");
		setBrand("");
		setMaterial("");
		setOccasion("");
		setAge("");
		setCare("");
	};

	return (
		<motion.div
			className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-b from-purple-900 via-green-900 to-brown-700 p-4"
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.8 }}
		>
			{/* Background / Closet Imagery */}
			<motion.div
				className="absolute top-0 left-0 w-full h-full bg-cover bg-center opacity-25 pointer-events-none"
				style={{ backgroundImage: `url(${closetImg})` }}
				initial={{ opacity: 0 }}
				animate={{ opacity: 0.25 }}
				transition={{ duration: 1.5 }}
			/>

			{/* Edison lightbulbs (abstract, decorative) */}

			{/* Main container */}
			<motion.div className="z-10 w-full max-w-5xl flex flex-col items-center">
				{/* <h1 className="text-4xl text-white font-bold mb-4">My Closet Inventory</h1> */}

				{/* Display status message if any */}
				{statusMessage && (
					<motion.div
						className="mb-4 p-2 bg-green-300 text-black rounded-lg"
						initial={{ scale: 0.8, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						transition={{ duration: 0.2 }}
						onAnimationComplete={() => {
							setTimeout(() => {
								setStatusMessage(null);
							}, 2000);
						}}
					>
						{statusMessage}
					</motion.div>
				)}

				{/* Carousel view */}
				<div className="carousel-container">
					<button onClick={handlePrev} className="absolute left-0">
						◀
					</button>
					<div className="three-horz">
						<AnimatePresence mode="wait">
							{visibleIndices.map((index, i) => {
								const item = categories[index];
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
									>
										<div className="text-3xl mb-2">{item.icon}</div>
										<div className="text-lg">{item.label}</div>
									</motion.div>
								);
							})}
							{/* {visibleIndices.map((index, i) => {
								const item = categories[index];
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
										className="group"
									>
										<div className="emoji">{item.icon}</div>
										<div className="emoji-text">{item.label}</div>
									</motion.div>
								);
							})} */}
							{/* <motion.div
								key={categories[currentIndex].label}
								initial={{ opacity: 0, x: 100 }}
								animate={{ opacity: 1, x: 0 }}
								exit={{ opacity: 0, x: -100 }}
								transition={{ duration: 0.3 }}
								className="carousel-card"
								whileHover={{ scale: 1.05 }}
							>
								<div className="emoji">{categories[currentIndex].icon}</div>
								<div className="emoji-text ">{categories[currentIndex].label}</div>
							</motion.div> */}
						</AnimatePresence>
					</div>
					<button onClick={handleNext} className="absolute right-0">
						▶
					</button>
				</div>
			</motion.div>

			{/* Overview of items */}
			{/* {view === "overview" && (
				<motion.div
					className="w-full max-w-3xl mt-6 grid grid-cols-1 md:grid-cols-2 gap-4"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.5 }}
				></motion.div> */}
		</motion.div>
	);
}

export default ClosetCarousel;

/*
  ========================
       BASIC TESTS
  ========================
  These tests assume you have a Jest/React Testing Library setup.

  import { render, screen, fireEvent } from '@testing-library/react';
  import ClosetInventoryApp from './ClosetInventoryApp';

  test('Add item flow', () => {
    render(<ClosetInventoryApp />);

    // Initially, carousel is shown
    expect(screen.queryByText('Add Item')).toBeInTheDocument();

    // Go to Add Item form
    fireEvent.click(screen.getByText('Add Item'));
    expect(screen.getByPlaceholderText('e.g. Red, Blue...')).toBeInTheDocument();

    // Fill out fields
    fireEvent.change(screen.getByPlaceholderText('e.g. Red, Blue...'), { target: { value: 'Red' } });
    fireEvent.change(screen.getByPlaceholderText('e.g. S, M, L...'), { target: { value: 'M' } });
    // ... fill out other fields as needed

    // Submit the form
    fireEvent.click(screen.getByText('Add Item'));

    // Expect an item added message
    expect(screen.queryByText('Item added successfully!')).toBeInTheDocument();
  });
*/
