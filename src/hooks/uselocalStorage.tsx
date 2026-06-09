import { useState, useEffect } from "react";

export const useLocalStorage = <T,>(keyName: string, initialValue: T) => {
	const [value, setValue] = useState(() => {
		try {
			const localStorageValue = window.localStorage.getItem(keyName);
			return localStorageValue ? (JSON.parse(localStorageValue) as T) : initialValue;
		} catch (error) {
			return initialValue;
		}
	});

	useEffect(() => {
		try {
			window.localStorage.setItem(keyName, JSON.stringify(value));
		} catch (error) {
			// Persistence is best-effort. Safari caps localStorage at ~5MB and throws
			// QuotaExceededError once full; private mode throws SecurityError. Keep the
			// in-memory value working rather than crashing the whole app on write.
			console.warn(`useLocalStorage: could not persist "${keyName}"`, error);
		}
	}, [keyName, value]);

	return [value, setValue] as const;
};
