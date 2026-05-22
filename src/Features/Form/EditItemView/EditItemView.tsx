import "./EditItemView.css";
import { ClothingItem } from "../../../utils/types";
import { useLocalStorageCloset } from "../../../hooks/useLocalCloset";
import Input from "../TextInput/TextInput";
import { normalizeToString } from "../../../utils/normalizeToString";
import { ChangeEvent, useState } from "react";
import { motion } from "framer-motion";

interface EditItemViewProps {
	item: ClothingItem;
	updateItem?: (id: string, updatedItem: Partial<ClothingItem>) => void;
	toast?: (message: string) => void;
}

const EditItemView = ({ item, toast }: EditItemViewProps) => {
	console.log({ item });
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

	function setInputValue(value: string) {
		throw new Error("Function not implemented.");
	}

	return (
		<div className="form">
			<motion.form
				layout
				onSubmit={handleSubmit}
				initial={{ opacity: 0, scale: 0.8 }}
				animate={{ opacity: 1, scale: 1 }}
				transition={{ duration: 0.5 }}
			>
				<form onSubmit={handleSubmit}>
					{Object.entries(item).map((field) => (
						// console.log({ field })
						<Input
							name={field[0]}
							//      label={field[0].charAt(0).toUpperCase() + field[0].slice(1)}
							label={field[0]}
							value={normalizeToString(field[1])}
							placeholder={!field[1] ? `Enter ${field[0]}` : ""}
							handleFormUpdate={(e: ChangeEvent<HTMLInputElement>) => setInputValue(e.target.value)}
							onChange={handleChange}
						/>
					))}

					{/* 
                  <Input
                        type="text"
                        name={formData.name}
                        label="Name"
                        value={formData.name ?? ""}
                        onChange={handleChange}
                  />
                  <Input
                        type="text"
                        name={formData.name}
                        label="Size"
                        value={formData.size ?? ""}
                        onChange={handleChange}
                  />
                  <Input
                        type="text"
                        name={formData.name}
                        label="Brand"
                        value={formData.brand ?? ""}
                        onChange={handleChange}
                  />
                  <Input
                        type="text"
                        name={formData.name}
                        label="Material"
                        value={formData.material ?? ""}
                        onChange={handleChange}
                  />
                  <Input
                        type="text"
                        name={formData.name}
                        label="Occasion"
                        value={formData.occasion ?? ""}
                        onChange={handleChange}
                  />
                  <Input
                        type="text"
                        name={formData.name}
                        label="Age"
                        value={formData.age ?? ""}
                        onChange={handleChange}
                  />
                  <Input
                        type="text"
                        name={formData.name}
                        label="Care"
                        value={formData.care ?? ""}
                        onChange={handleChange}
                  />
                  <Input
                        type="number"
                        name={formData.name}
                        label="Price"
                        value={formData.price ?? ""}
                        onChange={handleChange}
                  />
                  <label>
                        On Sale:
                        <input
                              type="checkbox"
                        name={formData.name}
                              checked={formData.onSale}
                              onChange={handleChange}
                        />                 
                         </label>
                  <textarea
                  name={formData.name}
label="Notes"
                        value={formData.notes}
                        onChange={handleChange}
                  />
                  <input
                        type="text"
                        name={formData.name}
                        label="Image URL"
                        value={formData.imageURL}
                        onChange={handleChange}
                  /> */}
					<button type="submit">Save Changes</button>
				</form>
			</motion.form>
		</div>
	);
};

export default EditItemView;
