import { test, expect } from "@playwright/test";
import { skipOnboarding, clickNavAction } from "./helpers/navHelpers";

/**
 * Regression: the fabric/fiber detail card (Fabric Guide → tap a fiber card)
 * was rendered inside `.app-content`, which has `z-index: 1` (needed to sit
 * above a background scrim) and therefore establishes its own stacking
 * context. That trapped the modal's `z-index` underneath the sticky NavBar
 * (`z-index: 100`, a sibling of `.app-content`) no matter how high the
 * modal's own z-index was set — the top of the card rendered behind the
 * header. Fixed by portaling the modal to `document.body` (see Modal.tsx)
 * plus giving it real top/bottom clearance and an internally-scrolling body.
 */
test.describe("Fabric detail modal — mobile", () => {
	test.use({ reducedMotion: "reduce" });

	test.beforeEach(async ({ page }) => {
		await skipOnboarding(page);
		await page.goto("/");
		await clickNavAction(page, "Fabric Guide");
		await expect(page.locator(".fiber-card").first()).toBeVisible({ timeout: 8000 });
	});

	test("detail panel clears the sticky nav (regression: fabric card hidden under header)", async ({ page }) => {
		await page.locator(".fiber-card").first().click();

		const panel = page.locator(".detail-panel");
		await expect(panel).toBeVisible();

		const navBox = await page.locator(".top-nav").boundingBox();
		const panelBox = await panel.boundingBox();
		expect(navBox, "sticky nav should have a bounding box").not.toBeNull();
		expect(panelBox, "detail panel should have a bounding box").not.toBeNull();

		const navBottom = navBox!.y + navBox!.height;
		expect(
			panelBox!.y,
			`detail panel top (${panelBox!.y.toFixed(1)}) is behind the nav bottom (${navBottom.toFixed(1)})`,
		).toBeGreaterThanOrEqual(navBottom - 1);

		// The panel (including its pinned header/close button) must also fit
		// within the viewport — not pushed off the bottom edge either. Measured
		// via window.innerHeight (what CSS/dvh actually renders against), not
		// page.viewportSize() — the two can disagree under mobile device
		// emulation (browser-chrome/safe-area accounting differs), which isn't
		// itself a bug worth asserting on here.
		const viewportHeight = await page.evaluate(() => window.innerHeight);
		const panelBottom = panelBox!.y + panelBox!.height;
		expect(panelBottom, "detail panel bottom overflows the viewport").toBeLessThanOrEqual(viewportHeight + 1);

		await page.getByRole("button", { name: /close detail panel/i }).click();
		await expect(panel).toBeHidden();
	});

	test("detail overlay renders via a portal at document.body (regression: trapped in .app-content stacking context)", async ({
		page,
	}) => {
		await page.locator(".fiber-card").first().click();
		await expect(page.locator(".detail-overlay")).toBeVisible();

		const isDirectBodyChild = await page.evaluate(() => {
			const overlay = document.querySelector(".detail-overlay");
			return !!overlay && overlay.parentElement === document.body;
		});
		expect(isDirectBodyChild, ".detail-overlay should be a direct child of <body>, not nested in .app-content").toBe(true);

		await page.getByRole("button", { name: /close detail panel/i }).click();
	});

	test("header and close button stay pinned while the body scrolls (regression: whole card scrolled together, header lost)", async ({
		page,
	}) => {
		await page.locator(".fiber-card").first().click();
		const header = page.locator(".detail-header");
		await expect(header).toBeVisible();

		const headerBoxBefore = await header.boundingBox();

		// Scroll the panel's body content, if it overflows.
		await page.locator(".detail-body").evaluate((el) => el.scrollBy(0, 400));
		await page.waitForTimeout(150);

		const headerBoxAfter = await header.boundingBox();
		expect(headerBoxBefore, "header should have a bounding box before scroll").not.toBeNull();
		expect(headerBoxAfter, "header should have a bounding box after scroll").not.toBeNull();

		// The header (with the close button) must not move — only the body scrolls.
		expect(headerBoxAfter!.y).toBeCloseTo(headerBoxBefore!.y, 0);

		await page.getByRole("button", { name: /close detail panel/i }).click();
	});
});
