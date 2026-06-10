import { useState } from "react";
import { ChevronRight, Mail, Search } from "lucide-react";

import "./InteractiveOnboardingV2.css";

export function OnboardingOption3({ onComplete }: { onComplete: () => void }) {
	const [currentStep, setCurrentStep] = useState(0);

	const steps = [
		{
			id: 0,
			badge: "Welcome",
			title: "Your Closet, Organized",
			description: "Track every piece, know what you own, care for it better.",
			demo: (
				<div className="onboarding-demo onboarding-demo--welcome">
					<div className="onboarding-demo__center">
						<div className="onboarding-demo__emoji">👔</div>
						<div className="onboarding-demo__label">Closet Inventory</div>
					</div>
				</div>
			),
		},
		{
			id: 1,
			badge: "Step 1",
			title: "Import from Email",
			description: "Click the import button, connect Gmail, and watch items populate automatically.",
			demo: (
				<div className="onboarding-demo onboarding-demo--email">
					<div className="onboarding-email">
						<div className="onboarding-email__header">
							<Mail className="size-4" />
							<span>Connect Gmail</span>
						</div>

						<div className="onboarding-email__list">
							{[1, 2, 3].map((i) => (
								<div key={i} className={`onboarding-email-card onboarding-email-card--delay-${i}`}>
									<div className="onboarding-email-card__icon">
										<Mail className="size-5 text-primary" />
									</div>

									<div className="onboarding-email-card__content">
										<div className="onboarding-email-card__line onboarding-email-card__line--primary" />
										<div className="onboarding-email-card__line onboarding-email-card__line--secondary" />
									</div>
								</div>
							))}
						</div>
					</div>

					<div className="onboarding-ping" />
					<div className="onboarding-action">
						<ChevronRight className="size-6 text-primary-foreground" />
					</div>
				</div>
			),
		},
		{
			id: 2,
			badge: "Step 2",
			title: "Search & Filter",
			description: "Type to search, click filters to narrow down. Find that perfect piece instantly.",
			demo: (
				<div className="onboarding-demo onboarding-demo--search">
					<div className="onboarding-search">
						<div className="onboarding-search__input">
							<Search className="size-4 text-muted-foreground" />
							<div className="text-sm text-muted-foreground">summer dress</div>
						</div>

						<div className="onboarding-search__filters">
							{["Dresses", "Cotton", "Under $50"].map((filter) => (
								<div key={filter} className="onboarding-search__filter">
									{filter}
								</div>
							))}
						</div>

						<div className="onboarding-search__grid">
							{[1, 2, 3, 4, 5, 6].map((i) => (
								<div key={i} className="onboarding-search__item" />
							))}
						</div>
					</div>
				</div>
			),
		},
		{
			id: 3,
			badge: "Step 3",
			title: "Learn Fabric Care",
			description: "Tap any item to see care instructions based on its materials.",
			demo: (
				<div className="onboarding-demo onboarding-demo--care">
					<div className="onboarding-care-card">
						<div className="onboarding-care-card__header">
							<div className="onboarding-care-card__image" />

							<div className="onboarding-care-card__content">
								<div className="onboarding-care-card__line onboarding-care-card__line--primary" />
								<div className="onboarding-care-card__line onboarding-care-card__line--secondary" />
							</div>
						</div>

						<div className="onboarding-care-card__materials">
							<div className="onboarding-care-card__material-row">
								<span className="font-medium">Cotton 80%</span>
								<span className="text-muted-foreground">Polyester 20%</span>
							</div>

							<div className="onboarding-care-card__progress">
								<div className="onboarding-care-card__progress-fill" />
							</div>
						</div>

						<div className="onboarding-care-card__instructions">
							<div>• Machine wash cold</div>
							<div>• Tumble dry low</div>
						</div>
					</div>
				</div>
			),
		},
	];

	const currentStepData = steps[currentStep];
	const isLastStep = currentStep === steps.length - 1;

	const handleNext = () => {
		if (!isLastStep) {
			setCurrentStep(currentStep + 1);
		} else {
			onComplete();
		}
	};

	return (
		<div className="onboarding">
			<div className="onboarding__container">
				<div className="onboarding__content">
					<div className="onboarding__badge">{currentStepData.badge}</div>

					<h1 className="onboarding__title">{currentStepData.title}</h1>

					<p className="onboarding__description">{currentStepData.description}</p>
				</div>
				<div>{currentStepData.demo}</div>

				<div className="onboarding__footer">
					<div className="onboarding-progress">
						{steps.map((step, index) => (
							<div
								key={step.id}
								className={`onboarding-progress__dot ${
									index === currentStep
										? "onboarding-progress__dot--active"
										: index < currentStep
											? "onboarding-progress__dot--completed"
											: ""
								}`}
							/>
						))}
					</div>

					<div className="onboarding__actions">
						{!isLastStep && <button onClick={onComplete}>Skip</button>}

						<button onClick={handleNext}>
							{isLastStep ? "Get Started" : "Next"}
							<ChevronRight className="size-4 ml-1" />
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
