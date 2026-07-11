import { useContext, useEffect, useMemo, useState } from "react";
import { MY_CLOSET_DATA } from "../utils/constants";
import type { CategoryType, ClothingItem, ItemFormData, WearState } from "../utils/types";
import { normalizeMaterial } from "../utils/materialUtils";
import getStockPhoto from "../utils/getStockPhoto";
import { computeUpdatePatch } from "./computeUpdatePatch";
import { safeSetItem } from "../utils/safeStorage";
import { SupabaseAuthContext } from "../context/SupabaseAuthContext";
import { SyncedClosetRepository } from "../services/syncedClosetRepository";

export type SyncStatus = "synced" | "syncing" | "offline" | "error";

const STORAGE_KEY = "my_closet_key";

/**
 * Seed the in-memory closet. On a fresh store (empty localStorage) we fall back
 * to the demo `MY_CLOSET_DATA` AND persist it — otherwise the repository's
 * update/remove paths read an empty store, can't find the item by id, and
 * silently drop the write (edits vanish on reload).
 */
function seed(): ClothingItem[] {
	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored) return JSON.parse(stored) as ClothingItem[];
		safeSetItem(STORAGE_KEY, JSON.stringify(MY_CLOSET_DATA));
		return MY_CLOSET_DATA;
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
			condition: newItem.condition as WearState | undefined,
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
		const existing = closet.find((item) => item.id === id);
		// BUG-1: preserve the existing photo — only backfill a stock photo when the
		// item genuinely has none (never overwrite a real photo on a category change).
		const patch = existing ? computeUpdatePatch(existing, updatedData) : { ...updatedData };
		setCloset((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
		void repo.update(id, patch);
	};

	const getCloset = (): ClothingItem[] => closet;

	const clearCloset = () => {
		setCloset([]);
		void repo.clear();
	};

	// Remove only the demo starter items (BUG-2 lifecycle). Demo items never
	// reached the cloud, so persist the trimmed closet to the local mirror via a
	// "replace" of the real items — the remote-write is real-only + idempotent.
	const clearDemoItems = () => {
		const remaining = closet.filter((item) => !item.isDemo);
		setCloset(remaining);
		void repo.importItems(remaining, "replace");
	};

	return {
		closet: normalizedCloset,
		addItem,
		addFullItem,
		importItems,
		removeItem,
		updateItem,
		getCloset,
		clearCloset,
		clearDemoItems,
		isLoading,
		syncStatus,
	};
}
