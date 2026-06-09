import { useMemo } from "react";
import { MY_CLOSET_DATA } from "../utils/constants";
import type { CategoryType, ClothingItem, ItemFormData } from "../utils/types";
import { normalizeMaterial } from "../utils/materialUtils";
import { useLocalStorage } from "./uselocalStorage";
import { safeSetItem } from "../utils/safeStorage";
import useStockPhoto from "./useStockPhoto";

const STORAGE_KEY = "my_closet_key";
// const STORAGE_KEY = "my_closet_key_v2";

export function useLocalStorageCloset() {
	const [closet, setCloset] = useLocalStorage<ClothingItem[]>(STORAGE_KEY, MY_CLOSET_DATA);

	// Transparently migrate legacy string material fields to MaterialBlend[]
	// so old localStorage data works without a manual migration step.
	const normalizedCloset = useMemo(() => closet.map((item) => ({ ...item, material: normalizeMaterial(item.material) })), [closet]);

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
			safeSetItem(STORAGE_KEY, JSON.stringify(updated));
			return updated;
		});
	};

	const addFullItem = (newItem: ClothingItem) => {
		setCloset((prev: ClothingItem[]) => {
			const updated = [...prev, newItem];
			safeSetItem(STORAGE_KEY, JSON.stringify(updated));
			return updated;
		});
	};

	/**
	 * Bulk-import items from a file. "replace" swaps the whole closet;
	 * "merge" appends to the existing one. Single atomic update either way.
	 */
	const importItems = (items: ClothingItem[], mode: "replace" | "merge") => {
		setCloset((prev: ClothingItem[]) => {
			const updated = mode === "replace" ? [...items] : [...prev, ...items];
			safeSetItem(STORAGE_KEY, JSON.stringify(updated));
			return updated;
		});
	};

	const removeItem = (id: string) => {
		setCloset((prev: ClothingItem[]) => {
			const updated = prev.filter((item) => item.id !== id);
			safeSetItem(STORAGE_KEY, JSON.stringify(updated));
			return updated;
		});
	};


	const updateItem = (id: string, updatedData: Partial<ClothingItem>) => {
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
			safeSetItem(STORAGE_KEY, JSON.stringify(updated));
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

	return { closet: normalizedCloset, addItem, addFullItem, importItems, removeItem, updateItem, getCloset, clearCloset };
}
