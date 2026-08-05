import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

const { initMonitoring, discardPendingEvents } = vi.hoisted(() => ({ initMonitoring: vi.fn(), discardPendingEvents: vi.fn() }));
vi.mock("../../lib/monitoring", () => ({ initMonitoring, discardPendingEvents }));

import ConsentBanner from "./ConsentBanner";

describe("ConsentBanner", () => {
	beforeEach(() => {
		localStorage.clear();
		initMonitoring.mockClear();
		discardPendingEvents.mockClear();
	});

	it("declining destroys the events buffered before consent was answered", () => {
		render(<ConsentBanner />);
		fireEvent.click(screen.getByRole("button", { name: /decline/i }));
		expect(discardPendingEvents).toHaveBeenCalled();
	});

	it("shows on first visit", () => {
		render(<ConsentBanner />);
		expect(screen.getByRole("dialog", { name: /consent/i })).toBeInTheDocument();
	});

	// Consent is only meaningful if the policy it refers to is reachable from the
	// same surface. The link must stay a real href to the static document, not an
	// in-app route — the app has no router and the SW would swallow it.
	it("links to the privacy policy", () => {
		render(<ConsentBanner />);
		const link = screen.getByRole("link", { name: /privacy policy/i });
		expect(link).toHaveAttribute("href", "/privacy.html");
	});

	it("does not render once consent has already been decided", () => {
		localStorage.setItem("closetly-analytics-consent", "declined");
		render(<ConsentBanner />);
		expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
	});

	it("Accept dismisses the banner and persists 'granted'", () => {
		render(<ConsentBanner />);
		fireEvent.click(screen.getByRole("button", { name: /accept/i }));
		expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
		expect(localStorage.getItem("closetly-analytics-consent")).toBe("granted");
	});

	it("Decline dismisses the banner and persists 'declined'", () => {
		render(<ConsentBanner />);
		fireEvent.click(screen.getByRole("button", { name: /decline/i }));
		expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
		expect(localStorage.getItem("closetly-analytics-consent")).toBe("declined");
	});
});
