import { test, expect } from "@playwright/test";

/**
 * E2E: analytics/error-tracking consent banner.
 *
 * Covers only what the unit tests can't — real-browser render + click +
 * localStorage persistence across a reload. The analytics SDKs themselves are
 * NOT asserted here (they need live keys); the unit suite mocks and verifies
 * that wiring.
 *
 * Deliberately points at :5199 (the `closet-preview` server) instead of the
 * default :5173 baseURL — :5173 is frequently occupied by a manually-run dev
 * server, so this avoids the port conflict. Start it with the `closet-preview`
 * launch config before running: it must be listening on 5199.
 */
const BASE = "http://localhost:5199";

// This spec seeds its own consent state, so skip the shared skipOnboarding
// helper (which pre-declines consent and would hide the banner).
test.describe("Analytics consent banner", () => {
	test.beforeEach(async ({ page }) => {
		// Bypass the onboarding overlay but leave consent undecided so the banner shows.
		await page.addInitScript(() => {
			localStorage.setItem("closetly-onboarding-complete", "true");
		});
	});

	test("shows on first visit, and Accept dismisses it + persists across reload", async ({ page }) => {
		await page.goto(BASE);

		const banner = page.getByRole("dialog", { name: /consent/i });
		await expect(banner).toBeVisible();

		await banner.getByRole("button", { name: /accept/i }).click();
		await expect(banner).toBeHidden();

		// Persistence: a reload must NOT bring the banner back.
		await page.reload();
		await expect(page.getByRole("dialog", { name: /consent/i })).toBeHidden();
	});

	test("Decline also dismisses and persists", async ({ page }) => {
		await page.goto(BASE);

		const banner = page.getByRole("dialog", { name: /consent/i });
		await expect(banner).toBeVisible();

		await banner.getByRole("button", { name: /decline/i }).click();
		await expect(banner).toBeHidden();

		await page.reload();
		await expect(page.getByRole("dialog", { name: /consent/i })).toBeHidden();
	});
});
