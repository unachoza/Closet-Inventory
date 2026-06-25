import type { ClothingItem } from "../utils/types";
import { normalizeMaterial } from "../utils/materialUtils";
import { safeSetItem } from "../utils/safeStorage";
import type { ClosetRepository, ImportMode } from "./closetRepository";

/**
 * localStorage-backed ClosetRepository — the current (offline-only) storage.
 *
 * Reads/writes the same `my_closet_key` the app uses today, so it is a faithful
 * drop-in for the existing `useLocalStorageCloset` persistence. During the
 * Supabase port this is replaced by a `SupabaseClosetRepository` (and kept as
 * the offline cache).
 */
const STORAGE_KEY = "my_closet_key";

function read(): ClothingItem[] {
	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (!stored) return [];
		const parsed = JSON.parse(stored) as ClothingItem[];
		// Transparently migrate legacy string material fields to MaterialBlend[].
		return parsed.map((item) => ({ ...item, material: normalizeMaterial(item.material) }));
	} catch {
		return [];
	}
}

function write(items: ClothingItem[]): void {
	safeSetItem(STORAGE_KEY, JSON.stringify(items));
}

export class LocalClosetRepository implements ClosetRepository {
	async getAll(): Promise<ClothingItem[]> {
		return read();
	}

	async getById(id: string): Promise<ClothingItem | null> {
		return read().find((item) => item.id === id) ?? null;
	}

	async add(item: ClothingItem): Promise<ClothingItem> {
		const normalized = { ...item, material: normalizeMaterial(item.material) };
		write([...read(), normalized]);
		return normalized;
	}

	async update(id: string, patch: Partial<ClothingItem>): Promise<ClothingItem | null> {
		const items = read();
		let updated: ClothingItem | null = null;
		const next = items.map((item) => {
			if (item.id !== id) return item;
			updated = { ...item, ...patch };
			return updated;
		});
		if (updated) write(next);
		return updated;
	}

	async remove(id: string): Promise<void> {
		write(read().filter((item) => item.id !== id));
	}

	async importItems(items: ClothingItem[], mode: ImportMode): Promise<ClothingItem[]> {
		const next = mode === "replace" ? [...items] : [...read(), ...items];
		write(next);
		return next;
	}

	async clear(): Promise<void> {
		localStorage.removeItem(STORAGE_KEY);
	}
}
