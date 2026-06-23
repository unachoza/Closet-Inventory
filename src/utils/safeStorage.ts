/**
 * Best-effort Web Storage writes that never throw.
 *
 * Safari caps storage at ~5MB and throws QuotaExceededError once full;
 * private mode throws SecurityError on write. Persistence is best-effort — the
 * app keeps its in-memory state working rather than crashing on a failed write.
 */

function safeSet(storage: Storage, key: string, value: string): boolean {
	try {
		storage.setItem(key, value);
		return true;
	} catch (error) {
		console.warn(`safeSet: could not persist "${key}" (storage full or unavailable)`, error);
		return false;
	}
}

/**
 * Best-effort localStorage write. Survives a tab close.
 * @returns true if persisted, false if storage rejected it.
 */
export function safeSetItem(key: string, value: string): boolean {
	return safeSet(window.localStorage, key, value);
}

/**
 * Best-effort sessionStorage write. Cleared when the tab closes — use for
 * sensitive data (e.g. fetched email bodies) that should not linger on disk.
 * @returns true if persisted, false if storage rejected it.
 */
export function safeSetSessionItem(key: string, value: string): boolean {
	return safeSet(window.sessionStorage, key, value);
}
