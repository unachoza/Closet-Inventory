import { useState, useEffect } from "react";

export const useLocalStorage = (keyName: string, initialValue: Record<string, any>) => {
	const [value, setValue] = useState(() => {
		try {
			const localStorageValue = window.localStorage.getItem(keyName);
			return localStorageValue ? JSON.parse(localStorageValue) : initialValue;
		} catch (error) {
			return initialValue;
		}
	});

	useEffect(() => {
		window.localStorage.setItem(keyName, JSON.stringify(value));
	}, [keyName, value]);

	return [value, setValue];
};

// import { useState, useEffect } from "react";

// export const useLocalStorage = (keyName, initialValue) => {
//   const [value, setValue] = useState(() => {
//     try {
//       const localValue = window.localStorage.getItem(keyName);
//       return localValue ? JSON.parse(localValue) : initialValue;
//     } catch (error) {
//       return initialValue;
//     }
//   });

//   useEffect(() => {
//     window.localStorage.setItem(keyName, JSON.stringify(value));
//   }, [keyName, value]);

//   return [value, setValue];
// };
