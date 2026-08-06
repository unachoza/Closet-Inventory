import { useSupabaseAuthContext } from "../../context/SupabaseAuthContext";
import { track } from "../../lib/analytics";
import { useEffect, type ReactNode } from "react";
import "./ImportAccountGate.css";

/**
 * Requires a signed-in account before Gmail import is reachable.
 *
 * Local-only mode is deliberate and stays supported for manually-added items —
 * but it cannot back an *import*. A signed-out closet lives in localStorage
 * (~5MB) with photos held as base64 data URLs, and an import pulls in dozens of
 * items with images at once: it would blow the quota almost immediately, and
 * `safeSetItem` swallows that failure, so the items would appear to import and
 * then silently vanish on reload.
 *
 * The account is also what makes the import *worth* anything — without one there
 * is no Storage bucket for the photos and no row to sync to. So this is not an
 * upsell gate; it's the point at which local-only stops being able to keep the
 * user's data.
 *
 * Placed at the view boundary rather than inside GmailImport so no Gmail OAuth
 * consent is ever requested from someone who has no account to attach it to.
 */
export default function ImportAccountGate({ children }: { children: ReactNode }) {
	const { isAuthenticated, isLoading, signIn, error } = useSupabaseAuthContext();

	// Distinguishes "bounced off the gate" from "never opened import" in the
	// funnel — previously invisible, since a signed-out user left no trace.
	useEffect(() => {
		if (!isLoading && !isAuthenticated) track("import_gate_shown");
	}, [isLoading, isAuthenticated]);

	// Don't show the WRONG content (the sign-in gate) while auth resolves, so a
	// signed-in user never sees it flash — but don't show nothing either, since
	// a cold-start tap on this tab used to render a blank screen and read as
	// broken. This loading state is neither the gate nor the real content.
	if (isLoading) {
		return (
			<div className="import-gate__loading" role="status" aria-label="Checking your account">
				Checking your account…
			</div>
		);
	}
	if (isAuthenticated) return <>{children}</>;

	return (
		<section className="import-gate" aria-labelledby="import-gate-heading">
			<h2 id="import-gate-heading" className="import-gate__heading">
				Create an account to import from Gmail
			</h2>

			<p className="import-gate__body">
				Importing brings in dozens of items and their photos at once — more than this
				device can hold on its own. An account gives them somewhere permanent to live,
				so they're still here on your next visit and on your other devices.
			</p>

			<p className="import-gate__body">
				Anything already in your closet stays exactly where it is, and moves over
				automatically when you sign in.
			</p>

			<button
				type="button"
				className="btn btn--primary import-gate__cta"
				onClick={() => {
					track("import_gate_signin_clicked");
					void signIn();
				}}
			>
				Create account or sign in
			</button>

			{error && (
				<p className="import-gate__error" role="alert">
					{error}
				</p>
			)}

			<p className="import-gate__aside">
				You can keep adding items by hand without an account.
			</p>
		</section>
	);
}
