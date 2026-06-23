import { createContext, useContext, useState, ReactNode } from "react";
import type { ClothingItem } from "../../utils/types";

// The item currently being edited.
export type EditItem = ClothingItem;

interface EditContextType {
	editItem: EditItem | null;
	setEditItem: (item: EditItem | null) => void;
}

const EditContext = createContext<EditContextType | undefined>(undefined);

export function EditProvider({ children }: { children: ReactNode }) {
	const [editItem, setEditItem] = useState<EditItem | null>(null);
	return <EditContext.Provider value={{ editItem, setEditItem }}>{children}</EditContext.Provider>;
}

export const useEditContext = () => {
	const ctx = useContext(EditContext);
	if (!ctx) throw new Error("useEditContext must be used within EditProvider");
	return ctx;
};
