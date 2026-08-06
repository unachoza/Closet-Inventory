import { useCallback, useState } from "react";
import {
	hasShown as hasShownPure,
	markShown as markShownPure,
	INITIAL_RETENTION_STATE,
	type RetentionHorizon,
	type RetentionLifecycleState,
} from "./retentionLifecycle";

const STORAGE_KEY = "ntw-retention-lifecycle";

function loadState(): RetentionLifecycleState {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return INITIAL_RETENTION_STATE;
		return { ...INITIAL_RETENTION_STATE, ...(JSON.parse(raw) as Partial<RetentionLifecycleState>) };
	} catch {
		return INITIAL_RETENTION_STATE;
	}
}

function saveState(state: RetentionLifecycleState): void {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
	} catch {
		// Non-fatal: the horizon just re-evaluates (and may re-fire once) next session.
	}
}

/**
 * Persists which retention horizons (Day 0/2-3/14/30) have already fired for
 * this browser, so each one shows in-app, once, ever — never re-asks on a
 * later visit. A surface still owns deciding *when* its own condition is met
 * (e.g. the Reveal's idle timer); this hook only remembers that it happened.
 *
 * localStorage-only, same as every other show-once prompt in the app today
 * (demoLifecycle, useWhatsChanged) — a horizon can re-fire on a new
 * device/browser or after a cache clear. Accepted for now; server-side "seen"
 * state (e.g. `profiles.settings`) is a documented follow-on, not built here.
 */
export function useRetentionLifecycle() {
	const [state, setState] = useState<RetentionLifecycleState>(loadState);

	const hasShown = useCallback((horizon: RetentionHorizon) => hasShownPure(state, horizon), [state]);

	const markShown = useCallback((horizon: RetentionHorizon) => {
		setState((prev) => {
			const next = markShownPure(prev, horizon);
			saveState(next);
			return next;
		});
	}, []);

	return { hasShown, markShown };
}
