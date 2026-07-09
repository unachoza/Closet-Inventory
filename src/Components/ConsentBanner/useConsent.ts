import { useCallback, useEffect, useState } from "react";
import { getConsent, setConsent, type ConsentState } from "../../lib/consent";
import { initMonitoring } from "../../lib/monitoring";

export function useConsent() {
	const [consent, setConsentState] = useState<ConsentState>("undecided");

	useEffect(() => {
		const current = getConsent();
		setConsentState(current);
		if (current === "granted") void initMonitoring();
	}, []);

	const accept = useCallback(() => {
		setConsent("granted");
		setConsentState("granted");
		void initMonitoring();
	}, []);

	const decline = useCallback(() => {
		setConsent("declined");
		setConsentState("declined");
	}, []);

	return { consent, accept, decline, showBanner: consent === "undecided" };
}
