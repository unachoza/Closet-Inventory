import { useEffect, useRef } from "react";

/**
 * Fires `onIdle` once, after `timeoutMs` of no reset. Reset by any change to
 * `activitySignal` — pass a value (or fingerprint string) that changes when
 * the user does something meaningful in the surface being watched.
 *
 * Built for the Day 0 Reveal's trigger (no interaction on the Gmail import
 * screen for N minutes), but intentionally generic — nothing here is
 * Gmail-specific.
 */
export function useIdleTimer(timeoutMs: number, onIdle: () => void, enabled: boolean, activitySignal: unknown): void {
	// Ref so a re-render that only changes the callback identity doesn't reset
	// the timer — only `activitySignal` changing should do that.
	const onIdleRef = useRef(onIdle);
	onIdleRef.current = onIdle;

	useEffect(() => {
		if (!enabled) return;
		const timer = setTimeout(() => onIdleRef.current(), timeoutMs);
		return () => clearTimeout(timer);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [enabled, timeoutMs, activitySignal]);
}
