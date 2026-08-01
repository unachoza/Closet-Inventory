import { useCallback, useMemo, useState } from "react";
import { useCloset } from "../context/ClosetContext";
import { safeSetItem } from "../utils/safeStorage";
import { shouldShowReveal, markRevealShown, INITIAL_RETENTION_STATE, type RetentionLifecycleState } from "./retentionLifecycle";

const STORAGE_KEY = "closetly-retention";

function loadState(): RetentionLifecycleState {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return INITIAL_RETENTION_STATE;
		return { ...INITIAL_RETENTION_STATE, ...(JSON.parse(raw) as Partial<RetentionLifecycleState>) };
	} catch {
		return INITIAL_RETENTION_STATE;
	}
}

/**
 * Drives the Day-0 Reveal: watches the closet for the own-item threshold and
 * exposes whether it should show right now, plus the action that marks it
 * shown (persisted so it never fires again, even across reloads/devices... —
 * localStorage only for now, matching every other `closetly-*` lifecycle flag).
 */
export function useRetentionLifecycle() {
	const { closet } = useCloset();
	const [state, setState] = useState<RetentionLifecycleState>(loadState);

	const ownCount = useMemo(() => closet.filter((item) => !item.isDemo).length, [closet]);
	const isDemoOnly = closet.length > 0 && ownCount === 0;

	const showReveal = shouldShowReveal(ownCount, isDemoOnly, state);

	const dismissReveal = useCallback(() => {
		const next = markRevealShown(state);
		setState(next);
		safeSetItem(STORAGE_KEY, JSON.stringify(next));
	}, [state]);

	return { showReveal, dismissReveal, ownCount };
}
