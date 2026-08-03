import { useEffect, useRef } from "react";
import OnboardingShell from "../Onboarding/OnboardingShell";
import { track } from "../../lib/analytics";
import "../Onboarding/OnboardingFlow.css";
import "./WhatsChanged.css";

export interface WhatsChangedScreenProps {
	bullets: readonly string[];
	version: string;
	onDismiss: () => void;
}

/** Full-screen "what's changed" card, styled like onboarding — shown once per release to a returning user. See useWhatsChanged.ts for when. */
export default function WhatsChangedScreen({ bullets, version, onDismiss }: WhatsChangedScreenProps) {
	// StrictMode double-mounts effects; guard so "shown" fires once per actual
	// appearance, matching the pattern already used in InstallStep.tsx.
	const trackedShown = useRef(false);

	useEffect(() => {
		if (!trackedShown.current) {
			trackedShown.current = true;
			track("whats_changed_shown", { version, bullet_count: bullets.length });
		}
	}, [version, bullets.length]);

	const handleDismiss = () => {
		track("whats_changed_dismissed", { version, bullet_count: bullets.length });
		onDismiss();
	};

	return (
		<OnboardingShell cta={{ label: "Got it", onClick: handleDismiss }}>
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
