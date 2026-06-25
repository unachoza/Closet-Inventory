import { createContext, useContext, type ReactNode } from "react";
import { useGmailAuth } from "../hooks/useGmailAuth";

/**
 * Session-scoped Gmail auth.
 *
 * The access token lives in `useGmailAuth`'s in-memory state. That hook used to
 * be called inside `GmailImport`, which is only mounted while `view === "gmail"`.
 * Importing an item switches the view (unmounting GmailImport), which destroyed
 * the hook instance and the token with it — so "Back to email" forced a full
 * re-auth (E3-bug.2).
 *
 * Lifting the hook into a provider mounted for the whole session keeps the token
 * alive across view changes. It is still memory-only (React state, never
 * localStorage) so the security guarantee is unchanged: the token dies on reload,
 * not on navigation.
 *
 * Must be mounted inside `GoogleOAuthProvider` (see main.tsx) so the underlying
 * `useGoogleLogin` has its required provider.
 */
type GmailAuthValue = ReturnType<typeof useGmailAuth>;

const GmailAuthContext = createContext<GmailAuthValue | null>(null);

export function GmailAuthProvider({ children }: { readonly children: ReactNode }) {
	const auth = useGmailAuth();
	return <GmailAuthContext.Provider value={auth}>{children}</GmailAuthContext.Provider>;
}

export function useGmailAuthContext(): GmailAuthValue {
	const ctx = useContext(GmailAuthContext);
	if (!ctx) {
		throw new Error("useGmailAuthContext must be used within a GmailAuthProvider");
	}
	return ctx;
}
