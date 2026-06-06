import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ViewProvider } from "../../../context/ViewContext";
import InteractiveGuide from "../InteractiveGuide";

// ── Environment mocks ─────────────────────────────────────────────────────────
// jsdom doesn't implement IntersectionObserver or scrollIntoView
beforeEach(() => {
	vi.stubGlobal(
		"IntersectionObserver",
		class {
			observe = vi.fn();
			unobserve = vi.fn();
			disconnect = vi.fn();
		},
	);
	Element.prototype.scrollIntoView = vi.fn();
});

function renderGuide() {
	return render(
		<ViewProvider>
			<InteractiveGuide />
		</ViewProvider>,
	);
}

// InteractiveGuide renders the full textile compendium (30+ fiber cards,
// comparison table, weave diagrams). Set a generous timeout so the full
// suite's parallel environment pressure doesn't cause false failures.
describe("InteractiveGuide", { timeout: 20000 }, () => {
	// ── Section rendering ────────────────────────────────────────────────────
	it("renders all main section headings", () => {
		renderGuide();
		// Each heading appears in both the TOC nav and the section — use getAllByText
		expect(screen.getAllByText("Natural Fibers").length).toBeGreaterThanOrEqual(1);
		expect(screen.getAllByText(/semi-synthetic fibers/i).length).toBeGreaterThanOrEqual(1);
		expect(screen.getAllByText(/synthetic fibers/i).length).toBeGreaterThanOrEqual(1);
		expect(screen.getAllByText(/weave structures/i).length).toBeGreaterThanOrEqual(1);
		expect(screen.getByRole("heading", { name: /fiber comparison/i })).toBeInTheDocument();
	});

	it("renders the sticky table-of-contents nav", () => {
		renderGuide();
		// TOC buttons exist (some labels appear in multiple places — use getAllBy)
		expect(screen.getAllByRole("button", { name: /natural fibers/i }).length).toBeGreaterThanOrEqual(1);
		expect(screen.getAllByRole("button", { name: /semi-synthetic/i }).length).toBeGreaterThanOrEqual(1);
		expect(screen.getByRole("button", { name: /care guide/i })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: /sources/i })).toBeInTheDocument();
	});

	it("clicking a TOC button calls scrollIntoView", () => {
		renderGuide();
		fireEvent.click(screen.getByRole("button", { name: /weave structures/i }));
		expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
	});

	// ── Weave tabs ───────────────────────────────────────────────────────────
	it("renders weave structure tabs", () => {
		renderGuide();
		// WEAVE_TYPES has tabs like plain, twill, satin
		const weaveSection = screen.getByText("Textile Weave Structures").closest("section")!;
		const tabs = weaveSection.querySelectorAll(".weave-tab");
		expect(tabs.length).toBeGreaterThan(0);
	});

	it("clicking a weave tab changes the active tab class", () => {
		renderGuide();
		const weaveSection = screen.getByText("Textile Weave Structures").closest("section")!;
		const tabs = Array.from(weaveSection.querySelectorAll(".weave-tab"));
		// Click the second tab (not the default)
		const secondTab = tabs[1] as HTMLElement;
		fireEvent.click(secondTab);
		expect(secondTab.className).toContain("active");
		// First tab should no longer be active
		expect((tabs[0] as HTMLElement).className).not.toContain("active");
	});

	// ── Fiber card modal ─────────────────────────────────────────────────────
	it("clicking a fiber card opens the detail modal", () => {
		renderGuide();
		const fiberCards = document.querySelectorAll(".fiber-card");
		expect(fiberCards.length).toBeGreaterThan(0);
		fireEvent.click(fiberCards[0]);
		// DetailModal has aria-label="Close detail panel" on its close button
		expect(screen.getByRole("button", { name: /close detail panel/i })).toBeInTheDocument();
		expect(screen.getByRole("dialog")).toBeInTheDocument();
	});

	it("closing the detail modal removes it from the screen", () => {
		renderGuide();
		const fiberCards = document.querySelectorAll(".fiber-card");
		fireEvent.click(fiberCards[0]);
		fireEvent.click(screen.getByRole("button", { name: /close detail panel/i }));
		expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
	});

	// ── Comparison table ─────────────────────────────────────────────────────
	it("renders the fiber comparison table with expected fibers", () => {
		renderGuide();
		expect(screen.getByRole("table")).toBeInTheDocument();
		// Fibers appear in both cards and the table — use getAllByText
		expect(screen.getAllByText("Merino Wool").length).toBeGreaterThanOrEqual(1);
		expect(screen.getAllByText("Cotton").length).toBeGreaterThanOrEqual(1);
		expect(screen.getAllByText("Polyester").length).toBeGreaterThanOrEqual(1);
	});
});
