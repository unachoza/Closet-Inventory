/**
 * Failed-sync tracker.
 *
 * `SyncedClosetRepository` writes to local storage first (instant) and pushes to
 * Supabase in the background. Those background writes used to swallow failures
 * silently (`.catch(() => {})`), so a user whose remote writes were all failing
 * had no signal — a data-loss risk once they switched devices.
 *
 * This is the minimal "failed-sync indicator" seam: the repository reports write
 * failures here, a successful full reconcile (`getAll`) clears them (it re-pushes
 * local-wins items, so pending failures are resolved), and the UI subscribes to
 * surface an unobtrusive indicator.
 *
 * No retry queue — recovery still rides on the next successful `getAll`. State is
 * held as immutable snapshots so subscribers can compare by reference.
 */

import { logError } from "../utils/logger";

export interface SyncFailureState {
	/** Number of background write operations that failed since the last clear. */
	failedWriteCount: number;
	/** Message from the most recent failure, for logging / tooltip context. */
	lastError: string | null;
	/** ISO timestamp of the most recent failure. */
	lastFailedAt: string | null;
}

const INITIAL_STATE: SyncFailureState = {
	failedWriteCount: 0,
	lastError: null,
	lastFailedAt: null,
};

let state: SyncFailureState = INITIAL_STATE;
const listeners = new Set<(state: SyncFailureState) => void>();

function emit(): void {
	for (const listener of listeners) listener(state);
}

/** Read the current snapshot (stable reference until the next change). */
export function getSyncFailureState(): SyncFailureState {
	return state;
}

/**
 * Record a failed background write. Logs the underlying error (never swallowed)
 * and bumps the pending count.
 */
export function recordSyncFailure(operation: string, error: unknown): void {
	const message = error instanceof Error ? error.message : String(error);
	// Surface the real cause — this replaces a silent `.catch(() => {})`.
	logError(`sync: "${operation}" failed to reach Supabase`, error);
	state = {
		failedWriteCount: state.failedWriteCount + 1,
		lastError: message,
		lastFailedAt: new Date().toISOString(),
	};
	emit();
}

/** Clear pending failures — call after a successful full reconcile. No-op when already clear. */
export function clearSyncFailures(): void {
	if (state === INITIAL_STATE || state.failedWriteCount === 0) return;
	state = INITIAL_STATE;
	emit();
}

/** Subscribe to state changes; returns an unsubscribe function. */
export function subscribeSyncFailures(listener: (state: SyncFailureState) => void): () => void {
	listeners.add(listener);
	return () => {
		listeners.delete(listener);
	};
}
