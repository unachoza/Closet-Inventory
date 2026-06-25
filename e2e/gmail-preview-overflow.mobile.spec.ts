import { test, expect, type Page } from "@playwright/test";
import { mockGmail, type MockEmail } from "./helpers/mockGmail";
import { skipOnboarding } from "./helpers/navHelpers";

/**
 * E3-bug.1 regression — rendering a real retailer order email in the preview.
 *
 * Real order emails (Shopbop, Express, SwimOutlet…) are built as 600–720px
 * fixed-width tables. Two things used to go wrong on a narrow viewport:
 *   1. `word-break: break-word` on `.gmail-preview-html` let the browser break
 *      text mid-word, collapsing the email's table columns to ~1 character (the
 *      "one letter per line" mangling in the reported screenshots).
 *   2. A too-wide email could push the layout into a horizontal scroll.
 *
 * The fix removes the forced break and confines any genuine overflow to a
 * horizontal scroll INSIDE the preview body (like Gmail's own preview).
 *
 * Note on coverage: the exact char-collapse is a CSS table-layout interaction
 * that's impractical to reproduce as a stable pixel assertion, so the mangling
 * is guarded here as a computed-style contract (word-break must not force
 * mid-word breaking). The overflow behaviour is checked directly.
 */

// A width="100%" outer table (obeys the narrow container) whose inner declared
// column widths sum well past the viewport — the structure that collapsed under
// word-break — plus a long unbroken token for good measure.
const WIDE_RETAILER_EMAIL: MockEmail = {
	id: "shopbop-001",
	threadId: "t-shopbop-001",
	subject: "Shopbop Order #103083925 - Order Confirmation",
	from: '"service@shopbop.com" <service@em.shopbop.com>',
	date: "Tue, 11 May 2021 02:28:44 +0000",
	snippet: "Order confirmation …",
	html: [
		'<table border="0" cellpadding="0" cellspacing="0" width="100%"><tbody><tr>',
		'<td width="400" valign="top">',
		'<table border="0" cellpadding="0" cellspacing="0" width="100%"><tbody><tr>',
		'<td width="140">Tie Dye Bananas Pajama Shirt Multi M FARMR303151A57D115</td>',
		'<td width="40" align="center">1</td>',
		'<td width="90" align="right">108.50</td>',
		'<td width="90" align="right">108.50</td>',
		"</tr></tbody></table>",
		"</td>",
		'<td width="200" valign="top" style="border-left:1px solid #000">Shipping Method 2-day Free</td>',
		"</tr></tbody></table>",
	].join(""),
};

async function gotoGmailPreview(page: Page) {
	await page.goto("/");
	await page.getByRole("button", { name: /open menu/i }).click();
	await page.getByRole("button", { name: /import gmail/i }).click();
	await expect(page.locator(".gmail-email-item")).toHaveCount(1);
	await page.locator(".gmail-email-checkbox").first().click();
	await expect(page.locator(".gmail-preview-html")).toBeVisible();
}

test.describe("Gmail preview — wide retailer email (E3-bug.1)", () => {
	test.beforeEach(async ({ page }) => {
		await skipOnboarding(page);
		await mockGmail(page, [WIDE_RETAILER_EMAIL]);
	});

	test("does not force mid-word breaking (guards the one-letter-per-line mangling)", async ({ page }) => {
		await gotoGmailPreview(page);

		// `word-break: break-word` is what collapsed the email tables character by
		// character. It must not be in effect on the rendered email HTML.
		const wordBreak = await page.evaluate(() => getComputedStyle(document.querySelector(".gmail-preview-html")!).wordBreak);
		expect(wordBreak, "gmail-preview-html must not force mid-word breaking").toBe("normal");
	});

	test("confines a too-wide email to a horizontal scroll inside the preview body", async ({ page }) => {
		await gotoGmailPreview(page);

		// The body is the horizontal-scroll container (not visible/clipped), so a
		// wide email scrolls here instead of widening the layout.
		const overflowX = await page.evaluate(() => getComputedStyle(document.querySelector(".gmail-preview-body")!).overflowX);
		expect(overflowX, "preview body must contain horizontal overflow").not.toBe("visible");

		// And the page itself never scrolls horizontally.
		const pageOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
		expect(pageOverflow, "wide email caused page-level horizontal scroll").toBeLessThanOrEqual(1);
	});
});
