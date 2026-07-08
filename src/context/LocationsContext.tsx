import { createContext, useContext, type ReactNode } from "react";
import { useLocationsStore, type LocationsStore } from "../hooks/useLocationsStore";
import { SupabaseAuthContext } from "./SupabaseAuthContext";

/**
 * E12-3.2 — single source of truth for the user's locations, mirroring the
 * ClosetProvider pattern: mount `useLocationsStore` ONCE here so every
 * consumer (location manager, edit-form picker, card border, filters) reads
 * the same live list instead of each re-fetching independently.
 *
 * Reads auth via the raw `useContext(SupabaseAuthContext)` (not the strict
 * `useSupabaseAuthContext()`, which throws without a provider) — same
 * leniency `useCloudCloset` uses, so trees that mount `ClosetProvider`
 * without `SupabaseAuthProvider` (e.g. local-only test trees) degrade to the
 * static registry instead of crashing.
 */

const LocationsContext = createContext<LocationsStore | null>(null);

export function LocationsProvider({ children }: { readonly children: ReactNode }) {
	const authCtx = useContext(SupabaseAuthContext);
	const store = useLocationsStore(authCtx?.user?.id ?? null);
	return <LocationsContext.Provider value={store}>{children}</LocationsContext.Provider>;
}

export function useLocations(): LocationsStore {
	const ctx = useContext(LocationsContext);
	if (!ctx) throw new Error("useLocations must be used within a LocationsProvider");
	return ctx;
}
