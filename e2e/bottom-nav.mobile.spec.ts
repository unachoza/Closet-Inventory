import { test, expect } from "@playwright/test";
import { skipOnboarding } from "./helpers/navHelpers";

/**
 * E5-1.2 / E5-1.3 — mobile bottom navigation + Add-Item FAB.
 * Mechanical checks: bar visible + thumb-sized on phones, tabs navigate,
 * FAB opens the add-item form, and the fixed bar never hides page content
 * (app-content reserves matching bottom padding).
 */
test.describe("Bottom navigation — mobile", () => {
	test.beforeEach(async ({ page }) => {
		await skipOnboarding(page);
		await page.goto("/");
		await expect(page.getByTestId("clothes-card").first()).toBeVisible({ timeout: 8000 });
	});

	test("bar is visible with 4 tabs + Add FAB, all ≥44px tall", async ({ page }) => {
		const nav = page.getByRole("navigation", { name: "Primary" });
		await expect(nav).toBeVisible();

		for (const name of ["Home", "Closet", "Search", "Import", "Add Item"]) {
			const btn = nav.getByRole("button", { name });
			await expect(btn).toBeVisible();
			const box = await btn.boundingBox();
			expect(box, `${name} should have a bounding box`).not.toBeNull();
			expect(box!.height, `${name} tap target is under 44px`).toBeGreaterThanOrEqual(43);
		}
	});

	test("tabs navigate: Import→gmail, Search→entireCloset, Home→carousel", async ({ page }) => {
		const nav = page.getByRole("navigation", { name: "Primary" });

		await nav.getByRole("button", { name: "Import" }).tap();
		await expect(page.getByRole("heading", { name: /import from gmail/i })).toBeVisible();
		await expect(nav.getByRole("button", { name: "Import" })).toHaveAttribute("aria-current", "page");

		await nav.getByRole("button", { name: "Search" }).tap();
		await expect(page.locator(".search-sort-bar__input")).toBeVisible();

		await nav.getByRole("button", { name: "Home" }).tap();
		await expect(page.getByTestId("carousel")).toBeVisible();
	});

	test("Add FAB opens the add-item form (out of the hamburger)", async ({ page }) => {
		await page.getByRole("navigation", { name: "Primary" }).getByRole("button", { name: "Add Item" }).tap();
		await expect(page.locator("form")).toBeVisible();
	});

	test("bar does not cover the last card (app-content reserves clearance)", async ({ page }) => {
		const nav = page.getByRole("navigation", { name: "Primary" });
		const navBox = await nav.boundingBox();
		expect(navBox).not.toBeNull();

		// Scroll to the bottom of the content area.
		await page.locator(".app-content").evaluate((el) => el.scrollTo(0, el.scrollHeight));
		await page.waitForTimeout(200);

		const cards = page.getByTestId("clothes-card");
		const last = cards.nth((await cards.count()) - 1);
		const lastBox = await last.boundingBox();
		expect(lastBox).not.toBeNull();

		// Fully scrolled, the last card's bottom must clear the bar's top edge.
		expect(
			lastBox!.y + lastBox!.height,
			"last card is hidden under the bottom nav",
		).toBeLessThanOrEqual(navBox!.y + 1);
	});
});
