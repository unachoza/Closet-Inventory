import "./EditItemView.css";
import { ClothingItem } from "../../../utils/types";
import { useLocalStorageCloset } from "../../../hooks/useLocalCloset";
import Input from "../TextInput/TextInput";
import AnimatedCheckbox from "../CheckboxCollection/RadixCheckbox";

import { normalizeToString } from "../../../utils/normalizeToString";
import { ChangeEvent, useState } from "react";
import { motion } from "framer-motion";
import { i } from "framer-motion/client";

interface EditItemViewProps {
	item: ClothingItem;
	updateItem?: (id: string, updatedItem: Partial<ClothingItem>) => void;
	toast?: (message: string) => void;
}

const EditItemView = ({ item, toast }: EditItemViewProps) => {
	if (!item) {
		return (
			<div className="edit-form-error">
				<h2>Error: No item selected for editing.</h2>
				<p>Please select an item to edit.</p>
			</div>
		);
	}
	console.log({ item });
	const { id, imageURL, onSale, notes, ...remaining } = item;
	const inputsToSeperate = { id, imageURL, onSale, notes };
	console.log({ inputsToSeperate });

	const [formData, setFormData] = useState<Partial<ClothingItem>>({
		name: item.name,
		size: item.size,
		brand: item.brand,
		material: item.material,
		occasion: item.occasion,
		age: item.age,
		care: item.care,
		price: item.price,
		onSale: item.onSale,
		notes: item.notes,
		imageURL: item.imageURL,
	});
	const { updateItem } = useLocalStorageCloset();

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (updateItem) {
			updateItem(item.id, formData);
			if (toast) toast("Item updated successfully!");
		}
	};

	const separateFeilds = () => {
		return Object.entries(inputsToSeperate).map(([key, value]) => {
			if (key === "imageURL") {
				return (
					<Input
						name={key}
						label={key}
						value={normalizeToString(value)}
						placeholder={!value ? `Enter ${key}` : ""}
						handleFormUpdate={(e: ChangeEvent<HTMLInputElement>) => setInputValue(e.target.value)}
						onChange={handleChange}
					/>
				);
			} else if (key === "onSale") {
				return <AnimatedCheckbox key={key} label={key} checked={key === value} onCheckedChange={() => onToggleDetail(key, value)} />;
			} else if (key === "notes") {
				return (
					<Input
						type="textarea"
						label={key}
						name={key}
						value={normalizeToString(value)}
						placeholder={!value ? `Enter ${key}` : ""}
						handleFormUpdate={(e: ChangeEvent<HTMLInputElement>) => setInputValue(e.target.value)}
						onChange={handleChange}
					/>
				);
			}
		});
	};

	// TODO: fix imageURL
	return (
		<div className="edit-form form">
			<motion.form
				layout
				onSubmit={handleSubmit}
				initial={{ opacity: 0, scale: 0.8 }}
				animate={{ opacity: 1, scale: 1 }}
				transition={{ duration: 0.5 }}
			>
				<h2 className="card-title">{item.name}</h2>
				<div className="form-fields">
					{/* // TODO: Refactor to remove imageURL field and add image upload functionality, onSale field should be a checkbox, and notes field should be a textarea */}
					{Object.entries(remaining).map((field) => (
						<Input
							name={field[0]}
							label={field[0]}
							value={normalizeToString(field[1])}
							placeholder={!field[1] ? `Enter ${field[0]}` : ""}
							handleFormUpdate={(e: ChangeEvent<HTMLInputElement>) => setInputValue(e.target.value)}
							onChange={handleChange}
						/>
					))}
					{separateFeilds(inputsToSeperate)}
				</div>
				<button type="submit">Save Changes</button>
			</motion.form>
		</div>
	);
};

export default EditItemView;
