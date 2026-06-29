import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import { useSupabaseAuth } from "../hooks/useSupabaseAuth";
import type { SupabaseAuthState } from "../hooks/useSupabaseAuth";

export const SupabaseAuthContext = createContext<SupabaseAuthState | null>(null);

export function SupabaseAuthProvider({ children }: { children: ReactNode }) {
  const auth = useSupabaseAuth();
  return (
    <SupabaseAuthContext.Provider value={auth}>
      {children}
    </SupabaseAuthContext.Provider>
  );
}

export function useSupabaseAuthContext(): SupabaseAuthState {
  const ctx = useContext(SupabaseAuthContext);
  if (!ctx) throw new Error("useSupabaseAuthContext must be used inside SupabaseAuthProvider");
  return ctx;
}
