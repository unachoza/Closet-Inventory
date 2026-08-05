import { useConsent } from "./useConsent";
import "./ConsentBanner.css";

/**
 * Bottom banner offering opt-in to **product analytics** (PostHog).
 *
 * Crash reporting (Sentry) is deliberately NOT covered by this banner — it runs
 * regardless, started in `main.tsx` via `initErrorTracking`. The copy therefore
 * says "how you use the app" and does not claim consent gates error tracking:
 * asking permission for something that happens either way would be misleading.
 * The second sentence discloses the crash reporting plainly instead.
 *
 * The privacy-policy link is live as of 2026-08-04 (LEGAL-1). It points at the
 * static `/privacy.html`, not an in-app route — see `LegalLinks` for why.
 */
export default function ConsentBanner() {
	const { showBanner, accept, decline } = useConsent();

	if (!showBanner) return null;

	return (
		<div className="consent-banner" role="dialog" aria-label="Analytics consent">
			<p className="consent-banner__text">
				We'd like to use analytics to see how you use the app and what's worth building next. Separately, we always record
				crash reports so we can fix what breaks — those contain no personal details. No data is sold or shared with
				advertisers.{" "}
				<a className="consent-banner__link" href="/privacy.html" target="_blank" rel="noreferrer">
					Privacy policy
				</a>
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
