import { useState, useEffect } from "react";
import { safeSetSessionItem } from "../utils/safeStorage";

/**
 * Like useLocalStorage, but backed by sessionStorage so the value is cleared
 * when the tab closes. Use for sensitive data (e.g. fetched email bodies) that
 * should not persist on disk where any XSS could read it.
 */
export const useSessionStorage = <T,>(keyName: string, initialValue: T) => {
	const [value, setValue] = useState(() => {
		try {
			const sessionValue = window.sessionStorage.getItem(keyName);
			return sessionValue ? (JSON.parse(sessionValue) as T) : initialValue;
		} catch {
			return initialValue;
		}
	});

	useEffect(() => {
		safeSetSessionItem(keyName, JSON.stringify(value));
	}, [keyName, value]);

	return [value, setValue] as const;
};
