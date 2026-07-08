import { test, expect } from "@playwright/test";
import { clickNavAction, skipOnboarding } from "./helpers/navHelpers";

/**
 * E2E: P1-4 long-press quick actions — press-and-hold a card front to open a
 * one-tap status menu, without flipping the card or triggering the browser's
 * native touch callout.
 *
 * Long-press is simulated with `click({ delay })`: a real browser fires a
 * genuine PointerEvent for a mouse press, and Playwright's `delay` holds the
 * button down that long before releasing — well past useLongPress's 500ms
 * threshold (Card.tsx uses the default), so it reliably triggers
 * `onLongPress` instead of a normal click.
 */

const LONG_PRESS_DELAY = 650; // > useLongPress's default 500ms threshold

test.describe("Card quick actions (long-press)", () => {
	test.beforeEach(async ({ page }) => {
		await skipOnboarding(page);
		await page.goto("/");
		await expect(page.getByTestId("clothes-card").first()).toBeVisible({ timeout: 8000 });
		await clickNavAction(page, /view all/i);
		await expect(page.getByRole("main", { name: /entire closet/i })).toBeVisible({ timeout: 5000 });
	});

	test("long-pressing a card opens the quick actions menu showing its current status", async ({ page }) => {
		const card = page.getByTestId("clothes-card").first();
		await card.click({ delay: LONG_PRESS_DELAY });

		const menu = page.getByRole("menu", { name: /status quick actions/i });
		await expect(menu).toBeVisible({ timeout: 3000 });
		await expect(menu.getByRole("menuitem").first()).toBeVisible();

		// Opening the menu must NOT also flip the card to its detail back face.
		await expect(card).not.toHaveClass(/flipped/);
	});

	test("selecting an action updates the item's status and closes the menu", async ({ page }) => {
		const card = page.getByTestId("clothes-card").first();
		await card.click({ delay: LONG_PRESS_DELAY });

		const menu = page.getByRole("menu", { name: /status quick actions/i });
		await expect(menu).toBeVisible({ timeout: 3000 });

		const statusLine = menu.locator(".card-quick-actions__status");
		const before = await statusLine.textContent();

		await menu.getByRole("menuitem").first().click();
		await expect(menu).toBeHidden({ timeout: 3000 });

		// Re-open on the same card and confirm the status actually changed.
		await card.click({ delay: LONG_PRESS_DELAY });
		await expect(menu).toBeVisible({ timeout: 3000 });
		await expect(statusLine).not.toHaveText(before ?? "");
	});

	test("clicking the backdrop closes the menu without changing the status", async ({ page }) => {
		const card = page.getByTestId("clothes-card").first();
		await card.click({ delay: LONG_PRESS_DELAY });

		const menu = page.getByRole("menu", { name: /status quick actions/i });
		await expect(menu).toBeVisible({ timeout: 3000 });
		const statusLine = menu.locator(".card-quick-actions__status");
		const before = await statusLine.textContent();

		// The backdrop and panel are both `inset: 0` and centered concentrically,
		// so a default center-click on the backdrop lands on the panel above it.
		// Click a corner instead, clear of the centered panel.
		await page.getByTestId("quick-actions-backdrop").click({ position: { x: 5, y: 5 } });
		await expect(menu).toBeHidden({ timeout: 3000 });

		await card.click({ delay: LONG_PRESS_DELAY });
		await expect(statusLine).toHaveText(before ?? "");
	});

	test("Escape closes the menu without changing the status", async ({ page }) => {
		const card = page.getByTestId("clothes-card").first();
		await card.click({ delay: LONG_PRESS_DELAY });

		const menu = page.getByRole("menu", { name: /status quick actions/i });
		await expect(menu).toBeVisible({ timeout: 3000 });
		const statusLine = menu.locator(".card-quick-actions__status");
		const before = await statusLine.textContent();

		await page.keyboard.press("Escape");
		await expect(menu).toBeHidden({ timeout: 3000 });

		await card.click({ delay: LONG_PRESS_DELAY });
		await expect(statusLine).toHaveText(before ?? "");
	});

	test("a normal (short) click still flips the card — long-press wiring doesn't break tap-to-flip", async ({ page }) => {
		const card = page.getByTestId("clothes-card").first();
		await card.click(); // default delay is well under the long-press threshold
		await expect(card).toHaveClass(/flipped/);
		await expect(page.getByRole("menu", { name: /status quick actions/i })).toBeHidden();
	});
});
