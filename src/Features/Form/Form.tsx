import { useState, FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DropDownSelect from "./DropDownSelect/DropDownSelect";
import CheckboxCollection from "./CheckboxCollection/CheckboxCollection";
import { ItemFormData, Option } from "../../utils/types";
import { colorOptions, sizeOptions, categoryOptions } from "../../utils/constants";

import "./Form.css";

// MULTI-STEP FORM
// We store 8 fields in "formData" and show them one at a time in Step1..Step8.

const item = {
	type: "",
	color: "",
	size: "",
	brand: "",
	material: "",
	occasion: "",
	age: "",
	care: "",
};

// TODO put back from AI
//removing OnComplete, currently does nothing, passes data no where
// { onComplete}: { onComplete: (data: FormData) => void}

function MultiStepForm() {
	// Manage step-based progression
	const [step, setStep] = useState(1);
	const [selectedOption, setSelectedOption] = useState<Option | null>(null);

	// Form data
	const [formData, setFormData] = useState<ItemFormData>(item);

	const handleOptionSelect = (option: Option) => {
		setSelectedOption(option);
		// You can add any additional handling for form submission or state updates here
	};

	// Helper: single selection for color
	const toggleColor = (value: string) => {
		setFormData((prev) => {
			if (prev.color === value) {
				// uncheck same color
				return { ...prev, color: "" };
			}
			// check new color
			return { ...prev, color: value };
		});
	};

	// Helper: single selection for size
	const toggleSize = (value: string) => {
		setFormData((prev) => {
			if (prev.size === value) {
				return { ...prev, size: "" };
			}
			return { ...prev, size: value };
		});
	};

	const handleNext = () => {
		setStep((prev) => prev + 1);
	};

	const handleBack = () => {
		setStep((prev) => prev - 1);
	};

	const handleSubmit = (e: FormEvent) => {
		e.preventDefault();
		console.log("submited", { formData });
		// When final step is submitted, pass data upward
		// onComplete(formData);
	};

	// Render each step conditionally
	// We'll put them all inside a single <motion.form> for simplicity
	return (
		<div className="form">
			<motion.form
				layout
				onSubmit={handleSubmit}
				initial={{ opacity: 0, scale: 0.8 }}
				animate={{ opacity: 1, scale: 1 }}
				transition={{ duration: 0.5 }}
			>
				{/* STEP 1: TYPE */}
				{step === 1 && (
					<div className="field-label">
						<label>Clothing Category</label>

						<DropDownSelect
							options={categoryOptions}
							onOptionSelect={handleOptionSelect}
							formField="type"
							setFormData={setFormData}
						/>
					</div>
				)}

				{/* STEP 2: COLOR */}
				{step === 2 && (
					<CheckboxCollection label="color" detailOptions={colorOptions} onToggleDetail={toggleColor} formData={formData} />
				)}

				{/* STEP 3: SIZE */}
				{step === 3 && (
					<CheckboxCollection label="size" detailOptions={sizeOptions} onToggleDetail={toggleSize} formData={formData} />
				)}

				{/* STEP 4: BRAND */}
				{step === 4 && (
					<div className="form-step">
						<label>Brand</label>
						<input
							value={formData.brand}
							onChange={(e: { target: { value: any } }) => setFormData((p) => ({ ...p, brand: e.target.value }))}
							placeholder="e.g. Gucci, Zara..."
						/>
					</div>
				)}

				{/* STEP 5: MATERIAL */}
				{step === 5 && (
					<div className="form-step">
						<label>Material</label>
						<input
							value={formData.material}
							onChange={(e: { target: { value: any } }) => setFormData((p) => ({ ...p, material: e.target.value }))}
							placeholder="e.g. Cotton, Silk..."
						/>
					</div>
				)}

				{/* STEP 6: OCCASION */}
				{step === 6 && (
					<div className="form-step">
						<label>Occasion</label>
						<input
							value={formData.occasion}
							onChange={(e: any) => setFormData((p) => ({ ...p, occasion: e.target.value }))}
							placeholder="e.g. Casual, Formal..."
						/>
					</div>
				)}

				{/* STEP 7: AGE */}
				{step === 7 && (
					<div className="form-step">
						<label>How old</label>
						<input
							value={formData.age}
							onChange={(e: any) => setFormData((p) => ({ ...p, age: e.target.value }))}
							placeholder="e.g. 2 years"
						/>
					</div>
				)}

				{/* STEP 8: CARE */}
				{step === 8 && (
					<div className="form-step">
						<label>Care Ilstructions</label>
						<input
							value={formData.care}
							onChange={(e: any) => setFormData((p) => ({ ...p, care: e.target.value }))}
							placeholder="e.g. Dry clean only"
						/>
					</div>
				)}

				{/* NAVIGATION bUTTONS */}
				<div className="form-controls">
					{step > 1 && (
						<button
							className="back-button"
							onClick={(e: any) => {
								e.preventDefault();
								handleBack();
							}}
						>
							Back
						</button>
					)}
					{step < 8 && (
						<button
							className="next-button"
							onClick={(e: any) => {
								e.preventDefault();
								handleNext();
							}}
						>
							Next
						</button>
					)}
					{step === 8 && (
						<button type="submit" className="submit" onClick={handleSubmit}>
							Submit
						</button>
					)}
				</div>
			</motion.form>
		</div>
	);
}

export default MultiStepForm;

// --------------------------------------------------------------------
// MAIN CLOSET INVENTORY APP
// --------------------------------------------------------------------
// export default function ClosetInventoryApp() {
//   const [view, setView] = React.useState<'carousel' | 'addItem' | 'overview'>("carousel");
//   const [currentIndex, setCurrentIndex] = React.useState(0);

//   // Example categories for the carousel
//   const categories = [
//     { label: 'Tops', icon: '👕' },
//     { label: 'Bottoms', icon: '👖' },
//     { label: 'Dresses', icon: '👗' },
//     { label: 'Coats', icon: '🧥' },
//     { label: 'Sweaters', icon: '🧶' },
//     { label: 'Lingerie', icon: '💃' },
//     { label: 'Socks', icon: '🧦' },
//     { label: 'Underwear', icon: '🩲' },
//   ];

//   const handleNext = () => {
//     setCurrentIndex((prevIndex) => (prevIndex + 1) % categories.length);
//   };

//   const handlePrev = () => {
//     setCurrentIndex((prevIndex) => (prevIndex - 1 + categories.length) % categories.length);
//   };

//   const [clothingItems, setClothingItems] = React.useState<any[]>([]);
//   const [statusMessage, setStatusMessage] = React.useState<string | null>(null);

//   // Called when multi-step form is complete
//   const handleCompleteForm = (data: {
//     type: string;
//     color: string;
//     size: string;
//     brand: string;
//     material: string;
//     occasion: string;
//     age: string;
//     care: string;
//   }) => {
//     const newItem = {
//       id: Date.now(),
//       ...data,
//     };
//     setClothingItems([...clothingItems, newItem]);
//     setStatusMessage('Item added successfully!');

//     // Return to carousel
//     setView('carousel');

//     // Clear status message in 2 seconds
//     setTimeout(() => setStatusMessage(null), 2000);
//   };

//   // For a 3-item visible carousel slice
//   const visibleItems = [
//     categories[currentIndex],
//     categories[(currentIndex + 1) % categories.length],
//     categories[(currentIndex + 2) % categories.length],
//   ];

//   return (
//     <motion.div
//       className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-b from-purple-900 via-green-900 to-brown-700 p-4"
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       transition={{ duration: 0.8 }}
//     >
//       {/* Background / Closet Imagery */}
//       <motion.div
//         className="absolute top-0 left-0 w-full h-full bg-cover bg-center opacity-25 pointer-events-none"
//         style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1606485278212-76851e1cae6b)' }}
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 0.25 }}
//         transition={{ duration: 1.5 }}
//       />

