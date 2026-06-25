import { test, expect } from "@playwright/test";
import { mockGmail, type MockEmail } from "./helpers/mockGmail";
import { skipOnboarding } from "./helpers/navHelpers";

/**
 * E3-bug.5 regression — "Back to email" must restore the list scroll to the
 * selected row, not reset it to the top.
 *
 * Flow: select an email far down a long list → Import a product (→ EditItemView)
 * → "Back to Email". GmailImport REMOUNTS, so the list starts at scrollTop 0.
 * The fix scrolls the selected row back into view — but only AFTER the body
 * loads and the 40%-width preview split settles (scrolling on row-mount, while
 * the list is still full-width, lands on a stale offset and drops back to top).
 *
 * Discriminating: with the fix, the list is scrolled down (scrollTop > 0) and
 * the selected row sits inside the list viewport. Revert the GmailImport scroll
 * effect and the list stays at the top → scrollTop ~ 0 → this fails.
 */

// One parseable clothing email (yields an Import button) placed far down a long
// list so returning to it REQUIRES a non-trivial scroll.
const IMPORTABLE_INDEX = 37;
const TOTAL = 40;

function fillerEmail(i: number): MockEmail {
	return {
		id: `filler-${i}`,
		threadId: `t-filler-${i}`,
		subject: `Newsletter ${i}`,
		from: `"Shop ${i}" <news${i}@shop.com>`,
		date: "Tue, 03 Jun 2026 10:14:00 +0000",
		snippet: `Promo email ${i}`,
		html: `<div style="font:13px arial">Promo ${i}</div>`,
	};
}

const IMPORTABLE: MockEmail = {
	id: "zara-importable",
	threadId: "t-zara-importable",
	subject: "Thank you for your purchase — Order 0/1112/051",
	from: "ZARA <noreply@zara.com>",
	date: "Tue, 03 Jun 2026 10:14:00 +0000",
	snippet: "Your order is confirmed. COTTON DRESS …",
	html: [
		'<div style="font:13px arial,sans-serif;margin:24px">',
		'<h1 style="text-align:center">ZARA</h1>',
		'<table cellspacing="0" cellpadding="6" style="width:100%;font-size:13px">',
		"<thead><tr><th>Description</th><th>Colour</th><th>Size</th><th>Units</th><th>Amount</th></tr></thead>",
		"<tbody>",
		"<tr><td>COTTON DRESS</td><td>Bluish</td><td>M</td><td>1</td><td>29.99&nbsp;USD</td></tr>",
		"</tbody></table>",
		"</div>",
	].join(""),
};

const EMAILS: MockEmail[] = Array.from({ length: TOTAL }, (_, i) =>
	i === IMPORTABLE_INDEX ? IMPORTABLE : fillerEmail(i),
);

test.describe("Gmail — Back to email restores list scroll (E3-bug.5)", () => {
	test.beforeEach(async ({ page }) => {
		await skipOnboarding(page);
		await mockGmail(page, EMAILS);
	});

	test("returning from EditItemView scrolls the selected row back into view", async ({ page }) => {
		await page.goto("/");
		await page.getByRole("button", { name: /open menu/i }).click();
		await page.getByRole("button", { name: /import gmail/i }).click();

		// Auto-search populates the full list.
		await expect(page.locator(".gmail-email-item")).toHaveCount(TOTAL);

		// Select the importable email far down the list (Playwright scrolls it into
		// view inside the list container, then selecting opens the preview).
		const row = page.locator(".gmail-email-item").nth(IMPORTABLE_INDEX);
		await row.locator(".gmail-email-checkbox").click();
		await expect(page.locator(".gmail-preview-html")).toBeVisible();

		// Import the detected product → EditItemView.
		await page.locator(".product-card-import-btn").first().click();
		const backBtn = page.getByRole("button", { name: /back to email/i });
		await expect(backBtn).toBeVisible();

		// Return — GmailImport remounts; the list starts at the top.
		await backBtn.click();
		await expect(page.locator(".gmail-email-list")).toBeVisible();

		// The fix scrolls the selected row back into view (smooth scroll settles
		// asynchronously, so poll).
		await expect
			.poll(async () => page.locator(".gmail-email-list").evaluate((el) => el.scrollTop), {
				message: "list did not scroll to the selected row on Back to email",
				timeout: 4000,
			})
			.toBeGreaterThan(0);

		// And the selected row is actually within the list's visible viewport.
		const inView = await page.evaluate(() => {
			const list = document.querySelector(".gmail-email-list");
			const sel = document.querySelector(".gmail-email-label--selected");
			if (!list || !sel) return false;
			const l = list.getBoundingClientRect();
			const s = sel.getBoundingClientRect();
			return s.bottom > l.top && s.top < l.bottom;
		});
		expect(inView, "selected row is not visible in the list viewport").toBe(true);
	});
});
