import { useSyncExternalStore } from "react";
import { getSyncFailureState, subscribeSyncFailures, type SyncFailureState } from "../services/syncFailureTracker";

/**
 * Subscribe to background-sync write failures reported by
 * `SyncedClosetRepository`. Re-renders when the failure count changes; snapshots
 * are stable references so `useSyncExternalStore` doesn't loop.
 */
export function useSyncStatus(): SyncFailureState {
	return useSyncExternalStore(subscribeSyncFailures, getSyncFailureState, getSyncFailureState);
}
