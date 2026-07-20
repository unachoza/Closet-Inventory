import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { SupabaseAuthContext } from "../../context/SupabaseAuthContext";
import type { SupabaseAuthState } from "../../hooks/useSupabaseAuth";

const { mockTrack } = vi.hoisted(() => ({ mockTrack: vi.fn() }));
vi.mock("../../lib/analytics", () => ({ track: mockTrack }));

import { useOnboardingFlow } from "./useOnboardingFlow";
import { ONBOARDING_STAGE_KEY, TOUR_STEPS } from "./flowSteps";

function makeAuth(overrides: Partial<SupabaseAuthState> = {}): SupabaseAuthState {
	return {
		session: null,
		user: null,
		gmailAccessToken: null,
		isAuthenticated: false,
		isLoading: false,
		error: null,
		signIn: vi.fn().mockResolvedValue(undefined),
		signOut: vi.fn(),
		...overrides,
	};
}

function authedAuth(overrides: Partial<SupabaseAuthState> = {}): SupabaseAuthState {
	return makeAuth({
		user: { id: "user-1" } as User,
		isAuthenticated: true,
		...overrides,
	});
}

function wrapperFor(auth: SupabaseAuthState) {
	return function Wrapper({ children }: { children: ReactNode }) {
		return <SupabaseAuthContext.Provider value={auth}>{children}</SupabaseAuthContext.Provider>;
	};
}

function renderFlow(auth: SupabaseAuthState, onComplete = vi.fn()) {
	const utils = renderHook(() => useOnboardingFlow({ onComplete }), { wrapper: wrapperFor(auth) });
	return { ...utils, onComplete };
}

