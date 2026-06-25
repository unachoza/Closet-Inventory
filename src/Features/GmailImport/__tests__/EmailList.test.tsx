/**
 * EmailList — the selected row must scroll into view so the left list stays in
 * sync with the right preview panel (especially after "Back to email", which
 * would otherwise reset the list to the top while the preview shows a row that's
 * scrolled out of sight).
 */
import { render } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import EmailList from "../EmailList";
import type { GmailEmailMeta } from "../../../hooks/useAdvancedSearch";

function makeEmails(n: number): GmailEmailMeta[] {
	return Array.from({ length: n }, (_, i) => ({
		id: `e${i}`,
		threadId: `t${i}`,
		subject: `Subject ${i}`,
		from: `"Sender ${i}" <s${i}@shop.com>`,
		date: "2024-01-01T00:00:00Z",
		snippet: `snippet ${i}`,
	}));
}

describe("EmailList — selected row scroll sync", () => {
	beforeEach(() => {
		// jsdom doesn't implement scrollIntoView; spy on the prototype.
		Element.prototype.scrollIntoView = vi.fn();
	});

	it("scrolls the selected row into view when a selection is present", () => {
		render(<EmailList emails={makeEmails(10)} selectedEmailId="e7" onToggleSelect={vi.fn()} />);

		expect(Element.prototype.scrollIntoView).toHaveBeenCalledWith({ behavior: "smooth", block: "start" });
	});

	it("does not scroll when nothing is selected", () => {
		render(<EmailList emails={makeEmails(10)} selectedEmailId={null} onToggleSelect={vi.fn()} />);

		expect(Element.prototype.scrollIntoView).not.toHaveBeenCalled();
	});

	it("marks the selected row so the list visually matches the preview", () => {
		render(<EmailList emails={makeEmails(5)} selectedEmailId="e2" onToggleSelect={vi.fn()} />);

		const selected = document.querySelector(".gmail-email-label--selected");
		expect(selected).toBeInTheDocument();
		expect(selected).toHaveTextContent("Subject 2");
		// Only the selected row carries the highlight.
		expect(document.querySelectorAll(".gmail-email-label--selected")).toHaveLength(1);
	});
});
