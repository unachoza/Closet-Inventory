import { useEffect, useState } from "react";
import { MY_CLOSET_DATA } from "../utils/constants";
import type { ClothingItemType, ItemFormData } from "../utils/types";

const STORAGE_KEY = "my_closet";

// You can replace this with your own image asset path or CDN URL
const PLACEHOLDER_IMAGE = "https://placehold.co/300x400?text=No+Image";

export function useLocalStorageCloset() {
	const [closet, setCloset] = useState<ClothingItemType[]>(() => {
		const localStorageValue = localStorage.getItem("STORAGE_KEY");
		if (localStorageValue == null) return MY_CLOSET_DATA;
		return JSON.parse(localStorageValue);
	});

	// // ✅ Initialize closet from localStorage or fallback to default
	// useEffect(() => {
	// 	const stored = localStorage.getItem(STORAGE_KEY);
	// 	if (stored) {
	// 		try {
	// 			const parsed = JSON.parse(stored);
	// 			if (Array.isArray(parsed)) {
	// 				setCloset(parsed);
	// 				return;
	// 			}
	// 		} catch {
	// 			console.warn("Corrupted localStorage closet data — resetting...");
	// 		}
	// 	}
	// 	// Default fallback
	// 	localStorage.setItem(STORAGE_KEY, JSON.stringify(MY_CLOSET_DATA));
	// 	setCloset(MY_CLOSET_DATA);
	// }, []);

	useEffect(() => {
		localStorage.setItem("ITEMS", JSON.stringify(closet));
	}, [closet]);

	// ✅ Add a new item (ItemFormData → ClothingItem)
	const addItem = (formItem: ItemFormData) => {
		console.log("inside add", { closet });
		const newItem: ClothingItemType = {
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

		const updatedCloset = [...closet, newItem];
		console.log({ updatedCloset });

		setCloset(updatedCloset);
	};

	// ✅ Retrieve all saved closet items (safe fallback)
	const getCloset = (): ClothingItemType[] => {
		try {
			const stored = localStorage.getItem(STORAGE_KEY);
			return stored ? (JSON.parse(stored) as ClothingItemType[]) : [];
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



// // useLocalStorageCloset.ts
// "use client";

// import { useEffect, useState, useCallback } from "react";
// import { MY_CLOSET_DATA } from "../utils/constants";
// import type { ClothingItemType, ItemFormData } from "../utils/types";

// const STORAGE_KEY = "my_closet";
// const PLACEHOLDER_IMAGE = "https://placehold.co/300x400?text=No+Image";

// /**
//  * Defensive helper: safe JSON.parse
//  */
// function safeParse<T>(s: string | null, fallback: T): T {
//   if (!s) return fallback;
//   try {
//     return JSON.parse(s) as T;
//   } catch (err) {
//     console.warn("safeParse failed", err);
//     return fallback;
//   }
// }

// /**
//  * Hook: useLocalStorageCloset
//  */
// export function useLocalStorageCloset() {
//   const [closet, setCloset] = useState<ClothingItemType[]>([]);

//   // init - runs only in browser
//   useEffect(() => {
   
//     try {
//       const stored = localStorage.getItem(STORAGE_KEY);
//       if (stored) {
//         const parsed = safeParse<ClothingItemType[]>(stored, []);
//         if (Array.isArray(parsed) && parsed.length > 0) {
//           setCloset(parsed);
//           console.debug("useLocalStorageCloset: loaded from localStorage", parsed.length);
//           return;
//         }
//       }

//       // fallback seed
//       localStorage.setItem(STORAGE_KEY, JSON.stringify(MY_CLOSET_DATA));
//       setCloset(MY_CLOSET_DATA);
//       console.debug("useLocalStorageCloset: seeded with MY_CLOSET_DATA", MY_CLOSET_DATA.length);
//     } catch (err) {
//       console.error("useLocalStorageCloset init error:", err);
//     }
//   }, []);

//   /**
//    * Primary addItem function (defensive).
//    * Converts ItemFormData -> ClothingItemType and persists to localStorage then state.
//    */
//   const addItem = useCallback((formItem: ItemFormData) => {


//     try {
//       console.debug("addItem called with formItem:", formItem);

//       // safe id generation
//       const id =
//         typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
//           ? crypto.randomUUID()
//           : String(Date.now()) + "-" + Math.floor(Math.random() * 10000);

//       const newItem: ClothingItemType = {
//         id,
//         imageURL: PLACEHOLDER_IMAGE,
//         name: formItem.brand ? `${formItem.brand} ${formItem.type}` : formItem.type,
//         category: formItem.type,
//         color: formItem.color,
//         size: formItem.size,
//         brand: formItem.brand,
//         price: "",
//         material: formItem.material,
//         occasion: formItem.occasion,
//         age: formItem.age,
//         care: formItem.care,
//         notes: "",
//         onSale: false,
//       };

//       // read existing storage (fresh)
//       const raw = localStorage.getItem(STORAGE_KEY);
//       const current = safeParse<ClothingItemType[]>(raw, MY_CLOSET_DATA || []);
//       console.debug("addItem - current length before:", current.length);

//       const updated = [...current, newItem];

//       // persist first (so crash after setState doesn't lose data)
//       localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
//       console.debug("addItem - persisted to localStorage, updated length:", updated.length);

//       // update state
//       setCloset(updated);
//       console.debug("addItem - setCloset called successfully");

//       return newItem;
//     } catch (err) {
//       console.error("addItem error:", err);
//       throw err;
//     }
//   }, []);

//   // keep storage in sync if closet updated elsewhere
//   useEffect(() => {
//     if (typeof window === "undefined") return;
//     try {
//       // If we seeded from constants and then setCloset was called in init, this will write again but it's fine.
//       localStorage.setItem(STORAGE_KEY, JSON.stringify(closet));
//     } catch (err) {
//       console.error("Error syncing closet -> localStorage:", err);
//     }
//   }, [closet]);

//   const getCloset = useCallback((): ClothingItemType[] => {
//     if (typeof window === "undefined") return [];
//     const stored = localStorage.getItem(STORAGE_KEY);
//     return safeParse<ClothingItemType[]>(stored, []);
//   }, []);

//   const clearCloset = useCallback(() => {
//     if (typeof window === "undefined") return;
//     localStorage.removeItem(STORAGE_KEY);
//     setCloset([]);
//     console.debug("clearCloset: cleared");
//   }, []);

//   return { closet, addItem, getCloset, clearCloset };
// }
