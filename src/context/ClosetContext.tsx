import { createContext, useContext, ReactNode } from "react";
import { useCloudCloset } from "../hooks/useCloudCloset";

type ClosetContextValue = ReturnType<typeof useCloudCloset>;

const ClosetContext = createContext<ClosetContextValue | null>(null);

export function ClosetProvider({ children }: { children: ReactNode }) {
	const closet = useCloudCloset();
	return <ClosetContext.Provider value={closet}>{children}</ClosetContext.Provider>;
}

export function useCloset(): ClosetContextValue {
	const ctx = useContext(ClosetContext);
	if (!ctx) throw new Error("useCloset must be used inside <ClosetProvider>");
	return ctx;
}

// Drop-in alias so existing imports of useLocalStorageCloset keep working
// without touching every call site — they now all share the single instance.
export { useCloset as useLocalStorageCloset };
