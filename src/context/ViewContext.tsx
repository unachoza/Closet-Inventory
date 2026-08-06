import { createContext, useCallback, useContext, useEffect, useRef, useState, ReactNode, Dispatch, SetStateAction } from "react";
import { ViewType } from "../utils/types";
import { track } from "../lib/analytics";
import Modal from "../Components/Modal/Modal";

/** Returns true when the current screen has unsaved work worth guarding. */
type NavGuard = () => boolean;

/**
 * Returns true when the navigation should be held for the Day 0 Reveal
 * instead of completing. Deliberately a second, independent guard slot
 * rather than a second "kind" on the existing one: the discard-confirm
 * guard above is owned solely by the manual-add wizard (Form.tsx), scoped
 * to the "form" view; this one is owned solely by App.tsx, scoped to the
 * "gmail" view. They never overlap, so a shared single-slot ref would only
 * add risk (whichever registers/clears last would silently disable the
 * other) for no benefit. The guard itself is expected to trigger showing
 * the Reveal as a side effect (see App.tsx) — returning true here means
 * "swallow this navigation attempt entirely," not "hold it to resume
 * later": both of the Reveal's own actions (see closet / continue hunting)
 * have fixed destinations, so there's nothing to resume.
 */
type RevealGuard = () => boolean;

interface ViewContextType {
	view: ViewType;
	previousView: ViewType | null;
	// Matches React's setter shape so it can be passed straight to components
	// that accept `setView: Dispatch<SetStateAction<ViewType>>`.
	setView: Dispatch<SetStateAction<ViewType>>;
	/** Register (or clear with null) a guard consulted before any view change.
	 *  When it returns true, the navigation is held and a discard prompt shown. */
	setNavGuard: (guard: NavGuard | null) => void;
	/** Register (or clear with null) the Reveal's interception guard. */
	setRevealGuard: (guard: RevealGuard | null) => void;
}

const ViewContext = createContext<ViewContextType | undefined>(undefined);

interface ViewProviderProps {
	children: ReactNode;
	initialView?: ViewType;
}

export function ViewProvider({ children, initialView = "carousel" }: ViewProviderProps) {
	const [view, setViewState] = useState<ViewType>(initialView);
	const [previousView, setPreviousView] = useState<ViewType | null>(null);

	// Held in a ref so registering/clearing a guard never re-renders consumers.
	const navGuardRef = useRef<NavGuard | null>(null);
	const [pendingAction, setPendingAction] = useState<SetStateAction<ViewType> | null>(null);

	const setNavGuard = useCallback((guard: NavGuard | null) => {
		navGuardRef.current = guard;
	}, []);

	// Separate ref, separate owner (see the RevealGuard type doc above).
	const revealGuardRef = useRef<RevealGuard | null>(null);

	const setRevealGuard = useCallback((guard: RevealGuard | null) => {
		revealGuardRef.current = guard;
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

	// Any navigation surface (bottom nav, drawer, deep link) routes through here;
	// a live guard holds the transition and surfaces the discard prompt instead
	// of silently throwing away in-progress work. The reveal guard is checked
	// second (only once the discard guard has cleared the navigation) and, if
	// it holds, the attempted navigation is dropped entirely — the guard's own
	// side effect is what shows the Reveal (see App.tsx), not this function.
	const setView = useCallback<Dispatch<SetStateAction<ViewType>>>(
		(action) => {
			if (navGuardRef.current?.()) {
				setPendingAction(() => action);
				return;
			}
			if (revealGuardRef.current?.()) {
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
		<ViewContext.Provider value={{ view, previousView, setView, setNavGuard, setRevealGuard }}>
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

export const useViewOptional = (): ViewContextType | null => {
	return useContext(ViewContext) ?? null;
};

const noopSetNavGuard = () => {};

/** Safe outside a ViewProvider (unit tests render the wizard bare) — no-op there. */
export const useSetNavGuard = (): ((guard: NavGuard | null) => void) => {
	const ctx = useContext(ViewContext);
	return ctx?.setNavGuard ?? noopSetNavGuard;
};

const noopSetRevealGuard = () => {};

/** Safe outside a ViewProvider — no-op there. */
export const useSetRevealGuard = (): ((guard: RevealGuard | null) => void) => {
	const ctx = useContext(ViewContext);
	return ctx?.setRevealGuard ?? noopSetRevealGuard;
};
