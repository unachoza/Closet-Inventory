import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./Carousel.css";
// import { Card, CardContent } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

export default function ClosetInventoryApp() {
	const [view, setView] = React.useState<"carousel" | "addItem" | "overview">("carousel");
	const [currentIndex, setCurrentIndex] = React.useState(0);

	// Categories for the carousel
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

	// State for clothing items and status message
	const [clothingItems, setClothingItems] = React.useState([]);
	const [statusMessage, setStatusMessage] = React.useState<string | null>(null);

	// Form states
	const [type, setType] = React.useState("");
	const [color, setColor] = React.useState("");
	const [size, setSize] = React.useState("");
	const [brand, setBrand] = React.useState("");
	const [material, setMaterial] = React.useState("");
	const [occasion, setOccasion] = React.useState("");
	const [age, setAge] = React.useState("");
	const [care, setCare] = React.useState("");

	// Single-choice “checkboxes”
	const colorOptions = ["red", "brown", "black", "grey", "white", "floral", "blue", "gold", "green"];
	const sizeOptions = ["xs", "s", "m", "l", "0", "2", "4", "6", "8"];

	// If user checks an option, that option becomes the only selected.
	// If user unchecks the currently selected one, we reset it to ""
	const handleColorCheckbox = (c: string) => {
		if (color === c) {
			// Unchecking the same color => none selected
			setColor("");
		} else {
			// Checking a new color => that color replaces any previous selection
			setColor(c);
		}
	};

	const handleSizeCheckbox = (s: string) => {
		if (size === s) {
			setSize("");
		} else {
			setSize(s);
		}
	};

	// Add Item
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

		// Clear the form
		setType("");
		setColor("");
		setSize("");
		setBrand("");
		setMaterial("");
		setOccasion("");
		setAge("");
		setCare("");

		// Return to carousel
		setView("carousel");
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
				style={{ backgroundImage: "url(https://images.unsplash.com/photo-1606485278212-76851e1cae6b)" }}
				initial={{ opacity: 0 }}
				animate={{ opacity: 0.25 }}
				transition={{ duration: 1.5 }}
			/>

			{/* Carousel */}
			{view === "carousel" && (
				<div className="buttons-with-group">
					<button onClick={handlePrev} className="absolute left-0">
						◀
					</button>
					<div className="three-horz">
						<AnimatePresence>
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
			)}
		</motion.div>
	);
}

/*
  ========================
       BASIC TESTS
  ========================
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
    fireEvent.change(screen.getByPlaceholderText('e.g. Red, Blue...'), {
      target: { value: 'Red' },
    });
    fireEvent.change(screen.getByPlaceholderText('e.g. S, M, L...'), {
      target: { value: 'M' },
    });
    // ... fill out other fields as needed

    // Submit the form
    fireEvent.click(screen.getByText('Add Item'));

    // Expect an item added message
    expect(screen.queryByText('Item added successfully!')).toBeInTheDocument();
  });

  test('Returns to carousel after adding an item', async () => {
    render(<ClosetInventoryApp />);
    // Navigate to Add Item
    fireEvent.click(screen.getByText('Add Item'));

    // Provide minimal form data
    fireEvent.change(screen.getByPlaceholderText('e.g. Red, Blue...'), {
      target: { value: 'Gray' },
    });
    fireEvent.click(screen.getByText('Add Item'));

    // Once added, user sees the carousel again
    expect(await screen.findByText('View All Items')).toBeInTheDocument();
  });
*/
