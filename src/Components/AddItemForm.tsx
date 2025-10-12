import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { ClothingItem } from "../App";

interface AddItemFormProps {
	onSubmitItem: (newItem: ClothingItem) => void;
	onCancel: () => void;
}

function AddItemForm({ onSubmitItem, onCancel }: AddItemFormProps) {
	const [type, setType] = React.useState("");
	const [color, setColor] = React.useState("");
	const [size, setSize] = React.useState("");
	const [brand, setBrand] = React.useState("");
	const [material, setMaterial] = React.useState("");
	const [occasion, setOccasion] = React.useState("");
	const [age, setAge] = React.useState("");
	const [care, setCare] = React.useState("");

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const newItem: ClothingItem = {
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

		// Call parent's handler
		onSubmitItem(newItem);

		// Optionally reset the form here if you want to remain on the same page
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
		<motion.form
			onSubmit={handleSubmit}
			className="w-full max-w-lg mt-6 bg-blue-100 p-6 rounded-2xl"
			initial={{ opacity: 0, scale: 0.8 }}
			animate={{ opacity: 1, scale: 1 }}
			transition={{ duration: 0.5 }}
		>
			{/* Type */}
			<div className="mb-4">
				<Label>Type</Label>
				<Select value={type} onValueChange={setType}>
					<SelectTrigger>
						<SelectValue placeholder="Select clothing type" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="tops">Tops</SelectItem>
						<SelectItem value="bottoms">Bottoms</SelectItem>
						<SelectItem value="dresses">Dresses</SelectItem>
						<SelectItem value="coats">Coats</SelectItem>
						<SelectItem value="sweaters">Sweaters</SelectItem>
						<SelectItem value="lingerie">Lingerie</SelectItem>
						<SelectItem value="socks">Socks</SelectItem>
						<SelectItem value="underwear">Underwear</SelectItem>
					</SelectContent>
				</Select>
			</div>

			{/* Color */}
			<div className="mb-4">
				<Label>Color</Label>
				<Input value={color} onChange={(e) => setColor(e.target.value)} placeholder="e.g. Red, Blue..." />
			</div>

			{/* Size */}
			<div className="mb-4">
				<Label>Size</Label>
				<Input value={size} onChange={(e) => setSize(e.target.value)} placeholder="e.g. S, M, L..." />
			</div>

			{/* Brand */}
			<div className="mb-4">
				<Label>Brand</Label>
				<Input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="e.g. Gucci, Zara..." />
			</div>

			{/* Material */}
			<div className="mb-4">
				<Label>Material</Label>
				<Input value={material} onChange={(e) => setMaterial(e.target.value)} placeholder="e.g. Cotton, Silk..." />
			</div>

			{/* Occasion */}
			<div className="mb-4">
				<Label>Occasion</Label>
				<Input value={occasion} onChange={(e) => setOccasion(e.target.value)} placeholder="e.g. Casual, Formal..." />
			</div>

			{/* Age */}
			<div className="mb-4">
				<Label>How old</Label>
				<Input value={age} onChange={(e) => setAge(e.target.value)} placeholder="e.g. 2 years" />
			</div>

			{/* Care Instructions */}
			<div className="mb-4">
				<Label>Care Instructions</Label>
				<Input value={care} onChange={(e) => setCare(e.target.value)} placeholder="e.g. Dry clean only" />
			</div>

			{/* Buttons */}
			<div className="flex gap-2">
				<Button type="submit" className="w-full">
					Add Item
				</Button>
				<Button variant="secondary" onClick={onCancel}>
					Cancel
				</Button>
			</div>
		</motion.form>
	);
}

export default AddItemForm;