//       {/* Edison lightbulbs (abstract, decorative) */}
//       <motion.div
//         className="absolute top-8 right-8 bg-yellow-200 w-6 h-12 rounded-b-full"
//         animate={{ y: [0, 10, 0] }}
//         transition={{ repeat: Infinity, duration: 2 }}
//       />
//       <motion.div
//         className="absolute top-8 left-8 bg-yellow-200 w-6 h-12 rounded-b-full"
//         animate={{ y: [0, 10, 0] }}
//         transition={{ repeat: Infinity, duration: 2, delay: 1 }}
//       />

//       <motion.div className="z-10 w-full max-w-5xl flex flex-col items-center">
//         <h1 className="text-4xl text-white font-bold mb-4">My Closet Inventory</h1>

//         {/* Display status message if any */}
//         {statusMessage && (
//           <motion.div
//             className="mb-4 p-2 bg-green-300 text-black rounded-lg"
//             initial={{ scale: 0.8, opacity: 0 }}
//             animate={{ scale: 1, opacity: 1 }}
//             transition={{ duration: 0.2 }}
//           >
//             {statusMessage}
//           </motion.div>
//         )}

//         {/* Carousel View */}
//         {view === 'carousel' && (
//           <div className="relative w-full max-w-xl p-4 flex items-center justify-center">
//             <button onClick={handlePrev} className="absolute left-0">◀</button>
//             <div className="mx-4 overflow-hidden">
//               <AnimatePresence mode="wait">
//                 <motion.div
//                   key={currentIndex}
//                   className="flex space-x-4"
//                   initial={{ opacity: 0, x: 100 }}
//                   animate={{ opacity: 1, x: 0 }}
//                   exit={{ opacity: 0, x: -100 }}
//                   transition={{ duration: 0.3 }}
//                 >
//                   {visibleItems.map((item, i) => (
//                     <motion.div
//                       key={item.label + i}
//                       className="flex flex-col items-center justify-center min-w-[100px] bg-black/30 text-white p-4 rounded-2xl shadow-lg cursor-pointer"
//                       whileHover={{ scale: 1.05 }}
//                     >
//                       <div className="text-3xl mb-2">{item.icon}</div>
//                       <div className="text-lg">{item.label}</div>
//                     </motion.div>
//                   ))}
//                 </motion.div>
//               </AnimatePresence>
//             </div>
//             <button onClick={handleNext} className="absolute right-0">▶</button>
//           </div>
//         )}
//       </motion.div>

