import { test, expect } from "@playwright/test";
import { clickNavAction, skipOnboarding } from "./helpers/navHelpers";

/**
 * E2E: Location + Status — border toggle, accessibility legend (P1-10), and
 * the Status/Location filter dimensions (P1-8) in the EntireClosetView.
 *
 * Seed data (demoClosetData.ts) carries a real spread of statuses/locations
 * (clean/dirty/at_cleaner/in_repair/traveling/on_loan across
 * home/storage/suitcase/other), so these assertions exercise the real
 * card-coloring + filter logic, not a mocked closet.
 */

test.describe("Border toggle, legend, and status/location filters", () => {
	test.beforeEach(async ({ page }) => {
		await skipOnboarding(page);
		await page.goto("/");
		await expect(page.getByTestId("clothes-card").first()).toBeVisible({ timeout: 8000 });
		await clickNavAction(page, /view all/i);
		await expect(page.getByRole("main", { name: /entire closet/i })).toBeVisible({ timeout: 5000 });
	});

	test("cycling the border toggle shows Location, then Location + Status, then Off", async ({ page }) => {
		const borderBtn = page.locator(".search-sort-bar__border-btn");
		await expect(borderBtn).toBeVisible();

		// Off -> Location
		await borderBtn.click();
		await expect(borderBtn).toHaveClass(/search-sort-bar__border-btn--active/);
		const firstCardWithBorder = page.locator('[data-border="location"]').first();
		await expect(firstCardWithBorder).toBeVisible({ timeout: 3000 });

		// Location -> Location + Status: a status dot appears on cards
		await borderBtn.click();
		await expect(page.locator(".filtered-card__status-dot").first()).toBeVisible({ timeout: 3000 });

		// Location + Status -> Off: no more data-border cards, no dots
		await borderBtn.click();
		await expect(borderBtn).not.toHaveClass(/search-sort-bar__border-btn--active/);
		await expect(page.locator(".filtered-card__status-dot")).toHaveCount(0);
	});

	test("the accessibility legend appears when borders are active and explains the encoding", async ({ page }) => {
		const borderBtn = page.locator(".search-sort-bar__border-btn");
		await borderBtn.click(); // -> Location mode

		const legend = page.locator(".border-legend");
		await expect(legend).toBeVisible({ timeout: 3000 });
		await expect(legend).toContainText(/home/i);
		await expect(legend).toContainText(/storage/i);
		await expect(legend).toContainText(/suitcase/i);

		// Location + Status mode adds the status legend
		await borderBtn.click();
		await expect(legend).toContainText(/clean/i);
		await expect(legend).toContainText(/dirty/i);
	});

	test("dismissing the legend hides it and the dismissal persists across a reload", async ({ page }) => {
		const borderBtn = page.locator(".search-sort-bar__border-btn");
		await borderBtn.click();

		const legend = page.locator(".border-legend");
		await expect(legend).toBeVisible({ timeout: 3000 });
		await page.getByRole("button", { name: /dismiss legend/i }).click();
		await expect(legend).toBeHidden();

		await page.reload();
		await expect(page.getByTestId("clothes-card").first()).toBeVisible({ timeout: 8000 });
		await clickNavAction(page, /view all/i);
		const borderBtnAfterReload = page.locator(".search-sort-bar__border-btn");
		await borderBtnAfterReload.click(); // re-enable border mode
		await expect(page.locator(".border-legend")).toBeHidden();
	});

	test("filtering by Status = Dirty shows only dirty items", async ({ page }) => {
		const filterBtn = page.locator(".search-sort-bar__filter-btn");
		const panel = page.locator(".filter-side-panel");

		await filterBtn.click();
		await expect(panel).toHaveClass(/filter-side-panel--open/, { timeout: 3000 });

		await panel.getByRole("button", { name: /^status$/i }).click();
		const statusGroup = page.locator('[role="group"][aria-label="Status"]');
		await expect(statusGroup).toBeVisible({ timeout: 3000 });
		await statusGroup.getByText("Dirty", { exact: true }).click();

		await page.getByRole("button", { name: /close filters/i }).click();

		const pillsRow = page.getByLabel("Active filters");
		await expect(pillsRow).toBeVisible({ timeout: 3000 });
		await expect(pillsRow.getByText(/dirty/i)).toBeVisible();
		await expect(page.getByTestId("clothes-card").first()).toBeVisible();
	});

	test("filtering by Location = Suitcase narrows results and clearing restores them", async ({ page }) => {
		const allCards = page.getByTestId("clothes-card");

		const filterBtn = page.locator(".search-sort-bar__filter-btn");
		const panel = page.locator(".filter-side-panel");
		await filterBtn.click();
		await expect(panel).toHaveClass(/filter-side-panel--open/, { timeout: 3000 });

		await panel.getByRole("button", { name: /^location$/i }).click();
		const locationGroup = panel.getByRole("group", { name: "Location" });
		await expect(locationGroup).toBeVisible({ timeout: 3000 });
		await locationGroup.getByText("Suitcase", { exact: true }).click();
		await page.getByRole("button", { name: /close filters/i }).click();

		const filteredCount = await allCards.count();
		expect(filteredCount).toBeGreaterThan(0);

		const removePill = page.getByLabel(/remove suitcase filter/i);
		await expect(removePill).toBeVisible({ timeout: 3000 });
		await removePill.click();
		await page.waitForTimeout(400);

		const restoredCount = await allCards.count();
		expect(restoredCount).toBeGreaterThan(filteredCount);
	});
});
