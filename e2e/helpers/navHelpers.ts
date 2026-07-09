import type { Page } from "@playwright/test";

/**
 * Click a nav action button ("Add Item", "View All", etc.).
 *
 * On desktop the buttons are visible in `.nav-actions` (top bar). On narrow
 * mobile viewports CSS may hide them; they're then accessible via the hamburger
 * drawer. This helper checks `.nav-actions` first and falls back to the drawer.
 */
export async function clickNavAction(page: Page, label: string | RegExp): Promise<void> {
	// Prefer the top-bar nav-actions (desktop / wide)
	const directBtn = page.locator(".nav-actions").getByRole("button", { name: label });
	if (await directBtn.isVisible()) {
		await directBtn.click();
		return;
	}

	// Fall back: open hamburger, click from the drawer
	await page.getByRole("button", { name: "Open menu" }).click();
	await page.locator(".nav-drawer").waitFor({ state: "visible" });
	await page.locator(".nav-drawer__actions").getByRole("button", { name: label }).click();
}

/**
 * Seed localStorage before the app boots to bypass the onboarding overlay and
 * the analytics-consent banner, so neither intrudes on unrelated flows. The
 * consent banner has its own dedicated spec (consent-banner.spec.ts) which does
 * NOT call this helper. Consent is seeded "declined" so no analytics SDK loads
 * during e2e runs.
 */
export async function skipOnboarding(page: Page): Promise<void> {
	await page.addInitScript(() => {
		localStorage.setItem("closetly-onboarding-complete", "true");
		localStorage.setItem("closetly-analytics-consent", "declined");
	});
}
