import type { ReactNode } from "react";
import { ChevronLeft } from "lucide-react";

export interface OnboardingShellProps {
	/** Tour progress; omit on the account steps (sign-in, name, install). */
	dots?: { index: number; length: number };
	onBack?: () => void;
	cta?: { label: string; onClick: () => void; disabled?: boolean };
	skip?: { label: string; onClick: () => void };
	children: ReactNode;
}

/**
 * Shared chrome for every onboarding screen: back chevron + progress dots up
 * top, the step's content in the middle, pill CTA + skip link pinned below.
 */
export default function OnboardingShell({ dots, onBack, cta, skip, children }: OnboardingShellProps) {
	return (
		<div className="onb">
			<header className="onb__top">
				{onBack ? (
					<button type="button" className="onb__back" aria-label="Back" onClick={onBack}>
						<ChevronLeft size={22} aria-hidden="true" />
					</button>
				) : (
					<span className="onb__top-spacer" aria-hidden="true" />
				)}
				{dots && (
					<div className="onb__dots" role="img" aria-label={`Step ${dots.index + 1} of ${dots.length}`}>
						{Array.from({ length: dots.length }, (_, i) => (
							<span key={i} className={`onb__dot${i === dots.index ? " onb__dot--on" : ""}`} />
						))}
					</div>
				)}
				<span className="onb__top-spacer" aria-hidden="true" />
			</header>

			<main className="onb__body">{children}</main>

			<footer className="onb__footer">
				{cta && (
					<button type="button" className="onb__cta" onClick={cta.onClick} disabled={cta.disabled}>
						{cta.label}
					</button>
				)}
				{skip && (
					<button type="button" className="onb__skip" onClick={skip.onClick}>
						{skip.label}
					</button>
				)}
			</footer>
		</div>
	);
}
