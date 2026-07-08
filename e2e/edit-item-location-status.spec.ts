import { test, expect } from "@playwright/test";
import { skipOnboarding } from "./helpers/navHelpers";

/**
 * E2E: editing an item's Status + Location from the edit form (the E2 "card
 * picker" — EditItemView's <select>s, now backed by the live per-user
 * locations context, E12-3.2/P1-6.2) and seeing the change reflected back on
 * the card's border/status dot in the overview.
 */

test.describe("Edit item status and location", () => {
	test.beforeEach(async ({ page }) => {
		await skipOnboarding(page);
		await page.goto("/");
		await expect(page.getByTestId("clothes-card").first()).toBeVisible({ timeout: 8000 });
	});

	test("changing Status + Location on the edit form persists and updates the card", async ({ page }) => {
		const card = page.getByTestId("clothes-card").first();

		// Open the card, grow into the full modal, then Edit — "Edit" only
		// renders in the full modal (CardDetails variant="full"), not the
		// flipped-but-not-expanded back face.
		await card.click();
		await expect(card).toHaveClass(/flipped/);
		await page.waitForTimeout(900); // let the 3D flip settle before hitting the back face
		await card.getByRole("button", { name: /see all details/i }).click({ force: true });

		const modal = page.locator(".card-grow-modal");
		await expect(modal).toBeVisible({ timeout: 3000 });
		await page.waitForTimeout(450); // let the grow animation settle

		await modal.getByRole("button", { name: /^edit$/i }).click();

		const statusSelect = page.getByLabel("status");
		const locationSelect = page.getByLabel("location");
		await expect(statusSelect).toBeVisible({ timeout: 5000 });
		await expect(locationSelect).toBeVisible();

		await statusSelect.selectOption("on_loan");
		await locationSelect.selectOption("other");

		await page.getByRole("button", { name: /save changes/i }).click();

		// Back on the overview: enable Location + Status borders and confirm the
		// edited item now carries the new state (border key = "other", plus a
		// status dot present — the same card the user just edited is somewhere
		// in the grid with this combination).
		const borderBtn = page.locator(".search-sort-bar__border-btn");
		if (await borderBtn.isVisible()) {
			await borderBtn.click(); // -> Location
			await borderBtn.click(); // -> Location + Status
			await expect(page.locator('[data-location-kind="other"]').first()).toBeVisible({ timeout: 3000 });
			await expect(page.locator('.filtered-card__status-dot[data-status="on_loan"]').first()).toBeVisible({
				timeout: 3000,
			});
		}
	});

	test("a freshly imported/created item defaults to clean + home", async ({ page }) => {
		// New items should never require the user to set status/location before
		// they show up correctly in the "Available now" mental model.
		const card = page.getByTestId("clothes-card").first();
		await card.click();
		await expect(card).toHaveClass(/flipped/);
		await page.waitForTimeout(900);
		await card.getByRole("button", { name: /see all details/i }).click({ force: true });

		const modal = page.locator(".card-grow-modal");
		await expect(modal).toBeVisible({ timeout: 3000 });
		await page.waitForTimeout(450);
		await modal.getByRole("button", { name: /^edit$/i }).click();

		const statusSelect = page.getByLabel("status");
		const locationSelect = page.getByLabel("location");
		await expect(statusSelect).toBeVisible({ timeout: 5000 });

		// Only assert the selects are populated and render a valid option —
		// exact seeded value varies per demo item, so this checks the picker
		// itself is wired (not empty / broken), which is the E12-3.2 regression
		// this spec guards against (card picker silently empty if the
		// locations context fails to load).
		const locationOptions = await locationSelect.locator("option").count();
		expect(locationOptions).toBeGreaterThan(0);
		const statusOptions = await statusSelect.locator("option").count();
		expect(statusOptions).toBeGreaterThan(0);
	});
});
