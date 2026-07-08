import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BorderLegend } from "./BorderLegend";

/**
 * P1-10 — legend visibility, mode-aware content, and dismissal state persistence.
 */

describe("BorderLegend", () => {
	beforeEach(() => {
		localStorage.clear();
	});

	afterEach(() => {
		localStorage.clear();
	});

	it("renders when borderMode is 'location'", () => {
		render(<BorderLegend borderMode="location" />);
		expect(screen.getByText(/Location/)).toBeInTheDocument();
		expect(screen.getByText(/Home/)).toBeInTheDocument();
		expect(screen.getByText(/Storage/)).toBeInTheDocument();
	});

	it("renders when borderMode is 'location_status'", () => {
		render(<BorderLegend borderMode="location_status" />);
		expect(screen.getByText("Location & Status")).toBeInTheDocument();
		expect(screen.getByText(/Location \(borders\)/)).toBeInTheDocument();
		expect(screen.getByText(/Status \(dots\)/)).toBeInTheDocument();
	});

	it("does not render when borderMode is 'off'", () => {
		const { container } = render(<BorderLegend borderMode="off" />);
		expect(container.firstChild).toBeNull();
	});

	it("'Location' mode lists only location kinds, no status dots", () => {
		render(<BorderLegend borderMode="location" />);
		expect(screen.getByText(/Home/)).toBeInTheDocument();
		expect(screen.getByText(/Storage/)).toBeInTheDocument();
		// No status section
		expect(screen.queryByText(/Status \(dots\)/)).not.toBeInTheDocument();
	});

	it("'Location + Status' mode lists both location kinds and status values", () => {
		render(<BorderLegend borderMode="location_status" />);
		expect(screen.getByText(/Location \(borders\)/)).toBeInTheDocument();
		expect(screen.getByText(/Status \(dots\)/)).toBeInTheDocument();
		expect(screen.getByText(/Clean/)).toBeInTheDocument();
		expect(screen.getByText(/Dirty/)).toBeInTheDocument();
	});

	it("dismissal persists across remounts via localStorage", () => {
		const { unmount } = render(<BorderLegend borderMode="location" />);
		const dismissBtn = screen.getByRole("button", { name: /Dismiss/ });
		fireEvent.click(dismissBtn);
		expect(screen.queryByText(/Location/)).not.toBeInTheDocument();
		unmount();

		// Remount — should stay dismissed
		const { container } = render(<BorderLegend borderMode="location" />);
		expect(container.firstChild).toBeNull();
	});

	it("calls onDismiss callback when dismissed", () => {
		const onDismiss = vi.fn();
		render(<BorderLegend borderMode="location" onDismiss={onDismiss} />);
		const dismissBtn = screen.getByRole("button", { name: /Dismiss/ });
		fireEvent.click(dismissBtn);
		expect(onDismiss).toHaveBeenCalledTimes(1);
	});

	it("legend has a dismissible button with aria-label", () => {
		render(<BorderLegend borderMode="location_status" />);
		expect(screen.getByRole("button", { name: /Dismiss/ })).toBeInTheDocument();
	});
});
