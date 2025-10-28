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
		window.localStorage.setItem(keyName, JSON.stringify(value));
	}, [keyName, value]);

	return [value, setValue] as const;
};
