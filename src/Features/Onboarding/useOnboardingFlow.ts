import { useCallback, useEffect, useRef, useState } from "react";
import { useSupabaseAuthContext } from "../../context/SupabaseAuthContext";
import { track } from "../../lib/analytics";
import { FLOW_STEPS, ONBOARDING_STAGE_KEY, TOUR_STEPS, isOnboardingStage } from "./flowSteps";
import type { FlowStep, OnboardingStage } from "./flowSteps";

export interface OnboardingFlowApi {
	/** Current step; null while the Supabase session is still restoring. */
	step: FlowStep | null;
	isTourStep: boolean;
	/** 0-based position within the tour for the progress dots; -1 off-tour. */
	tourIndex: number;
	tourLength: number;
	next: () => void;
	back: () => void;
	skipTour: () => void;
	beginSignIn: () => Promise<void>;
	skipSignIn: () => void;
	advanceFromName: () => void;
	finish: (options?: { installed?: boolean }) => void;
}

function persistStage(stage: OnboardingStage): void {
	localStorage.setItem(ONBOARDING_STAGE_KEY, stage);
}

function resolveInitialStep(isAuthenticated: boolean): FlowStep {
	const raw = localStorage.getItem(ONBOARDING_STAGE_KEY);
	const stage = isOnboardingStage(raw) ? raw : null;
	if (stage === "awaiting-auth") return isAuthenticated ? "name" : "signin";
	if (stage === "install") return "install";
	return "welcome";
}

/**
 * The onboarding state machine: tour → sign-in → name → install → done.
 * Survives the full-page Google OAuth redirect by persisting a stage marker
 * (see flowSteps.ts) and re-deriving the step once auth finishes restoring.
 */
export function useOnboardingFlow({ onComplete }: { onComplete: () => void }): OnboardingFlowApi {
	const auth = useSupabaseAuthContext();
	const [step, setStep] = useState<FlowStep | null>(null);
	const lastViewedRef = useRef<FlowStep | null>(null);

	useEffect(() => {
		// Resolve only once: the session restore after the OAuth redirect is
		// async, and deciding before it lands would flash the wrong step.
		if (auth.isLoading || step !== null) return;
		setStep(resolveInitialStep(auth.isAuthenticated));
	}, [auth.isLoading, auth.isAuthenticated, step]);

	useEffect(() => {
		if (step === null || lastViewedRef.current === step) return;
		lastViewedRef.current = step;
		track("onboarding_step_viewed", { step, index: FLOW_STEPS.indexOf(step) });
	}, [step]);

	const goToAccountSteps = useCallback(() => {
		setStep(auth.isAuthenticated ? "name" : "signin");
	}, [auth.isAuthenticated]);

	const next = useCallback(() => {
		setStep((current) => {
			if (current === null) return current;
			const tourIndex = (TOUR_STEPS as readonly string[]).indexOf(current);
			if (tourIndex === -1) return current;
			if (tourIndex < TOUR_STEPS.length - 1) return TOUR_STEPS[tourIndex + 1];
			return auth.isAuthenticated ? "name" : "signin";
		});
	}, [auth.isAuthenticated]);

	const back = useCallback(() => {
		setStep((current) => {
			if (current === null) return current;
			const tourIndex = (TOUR_STEPS as readonly string[]).indexOf(current);
			return tourIndex > 0 ? TOUR_STEPS[tourIndex - 1] : current;
		});
	}, []);

	const skipTour = useCallback(() => {
		track("onboarding_skipped", { at_step: step });
		goToAccountSteps();
	}, [step, goToAccountSteps]);

	const beginSignIn = useCallback(async () => {
		// Persist before the redirect wipes this page's JS state.
		persistStage("awaiting-auth");
		await auth.signIn();
	}, [auth]);

	const skipSignIn = useCallback(() => {
		track("signin_skipped", undefined);
		persistStage("install");
		setStep("install");
	}, []);

	const advanceFromName = useCallback(() => {
		persistStage("install");
		setStep("install");
	}, []);

	const finish = useCallback(
		(options?: { installed?: boolean }) => {
			localStorage.removeItem(ONBOARDING_STAGE_KEY);
			track("onboarding_completed", {
				signed_in: auth.isAuthenticated,
				installed: options?.installed ?? false,
			});
			onComplete();
		},
		[auth.isAuthenticated, onComplete],
	);

	const tourIndex = step === null ? -1 : (TOUR_STEPS as readonly string[]).indexOf(step);

	return {
		step,
		isTourStep: tourIndex !== -1,
		tourIndex,
		tourLength: TOUR_STEPS.length,
		next,
		back,
		skipTour,
		beginSignIn,
		skipSignIn,
		advanceFromName,
		finish,
	};
}
