import type { ClothingItem } from "../utils/types";
import type { ClosetRepository, ImportMode } from "./closetRepository";
import { LocalClosetRepository } from "./localClosetRepository";
import { SupabaseClosetRepository } from "./supabaseClosetRepository";
import { clearSyncFailures, recordSyncFailure } from "./syncFailureTracker";

function ts(iso: string | undefined): number {
	return iso ? new Date(iso).getTime() : 0;
}

/** Last-write-wins merge: union of local + remote, newer updatedAt wins per id. */
function mergeItems(local: ClothingItem[], remote: ClothingItem[]): ClothingItem[] {
	const byId = new Map<string, ClothingItem>();
	for (const item of remote) byId.set(item.id, item);
	for (const item of local) {
		const existing = byId.get(item.id);
		if (!existing || ts(item.updatedAt) > ts(existing.updatedAt)) {
			byId.set(item.id, item);
		}
	}
	return Array.from(byId.values());
}

/**
 * E1-1.4 / E1-1.5 / E1-1.6
 *
 * Offline-first: writes go to local first (instant), then async to Supabase.
 * `getAll()` reconciles local + remote on sign-in; if remote is empty it seeds
 * from local (E1-1.5). Last-write-wins via `updatedAt` (E1-1.6).
 *
 * When userId is null (signed-out or Supabase unconfigured) every method falls
 * through to the LocalClosetRepository — behaviour is identical to offline mode.
 */
export class SyncedClosetRepository implements ClosetRepository {
	private local: LocalClosetRepository;
	private remote: SupabaseClosetRepository | null;

	constructor(userId: string | null) {
		this.local = new LocalClosetRepository();
		this.remote = userId ? new SupabaseClosetRepository(userId) : null;
	}

	async getAll(): Promise<ClothingItem[]> {
		if (!this.remote) return this.local.getAll();

		const local = await this.local.getAll();

		try {
			const remote = await this.remote.getAll();

			// E1-1.5: seed — remote is empty, push all local items
			if (remote.length === 0 && local.length > 0) {
				await this.remote.importItems(local, "replace");
				clearSyncFailures();
				return local;
			}

			// E1-1.6: reconcile — last-write-wins per item
			const merged = mergeItems(local, remote);

			// Keep local mirror current
			await this.local.importItems(merged, "replace");

			// Push local-wins items back to Supabase
			const localWins = merged.filter((item) => {
				const r = remote.find((ri) => ri.id === item.id);
				return !r || ts(item.updatedAt) > ts(r.updatedAt);
			});
			if (localWins.length > 0) {
				// The local mirror already holds the full merged UNION (written above),
				// so nothing is lost locally here. If this push fails it is recorded
				// (drives the SyncStatusIndicator) and re-attempted on the next
				// successful getAll() — eventual consistency, not silent data loss.
				// The one real gap: a localWin whose push never lands before the local
				// cache is cleared (tab closed, never reloaded/signed-in again) stays
				// stale in the cloud. A durable retry queue is deferred — tracked
				// separately (see E1-1.6 "retry queue still deferred").
				void this.remote
					.importItems(localWins, "merge")
					.then(() => clearSyncFailures())
					.catch((error) => {
						recordSyncFailure("reconcile", error);
					});
			} else {
				// Remote already had everything — nothing pending.
				clearSyncFailures();
			}

			return merged;
		} catch {
			// Network/Supabase unavailable — serve local cache
			return local;
		}
	}

	async getById(id: string): Promise<ClothingItem | null> {
		return this.local.getById(id);
	}

	async add(item: ClothingItem): Promise<ClothingItem> {
		const stamped: ClothingItem = { ...item, updatedAt: item.updatedAt ?? new Date().toISOString() };
		await this.local.add(stamped);
		if (this.remote) {
			void this.remote.add(stamped).catch((error) => recordSyncFailure("add", error));
		}
		return stamped;
	}

	async update(id: string, patch: Partial<ClothingItem>): Promise<ClothingItem | null> {
		const stamped = { ...patch, updatedAt: new Date().toISOString() };
		const result = await this.local.update(id, stamped);
		if (this.remote) {
			void this.remote.update(id, stamped).catch((error) => recordSyncFailure("update", error));
		}
		return result;
	}

	async remove(id: string): Promise<void> {
		await this.local.remove(id);
		if (this.remote) {
			void this.remote.remove(id).catch((error) => recordSyncFailure("remove", error));
		}
	}

	async importItems(items: ClothingItem[], mode: ImportMode): Promise<ClothingItem[]> {
		const result = await this.local.importItems(items, mode);
		if (this.remote) {
			void this.remote.importItems(items, mode).catch((error) => recordSyncFailure("importItems", error));
		}
		return result;
	}

	async clear(): Promise<void> {
		await this.local.clear();
		if (this.remote) {
			void this.remote.clear().catch((error) => recordSyncFailure("clear", error));
		}
	}
}
