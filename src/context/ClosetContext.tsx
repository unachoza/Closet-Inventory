import { createContext, useContext, type ReactNode } from "react";
import { useCloudCloset } from "../hooks/useCloudCloset";

/**
 * E1-1.4 — single source of truth for the closet.
 *
 * Before this, six components each called `useLocalStorageCloset()` and stayed
 * in sync only because they all read the same localStorage key. Swapping those
 * to the cloud-backed `useCloudCloset` naively would spin up six independent
 * `SyncedClosetRepository` instances, each firing its own seed/reconcile against
 * Supabase on sign-in (racy, wasteful).
 *
 * Mounting `useCloudCloset` ONCE here and sharing it via context gives every
 * consumer the same closet + mutations and a single sync loop. Must be mounted
 * inside `SupabaseAuthProvider` so the hook can read the signed-in `userId`.
 */
type ClosetContextValue = ReturnType<typeof useCloudCloset>;

const ClosetContext = createContext<ClosetContextValue | null>(null);

export function ClosetProvider({ children }: { readonly children: ReactNode }) {
	const closet = useCloudCloset();
	return <ClosetContext.Provider value={closet}>{children}</ClosetContext.Provider>;
}

export function useCloset(): ClosetContextValue {
	const ctx = useContext(ClosetContext);
	if (!ctx) throw new Error("useCloset must be used within a ClosetProvider");
	return ctx;
}
