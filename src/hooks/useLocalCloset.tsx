import { MY_CLOSET_DATA } from "../utils/constants";
import type { CategoryType, ClothingItem, ItemFormData } from "../utils/types";
import { useLocalStorage } from "./uselocalStorage";
import useStockPhoto from "./useStockPhoto";

const STORAGE_KEY = "my_closet_key";

// You can replace this with your own image asset path or CDN URL
const PLACEHOLDER_IMAGE = "https://placehold.co/300x400?text=No+Image";

export function useLocalStorageCloset() {
	const [closet, setCloset] = useLocalStorage(STORAGE_KEY, MY_CLOSET_DATA);

	const addItem = (newItem: ItemFormData) => {
		setCloset((prev: any) => {
			const updated = [
				...prev,
				{
					...newItem,
					id: crypto.randomUUID(),
					imageURL: useStockPhoto(newItem.category as CategoryType),
					name: newItem.brand ? `${newItem.brand} ${newItem.category}` : newItem.category,
				},
			];
			localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
			return updated;
		});
	};

	const getCloset = (): ClothingItem[] => {
		try {
			const stored = localStorage.getItem(STORAGE_KEY);
			return stored ? (JSON.parse(stored) as ClothingItem[]) : [];
		} catch {
			return [];
		}
	};

	const clearCloset = () => {
		localStorage.removeItem(STORAGE_KEY);
		setCloset([]);
	};

	return { closet, addItem, getCloset, clearCloset };
}
