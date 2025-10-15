import { useEffect, useState } from "react";
import { MY_CLOSET_DATA } from "../utils/constants";
import type { ClothingItem, ItemFormData } from "../utils/types";

const STORAGE_KEY = "my_closet";

// You can replace this with your own image asset path or CDN URL
const PLACEHOLDER_IMAGE = "https://placehold.co/300x400?text=No+Image";

export function useLocalStorageCloset() {
	const [closet, setCloset] = useState<ClothingItem[]>([]);

	// ✅ Initialize closet from localStorage or fallback to default
	useEffect(() => {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored) {
			try {
				const parsed = JSON.parse(stored);
				if (Array.isArray(parsed)) {
					setCloset(parsed);
					return;
				}
			} catch {
				console.warn("Corrupted localStorage closet data — resetting...");
			}
		}
		// Default fallback
		localStorage.setItem(STORAGE_KEY, JSON.stringify(MY_CLOSET_DATA));
		setCloset(MY_CLOSET_DATA);
	}, []);

	// ✅ Add a new item (ItemFormData → ClothingItem)
	const addItem = (formItem: ItemFormData) => {
		const newItem: ClothingItem = {
			id: crypto.randomUUID(),
			imageURL: PLACEHOLDER_IMAGE, // 🎨 auto placeholder image
			name: formItem.brand ? `${formItem.brand} ${formItem.type}` : formItem.type,
			category: formItem.type,
			color: formItem.color,
			size: formItem.size,
			brand: formItem.brand,
			price: "",
			material: formItem.material,
			occasion: formItem.occasion,
			age: formItem.age,
			care: formItem.care,
			notes: "",
			onSale: false,
		};

		setCloset((prev) => {
			const updated = [...prev, newItem];
			localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
			return updated;
		});
	};

	// ✅ Retrieve all saved closet items (safe fallback)
	const getCloset = (): ClothingItem[] => {
		try {
			const stored = localStorage.getItem(STORAGE_KEY);
			return stored ? (JSON.parse(stored) as ClothingItem[]) : [];
		} catch {
			return [];
		}
	};

	// ✅ Optional: clear closet
	const clearCloset = () => {
		localStorage.removeItem(STORAGE_KEY);
		setCloset([]);
	};

	return { closet, addItem, getCloset, clearCloset };
}
