import { createContext, useCallback, useContext, useState, ReactNode, Dispatch, SetStateAction } from "react";
import { ViewType } from "../utils/types";

interface ViewContextType {
	view: ViewType;
	previousView: ViewType | null;
	// Matches React's setter shape so it can be passed straight to components
	// that accept `setView: Dispatch<SetStateAction<ViewType>>`.
	setView: Dispatch<SetStateAction<ViewType>>;
}

const ViewContext = createContext<ViewContextType | undefined>(undefined);

interface ViewProviderProps {
	children: ReactNode;
	initialView?: ViewType;
}

export function ViewProvider({ children, initialView = "carousel" }: ViewProviderProps) {
	const [view, setViewState] = useState<ViewType>(initialView);
	const [previousView, setPreviousView] = useState<ViewType | null>(null);

	// Immutable transition: remember where we came from, then move. Supports
	// both a plain value (setView("form")) and the updater form.
	const setView = useCallback<Dispatch<SetStateAction<ViewType>>>((action) => {
		setViewState((current) => {
			const next = typeof action === "function" ? (action as (prev: ViewType) => ViewType)(current) : action;
			setPreviousView(current);
			return next;
		});
	}, []);

	return <ViewContext.Provider value={{ view, previousView, setView }}>{children}</ViewContext.Provider>;
}

export const useView = (): ViewContextType => {
	const ctx = useContext(ViewContext);
	if (!ctx) {
		throw new Error("useView must be used within a ViewProvider");
	}
	return ctx;
};
