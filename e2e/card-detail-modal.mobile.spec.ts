import { test, expect, type Page } from "@playwright/test";
import { skipOnboarding } from "./helpers/navHelpers";

/**
 * Mobile UX flow for the card → flip → "See all details" → grow-into-modal path.
 *
 * Two kinds of checks here:
 *  1. MECHANICAL assertions — element fits the viewport, no horizontal overflow,
 *     tap targets are big enough.
 *  2. VISUAL BASELINE (toHaveScreenshot) — locks the detail modal layout; any
 *     pixel drift fails the build. Baselines live under e2e/__screenshots__.
 */

/** Assert an element sits within the viewport horizontally (no edge overflow). */
async function expectWithinViewport(page: Page, selector: string) {
	const viewport = page.viewportSize();
	expect(viewport, "viewport size should be defined for mobile projects").not.toBeNull();

	const box = await page.locator(selector).boundingBox();
	expect(box, `${selector} should have a bounding box`).not.toBeNull();

	expect(box!.x, `${selector} overflows the left edge`).toBeGreaterThanOrEqual(-1);
	expect(box!.x + box!.width, `${selector} overflows the right edge`).toBeLessThanOrEqual(viewport!.width + 1);
}

test.describe("Card detail modal — mobile", () => {
	// The grow/shrink modal tears down on a `width` transitionend, which WebKit
	// fires unreliably under automation — leaving the modal "stuck" open. Reduced
	// motion routes close through the instant-teardown path (prefersReducedMotion),
	// making the flow deterministic across browsers. Final layout is unchanged, so
	// the visual baseline still holds.
	test.use({ reducedMotion: "reduce" });

	test.beforeEach(async ({ page }) => {
		await skipOnboarding(page);
		await page.goto("/");
		await expect(page.getByTestId("clothes-card").first()).toBeVisible({ timeout: 8000 });
	});

	test("flip → See all details → grow modal → close", async ({ page }) => {
		const card = page.getByTestId("clothes-card").first();

		// 1) Tap the card → it flips to the compact summary.
		await card.tap();
		await expect(card).toHaveClass(/flipped/);
		// Wait for the 0.8s flip transition to finish so the back face is settled
		// before we tap into it (force-tapping mid-flip can miss the button).
		await page.waitForTimeout(900);

		// 2) Tap "See all details" → the card grows into the centered modal.
		//    force:true because the back face lives in a rotateY(180deg) 3D context,
		//    which can confuse Playwright's pointer hit-testing even though it's visible.
		await card.getByRole("button", { name: /see all details/i }).tap({ force: true });

		const modal = page.locator(".card-grow-modal");
		await expect(modal).toBeVisible();
		// Let the grow animation settle before measuring / shooting.
		await page.waitForTimeout(450);

		// MECHANICAL: the modal must fit the phone width.
		await expectWithinViewport(page, ".card-grow-modal");

		// VISUAL BASELINE: locks the detail modal layout against drift.
		await expect(modal).toHaveScreenshot("card-grow-modal.png");

		// 3) Close → modal goes away. The close (✕) button is absolutely positioned
		//    at the modal's top-right corner; WebKit's touch hit-testing misses it
		//    under automation even with force:true, so dispatch the click directly
		//    to exercise the onClose handler deterministically.
		await modal.getByRole("button", { name: "Close" }).dispatchEvent("click");
		await expect(modal).toBeHidden();
	});

	test("landing closet has no horizontal overflow", async ({ page }) => {
		const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
		expect(overflow, "page scrolls horizontally on mobile").toBeLessThanOrEqual(1);
	});

	test("'See all details' is a comfortable tap target (>= 44px tall)", async ({ page }) => {
		const card = page.getByTestId("clothes-card").first();
		await card.tap();
		await expect(card).toHaveClass(/flipped/);

		const box = await card.getByRole("button", { name: /see all details/i }).boundingBox();
		expect(box).not.toBeNull();
		// Apple/Material guidance is ~44px; allow a small tolerance.
		expect(box!.height, "tap target is shorter than ~44px").toBeGreaterThanOrEqual(40);
	});

	// ── Regression: E5-bug.1 — card top clipped + "See all details" clipped ──

	test("first card top edge is not hidden above the viewport (regression: margin-top clipping)", async ({ page }) => {
		const card = page.getByTestId("clothes-card").first();
		const cardBox = await card.boundingBox();
		expect(cardBox).not.toBeNull();

		// Card top must be visible — not scrolled/pushed above y=0.
		// Allow a 1px tolerance for subpixel rendering.
		expect(cardBox!.y, "first card is clipped above the visible viewport").toBeGreaterThanOrEqual(-1);
	});

	test("'See all details' button is fully within the card's vertical bounds (regression: footer clipped)", async ({ page }) => {
		const card = page.getByTestId("clothes-card").first();
		await card.tap();
		await expect(card).toHaveClass(/flipped/);
		await page.waitForTimeout(900);

		const cardBox = await card.boundingBox();
		const btnBox = await card.getByRole("button", { name: /see all details/i }).boundingBox();

		expect(cardBox).not.toBeNull();
		expect(btnBox).not.toBeNull();

		const cardBottom = cardBox!.y + cardBox!.height;
		const btnBottom = btnBox!.y + btnBox!.height;

		// The "See all details" button's bottom edge must sit within the card.
		// 2px tolerance for border/subpixel rendering.
		expect(
			btnBottom,
			`"See all details" bottom (${btnBottom.toFixed(1)}) overflows card bottom (${cardBottom.toFixed(1)})`,
		).toBeLessThanOrEqual(cardBottom + 2);

		// And the button must also be in the visible viewport.
		const viewportHeight = page.viewportSize()!.height;
		expect(btnBottom, '"See all details" is below the visible viewport').toBeLessThanOrEqual(viewportHeight);
	});

	test("all cards on first page have tops within viewport (no card hidden under nav)", async ({ page }) => {
		const cards = page.getByTestId("clothes-card");
		const count = await cards.count();

		for (let i = 0; i < count; i++) {
			const box = await cards.nth(i).boundingBox();
			expect(box, `card ${i} has no bounding box`).not.toBeNull();
			expect(box!.y, `card ${i} top is above the viewport`).toBeGreaterThanOrEqual(-1);
		}
	});
});
