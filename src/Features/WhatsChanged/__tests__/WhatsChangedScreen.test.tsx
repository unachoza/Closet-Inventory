import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

const { track } = vi.hoisted(() => ({ track: vi.fn() }));
vi.mock("../../../lib/analytics", () => ({ track }));

import WhatsChangedScreen from "../WhatsChangedScreen";

describe("WhatsChangedScreen", () => {
	beforeEach(() => {
		track.mockClear();
	});

	it("shows the title and up to 3 bullets", () => {
		render(<WhatsChangedScreen bullets={["First", "Second", "Third"]} version="0.9.1" onDismiss={vi.fn()} />);

		expect(screen.getByText("What's changed")).toBeInTheDocument();
		expect(screen.getByText("First")).toBeInTheDocument();
		expect(screen.getByText("Second")).toBeInTheDocument();
		expect(screen.getByText("Third")).toBeInTheDocument();
	});

	it("calls onDismiss when the CTA is pressed", () => {
		const onDismiss = vi.fn();
		render(<WhatsChangedScreen bullets={["First"]} version="0.9.1" onDismiss={onDismiss} />);

		fireEvent.click(screen.getByRole("button", { name: /got it/i }));

		expect(onDismiss).toHaveBeenCalled();
	});

	it("tracks whats_changed_shown once on mount, with version and bullet count", () => {
		render(<WhatsChangedScreen bullets={["First", "Second"]} version="0.9.1" onDismiss={vi.fn()} />);

		expect(track).toHaveBeenCalledWith("whats_changed_shown", { version: "0.9.1", bullet_count: 2 });
		expect(track).toHaveBeenCalledTimes(1);
	});

	it("tracks whats_changed_dismissed when the CTA is pressed, in addition to calling onDismiss", () => {
		const onDismiss = vi.fn();
		render(<WhatsChangedScreen bullets={["First", "Second", "Third"]} version="0.9.1" onDismiss={onDismiss} />);
		track.mockClear();

		fireEvent.click(screen.getByRole("button", { name: /got it/i }));

		expect(track).toHaveBeenCalledWith("whats_changed_dismissed", { version: "0.9.1", bullet_count: 3 });
		expect(onDismiss).toHaveBeenCalled();
	});
});
