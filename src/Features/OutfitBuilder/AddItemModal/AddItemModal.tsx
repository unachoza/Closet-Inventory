import { useCallback, useRef, useState } from "react";
import { Upload, X } from "lucide-react";
import { ClothingItem, ItemCategory } from "../utils/types";
import { ITEM_CATEGORIES } from "../utils/data";

import "./AddItemModal.css";

interface AddItemModalProps {
	onClose: () => void;
	onAdd: (item: Omit<ClothingItem, "id">) => void;
}

export function AddItemModal({ onClose, onAdd }: AddItemModalProps) {
	const [name, setName] = useState("");
	const [category, setCategory] = useState<ItemCategory | null>(null);
	const [imageUrl, setImageUrl] = useState<string | null>(null);
	const [dragging, setDragging] = useState(false);

	const inputRef = useRef<HTMLInputElement>(null);

	const handleFile = (file: File) => {
		if (file.type.startsWith("image/")) {
			setImageUrl(URL.createObjectURL(file));
		}
	};

	const handleDrop = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		setDragging(false);

		const file = e.dataTransfer.files?.[0];
		if (file) handleFile(file);
	}, []);

	const submit = () => {
		if (!imageUrl || !category || !name.trim()) return;

		const newItem = {
			name: name.trim(),
			category,
			imageUrl,
			colorHex: "#888888",
		};
		console.log("added new item", { newItem });
		onAdd(newItem);

		onClose();
	};

	return (
		<div className="add-modal" onClick={onClose}>
			<div className="add-modal__panel" onClick={(e) => e.stopPropagation()}>
				{/* Drag handle */}
				<div className="add-modal__handle" />

				{/* Header */}
				<div className="add-modal__header">
					<div>
						<h3 className="add-modal__title">Add to Closet</h3>

						<p className="add-modal__subtitle">Upload a photo from your closet</p>
					</div>

					<button type="button" className="add-modal__close" onClick={onClose}>
						<X size={16} strokeWidth={1.5} />
					</button>
				</div>

				{/* Drop zone */}
				<div
					className={`add-modal__dropzone ${dragging ? "add-modal__dropzone--active" : ""}`}
					onClick={() => inputRef.current?.click()}
					onDragOver={(e) => {
						e.preventDefault();
						setDragging(true);
					}}
					onDragLeave={() => setDragging(false)}
					onDrop={handleDrop}
				>
					{imageUrl ? (
						<>
							<img src={imageUrl} alt="Preview" className="add-modal__preview" />

							<button
								type="button"
								className="add-modal__remove-image"
								onClick={(e) => {
									e.stopPropagation();
									setImageUrl(null);
								}}
							>
								<X size={12} strokeWidth={2} />
							</button>
						</>
					) : (
						<div className="add-modal__dropzone-content">
							<Upload size={24} strokeWidth={1.5} />

							<p>Tap to upload a photo</p>

							<span>PNG, JPG, WEBP</span>
						</div>
					)}
				</div>

				<input
					ref={inputRef}
					type="file"
					accept="image/*"
					className="add-modal__file-input"
					onChange={(e) => {
						const file = e.target.files?.[0];
						if (file) handleFile(file);
					}}
				/>

				{/* Name */}
				<div className="add-modal__field">
					<label>Item name</label>

					<input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Blue linen blazer" />
				</div>

				{/* Category */}
				<div className="add-modal__field">
					<label>Category</label>

					<div className="add-modal__grid">
						{ITEM_CATEGORIES.map((cat) => {
							const isActive = category === cat;

							return (
								<button
									key={cat}
									type="button"
									className={`add-modal__category ${isActive ? "add-modal__category--active" : ""}`}
									onClick={() => setCategory(cat)}
								>
									{cat}
								</button>
							);
						})}
					</div>
				</div>

				{/* Submit */}
				<button type="button" className="add-modal__submit" onClick={submit} disabled={!imageUrl || !category || !name.trim()}>
					Add to closet
				</button>
			</div>
		</div>
	);
}
