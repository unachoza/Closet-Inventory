/**
 * useCloudCloset — Firestore-backed closet sync.
 *
 * When a user is signed in:
 *   • Reads the closet from Firestore (users/{uid}/closet collection).
 *   • On first sign-in with no cloud data, uploads the local closet to Firestore.
 *   • All mutations write to Firestore AND keep localStorage in sync as an
 *     offline cache.
 *
 * When signed out:
 *   • Falls back to the local localStorage closet transparently.
 */
import { useEffect, useState, useCallback } from "react";
import {
	collection,
	doc,
	getDocs,
	setDoc,
	deleteDoc,
	writeBatch,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { useLocalStorageClosetBase as useLocalStorageCloset } from "./useLocalCloset";
import type { ClothingItem, ItemFormData } from "../utils/types";
import { normalizeMaterial } from "../utils/materialUtils";

function closetCollection(uid: string) {
	return collection(db, "users", uid, "closet");
}

export function useCloudCloset() {
	const { user } = useAuth();
	const local = useLocalStorageCloset();

	const [cloudItems, setCloudItems] = useState<ClothingItem[] | null>(null);
	const [syncing, setSyncing] = useState(false);

	// ── On sign-in: load cloud closet (or seed it from local) ──────────────
	useEffect(() => {
		if (!user) {
			setCloudItems(null);
			return;
		}

		let cancelled = false;
		setSyncing(true);

		(async () => {
			try {
				const snap = await getDocs(closetCollection(user.uid));

				if (cancelled) return;

				if (!snap.empty) {
					// Cloud data exists — use it as source of truth
					const items = snap.docs.map((d) => ({
						...(d.data() as ClothingItem),
						material: normalizeMaterial((d.data() as ClothingItem).material),
					}));
					setCloudItems(items);
				} else {
					// First sign-in — upload local closet to Firestore
					const localItems = local.closet;
					if (localItems.length > 0) {
						const batch = writeBatch(db);
						localItems.forEach((item) => {
							batch.set(doc(closetCollection(user.uid), item.id), item);
						});
						await batch.commit();
					}
					if (!cancelled) setCloudItems(localItems);
				}
			} finally {
				if (!cancelled) setSyncing(false);
			}
		})();

		return () => { cancelled = true; };
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [user?.uid]);

	// ── Mutations: write to Firestore + keep local in sync ──────────────────
	const addFullItem = useCallback(
		async (item: ClothingItem) => {
			local.addFullItem(item);
			if (user) {
				await setDoc(doc(closetCollection(user.uid), item.id), item);
				setCloudItems((prev) => [...(prev ?? []), item]);
			}
		},
		[user, local],
	);

	const addItem = useCallback(
		async (newItem: ItemFormData) => {
			// Delegate to local (which assigns id/imageURL), then mirror to cloud.
			local.addItem(newItem);
			if (user) {
				// Re-read from local after the update
				const updated = JSON.parse(localStorage.getItem("my_closet_key") ?? "[]") as ClothingItem[];
				const batch = writeBatch(db);
				updated.forEach((item) => {
					batch.set(doc(closetCollection(user.uid), item.id), item);
				});
				await batch.commit();
				setCloudItems(updated);
			}
		},
		[user, local],
	);

	const removeItem = useCallback(
		async (id: string) => {
			local.removeItem(id);
			if (user) {
				await deleteDoc(doc(closetCollection(user.uid), id));
				setCloudItems((prev) => (prev ?? []).filter((i) => i.id !== id));
			}
		},
		[user, local],
	);

	const updateItem = useCallback(
		async (id: string, data: Partial<ClothingItem>) => {
			local.updateItem(id, data);
			if (user) {
				const updated = JSON.parse(localStorage.getItem("my_closet_key") ?? "[]") as ClothingItem[];
				const item = updated.find((i) => i.id === id);
				if (item) await setDoc(doc(closetCollection(user.uid), id), item);
				setCloudItems(updated);
			}
		},
		[user, local],
	);

	// Use cloud items when signed in, local items when not
	const closet = user ? (cloudItems ?? local.closet) : local.closet;

	return {
		closet,
		syncing,
		addItem,
		addFullItem,
		removeItem,
		updateItem,
		clearCloset: local.clearCloset,
		getCloset: local.getCloset,
	};
}
