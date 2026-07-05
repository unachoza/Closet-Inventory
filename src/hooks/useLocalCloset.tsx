import { useMemo, useState } from "react";
import { MY_CLOSET_DATA } from "../utils/constants";
import type { CategoryType, ClothingItem, ItemFormData, WearState } from "../utils/types";
import { normalizeMaterial } from "../utils/materialUtils";
import getStockPhoto from "../utils/getStockPhoto";
import { closetRepository } from "../services";

const STORAGE_KEY = "my_closet_key";

/**
 * Reactive closet hook.
 *
 * Persistence is delegated to the `closetRepository` seam (the single write
 * path — swap its implementation for Supabase, no consumer changes). This hook
 * owns only the React mirror + the business logic (id generation, stock-photo
 * fallback, name derivation) that the repository deliberately stays out of.
 *
 * Reads still seed synchronously from localStorage so render/test behavior is
 * unchanged. Porting the seed to an async `repository.getAll()` (with loading
 * state + cross-instance sync) is the E1-1.4 cloud step, not this one.
 */
function seed(): ClothingItem[] {
	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		return stored ? (JSON.parse(stored) as ClothingItem[]) : MY_CLOSET_DATA;
	} catch {
		return MY_CLOSET_DATA;
	}
}

/** @internal Pure-local hook (no Supabase sync). Use `useLocalStorageCloset` in production code. */
export function useLocalOnlyCloset() {
	const [closet, setCloset] = useState<ClothingItem[]>(seed);

	// Transparently migrate legacy string material fields to MaterialBlend[]
	// so old localStorage data works without a manual migration step.
	const normalizedCloset = useMemo(() => closet.map((item) => ({ ...item, material: normalizeMaterial(item.material) })), [closet]);

	const addItem = (newItem: ItemFormData) => {
		const photo = newItem.imageURL;
		const item: ClothingItem = {
			...newItem,
			id: crypto.randomUUID(),
			imageURL: photo ? photo : getStockPhoto(newItem.category as CategoryType),
			name: newItem.brand ? `${newItem.brand} ${newItem.category}` : newItem.category,
			material: normalizeMaterial(newItem.material),
			condition: newItem.condition as WearState | undefined,
		};
		setCloset((prev) => [...prev, item]);
		void closetRepository.add(item);
	};

	const addFullItem = (newItem: ClothingItem) => {
		const item = { ...newItem, material: normalizeMaterial(newItem.material) };
		setCloset((prev) => [...prev, item]);
		void closetRepository.add(item);
	};

	/**
	 * Bulk-import items from a file. "replace" swaps the whole closet;
	 * "merge" appends to the existing one. Single atomic update either way.
	 */
	const importItems = (items: ClothingItem[], mode: "replace" | "merge") => {
		setCloset((prev) => (mode === "replace" ? [...items] : [...prev, ...items]));
		void closetRepository.importItems(items, mode);
	};

	const removeItem = (id: string) => {
		setCloset((prev) => prev.filter((item) => item.id !== id));
		void closetRepository.remove(id);
	};

	const updateItem = (id: string, updatedData: Partial<ClothingItem>) => {
		// Derive the final patch (incl. stock-photo fallback) here, then persist
		// it through the seam — the repository applies the patch verbatim.
		const patch: Partial<ClothingItem> = { ...updatedData };
		if (!updatedData.imageURL && updatedData.category) {
			patch.imageURL = getStockPhoto(updatedData.category as CategoryType);
		}
		setCloset((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
		void closetRepository.update(id, patch);
	};

	const getCloset = (): ClothingItem[] => closet;

	const clearCloset = () => {
		setCloset([]);
		void closetRepository.clear();
	};

	return { closet: normalizedCloset, addItem, addFullItem, importItems, removeItem, updateItem, getCloset, clearCloset };
}

/**
 * Public alias — backed by `useCloudCloset` (Supabase sync when signed in,
 * offline-local when signed out). Kept under this name so all existing
 * component imports and test mocks require no path changes.
 */
export { useCloudCloset as useLocalStorageCloset } from "./useCloudCloset";
