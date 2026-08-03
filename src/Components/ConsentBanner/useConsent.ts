import { useCallback, useEffect, useState } from "react";
import { getConsent, setConsent, type ConsentState } from "../../lib/consent";
import { discardPendingEvents, initMonitoring } from "../../lib/monitoring";

export function useConsent() {
	const [consent, setConsentState] = useState<ConsentState>("undecided");

	useEffect(() => {
		const current = getConsent();
		setConsentState(current);
		if (current === "granted") void initMonitoring();
	}, []);

	// Accepting flushes the events buffered during onboarding (see `monitoring.ts`);
	// initMonitoring replays them itself once PostHog is up.
	const accept = useCallback(() => {
		setConsent("granted");
		setConsentState("granted");
		void initMonitoring();
	}, []);

	// Declining destroys that buffer rather than leaving it sitting in memory.
	const decline = useCallback(() => {
		setConsent("declined");
		setConsentState("declined");
		discardPendingEvents();
	}, []);

	return { consent, accept, decline, showBanner: consent === "undecided" };
}
