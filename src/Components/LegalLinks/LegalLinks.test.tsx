import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import LegalLinks from "./LegalLinks";

describe("LegalLinks", () => {
	// Google's OAuth consent screen points at these exact paths, and they are
	// static documents in public/ rather than SPA routes. If either href drifts
	// (or becomes a router link), the consent screen's policy URL and the in-app
	// link stop agreeing — which is a verification failure, not a broken link.
	it("points at the static policy documents", () => {
		render(<LegalLinks />);
		expect(screen.getByRole("link", { name: /privacy/i })).toHaveAttribute("href", "/privacy.html");
		expect(screen.getByRole("link", { name: /terms/i })).toHaveAttribute("href", "/terms.html");
	});

	it("opens in a new tab so an in-progress edit is never lost", () => {
		render(<LegalLinks />);
		screen.getAllByRole("link").forEach((link) => {
			expect(link).toHaveAttribute("target", "_blank");
			expect(link).toHaveAttribute("rel", "noreferrer");
		});
	});
});
