import { useConsent } from "./useConsent";
import "./ConsentBanner.css";

/**
 * Bottom banner offering opt-in to error tracking + analytics (Sentry +
 * PostHog). No privacy-policy link yet — LEGAL-1 hasn't shipped — so the copy
 * stays generic and factual rather than promising a policy that isn't live.
 */
export default function ConsentBanner() {
	const { showBanner, accept, decline } = useConsent();

	if (!showBanner) return null;

	return (
		<div className="consent-banner" role="dialog" aria-label="Analytics and error-tracking consent">
			<p className="consent-banner__text">
				We'd like to use analytics and error tracking to see what's broken and what's useful. No data is sold or shared with
				advertisers.
			</p>
			<div className="consent-banner__actions">
				<button className="btn btn--ghost btn--sm" type="button" onClick={decline}>
					Decline
				</button>
				<button className="btn btn--primary btn--sm" type="button" onClick={accept}>
					Accept
				</button>
			</div>
		</div>
	);
}
