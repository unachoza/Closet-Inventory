import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { SupabaseAuthContext } from "../../context/SupabaseAuthContext";
import type { SupabaseAuthState } from "../../hooks/useSupabaseAuth";
import { ONBOARDING_STAGE_KEY } from "./flowSteps";

vi.mock("../../lib/analytics", () => ({ track: vi.fn() }));

const { mockGetProfile, mockUpdateDisplayName } = vi.hoisted(() => ({
	mockGetProfile: vi.fn(),
	mockUpdateDisplayName: vi.fn(),
}));
vi.mock("../../services/profileService", async (importOriginal) => ({
	...(await importOriginal<typeof import("../../services/profileService")>()),
	getProfile: mockGetProfile,
	updateDisplayName: mockUpdateDisplayName,
}));

import OnboardingFlow from "./OnboardingFlow";

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

function renderFlow(auth: SupabaseAuthState, onComplete = vi.fn()) {
	const wrapper = ({ children }: { children: ReactNode }) => (
		<SupabaseAuthContext.Provider value={auth}>{children}</SupabaseAuthContext.Provider>
	);
	render(<OnboardingFlow onComplete={onComplete} />, { wrapper });
	return { onComplete, auth };
}

const TOUR_HEADINGS = [
	/your closet/i,
	/your inbox already knows/i,
	/care for what you love/i,
	/find anything in seconds/i,
];

describe("OnboardingFlow", () => {
	beforeEach(() => {
		localStorage.clear();
		mockGetProfile.mockReset().mockResolvedValue({
			ok: true,
			data: { id: "user-1", created_at: "", display_name: "Arianna", photo_url: null, settings: {} },
		});
		mockUpdateDisplayName.mockReset().mockResolvedValue({ ok: true, data: "Arianna" });
	});

	it("shows a quiet holding state while auth is restoring", () => {
		renderFlow(makeAuth({ isLoading: true }));
		expect(screen.getByLabelText(/getting things ready/i)).toBeInTheDocument();
		expect(screen.queryByRole("heading")).not.toBeInTheDocument();
	});

	it("walks the four tour screens, then reaches sign-in", async () => {
		const user = userEvent.setup();
		renderFlow(makeAuth());

		for (let i = 0; i < TOUR_HEADINGS.length; i++) {
			expect(screen.getByRole("heading", { name: TOUR_HEADINGS[i] })).toBeInTheDocument();
			const isLast = i === TOUR_HEADINGS.length - 1;
			await user.click(screen.getByRole("button", { name: isLast ? /get started/i : /^next$/i }));
		}
		expect(screen.getByRole("button", { name: /sign in with google/i })).toBeInTheDocument();
		expect(screen.getByText(/hasn't verified this app/i)).toBeInTheDocument();
	});

	it("hides Back on the first tour screen and shows it afterwards", async () => {
		const user = userEvent.setup();
		renderFlow(makeAuth());
		expect(screen.queryByRole("button", { name: /back/i })).not.toBeInTheDocument();
		await user.click(screen.getByRole("button", { name: /^next$/i }));
		await user.click(screen.getByRole("button", { name: /back/i }));
		expect(screen.getByRole("heading", { name: TOUR_HEADINGS[0] })).toBeInTheDocument();
	});

	it("Skip jumps from the tour straight to sign-in", async () => {
		const user = userEvent.setup();
		renderFlow(makeAuth());
		await user.click(screen.getByRole("button", { name: /^skip$/i }));
		expect(screen.getByRole("button", { name: /sign in with google/i })).toBeInTheDocument();
	});

	it("starting sign-in persists the stage, marks the Google notice seen, and calls signIn", async () => {
		const user = userEvent.setup();
		const { auth } = renderFlow(makeAuth());
		await user.click(screen.getByRole("button", { name: /^skip$/i }));
		await user.click(screen.getByRole("button", { name: /sign in with google/i }));
		expect(localStorage.getItem(ONBOARDING_STAGE_KEY)).toBe("awaiting-auth");
		expect(localStorage.getItem("closetly-google-notice-seen")).toBe("true");
		expect(auth.signIn).toHaveBeenCalled();
	});

	it("skipping sign-in leads to the install card, and Maybe later completes the flow", async () => {
		const user = userEvent.setup();
		const { onComplete } = renderFlow(makeAuth());
		await user.click(screen.getByRole("button", { name: /^skip$/i }));
		await user.click(screen.getByRole("button", { name: /skip for now/i }));
		expect(screen.getByRole("heading", { name: /one tap away/i })).toBeInTheDocument();
		await user.click(screen.getByRole("button", { name: /maybe later/i }));
		expect(onComplete).toHaveBeenCalled();
	});

	it("an authenticated user goes from the tour to the name step, then install", async () => {
		const user = userEvent.setup();
		renderFlow(makeAuth({ user: { id: "user-1" } as User, isAuthenticated: true }));
		await user.click(screen.getByRole("button", { name: /^skip$/i }));
		expect(await screen.findByRole("heading", { name: /what should we call you/i })).toBeInTheDocument();
		await waitFor(() => expect(screen.getByRole("textbox")).toHaveValue("Arianna"));
		await user.click(screen.getByRole("button", { name: /that's me/i }));
		expect(await screen.findByRole("heading", { name: /one tap away/i })).toBeInTheDocument();
	});

	it("resumes at the name step when returning authenticated from the OAuth redirect", async () => {
		localStorage.setItem(ONBOARDING_STAGE_KEY, "awaiting-auth");
		renderFlow(makeAuth({ user: { id: "user-1" } as User, isAuthenticated: true }));
		expect(await screen.findByRole("heading", { name: /what should we call you/i })).toBeInTheDocument();
	});
});
