import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import type { RevealStats } from "../revealStats";

const { track } = vi.hoisted(() => ({ track: vi.fn() }));
vi.mock("../../../lib/analytics", () => ({ track }));

import RevealScreen from "../RevealScreen";

const baseStats: RevealStats = {
	pieceCount: 142,
	brandCount: 11,
	totalValue: 4280,
	hasCompleteValue: true,
	dateRange: { earliest: "2024-05-15T00:00:00.000Z", latest: "2026-06-01T00:00:00.000Z" },
};

describe("RevealScreen", () => {
	beforeEach(() => {
		track.mockClear();
	});

	it("shows the piece count, brand count, and value", () => {
		render(<RevealScreen stats={baseStats} onDismiss={vi.fn()} />);

		expect(screen.getByText("142")).toBeInTheDocument();
		expect(screen.getByText(/11 brands/)).toBeInTheDocument();
		expect(screen.getByText(/\$4,280 in value/)).toBeInTheDocument();
	});

	it("marks an incomplete value with a '+' instead of presenting it as exact", () => {
		render(<RevealScreen stats={{ ...baseStats, hasCompleteValue: false }} onDismiss={vi.fn()} />);

		expect(screen.getByText(/\$4,280\+ in value/)).toBeInTheDocument();
	});

	it("omits the value line entirely when there's nothing priced", () => {
		render(<RevealScreen stats={{ ...baseStats, totalValue: 0 }} onDismiss={vi.fn()} />);

		expect(screen.queryByText(/in value/)).not.toBeInTheDocument();
	});

	it("shows the imported date range when present", () => {
		render(<RevealScreen stats={baseStats} onDismiss={vi.fn()} />);

		expect(screen.getByText(/Imported from May 2024 – June 2026\./)).toBeInTheDocument();
	});

	it("omits the date range line when there's no purchaseDate data", () => {
		render(<RevealScreen stats={{ ...baseStats, dateRange: null }} onDismiss={vi.fn()} />);

		expect(screen.queryByText(/Imported from/)).not.toBeInTheDocument();
	});

	it("calls onDismiss when the CTA is pressed", () => {
		const onDismiss = vi.fn();
		render(<RevealScreen stats={baseStats} onDismiss={onDismiss} />);

		fireEvent.click(screen.getByRole("button", { name: /see your closet/i }));

		expect(onDismiss).toHaveBeenCalled();
	});

	it("tracks reveal_shown once on mount, with the key stats", () => {
		render(<RevealScreen stats={baseStats} onDismiss={vi.fn()} />);

		expect(track).toHaveBeenCalledWith("reveal_shown", {
			piece_count: 142,
			brand_count: 11,
			has_date_range: true,
			has_complete_value: true,
		});
		expect(track).toHaveBeenCalledTimes(1);
	});
});
