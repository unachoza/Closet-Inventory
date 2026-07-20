import type { ReactNode } from "react";
import OnboardingShell from "../OnboardingShell";

export interface TourScreenContent {
	title: ReactNode;
	subtitle: string;
	illustration: ReactNode;
	/** Optional extra block under the subtitle (e.g. the nav teaching strip). */
	extra?: ReactNode;
}

export interface TourStepProps {
	content: TourScreenContent;
	index: number;
	length: number;
	isLast: boolean;
	onNext: () => void;
	onBack: () => void;
	onSkip: () => void;
}

/** One value-tour screen: illustration, serif headline, one supporting line. */
export default function TourStep({ content, index, length, isLast, onNext, onBack, onSkip }: TourStepProps) {
	return (
		<OnboardingShell
			dots={{ index, length }}
			onBack={index > 0 ? onBack : undefined}
			cta={{ label: isLast ? "Get started" : "Next", onClick: onNext }}
			skip={{ label: "Skip", onClick: onSkip }}
		>
			<div className="onb-step">
				<div className="onb-step__ill">{content.illustration}</div>
				<h1 className="onb-step__title">{content.title}</h1>
				<p className="onb-step__sub">{content.subtitle}</p>
				{content.extra}
			</div>
		</OnboardingShell>
	);
}
