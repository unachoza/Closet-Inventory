/**
 * Service layer barrel — re-exports the repository types + implementations.
 *
 * The app talks to the closet through `useCloset()` / `ClosetProvider`
 * (`SyncedClosetRepository` under the hood). There is deliberately NO shared
 * repository singleton here: a bare `LocalClosetRepository` instance would be a
 * second write path to the same localStorage key, bypassing cloud sync (removed
 * with the dead `useLocalStorageCloset` hook, 2026-07-07).
 */
export type { ClosetRepository, ImportMode } from "./closetRepository";
export { LocalClosetRepository } from "./localClosetRepository";
export { SupabaseClosetRepository } from "./supabaseClosetRepository";
export { SyncedClosetRepository } from "./syncedClosetRepository";
