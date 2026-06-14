/**
 * Best-effort localStorage write that never throws.
 *
 * Safari caps localStorage at ~5MB and throws QuotaExceededError once full;
 * private mode throws SecurityError on write. Persistence is best-effort — the
 * app keeps its in-memory state working rather than crashing on a failed write.
 *
 * @returns true if the value was persisted, false if storage rejected it.
 */
export function safeSetItem(key: string, value: string): boolean {
	try {
		window.localStorage.setItem(key, value);
		return true;
	} catch (error) {
		console.warn(`safeSetItem: could not persist "${key}" (storage full or unavailable)`, error);
		return false;
	}
}
