import { useEffect, useState } from "react";
import { MY_CLOSET_DATA } from "../utils/constants"; // adjust path if needed
import type { ClothingItem } from "../utils/types";

const STORAGE_KEY = "my_closet";
const PLACEHOLDER_IMAGE = "https://placehold.co/300x400?text=No+Image";

export function useLocalStorageCloset() {
	const [closet, setCloset] = useState<ClothingItem[]>([]);

	// ✅ Initialize localStorage with MY_CLOSET_DATA if empty
	useEffect(() => {
		const stored = localStorage.getItem(STORAGE_KEY);

		if (stored) {
			try {
				const parsed = JSON.parse(stored);
				if (Array.isArray(parsed)) {
					setCloset(parsed);
				} else {
					// if invalid structure, reset
					localStorage.setItem(STORAGE_KEY, JSON.stringify(MY_CLOSET_DATA));
					setCloset(MY_CLOSET_DATA);
				}
			} catch {
				localStorage.setItem(STORAGE_KEY, JSON.stringify(MY_CLOSET_DATA));
				setCloset(MY_CLOSET_DATA);
			}
		} else {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(MY_CLOSET_DATA));
			setCloset(MY_CLOSET_DATA);
		}
	}, []);

	// ✅ Add new item on form submission
	const addItem = (newItem: ClothingItem) => {
		setCloset((prev) => {
			const updated = [...prev, { ...newItem, imageURL: PLACEHOLDER_IMAGE }];
			localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
			return updated;
		});
	};

	// ✅ Helper to manually read from storage (optional)
	const getCloset = () => {
		try {
			const stored = localStorage.getItem(STORAGE_KEY);
			return stored ? (JSON.parse(stored) as ClothingItem[]) : [];
		} catch {
			return [];
		}
	};

	return { closet, addItem, getCloset };
}
