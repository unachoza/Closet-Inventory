import { MY_CLOSET_DATA } from "../utils/constants";
import type { CategoryType, ClothingItem, ItemFormData } from "../utils/types";
import { useLocalStorage } from "./uselocalStorage";
import useStockPhoto from "./useStockPhoto";

const STORAGE_KEY = "my_closet_key";

export function useLocalStorageCloset() {
	const [closet, setCloset] = useLocalStorage<ClothingItem[]>(STORAGE_KEY, MY_CLOSET_DATA);

	const addItem = (newItem: ItemFormData) => {
		setCloset((prev: ClothingItem[]) => {
			const photo = newItem.imageURL;
			const updated = [
				...prev,
				{
					...newItem,
					id: crypto.randomUUID(),
					imageURL: photo ? photo : useStockPhoto(newItem.category as CategoryType),
					name: newItem.brand ? `${newItem.brand} ${newItem.category}` : newItem.category,
				},
			];
			localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
			return updated;
		});
	};

	const addFullItem = (newItem: ClothingItem) => {
		setCloset((prev: ClothingItem[]) => {
			const updated = [...prev, newItem];
			localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
			return updated;
		});
	};

	const removeItem = (id: string) => {
		setCloset((prev: ClothingItem[]) => {
			const updated = prev.filter((item) => item.id !== id);
			localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
			return updated;
		});
		console.log("Removed item with id:", id);
		console.log("Current closet:", closet);
	};

	const getItem = (id: string): ClothingItem | undefined => {
		return closet.find((item) => item.id === id);
	}

	const updateItem = (id: string, updatedData: Partial<ItemFormData>) => {
		setCloset((prev: ClothingItem[]) => {
			const updated = prev.map((item) => {
				if (item.id === id) {
					const updatedItem = { ...item, ...updatedData };
					if (updatedData.imageURL) {
						updatedItem.imageURL = updatedData.imageURL;
					} else if (updatedData.category) {
						updatedItem.imageURL = useStockPhoto(updatedData.category as CategoryType);
					}
					return updatedItem;
				}
				return item;
			});
			localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
			return updated;
		});
	}

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

	return { closet, addItem, addFullItem, removeItem, updateItem, getCloset, clearCloset };
}
