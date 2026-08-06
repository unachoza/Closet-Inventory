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

function renderScreen(
	stats: RevealStats,
	overrides: { onGoToCloset?: () => void; onContinueHunting?: () => void; source?: "gmail" | "manual" } = {},
) {
	return render(
		<RevealScreen
			stats={stats}
			source={overrides.source ?? "gmail"}
			onGoToCloset={overrides.onGoToCloset ?? vi.fn()}
			onContinueHunting={overrides.onContinueHunting ?? vi.fn()}
		/>,
	);
}

describe("RevealScreen", () => {
	beforeEach(() => {
		track.mockClear();
	});

	it("shows the piece count, brand count, and value", () => {
		renderScreen(baseStats);

		expect(screen.getByText("142")).toBeInTheDocument();
		expect(screen.getByText(/11 brands/)).toBeInTheDocument();
		expect(screen.getByText(/\$4,280 in value/)).toBeInTheDocument();
	});

	it("marks an incomplete value with a '+' instead of presenting it as exact", () => {
		renderScreen({ ...baseStats, hasCompleteValue: false });

		expect(screen.getByText(/\$4,280\+ in value/)).toBeInTheDocument();
	});

	it("omits the value line entirely when there's nothing priced", () => {
		renderScreen({ ...baseStats, totalValue: 0 });

		expect(screen.queryByText(/in value/)).not.toBeInTheDocument();
	});

	it("shows the imported date range when present", () => {
		renderScreen(baseStats);

		expect(screen.getByText(/Imported from email receipts between.*May 2024 – June 2026\./)).toBeInTheDocument();
	});

	it("omits the date range line when there's no purchaseDate data", () => {
		renderScreen({ ...baseStats, dateRange: null });

		expect(screen.queryByText(/Imported from/)).not.toBeInTheDocument();
	});

	it("has two distinct, equally real actions — not a primary + a dismiss", () => {
		const onGoToCloset = vi.fn();
		const onContinueHunting = vi.fn();
		renderScreen(baseStats, { onGoToCloset, onContinueHunting });

		fireEvent.click(screen.getByRole("button", { name: /see your closet/i }));
		expect(onGoToCloset).toHaveBeenCalledTimes(1);
		expect(onContinueHunting).not.toHaveBeenCalled();
	});

	it("calls onContinueHunting, not onGoToCloset, from the continue-hunting action", () => {
		const onGoToCloset = vi.fn();
		const onContinueHunting = vi.fn();
		renderScreen(baseStats, { onGoToCloset, onContinueHunting });

		fireEvent.click(screen.getByRole("button", { name: /keep searching emails/i }));
		expect(onContinueHunting).toHaveBeenCalledTimes(1);
		expect(onGoToCloset).not.toHaveBeenCalled();
	});

	it("tracks reveal_shown once on mount, with the key stats", () => {
		renderScreen(baseStats);

		expect(track).toHaveBeenCalledWith("reveal_shown", {
			piece_count: 142,
			brand_count: 11,
			has_date_range: true,
			has_complete_value: true,
		});
		expect(track).toHaveBeenCalledTimes(1);
	});

	it("tracks reveal_closet_clicked when she picks See your closet", () => {
		renderScreen(baseStats);
		track.mockClear(); // drop the mount-time reveal_shown call

		fireEvent.click(screen.getByRole("button", { name: /see your closet/i }));

		expect(track).toHaveBeenCalledWith("reveal_closet_clicked");
		expect(track).not.toHaveBeenCalledWith("reveal_continue_hunting_clicked");
	});

	it("tracks reveal_continue_hunting_clicked when she picks Keep Searching Emails", () => {
		renderScreen(baseStats);
		track.mockClear();

		fireEvent.click(screen.getByRole("button", { name: /keep searching emails/i }));

		expect(track).toHaveBeenCalledWith("reveal_continue_hunting_clicked");
		expect(track).not.toHaveBeenCalledWith("reveal_closet_clicked");
	});
});
