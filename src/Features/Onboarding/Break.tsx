export interface BreakProps {
	/** Show only at desktop widths instead of the default mobile-only behavior (see .onb-br--desktop in OnboardingFlow.css). */
	readonly desktop?: boolean;
}

/** A line break that only applies on mobile widths by default; desktop wraps naturally (see .onb-br--mobile in OnboardingFlow.css). */
export default function Break({ desktop }: BreakProps) {
	return <br className={desktop ? "onb-br--desktop" : "onb-br--mobile"} />;
}