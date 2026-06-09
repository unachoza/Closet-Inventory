import { test, expect, type Page } from "@playwright/test";
import { mockGmail, DEFAULT_MOCK_EMAILS } from "./helpers/mockGmail";

/**
 * Mobile UX for the Gmail import flow, with Gmail fully mocked (see mockGmail).
 * Guards horizontal overflow + locks the search/preview layout via
 * toHaveScreenshot baselines (stored under e2e/__screenshots__, tracked in git).
 */

async function expectNoHorizontalOverflow(page: Page) {
	const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
	expect(overflow, "page scrolls horizontally on mobile").toBeLessThanOrEqual(1);
}

/** Open the hamburger drawer and navigate to the Gmail import view. */
async function gotoGmail(page: Page) {
	await page.goto("/");
	await page.getByRole("button", { name: /open menu/i }).tap();
	await page.getByRole("button", { name: /import gmail/i }).tap();
}

test.describe("Gmail import — mobile", () => {
	test.beforeEach(async ({ page }) => {
		await mockGmail(page);
	});

	test("authenticated search screen renders the search boxes without overflow", async ({ page }) => {
		await gotoGmail(page);

		// Authenticated → the advanced search UI is present (not the Connect button).
		await expect(page.locator(".advanced-search")).toBeVisible();
		await expect(page.getByRole("button", { name: /connect gmail/i })).toHaveCount(0);

		// Auto-search populates the list from the mock.
		await expect(page.locator(".gmail-email-item")).toHaveCount(DEFAULT_MOCK_EMAILS.length);

		await expectNoHorizontalOverflow(page);
		// VISUAL BASELINE: locks the mobile search screen + header layout.
		await expect(page).toHaveScreenshot("gmail-search.png");
	});

	test("expanding advanced search shows the input rows at a sensible width", async ({ page }) => {
		await gotoGmail(page);

		await page.locator(".advanced-search-toggle").tap();
		const input = page.locator(".advanced-search-input").first();
		await expect(input).toBeVisible();

		// The search input shouldn't overflow the viewport width.
		const viewport = page.viewportSize()!;
		const box = await input.boundingBox();
		expect(box).not.toBeNull();
		expect(box!.x + box!.width, "search input overflows the right edge").toBeLessThanOrEqual(viewport.width + 1);

		await expectNoHorizontalOverflow(page);
		// VISUAL BASELINE: locks the advanced-search form layout.
		await expect(page.locator(".advanced-search")).toHaveScreenshot("gmail-advanced-search.png");
	});

	test("selecting an email opens the preview with real content, fitting the screen", async ({ page }) => {
		await gotoGmail(page);

		await expect(page.locator(".gmail-email-item")).toHaveCount(DEFAULT_MOCK_EMAILS.length);

		// Tap the first email → triggers the format=full fetch → preview opens.
		await page.locator(".gmail-email-item").first().getByText(/short jacquard jumpsuit|thank you for your purchase/i).first().tap();

		const preview = page.locator(".gmail-preview");
		await expect(preview).toBeVisible();

		// Non-empty preview proves the whole chain works: auth seed + list +
		// metadata + full-body decode. A product name from the fixture must appear.
		await expect(preview.locator(".gmail-preview-html")).toContainText(/JUMPSUIT|KNOTTED TOP/);

		// The preview panel must fit the phone width.
		const viewport = page.viewportSize()!;
		const box = await preview.boundingBox();
		expect(box).not.toBeNull();
		expect(box!.x, "preview overflows the left edge").toBeGreaterThanOrEqual(-1);
		expect(box!.x + box!.width, "preview overflows the right edge").toBeLessThanOrEqual(viewport.width + 1);

		await expectNoHorizontalOverflow(page);
		// VISUAL BASELINE: locks the full-screen preview overlay (element-scoped, so
		// it captures the fixed panel rather than the list scrolling beneath it).
		await expect(page.locator(".gmail-preview-panel")).toHaveScreenshot("gmail-preview-overlay.png");

		// The mobile overlay must be dismissable via "Back to list".
		await page.getByRole("button", { name: /back to email list/i }).tap();
		await expect(preview).toBeHidden();
		await expect(page.locator(".gmail-email-item").first()).toBeVisible();
	});
});
