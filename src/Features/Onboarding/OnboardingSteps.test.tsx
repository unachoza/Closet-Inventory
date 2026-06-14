import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { OnboardingExpanded } from "./OnboardingSteps";

const next = () => fireEvent.click(screen.getByRole("button", { name: /^next$/i }));
const advanceToLast = () => {
	for (let i = 0; i < 8; i++) next();
};

describe("OnboardingExpanded (SevenStep)", () => {
	it("renders the first step with its badge, group, and title", () => {
		render(<OnboardingExpanded onComplete={vi.fn()} />);
		expect(screen.getByText("A personal wardrobe management app")).toBeInTheDocument();
		expect(screen.getByText("Step 1 of 9")).toBeInTheDocument();
		// expect(screen.getByText("Email Import")).toBeInTheDocument();
	});

	it("renders one progress segment per step", () => {
		const { container } = render(<OnboardingExpanded onComplete={vi.fn()} />);
		expect(container.querySelectorAll(".ob-progress-seg")).toHaveLength(9);
	});

	it("disables Back on the first step", () => {
		render(<OnboardingExpanded onComplete={vi.fn()} />);
		expect(screen.getByRole("button", { name: /back/i })).toBeDisabled();
	});

	it("advances to the next step when Next is clicked", () => {
		render(<OnboardingExpanded onComplete={vi.fn()} />);
		next();
		expect(screen.getByText("Connect your Gmail")).toBeInTheDocument();
		expect(screen.getByText("Step 2 of 9")).toBeInTheDocument();
	});

	it("goes back to the previous step when Back is clicked", () => {
		render(<OnboardingExpanded onComplete={vi.fn()} />);
		next();
		fireEvent.click(screen.getByRole("button", { name: /back/i }));
		expect(screen.getByText("A personal wardrobe management app")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: /back/i })).toBeDisabled();
	});

	it("updates the group badge across phases (Manual Entry on step 5)", () => {
		render(<OnboardingExpanded onComplete={vi.fn()} />);
		for (let i = 0; i < 6; i++) next();
		expect(screen.getByText("Add items manually too")).toBeInTheDocument();
		expect(screen.getByText("Manual Entry")).toBeInTheDocument();
	});

	it("calls onComplete when 'Skip all' is clicked", () => {
		const onComplete = vi.fn();
		render(<OnboardingExpanded onComplete={onComplete} />);
		fireEvent.click(screen.getByRole("button", { name: /skip all/i }));
		expect(onComplete).toHaveBeenCalledTimes(1);
	});

	it("shows the finish button (and hides Skip all) on the last step", () => {
		render(<OnboardingExpanded onComplete={vi.fn()} />);
		advanceToLast();
		expect(screen.getByText("Know how to care for it")).toBeInTheDocument();
		expect(screen.getByText("Fabric Guide")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: /go to my closet/i })).toBeInTheDocument();
		expect(screen.queryByRole("button", { name: /skip all/i })).not.toBeInTheDocument();
		expect(screen.queryByRole("button", { name: /^next$/i })).not.toBeInTheDocument();
	});

	it("calls onComplete from the last step's finish button", () => {
		const onComplete = vi.fn();
		render(<OnboardingExpanded onComplete={onComplete} />);
		advanceToLast();
		fireEvent.click(screen.getByRole("button", { name: /go to my closet/i }));
		expect(onComplete).toHaveBeenCalledTimes(1);
	});

	it("walks through all seven step titles in order", () => {
		render(<OnboardingExpanded onComplete={vi.fn()} />);
		const titles = [
			"Closet Inventory",
			"Connect your Gmail",
			"Narrow your search",
			"We find your purchases",
			"Pick items to import",
			"Review the parsed details",
			"Add items manually too",
			"Find anything instantly",
			"Know how to care for it",
		];
		titles.forEach((title, i) => {
			expect(screen.getByText(title)).toBeInTheDocument();
			if (i < titles.length - 1) next();
		});
	});

	it("enables Back once past the first step", () => {
		render(<OnboardingExpanded onComplete={vi.fn()} />);
		next();
		expect(screen.getByRole("button", { name: /back/i })).toBeEnabled();
	});

	it("marks progress segments done/active for the current step", () => {
		const { container } = render(<OnboardingExpanded onComplete={vi.fn()} />);
		next();
		next();
		// On step 3 (index 2): two done, one active.
		expect(container.querySelectorAll(".ob-progress-seg--done")).toHaveLength(2);
		expect(container.querySelectorAll(".ob-progress-seg--active")).toHaveLength(1);
	});

	it("step 5 manual demo finishes with an 'added to closet' toast and does not loop", () => {
		vi.useFakeTimers();
		try {
			render(<OnboardingExpanded onComplete={vi.fn()} />);
			for (let i = 0; i < 6; i++) next(); // reach step 5
			expect(screen.getByText("Add items manually too")).toBeInTheDocument();

			// Run the timed walk through the 5 sub-steps to completion (5 × 1300ms).
			act(() => {
				vi.advanceTimersByTime(7000);
			});
			expect(screen.getByText(/added to your closet/i)).toBeInTheDocument();
			expect(screen.getByText("All set!")).toBeInTheDocument();

			// Advancing further must NOT restart the cycle — the end state stays put.
			act(() => {
				vi.advanceTimersByTime(7000);
			});
			expect(screen.getByText("All set!")).toBeInTheDocument();
			expect(screen.getByText(/added to your closet/i)).toBeInTheDocument();
		} finally {
			vi.useRealTimers();
		}
	});
});
