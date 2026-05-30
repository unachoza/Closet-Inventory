import React, { createContext, useContext, useState, ReactNode } from "react";

// Type for the item being edited (customize as needed)
export type EditItem = any;

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
