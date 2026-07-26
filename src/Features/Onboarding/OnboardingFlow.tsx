import { useOnboardingFlow } from "./useOnboardingFlow";
import { TOUR_STEPS } from "./flowSteps";
import type { TourStep as TourStepId } from "./flowSteps";
import TourStep from "./steps/TourStep";
import type { TourScreenContent } from "./steps/TourStep";
import NavPreviewStrip from "./steps/NavPreviewStrip";
import Break from "./Break";
import SignInStep from "./steps/SignInStep";
import NameStep from "./steps/NameStep";
import InstallStep from "./steps/InstallStep";
import {
	WelcomeIllustration,
	EmailImportIllustration,
	AddItemIllustration,
	CareIllustration,
	SearchIllustration,
} from "./illustrations/TourIllustrations";
import "./OnboardingFlow.css";

const TOUR_CONTENT: Record<TourStepId, TourScreenContent> = {
	welcome: {
		title: (
			<>
				Your closet, <Break />
				<em>in your pocket</em>
			</>
		),
		subtitle: "Every piece you own, beautifully organized and easy to see.",
		illustration: <WelcomeIllustration />,
	},
	email: {
		title: (
			<>
				Your inbox already <Break />
				<em>
					knows <Break desktop />
					your wardrobe
				</em>
			</>
		),
		subtitle: (
			<>
				Connect to Gmail and we'll find <Break />
				your order confirmations and <Break />
				turn them into closet items. No typing.
			</>
		),
		illustration: <EmailImportIllustration />,
	},
	add: {
		title: (
			<>
				Didn't come by <Break />
				<em>email?</em>
			</>
		),
		subtitle: (
			<>
				Add gifts, thrifted finds, <Break />
				and hand-me-downs by hand <Break />
				in a few quick taps.
			</>
		),
		illustration: <AddItemIllustration />,
	},
	care: {
		title: (
			<>
				Care for what <Break />
				<em>you love</em>
			</>
		),
		subtitle: (
			<>
				Guidance for every fabric, <Break />
				so your favorites last.
			</>
		),
		illustration: <CareIllustration />,
	},
	search: {
		title: (
			<>
				See everything <Break />
				<em>Find anything</em>
			</>
		),
		subtitle: "One search. Your entire wardrobe.",
		illustration: <SearchIllustration />,
		extra: <NavPreviewStrip />,
	},
};

export interface OnboardingFlowProps {
	onComplete: (options?: { goToGmail?: boolean }) => void;
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
