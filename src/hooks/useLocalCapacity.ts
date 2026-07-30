import { useContext, useMemo } from "react";
import { SupabaseAuthContext } from "../context/SupabaseAuthContext";
import { useCloset } from "../context/ClosetContext";
import { measureLocalCloset, type LocalCapacity } from "../services/localClosetCapacity";
import { hasEverSynced } from "../services/cloudSyncFlag";

export interface LocalCapacityState {
	/** True only when the closet is unbacked — signed out with no cloud copy. */
	isLocalOnly: boolean;
	capacity: LocalCapacity;
	/** Convenience: blocked AND local-only. Signed-in users are never blocked. */
	isAtCapacity: boolean;
}

/**
 * Capacity state for the signed-out closet.
 *
 * Signed-in closets sync to Supabase and have no meaningful local ceiling, so
 * everything here collapses to "not local only" and nothing is ever blocked for
 * them — the limits exist because localStorage is finite, not as a paywall.
 */
export function useLocalCapacity(): LocalCapacityState {
	// Safe context access: null outside SupabaseAuthProvider (tests, storybook).
	const authCtx = useContext(SupabaseAuthContext);
	const isSignedIn = authCtx?.isAuthenticated ?? false;
	const { closet } = useCloset();

	// Sample items (`isDemo`) are seeded by the app, badged "Sample" in the UI,
	// and clearable in one tap — they are not the user's data. Counting them
	// would nag someone who has added nothing of their own (the starter closet
	// alone is 13 items) and would eat into a budget they never spent.
	const capacity = useMemo(
		() => measureLocalCloset(closet.filter((item) => !item.isDemo)),
		[closet],
	);

	// "Signed out right now" is NOT the same as "never backed up". A user whose
	// session expired still has their closet on the server — telling them it
	// lives on this device only, and blocking new items, would be false and
	// worse than the data loss the cap prevents.
	const isLocalOnly = !isSignedIn && !hasEverSynced();

	return {
		isLocalOnly,
		capacity,
		isAtCapacity: isLocalOnly && capacity.isBlocked,
	};
}
