import { useOnboardingFlow } from "./useOnboardingFlow";
import { TOUR_STEPS } from "./flowSteps";
import type { TourStep as TourStepId } from "./flowSteps";
import TourStep from "./steps/TourStep";
import type { TourScreenContent } from "./steps/TourStep";
import NavPreviewStrip from "./steps/NavPreviewStrip";
import SignInStep from "./steps/SignInStep";
import NameStep from "./steps/NameStep";
import InstallStep from "./steps/InstallStep";
import {
	WelcomeIllustration,
	EmailImportIllustration,
	CareIllustration,
	SearchIllustration,
} from "./illustrations/TourIllustrations";
import "./OnboardingFlow.css";

const TOUR_CONTENT: Record<TourStepId, TourScreenContent> = {
	welcome: {
		title: (
			<>
				Your closet, <em>in your pocket</em>
			</>
		),
		subtitle: "Every piece you own, in one calm place.",
		illustration: <WelcomeIllustration />,
	},
	email: {
		title: (
			<>
				Your inbox already <em>knows your wardrobe</em>
			</>
		),
		subtitle: "Connect Gmail and we'll build your closet from your order emails. No typing.",
		illustration: <EmailImportIllustration />,
	},
	care: {
		title: (
			<>
				Care for what <em>you love</em>
			</>
		),
		subtitle: "Wash, dry, and fabric guidance for every piece — so your favorites last.",
		illustration: <CareIllustration />,
	},
	search: {
		title: (
			<>
				Find anything <em>in seconds</em>
			</>
		),
		subtitle: "Everything lives one tap away, right here:",
		illustration: <SearchIllustration />,
		extra: <NavPreviewStrip />,
	},
};

export interface OnboardingFlowProps {
	onComplete: () => void;
}

/**
 * First-run flow: four-screen value tour → Google sign-in (skippable to local
 * mode) → name confirm → add-to-home-screen card → the closet. Step order,
 * resume-after-OAuth, and analytics live in useOnboardingFlow.
 */
export default function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
	const flow = useOnboardingFlow({ onComplete });

	if (flow.step === null) {
		return <div className="onb onb--loading" role="status" aria-label="Getting things ready" />;
	}

	if (flow.isTourStep) {
		return (
			<TourStep
				content={TOUR_CONTENT[TOUR_STEPS[flow.tourIndex]]}
				index={flow.tourIndex}
				length={flow.tourLength}
				isLast={flow.tourIndex === flow.tourLength - 1}
				onNext={flow.next}
				onBack={flow.back}
				onSkip={flow.skipTour}
			/>
		);
	}

	if (flow.step === "signin") {
		return <SignInStep onSignIn={() => void flow.beginSignIn()} onSkip={flow.skipSignIn} />;
	}

	if (flow.step === "name") {
		return <NameStep onContinue={flow.advanceFromName} />;
	}

	return <InstallStep onFinish={flow.finish} />;
}
