import type { ClothingItem } from "../utils/types";

export type ImportMode = "replace" | "merge";

/**
 * The seam between the UI and storage.
 *
 * Components and hooks depend on THIS interface, never on a concrete storage
 * client (localStorage today, Supabase later). Swapping the backend = providing
 * a new implementation; zero component changes. See the brief's architecture
 * decision #2 ("Separate backend from frontend. API layer pattern.").
 *
 * Pure persistence only — business logic (id generation, stock-photo fallback,
 * name derivation) stays in the calling layer so the repository stays swappable.
 * Async-by-default because the cloud impl will be network-bound; the local impl
 * resolves synchronously under the hood.
 */
export interface ClosetRepository {
	getAll(): Promise<ClothingItem[]>;
	getById(id: string): Promise<ClothingItem | null>;
	add(item: ClothingItem): Promise<ClothingItem>;
	update(id: string, patch: Partial<ClothingItem>): Promise<ClothingItem | null>;
	remove(id: string): Promise<void>;
	importItems(items: ClothingItem[], mode: ImportMode): Promise<ClothingItem[]>;
	clear(): Promise<void>;
}
