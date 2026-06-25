/**
 * EmailList — presentational list of email rows.
 *
 * Scroll-into-view of the selected row is owned by the PARENT (GmailImport),
 * which fires it only after the email body loads and the 40%-width preview-split
 * layout settles (scrolling earlier lands on a stale offset). EmailList's job is
 * just to mark the selected row and expose the <ul> via `listRef` so the parent
 * can find that row.
 */
import { createRef } from "react";
import { render } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
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

describe("EmailList", () => {
	it("marks the selected row so the list visually matches the preview", () => {
		render(<EmailList emails={makeEmails(5)} selectedEmailId="e2" onToggleSelect={vi.fn()} />);

		const selected = document.querySelector(".gmail-email-label--selected");
		expect(selected).toBeInTheDocument();
		expect(selected).toHaveTextContent("Subject 2");
		// Only the selected row carries the highlight.
		expect(document.querySelectorAll(".gmail-email-label--selected")).toHaveLength(1);
	});

	it("marks no row when nothing is selected", () => {
		render(<EmailList emails={makeEmails(5)} selectedEmailId={null} onToggleSelect={vi.fn()} />);

		expect(document.querySelector(".gmail-email-label--selected")).not.toBeInTheDocument();
	});

	it("exposes the <ul> via listRef so the parent can scroll the selected row", () => {
		const listRef = createRef<HTMLUListElement>();
		render(<EmailList emails={makeEmails(3)} selectedEmailId="e1" onToggleSelect={vi.fn()} listRef={listRef} />);

		expect(listRef.current).toBeInstanceOf(HTMLUListElement);
		// The parent finds the selected row through this ref.
		expect(listRef.current?.querySelector(".gmail-email-label--selected")).toHaveTextContent("Subject 1");
	});
});
