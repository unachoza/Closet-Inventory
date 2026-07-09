import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

const { initMonitoring } = vi.hoisted(() => ({ initMonitoring: vi.fn() }));
vi.mock("../../lib/monitoring", () => ({ initMonitoring }));

import ConsentBanner from "./ConsentBanner";

describe("ConsentBanner", () => {
	beforeEach(() => {
		localStorage.clear();
		initMonitoring.mockClear();
	});

	it("shows on first visit", () => {
		render(<ConsentBanner />);
		expect(screen.getByRole("dialog", { name: /consent/i })).toBeInTheDocument();
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