//       {/* Navigation buttons */}
//       <div className="mt-4">
//         <button onClick={() => setView('addItem')}>Add Item</button>
//         <button  className="ml-2" onClick={() => setView('overview')}>
//           View All Items
//         </button>
//       </div>

//       {/* Multi-step form */}
//       {view === 'addItem' && (
//         <MultiStepForm onComplete={handleCompleteForm} />
//       )}

//       {/* Overview of items */}
//       {view === 'overview' && (
//         <motion.div
//           className="w-full max-w-3xl mt-6 grid grid-cols-1 md:grid-cols-2 gap-4"
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           transition={{ duration: 0.5 }}
//         >
//           {clothingItems.map((item) => (
//             <Card key={item.id} className="bg-black/30 text-white">
//               <CardContent>
//                 <p>Type: {item.type}</p>
//                 <p>Color: {item.color}</p>
//                 <p>Size: {item.size}</p>
//                 <p>Brand: {item.brand}</p>
//                 <p>Material: {item.material}</p>
//                 <p>Occasion: {item.occasion}</p>
//                 <p>Age: {item.age}</p>
//                 <p>Care Instructions: {item.care}</p>
//               </CardContent>
//             </Card>
//           ))}
//         </motion.div>
//       )}
//     </motion.div>
//   );
// }

