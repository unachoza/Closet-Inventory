import "./EditItemView.css";
import { ClothingItem, ViewType } from "../../../utils/types";
import { useLocalStorageCloset } from "../../../hooks/useLocalCloset";
import TextInput from "../TextInput/TextInput";
import AnimatedCheckbox from "../CheckboxCollection/RadixCheckbox";

import { normalizeToString } from "../../../utils/normalizeToString";
import { Dispatch, SetStateAction, useState } from "react";
import { motion } from "framer-motion";
import { useToast } from "../../../Components/Toast/Toast";
import close from "../../../assets/close.svg";

export interface EditItemViewProps {
	item: ClothingItem;
	mode?: "edit" | "create";
	updateItem?: (id: string, updatedItem: Partial<ClothingItem>) => void;
	setView: Dispatch<SetStateAction<ViewType>>;
}

const EditItemView = ({ item, mode = "edit", setView }: EditItemViewProps) => {
	const isCreateMode = mode === "create";
	const { id, imageURL, onSale, notes, ...remaining } = item;
	const inputsToSeperate = { id, onSale, notes };
	const { updateItem, addItem } = useLocalStorageCloset();
	const { showToast } = useToast();

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
		category: item.category,
		color: item.color,
	});

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const onToggleDetail = (key: string, value: any) => {
		setFormData((prev) => ({ ...prev, [key]: !value }));
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (isCreateMode) {
			addItem({
				id: item.id || crypto.randomUUID(),
				category: formData.category ?? "",
				color: formData.color ?? "",
				size: formData.size ?? "",
				brand: formData.brand ?? "",
				material: formData.material ?? "",
				occasion: formData.occasion ?? "",
				age: formData.age ?? "",
				care: formData.care ?? "",
				image: "",
				imageURL: formData.imageURL,
			});
			showToast(`${formData.name || formData.category} added to your closet!`);
		} else {
			updateItem(item.id, formData);
			showToast(`${formData.name} updated`);
		}

		setTimeout(() => {
			setView("carousel");
		});
	};

	const separateFeilds = () => {
		return Object.entries(inputsToSeperate).map(([key, value]) => {
			if (key === "imageURL") {
				return (
					<TextInput
						key={key}
						name={key}
						label={key}
						value={normalizeToString(formData[key] ?? value)}
						placeholder={!value ? `Enter ${key}` : ""}
						handleFormUpdate={handleChange}
					/>
				);
			} else if (key === "onSale") {
				return (
					<AnimatedCheckbox key={key} label={key} checked={!!formData[key]} onCheckedChange={() => onToggleDetail(key, value)} />
				);
			} else if (key === "notes") {
				return (
					<label key={key}>
						{key}
						<textarea
							name={key}
							className="textarea"
							value={normalizeToString(formData[key] ?? value)}
							placeholder={!value ? `Enter ${key}` : ""}
							onChange={handleChange}
						></textarea>
					</label>
				);
			}
			return null;
		});
	};

	if (!item) {
		return (
			<div className="edit-form-error">
				<h2>Error: No item selected for editing.</h2>
				<p>Please select an item to edit.</p>
			</div>
		);
	}

	return (
		<div className="edit-form form">
			<img src={close} className="close-icon" onClick={() => setView("carousel")} alt="close icon" data-testid="close-icon" />
			<motion.form
				layout
				onSubmit={handleSubmit}
				initial={{ opacity: 0, scale: 0.8 }}
				animate={{ opacity: 1, scale: 1 }}
				transition={{ duration: 0.5 }}
			>
				<h2 className="card-title">
					{isCreateMode ? "Import Item" : item.name}
				</h2>

				{/* Image preview for create mode */}
				{isCreateMode && formData.imageURL && (
					<div className="edit-form-image-preview">
						<img
							src={formData.imageURL}
							alt={formData.name ?? "Product"}
							className="edit-form-preview-img"
						/>
					</div>
				)}

				<div className="form-fields">
					{Object.entries(remaining).map(([key, value]) => (
						<TextInput
							key={key}
							name={key}
							label={key}
							value={normalizeToString(formData[key] ?? value)}
							placeholder={!value ? `Enter ${key}` : ""}
							handleFormUpdate={handleChange}
						/>
					))}
					{separateFeilds()}
				</div>
				<button type="submit">
					{isCreateMode ? "Add to Closet" : "Save Changes"}
				</button>
			</motion.form>
		</div>
	);
};

export default EditItemView;
