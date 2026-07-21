import { useCallback, useRef, useState } from "react";

const NOTICE_SEEN_KEY = "closetly-google-notice-seen";

/**
 * The onboarding sign-in step shows the unverified-app explanation inline, so
 * it marks the notice seen directly instead of opening the modal — later OAuth
 * entry points (CloudSyncControl, Gmail import) then skip the interstitial.
 */
export function markGoogleNoticeSeen(): void {
	localStorage.setItem(NOTICE_SEEN_KEY, "true");
}

/**
 * Gates any Google OAuth entry point (Supabase sign-in, Gmail import) behind a
 * one-time explainer for the "Google hasn't verified this app" interstitial.
 * Non-technical waitlisters otherwise read that screen as a scam warning and
 * bail before finishing sign-in — this walks them through Advanced → Go to
 * the app once, then gets out of the way for every OAuth flow after.
 */
export function useGoogleUnverifiedNotice() {
	const [isOpen, setIsOpen] = useState(false);
	const pendingActionRef = useRef<(() => void) | null>(null);

	const requestGoogleSignIn = useCallback((proceed: () => void) => {
		if (localStorage.getItem(NOTICE_SEEN_KEY)) {
			proceed();
			return;
		}
		pendingActionRef.current = proceed;
		setIsOpen(true);
	}, []);

	const confirm = useCallback(() => {
		localStorage.setItem(NOTICE_SEEN_KEY, "true");
		setIsOpen(false);
		const proceed = pendingActionRef.current;
		pendingActionRef.current = null;
		proceed?.();
	}, []);

	const dismiss = useCallback(() => {
		setIsOpen(false);
		pendingActionRef.current = null;
	}, []);

	return { isOpen, requestGoogleSignIn, confirm, dismiss };
}
