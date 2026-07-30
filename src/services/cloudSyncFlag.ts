import { safeSetItem } from "../utils/safeStorage";

/**
 * Sticky "this closet has been synced to the cloud at least once" marker.
 *
 * The local capacity ceiling exists because an *unbacked* closet can only hold
 * what localStorage fits. "Not signed in right now" is the wrong test for that:
 * `useCloudCloset` keeps the reconciled items in state after sign-out, so a
 * user whose session simply expired would otherwise be told their synced closet
 * "lives on this device only" and be blocked from adding — alarming, false, and
 * worse than the problem the cap was added to solve.
 *
 * This flag answers the question the cap actually cares about: has this data
 * ever reached the server? Once true it stays true — a signed-out session is a
 * temporary state, not a reason to treat a backed-up closet as disposable.
 */

const SYNCED_KEY = "closetly-has-synced";

export function hasEverSynced(): boolean {
	try {
		return localStorage.getItem(SYNCED_KEY) === "true";
	} catch {
		// Storage unavailable (private mode): assume unsynced, which only means
		// the user sees nudges they may not need — never a wrongful block, since
		// a signed-in user is never blocked regardless.
		return false;
	}
}

/** Call after a successful cloud reconcile. Idempotent. */
export function markSynced(): void {
	safeSetItem(SYNCED_KEY, "true");
}
