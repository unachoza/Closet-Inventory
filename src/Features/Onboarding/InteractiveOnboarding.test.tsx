import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { OnboardingOption3 } from "./InteractiveOnboarding";

describe("OnboardingOption3", () => {
	it("renders the welcome step first", () => {
		render(<OnboardingOption3 onComplete={vi.fn()} />);
		expect(screen.getByText("Your Closet, Organized")).toBeInTheDocument();
		expect(screen.getByText("Welcome")).toBeInTheDocument();
	});

	it("advances through steps when clicking Next", () => {
		render(<OnboardingOption3 onComplete={vi.fn()} />);
		fireEvent.click(screen.getByText("Next"));
		expect(screen.getByText("Import from Email")).toBeInTheDocument();
		fireEvent.click(screen.getByText("Next"));
		expect(screen.getByText("Search & Filter")).toBeInTheDocument();
	});

	it("shows 'Get Started' on the last step and calls onComplete", () => {
		const onComplete = vi.fn();
		render(<OnboardingOption3 onComplete={onComplete} />);
		// Three Nexts from step 0 lands on the final step (index 3).
		fireEvent.click(screen.getByText("Next"));
		fireEvent.click(screen.getByText("Next"));
		fireEvent.click(screen.getByText("Next"));
		const getStarted = screen.getByText("Get Started");
		expect(getStarted).toBeInTheDocument();
		fireEvent.click(getStarted);
		expect(onComplete).toHaveBeenCalledTimes(1);
	});

	it("calls onComplete when Skip is clicked", () => {
		const onComplete = vi.fn();
		render(<OnboardingOption3 onComplete={onComplete} />);
		fireEvent.click(screen.getByText("Skip"));
		expect(onComplete).toHaveBeenCalledTimes(1);
	});

	it("hides Skip on the final step", () => {
		render(<OnboardingOption3 onComplete={vi.fn()} />);
		fireEvent.click(screen.getByText("Next"));
		fireEvent.click(screen.getByText("Next"));
		fireEvent.click(screen.getByText("Next"));
		expect(screen.queryByText("Skip")).not.toBeInTheDocument();
	});
});
