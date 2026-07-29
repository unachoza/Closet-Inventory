import type { ReactNode } from "react";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import OnboardingShell from "../OnboardingShell";

export interface TourScreenContent {
	title: ReactNode;
	subtitle: string | ReactNode;
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

const PAGE_OFFSET = 125;

/** One value-tour screen: illustration, serif headline, one supporting line. */
export default function TourStep({ content, index, length, isLast, onNext, onBack, onSkip }: TourStepProps) {
	const prefersReducedMotion = useReducedMotion();
	// Tracks whether the index moved forward or backward so the page-turn can
	// exit/enter from the correct side. Reading/writing a ref during render is
	// unsafe (react-hooks/refs) — this uses React's sanctioned "adjust state
	// during render" idiom instead: comparing against state (not a ref) during
	// render is fine, and the setState calls below bail out once state catches
	// up to the prop, so this doesn't loop.
	const [renderedIndex, setRenderedIndex] = useState(index);
	const [direction, setDirection] = useState(1);
	if (index !== renderedIndex) {
		setDirection(index > renderedIndex ? 1 : -1);
		setRenderedIndex(index);
	}

	return (
		<OnboardingShell
			dots={{ index, length }}
			onBack={index > 0 ? onBack : undefined}
			cta={{ label: isLast ? "Get started" : "Next", onClick: onNext }}
			skip={{ label: "Skip", onClick: onSkip }}
		>
			<div className="onb-step-viewport">
				<AnimatePresence initial={false} custom={direction}>
					<motion.div
						key={index}
						className="onb-step"
						custom={direction}
						initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: direction * PAGE_OFFSET }}
						animate={{ opacity: 1, x: 0, position: "relative" }}
						exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: direction * -PAGE_OFFSET, position: "absolute" }}
						transition={{ duration: prefersReducedMotion ? 0.15 : 0.5, ease: [0.4, 0, 0.2, 1] }}
					>
						<div className="onb-step__ill">{content.illustration}</div>
						<h1 className="onb-step__title">{content.title}</h1>
						<p className="onb-step__sub">{content.subtitle}</p>
						{content.extra}
					</motion.div>
				</AnimatePresence>
			</div>
		</OnboardingShell>
	);
}
