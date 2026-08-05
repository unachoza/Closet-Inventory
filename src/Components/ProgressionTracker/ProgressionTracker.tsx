"use client";

import { motion } from "framer-motion";
import { steps as addWizardSteps } from "../../utils/constants";
import "./ProgressionTracker.css";

interface StepTabsTrackerProps {
	currentStep: number;
	onStepClick: (step: number) => void;
	/** Step labels. Defaults to the Add wizard's four steps. */
	steps?: readonly string[];
	/**
	 * Namespaces the underline's shared-layout animation. Two trackers mounted
	 * at once with the same id would animate the underline between them, so give
	 * each additional instance its own.
	 */
	id?: string;
}

const StepTabsTracker = ({ currentStep, onStepClick, steps = addWizardSteps, id = "default" }: StepTabsTrackerProps) => {
	return (
		<nav className="step-tabs-container">
			<ul className="step-tabs-list">
				{steps.map((label, index) => {
					const isActive = currentStep === index + 1;

					return (
						<li key={label} className={`step-tab ${isActive ? "active" : ""}`} onClick={() => onStepClick(index + 1)}>
							<span>{label}</span>
							{isActive && (
								<motion.div
									className="step-tab-underline"
									layoutId={`activeStepUnderline-${id}`}
									transition={{
										type: "spring",
										stiffness: 500,
										damping: 30,
									}}
								/>
							)}
						</li>
					);
				})}
			</ul>
		</nav>
	);
};

export default StepTabsTracker;
