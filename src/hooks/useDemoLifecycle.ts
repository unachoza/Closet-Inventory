import { useCallback, useEffect, useMemo, useState } from "react";
import { useCloset } from "../context/ClosetContext";
import {
	nextDemoPrompt,
	declineDemoPrompt,
	clearDemoState,
	INITIAL_DEMO_STATE,
	type DemoLifecycleState,
	type DemoPrompt,
} from "./demoLifecycle";

const STORAGE_KEY = "ntw-demo-lifecycle";

function loadState(): DemoLifecycleState {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return INITIAL_DEMO_STATE;
		return { ...INITIAL_DEMO_STATE, ...(JSON.parse(raw) as Partial<DemoLifecycleState>) };
	} catch {
		return INITIAL_DEMO_STATE;
	}
}

function saveState(state: DemoLifecycleState): void {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
	} catch {
		// Non-fatal: the prompt just re-evaluates next session.
	}
}

/**
 * Drives the demo-data lifecycle UI: watches the closet for the first real item
 * (and the re-prompt threshold), and exposes the active prompt + the accept /
 * decline actions. Persists the decision so "ask again at 20" survives reloads.
 */
export function useDemoLifecycle() {
	const { closet, clearDemoItems } = useCloset();
	const [state, setState] = useState<DemoLifecycleState>(loadState);
	// Once shown, a prompt stays up until the user acts, even if a re-render
	// changes the derived counts underneath it.
	const [activePrompt, setActivePrompt] = useState<DemoPrompt>(null);

	const ownCount = useMemo(() => closet.filter((item) => !item.isDemo).length, [closet]);
	const hasDemoItems = useMemo(() => closet.some((item) => item.isDemo), [closet]);

	useEffect(() => {
		if (activePrompt) return; // don't stack prompts
		const prompt = nextDemoPrompt(ownCount, hasDemoItems, state);
		if (prompt) setActivePrompt(prompt);
	}, [ownCount, hasDemoItems, state, activePrompt]);

	const persist = useCallback((next: DemoLifecycleState) => {
		setState(next);
		saveState(next);
	}, []);

	const keepDemo = useCallback(() => {
		persist(declineDemoPrompt(ownCount, state));
		setActivePrompt(null);
	}, [ownCount, state, persist]);

	const clearDemo = useCallback(() => {
		clearDemoItems();
		persist(clearDemoState(state));
		setActivePrompt(null);
	}, [clearDemoItems, state, persist]);

	return { activePrompt, keepDemo, clearDemo };
}