describe("useOnboardingFlow", () => {
	beforeEach(() => {
		localStorage.clear();
		mockTrack.mockClear();
	});

	describe("initial step resolution", () => {
		it("starts at welcome on a fresh device", () => {
			const { result } = renderFlow(makeAuth());
			expect(result.current.step).toBe("welcome");
		});

		it("stays unresolved while auth is still loading", () => {
			const { result } = renderFlow(makeAuth({ isLoading: true }));
			expect(result.current.step).toBeNull();
		});

		it("resolves once auth finishes loading", () => {
			let auth = makeAuth({ isLoading: true });
			const onComplete = vi.fn();
			const { result, rerender } = renderHook(() => useOnboardingFlow({ onComplete }), {
				wrapper: ({ children }: { children: ReactNode }) => (
					<SupabaseAuthContext.Provider value={auth}>{children}</SupabaseAuthContext.Provider>
				),
			});
			expect(result.current.step).toBeNull();
			auth = makeAuth({ isLoading: false });
			rerender();
			expect(result.current.step).toBe("welcome");
		});

		it("resumes at the name step after returning authenticated from OAuth", () => {
			localStorage.setItem(ONBOARDING_STAGE_KEY, "awaiting-auth");
			const { result } = renderFlow(authedAuth());
			expect(result.current.step).toBe("name");
		});

		it("resumes at sign-in when OAuth was cancelled", () => {
			localStorage.setItem(ONBOARDING_STAGE_KEY, "awaiting-auth");
			const { result } = renderFlow(makeAuth());
			expect(result.current.step).toBe("signin");
		});

		it("resumes at the install step", () => {
			localStorage.setItem(ONBOARDING_STAGE_KEY, "install");
			const { result } = renderFlow(makeAuth());
			expect(result.current.step).toBe("install");
		});

		it("ignores an unrecognised stage value", () => {
			localStorage.setItem(ONBOARDING_STAGE_KEY, "garbage");
			const { result } = renderFlow(makeAuth());
			expect(result.current.step).toBe("welcome");
		});
	});

	describe("tour navigation", () => {
		it("advances through the four tour steps then to sign-in when signed out", () => {
			const { result } = renderFlow(makeAuth());
			for (const expected of TOUR_STEPS) {
				expect(result.current.step).toBe(expected);
				act(() => result.current.next());
			}
			expect(result.current.step).toBe("signin");
		});

		it("skips sign-in and goes to the name step when already authenticated", () => {
			const { result } = renderFlow(authedAuth());
			act(() => result.current.next());
			act(() => result.current.next());
			act(() => result.current.next());
			act(() => result.current.next());
			expect(result.current.step).toBe("name");
		});

		it("goes back within the tour and not before welcome", () => {
			const { result } = renderFlow(makeAuth());
			act(() => result.current.next());
			expect(result.current.step).toBe("email");
			act(() => result.current.back());
			expect(result.current.step).toBe("welcome");
			act(() => result.current.back());
			expect(result.current.step).toBe("welcome");
		});

		it("exposes the tour index for the progress dots", () => {
			const { result } = renderFlow(makeAuth());
			expect(result.current.isTourStep).toBe(true);
			expect(result.current.tourIndex).toBe(0);
			act(() => result.current.next());
			expect(result.current.tourIndex).toBe(1);
		});

		it("skipTour jumps to sign-in and records where the user bailed", () => {
			const { result } = renderFlow(makeAuth());
			act(() => result.current.next());
			act(() => result.current.skipTour());
			expect(result.current.step).toBe("signin");
			expect(mockTrack).toHaveBeenCalledWith("onboarding_skipped", { at_step: "email" });
		});

		it("skipTour lands on the name step when already authenticated", () => {
			const { result } = renderFlow(authedAuth());
			act(() => result.current.skipTour());
			expect(result.current.step).toBe("name");
		});
	});

	describe("sign-in hand-off", () => {
		it("persists the awaiting-auth stage before starting OAuth", async () => {
			const signIn = vi.fn().mockImplementation(() => {
				expect(localStorage.getItem(ONBOARDING_STAGE_KEY)).toBe("awaiting-auth");
				return Promise.resolve();
			});
			const { result } = renderFlow(makeAuth({ signIn }));
			await act(async () => {
				await result.current.beginSignIn();
			});
			expect(signIn).toHaveBeenCalled();
		});

		it("skipSignIn moves to install, persists the stage, and records the choice", () => {
			const { result } = renderFlow(makeAuth());
			act(() => result.current.skipSignIn());
			expect(result.current.step).toBe("install");
			expect(localStorage.getItem(ONBOARDING_STAGE_KEY)).toBe("install");
			expect(mockTrack).toHaveBeenCalledWith("signin_skipped", undefined);
		});
	});

	describe("name and install steps", () => {
		it("advances from name to install and persists the stage", () => {
			localStorage.setItem(ONBOARDING_STAGE_KEY, "awaiting-auth");
			const { result } = renderFlow(authedAuth());
			act(() => result.current.advanceFromName());
			expect(result.current.step).toBe("install");
			expect(localStorage.getItem(ONBOARDING_STAGE_KEY)).toBe("install");
		});

		it("finish clears the stage, reports completion, and calls onComplete", () => {
			localStorage.setItem(ONBOARDING_STAGE_KEY, "install");
			const { result, onComplete } = renderFlow(authedAuth());
			act(() => result.current.finish({ installed: true }));
			expect(localStorage.getItem(ONBOARDING_STAGE_KEY)).toBeNull();
			expect(onComplete).toHaveBeenCalled();
			expect(mockTrack).toHaveBeenCalledWith("onboarding_completed", { signed_in: true, installed: true });
		});

		it("finish defaults to not installed", () => {
			const { result } = renderFlow(makeAuth());
			act(() => result.current.finish());
			expect(mockTrack).toHaveBeenCalledWith("onboarding_completed", { signed_in: false, installed: false });
		});
	});

	describe("analytics", () => {
		it("reports each step view once", () => {
			const { result } = renderFlow(makeAuth());
			expect(mockTrack).toHaveBeenCalledWith("onboarding_step_viewed", { step: "welcome", index: 0 });
			act(() => result.current.next());
			expect(mockTrack).toHaveBeenCalledWith("onboarding_step_viewed", { step: "email", index: 1 });
			const welcomeViews = mockTrack.mock.calls.filter(
				([event, props]) => event === "onboarding_step_viewed" && (props as { step: string }).step === "welcome",
			);
			expect(welcomeViews).toHaveLength(1);
		});
	});
});
