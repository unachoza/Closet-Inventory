import { createContext, useCallback, useContext, useEffect, useRef, useState, ReactNode, Dispatch, SetStateAction } from "react";
import Modal from "../Components/Modal/Modal";
import { ViewType } from "../utils/types";
import { track } from "../lib/analytics";

/** Returns true when navigation should pause for a discard confirmation. */
type NavGuard = () => boolean;

interface ViewContextType {
	view: ViewType;
	previousView: ViewType | null;
	// Matches React's setter shape so it can be passed straight to components
	// that accept `setView: Dispatch<SetStateAction<ViewType>>`.
	setView: Dispatch<SetStateAction<ViewType>>;
	/** Register (or clear with null) a guard consulted before any view change.
	 *  Lets in-progress flows (the add-item wizard) intercept bottom-nav /
	 *  drawer taps that would otherwise silently discard their state. */
	setNavGuard: (guard: NavGuard | null) => void;
}

const ViewContext = createContext<ViewContextType | undefined>(undefined);

interface ViewProviderProps {
	children: ReactNode;
	initialView?: ViewType;
}

export function ViewProvider({ children, initialView = "carousel" }: ViewProviderProps) {
	const [view, setViewState] = useState<ViewType>(initialView);
	const [previousView, setPreviousView] = useState<ViewType | null>(null);

	const navGuardRef = useRef<NavGuard | null>(null);
	const [pendingAction, setPendingAction] = useState<SetStateAction<ViewType> | null>(null);

	const setNavGuard = useCallback((guard: NavGuard | null) => {
		navGuardRef.current = guard;
	}, []);

	// Immutable transition: remember where we came from, then move. Supports
	// both a plain value (setView("form")) and the updater form.
	const applyView = useCallback((action: SetStateAction<ViewType>) => {
		setViewState((current) => {
			const next = typeof action === "function" ? (action as (prev: ViewType) => ViewType)(current) : action;
			setPreviousView(current);
			return next;
		});
	}, []);

	const setView = useCallback<Dispatch<SetStateAction<ViewType>>>(
		(action) => {
			if (navGuardRef.current?.()) {
				setPendingAction(() => action);
				return;
			}
			applyView(action);
		},
		[applyView],
	);

	const confirmDiscard = useCallback(() => {
		navGuardRef.current = null;
		setPendingAction((pending: SetStateAction<ViewType> | null) => {
			if (pending !== null) applyView(pending);
			return null;
		});
	}, [applyView]);

	// Central nav analytics — one effect covers every feature surface (closet/
	// care/search/email/form). Runs as a side effect of the committed `view`,
	// not inside the state updater, so StrictMode can't double-fire it.
	const lastTracked = useRef<ViewType | null>(null);
	useEffect(() => {
		if (lastTracked.current === view) return;
		track("screen_viewed", { view, from: lastTracked.current });
		if (view === "fabric") track("care_guide_opened", { from: lastTracked.current });
		lastTracked.current = view;
	}, [view]);

	return (
		<ViewContext.Provider value={{ view, previousView, setView, setNavGuard }}>
			{children}
			<Modal
				isOpen={pendingAction !== null}
				onClose={() => setPendingAction(null)}
				title="Discard this item?"
				maxWidth={400}
				footer={
					<>
						<button className="btn btn--ghost" type="button" onClick={() => setPendingAction(null)}>
							Keep editing
						</button>
						<button className="btn btn--primary" type="button" onClick={confirmDiscard}>
							Discard
						</button>
					</>
				}
			>
				<p>You haven't added this item yet. Leaving now will lose what you've filled in.</p>
			</Modal>
		</ViewContext.Provider>
	);
}

export const useView = (): ViewContextType => {
	const ctx = useContext(ViewContext);
	if (!ctx) {
		throw new Error("useView must be used within a ViewProvider");
	}
	return ctx;
};

const noopSetNavGuard = () => {};

/** Safe outside a ViewProvider (unit tests render the wizard bare) — no-op there. */
export const useSetNavGuard = (): ((guard: NavGuard | null) => void) => {
	const ctx = useContext(ViewContext);
	return ctx?.setNavGuard ?? noopSetNavGuard;
};