/*
  ========================
       EXISTING TESTS
  ========================
  import { render, screen, fireEvent } from '@testing-library/react';
  import ClosetInventoryApp from './ClosetInventoryApp';

  test('Add item flow', () => {
    render(<ClosetInventoryApp />);
    // Initially, carousel is shown
    expect(screen.queryByText('Add Item')).toBeInTheDocument();

    // Go to Add Item form (now multi-step)
    fireEvent.click(screen.getByText('Add Item'));
    expect(screen.getByPlaceholderText('Select clothing type')).toBeInTheDocument();

    // Minimally fill out brand to eventually pass existing test
    // But it's multiple steps now! We must skip forward to brand.
    // Step 1: pick type
    fireEvent.click(screen.getByText('Tops'));
    fireEvent.click(screen.getByText('Next')); // move to color
    fireEvent.click(screen.getByText('Next')); // skip color
    fireEvent.click(screen.getByText('Next')); // skip size

    // Now we are on Step 4: Brand
    fireEvent.change(screen.getByPlaceholderText('e.g. Gucci, Zara...'), {
      target: { value: 'Zara' },
    });

    // Move forward through steps until final
    fireEvent.click(screen.getByText('Next')); // material
    fireEvent.click(screen.getByText('Next')); // occasion
    fireEvent.click(screen.getByText('Next')); // age
    fireEvent.click(screen.getByText('Next')); // care

    // Finally "Submit"
    fireEvent.click(screen.getByText('Submit'));

    // Expect an item added message
    expect(screen.queryByText('Item added successfully!')).toBeInTheDocument();
  });

  test('Returns to carousel after adding an item', async () => {
    render(<ClosetInventoryApp />);

    // Navigate to Add Item
    fireEvent.click(screen.getByText('Add Item'));
    // We'll jump steps quickly to get to the final
    fireEvent.click(screen.getByText('Next')); // skip type
    fireEvent.click(screen.getByText('Next')); // skip color
    fireEvent.click(screen.getByText('Next')); // skip size
    fireEvent.click(screen.getByText('Next')); // skip brand
    fireEvent.click(screen.getByText('Next')); // skip material
    fireEvent.click(screen.getByText('Next')); // skip occasion
    fireEvent.click(screen.getByText('Next')); // skip age
    // On care step, fill something minimal
    fireEvent.change(screen.getByPlaceholderText('e.g. Dry clean only'), {
      target: { value: 'Wash Cold' },
    });
    fireEvent.click(screen.getByText('Submit'));

    // Once added, user sees the carousel again
    expect(await screen.findByText('View All Items')).toBeInTheDocument();
  });

  /*
    ================================
    NEW TESTS FOR MULTI-STEP LOGIC
    ================================
  */
//   test('Multi-step color selection is styled properly', () => {
//     render(<ClosetInventoryApp />);
//     fireEvent.click(screen.getByText('Add Item'));

//     // Step 1: Type => skip
//     fireEvent.click(screen.getByText('Next'));

//     // Step 2: Color
//     // Check 'red' => background red, text white
//     const redLabel = screen.getByLabelText('red').closest('label');
//     expect(redLabel).toHaveStyle('background-color: red');
//     // Select 'red'
//     fireEvent.click(screen.getByLabelText('red'));
//     expect(screen.getByLabelText('red')).toBeChecked();
//   });

//   test('User can go back steps', () => {
//     render(<ClosetInventoryApp />);
//     fireEvent.click(screen.getByText('Add Item'));
//     // Step 1 => Next => Step 2 => Next => Step 3 => ...
//     fireEvent.click(screen.getByText('Next'));
//     fireEvent.click(screen.getByText('Next'));
//     // Now we are on Step 3
//     expect(screen.queryByText('Size')).toBeInTheDocument();

//     // Go back => Step 2
//     fireEvent.click(screen.getByText('Back'));
//     expect(screen.queryByText('Color')).toBeInTheDocument();
//   });
