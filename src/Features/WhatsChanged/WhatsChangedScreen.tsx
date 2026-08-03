import OnboardingShell from "../Onboarding/OnboardingShell";
import "../Onboarding/OnboardingFlow.css";
import "./WhatsChanged.css";

export interface WhatsChangedScreenProps {
	bullets: readonly string[];
	onDismiss: () => void;
}

/** Full-screen "what's changed" card, styled like onboarding — shown once per release to a returning user. See useWhatsChanged.ts for when. */
export default function WhatsChangedScreen({ bullets, onDismiss }: WhatsChangedScreenProps) {
	return (
		<OnboardingShell cta={{ label: "Got it", onClick: onDismiss }}>
			<div className="onb-step">
				<h1 className="onb-step__title">What's changed</h1>
				<ul className="whats-changed__bullets">
					{bullets.map((bullet) => (
						<li key={bullet}>{bullet}</li>
					))}
				</ul>
			</div>
		</OnboardingShell>
	);
}
