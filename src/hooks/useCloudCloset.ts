import { useContext, useEffect, useMemo, useState } from "react";
import { MY_CLOSET_DATA } from "../utils/constants";
import type { CategoryType, ClothingItem, ItemFormData } from "../utils/types";
import { normalizeMaterial } from "../utils/materialUtils";
import getStockPhoto from "../utils/getStockPhoto";
import { SupabaseAuthContext } from "../context/SupabaseAuthContext";
import { SyncedClosetRepository } from "../services/syncedClosetRepository";

export type SyncStatus = "synced" | "syncing" | "offline" | "error";

const STORAGE_KEY = "my_closet_key";

function seed(): ClothingItem[] {
	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		return stored ? (JSON.parse(stored) as ClothingItem[]) : MY_CLOSET_DATA;
	} catch {
		return MY_CLOSET_DATA;
	}
}

/**
 * E1-1.4 drop-in replacement for `useLocalStorageCloset`.
 *
 * Return shape is identical (+ `isLoading` / `syncStatus`). Consumers swap the
 * import — no other changes needed.
 *
 * When signed out or Supabase is unconfigured the hook is pure-local: same
 * behaviour as the old hook, never throws. When signed in, `getAll()` runs the
 * E1-1.5 seed + E1-1.6 reconcile via `SyncedClosetRepository`.
 */
export function useCloudCloset() {
	const [closet, setCloset] = useState<ClothingItem[]>(seed);
	const [isLoading, setIsLoading] = useState(false);
	const [syncStatus, setSyncStatus] = useState<SyncStatus>("synced");

	// Safe context access: null when rendered outside SupabaseAuthProvider (tests).
	const authCtx = useContext(SupabaseAuthContext);
	const userId = authCtx?.user?.id ?? null;

	const repo = useMemo(() => new SyncedClosetRepository(userId), [userId]);

	// On sign-in (or userId change): reconcile local + remote.
	useEffect(() => {
		if (!userId) return;
		setIsLoading(true);
		setSyncStatus("syncing");
		repo
			.getAll()
			.then((items) => {
				setCloset(items);
				setSyncStatus("synced");
			})
			.catch(() => {
				setSyncStatus("offline");
			})
			.finally(() => {
				setIsLoading(false);
			});
	}, [repo, userId]);

	const normalizedCloset = useMemo(
		() => closet.map((item) => ({ ...item, material: normalizeMaterial(item.material) })),
		[closet],
	);

	const addItem = (newItem: ItemFormData) => {
		const photo = newItem.imageURL;
		const item: ClothingItem = {
			...newItem,
			id: crypto.randomUUID(),
			imageURL: photo ? photo : getStockPhoto(newItem.category as CategoryType),
			name: newItem.brand ? `${newItem.brand} ${newItem.category}` : newItem.category,
			material: normalizeMaterial(newItem.material),
		};
		setCloset((prev) => [...prev, item]);
		void repo.add(item);
	};

	const addFullItem = (newItem: ClothingItem) => {
		const item = { ...newItem, material: normalizeMaterial(newItem.material) };
		setCloset((prev) => [...prev, item]);
		void repo.add(item);
	};

	const importItems = (items: ClothingItem[], mode: "replace" | "merge") => {
		setCloset((prev) => (mode === "replace" ? [...items] : [...prev, ...items]));
		void repo.importItems(items, mode);
	};

	const removeItem = (id: string) => {
		setCloset((prev) => prev.filter((item) => item.id !== id));
		void repo.remove(id);
	};

	const updateItem = (id: string, updatedData: Partial<ClothingItem>) => {
		const patch: Partial<ClothingItem> = { ...updatedData };
		if (!updatedData.imageURL && updatedData.category) {
			patch.imageURL = getStockPhoto(updatedData.category as CategoryType);
		}
		setCloset((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
		void repo.update(id, patch);
	};

	const getCloset = (): ClothingItem[] => closet;

	const clearCloset = () => {
		setCloset([]);
		void repo.clear();
	};

	return { closet: normalizedCloset, addItem, addFullItem, importItems, removeItem, updateItem, getCloset, clearCloset, isLoading, syncStatus };
}
