import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import DetailModal from "./Modal";
import type { Fiber } from "../../Content/Fabric&Fiber";

const fiber: Fiber = {
	id: "tencel",
	name: "TENCEL™ / Lyocell",
	category: "semi",
	tagLabel: "Semi-Synthetic",
	source: "Eucalyptus globulus · Lenzing AG, Austria",
	description: "Regenerated cellulose fiber.",
	imageUrl: "https://example.com/tencel.jpg",
	imageAlt: "TENCEL fiber",
	properties: [],
	detail: [{ title: "Care", content: "Machine wash cold." }],
};

describe("DetailModal", () => {
	afterEach(() => {
		document.body.style.overflow = "";
	});

	// ── Regression: fabric detail card hidden under the sticky NavBar ──
	//
	// Root cause: .app-content has z-index:1 (needed to sit above a background
	// scrim), which creates a stacking context that traps any fixed-position
	// modal rendered *inside* it below the sticky NavBar's z-index:100 — no
	// matter how high the modal's own z-index is set. Rendering via a portal
	// to document.body is what actually escapes the trap; jsdom doesn't compute
	// layout/z-index, so this test asserts the structural fix (portal target)
	// rather than pixel positions — see e2e/fabric-detail-modal.mobile.spec.ts
	// for the geometry-level regression guard.
	it("renders via a portal directly under document.body, not nested inside the calling tree (regression: modal trapped under sticky nav)", () => {
		const appRoot = document.createElement("div");
		appRoot.className = "app-content";
		document.body.appendChild(appRoot);

		render(<DetailModal fiber={fiber} onClose={() => {}} />, { container: appRoot });

		const overlay = document.querySelector(".detail-overlay");
		expect(overlay).toBeInTheDocument();
		// Direct child of <body>, escaping .app-content's stacking context entirely.
		expect(overlay!.parentElement).toBe(document.body);
		expect(appRoot.contains(overlay)).toBe(false);

		document.body.removeChild(appRoot);
	});

	it("renders nothing when fiber is null", () => {
		render(<DetailModal fiber={null} onClose={() => {}} />);
		expect(document.querySelector(".detail-overlay")).not.toBeInTheDocument();
	});

	it("shows the fiber name, source, and detail sections", () => {
		render(<DetailModal fiber={fiber} onClose={() => {}} />);

		expect(screen.getByText("TENCEL™ / Lyocell")).toBeInTheDocument();
		expect(screen.getByText(/Eucalyptus globulus/)).toBeInTheDocument();
		expect(screen.getByText("Care")).toBeInTheDocument();
		expect(screen.getByText("Machine wash cold.")).toBeInTheDocument();
	});

	it("calls onClose when the close button is clicked", () => {
		const onClose = vi.fn();
		render(<DetailModal fiber={fiber} onClose={onClose} />);

		fireEvent.click(screen.getByRole("button", { name: /close detail panel/i }));
		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it("calls onClose on Escape", () => {
		const onClose = vi.fn();
		render(<DetailModal fiber={fiber} onClose={onClose} />);

		fireEvent.keyDown(document, { key: "Escape" });
		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it("calls onClose on backdrop click but not on panel click", () => {
		const onClose = vi.fn();
		render(<DetailModal fiber={fiber} onClose={onClose} />);

		fireEvent.click(screen.getByText("TENCEL™ / Lyocell"));
		expect(onClose).not.toHaveBeenCalled();

		fireEvent.click(document.querySelector(".detail-overlay")!);
		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it("locks body scroll while open", () => {
		const { unmount } = render(<DetailModal fiber={fiber} onClose={() => {}} />);
		expect(document.body.style.overflow).toBe("hidden");

		unmount();
		expect(document.body.style.overflow).toBe("");
	});
});
