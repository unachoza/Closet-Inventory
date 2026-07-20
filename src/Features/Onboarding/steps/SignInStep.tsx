import OnboardingShell from "../OnboardingShell";
import { markGoogleNoticeSeen } from "../useGoogleUnverifiedNotice";

export interface SignInStepProps {
	onSignIn: () => void;
	onSkip: () => void;
}

function GoogleMark() {
	return (
		<svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
			<path fill="#4285F4" d="M23 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.2a5.3 5.3 0 0 1-2.3 3.5v2.9h3.7c2.2-2 3.4-5 3.4-8.6Z" />
			<path fill="#34A853" d="M12 24c3.1 0 5.7-1 7.6-2.8l-3.7-2.9c-1 .7-2.4 1.1-3.9 1.1-3 0-5.5-2-6.4-4.7H1.8v3A11.5 11.5 0 0 0 12 24Z" />
			<path fill="#FBBC05" d="M5.6 14.7a7 7 0 0 1 0-4.4v-3H1.8a11.5 11.5 0 0 0 0 10.4l3.8-3Z" />
			<path fill="#EA4335" d="M12 4.6c1.7 0 3.2.6 4.4 1.7L19.7 3A11.5 11.5 0 0 0 1.8 7.3l3.8 3c.9-2.7 3.4-4.7 6.4-4.7Z" />
		</svg>
	);
}

/**
 * The account decision. Reassurance for Google's "unverified app" interstitial
 * lives right under the button — the moment the fear happens — and clicking
 * sign-in marks the standalone notice as seen so later OAuth entry points
 * (sync control, Gmail import) don't repeat the explanation.
 */
export default function SignInStep({ onSignIn, onSkip }: SignInStepProps) {
	const handleSignIn = () => {
		markGoogleNoticeSeen();
		onSignIn();
	};

	return (
		<OnboardingShell skip={{ label: "Skip for now — keep my closet on this device", onClick: onSkip }}>
			<div className="onb-step">
				<h1 className="onb-step__title">
					Save your closet <em>to your account</em>
				</h1>
				<p className="onb-step__sub">Sign in to keep your closet backed up and import from Gmail.</p>
				<button type="button" className="onb__gbtn" onClick={handleSignIn}>
					<GoogleMark />
					Sign in with Google
				</button>
				<div className="onb-notice">
					<strong>Heads up:</strong> Google will show a "hasn't verified this app" notice — that's expected during our
					small beta. Tap <strong>Advanced, then Go to Nothing To Wear</strong> to continue safely.
				</div>
			</div>
		</OnboardingShell>
	);
}
