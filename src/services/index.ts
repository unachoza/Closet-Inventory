/**
 * Service layer — the single place the app talks to storage.
 *
 * Import `closetRepository` (or the interface) from here; never reach for
 * localStorage or a DB client directly in components/hooks. During the Supabase
 * port, swap the one line below for a `SupabaseClosetRepository` and the rest of
 * the app is unaffected.
 */
import { LocalClosetRepository } from "./localClosetRepository";
import type { ClosetRepository } from "./closetRepository";

export type { ClosetRepository, ImportMode } from "./closetRepository";
export { LocalClosetRepository } from "./localClosetRepository";

/** The active repository. Swap during the cloud port. */
export const closetRepository: ClosetRepository = new LocalClosetRepository();
