import { useEffect, useState } from "react";
import { applyPendingUpdate, isUpdateReady, subscribeToUpdateReady } from "../lib/pwaUpdate";

export interface UseAppUpdate {
	updateReady: boolean;
	applyUpdate: () => void;
}

/** React binding for pwaUpdate.ts's module-scope update state — see that file for why. */
export function useAppUpdate(): UseAppUpdate {
	const [updateReady, setUpdateReady] = useState(isUpdateReady());

	useEffect(() => {
		const sync = () => setUpdateReady(isUpdateReady());
		const unsubscribe = subscribeToUpdateReady(sync);
		// The update may have already landed before this component mounted —
		// without this, the banner would wait for a 2nd event that never comes.
		sync();
		return unsubscribe;
	}, []);

	return { updateReady, applyUpdate: applyPendingUpdate };
}
