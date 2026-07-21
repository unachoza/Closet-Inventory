import { useEffect, useRef } from "react";
import { Share, SquarePlus, Smartphone } from "lucide-react";
import OnboardingShell from "../OnboardingShell";
import { useInstallPrompt } from "../../../hooks/useInstallPrompt";
import { track } from "../../../lib/analytics";

export interface InstallStepProps {
	onFinish: (options?: { installed?: boolean }) => void;
}

/**
 * The add-to-home-screen card. Android/desktop Chrome get the captured native
 * prompt; iOS gets the manual three-step walk-through; an already-installed
 * app skips the step entirely. Always escapable via "Maybe later".
 */
export default function InstallStep({ onFinish }: InstallStepProps) {
	const { canPrompt, promptInstall, isStandalone, isIOS } = useInstallPrompt();
	const reportedRef = useRef(false);

	useEffect(() => {
		if (isStandalone) onFinish({ installed: true });
	}, [isStandalone, onFinish]);

	useEffect(() => {
		if (isIOS && !isStandalone && !reportedRef.current) {
			reportedRef.current = true;
			track("install_prompt_result", { outcome: "ios_instructions" });
		}
	}, [isIOS, isStandalone]);

	const handleInstall = async () => {
		const outcome = await promptInstall();
		track("install_prompt_result", { outcome });
		onFinish({ installed: outcome === "accepted" });
	};

	if (isStandalone) return null;

	return (
		<OnboardingShell
			cta={canPrompt ? { label: "Add to home screen", onClick: () => void handleInstall() } : undefined}
			skip={{ label: "Maybe later", onClick: () => onFinish() }}
		>
			<div className="onb-step">
				<h1 className="onb-step__title">
					Keep it <em>one tap away</em>
				</h1>
				<p className="onb-step__sub">Add Nothing To Wear to your home screen — it works like a regular app.</p>
				{isIOS ? (
					<div className="onb-install-steps">
						<div className="onb-install-step">
							<Share size={17} aria-hidden="true" />
							Tap the Share button in Safari
						</div>
						<div className="onb-install-step">
							<SquarePlus size={17} aria-hidden="true" />
							Choose "Add to Home Screen"
						</div>
						<div className="onb-install-step">
							<Smartphone size={17} aria-hidden="true" />
							Open it from your home screen
						</div>
					</div>
				) : (
					!canPrompt && <p className="onb__hint">You can also install it anytime from your browser's menu.</p>
				)}
			</div>
		</OnboardingShell>
	);
}
