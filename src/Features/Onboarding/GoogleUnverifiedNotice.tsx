import Modal from "../../Components/Modal/Modal";
import GoogleConsentCard from "../../Components/GoogleConsentCard/GoogleConsentCard";
import "./GoogleUnverifiedNotice.css";

interface GoogleUnverifiedNoticeProps {
	readonly isOpen: boolean;
	readonly onContinue: () => void;
	readonly onCancel: () => void;
	readonly variant?: "sign-in" | "gmail-import";
	readonly userPhotoUrl?: string | null;
	readonly userName?: string | null;
}

/**
 * Explains the "Google hasn't verified this app" interstitial before the user
 * hits it. Nothing To Wear is a small beta still going through Google's
 * verification review, so every sign-in shows that screen — without warning,
 * it reads as a scam prompt to non-technical users (see P0 backlog: 40–60%
 * onboarding drop-off risk).
 */
export default function GoogleUnverifiedNotice({
	isOpen,
	onContinue,
	onCancel,
	variant = "sign-in",
	userPhotoUrl,
	userName,
}: GoogleUnverifiedNoticeProps) {
	return (
		<Modal
			isOpen={isOpen}
			onClose={onCancel}
			title="What to expect before you sign in"
			footer={
				<>
					<button className="btn btn--ghost" type="button" onClick={onCancel}>
						Cancel
					</button>
					<button className="btn btn--primary" type="button" onClick={onContinue}>
						Continue to Google sign-in
					</button>
				</>
			}
		>
			<GoogleConsentCard variant={variant} userPhotoUrl={userPhotoUrl} userName={userName} className="gun-card" />
			<p className="gun-lead">What happens next</p>
			<ol className="gun-steps">
				<li>
					Tap <strong>Advanced</strong> (bottom left)
				</li>
				<li>
					Tap <strong>Go to Nothing To Wear</strong>
				</li>
				<li>Sign in with your Google account as normal</li>
			</ol>
		</Modal>
	);
}
