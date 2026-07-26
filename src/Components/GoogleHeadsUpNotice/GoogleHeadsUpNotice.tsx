import GoogleConsentCard from "../GoogleConsentCard/GoogleConsentCard";

interface GoogleHeadsUpNoticeProps {
	/** Extra class for surface-specific spacing (onboarding vs. connect cards). */
	readonly className?: string;
	/** Which OAuth flow this sits under — changes the scope list and lead copy. */
	readonly variant?: "sign-in" | "gmail-import";
	/** Full mode shows the scope permission list; compact drops it for inline placement below a button. Defaults to compact. */
	readonly compact?: boolean;
}

/**
 * The branded "Google hasn't verified this app" reassurance, in one place.
 *
 * Originally this copy lived only inside the onboarding sign-in step, so a
 * tester who skipped sign-in there met the scarier second OAuth (Email import,
 * Profile sign-in) with no heads-up. Rendering this shared block on every
 * Google entry point means the warning always arrives *before* the fear does,
 * and the wording only has to be maintained once (P1-7).
 */
export default function GoogleHeadsUpNotice({ className, variant = "sign-in", compact = true }: GoogleHeadsUpNoticeProps) {
	return <GoogleConsentCard variant={variant} compact={compact} className={className} />;
}
