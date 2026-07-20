import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import SignInStep from "./SignInStep";

describe("SignInStep", () => {
	beforeEach(() => {
		localStorage.clear();
	});

	it("explains the Google unverified-app screen inline", () => {
		render(<SignInStep onSignIn={vi.fn()} onSkip={vi.fn()} />);
		expect(screen.getByText(/hasn't verified this app/i)).toBeInTheDocument();
		expect(screen.getByText(/advanced/i)).toBeInTheDocument();
	});

	it("marks the Google notice as seen and starts sign-in", async () => {
		const user = userEvent.setup();
		const onSignIn = vi.fn();
		render(<SignInStep onSignIn={onSignIn} onSkip={vi.fn()} />);
		await user.click(screen.getByRole("button", { name: /sign in with google/i }));
		expect(localStorage.getItem("closetly-google-notice-seen")).toBe("true");
		expect(onSignIn).toHaveBeenCalled();
	});

	it("offers an honest local-mode skip", async () => {
		const user = userEvent.setup();
		const onSkip = vi.fn();
		render(<SignInStep onSignIn={vi.fn()} onSkip={onSkip} />);
		await user.click(screen.getByRole("button", { name: /skip for now/i }));
		expect(onSkip).toHaveBeenCalled();
	});
});
