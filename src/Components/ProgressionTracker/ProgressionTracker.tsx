"use client";

import { motion } from "framer-motion";
import { steps } from "../../utils/constants";
import "./ProgressionTracker.css";

interface StepTabsTrackerProps {
	currentStep: number;
	onStepClick: (step: number) => void;
}

const StepTabsTracker = ({ currentStep, onStepClick }: StepTabsTrackerProps) => {
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
									layoutId="activeStepUnderline"
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
