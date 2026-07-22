import { test, expect, type Page } from "@playwright/test";

/**
 * New-user onboarding flow (tour → sign-in → install → closet). Deliberately
 * does NOT call skipOnboarding() — a fresh browser context is the new-user
 * state. Real Google OAuth can't run here, so the flow is exercised through
 * the "Skip for now" local-mode path; the authenticated name step is covered
 * by unit tests with a mocked auth context.
 */

async function seedConsentOnly(page: Page): Promise<void> {
	await page.addInitScript(() => {
		localStorage.setItem("closetly-analytics-consent", "declined");
	});
}

test.describe("onboarding — new user", () => {
	test("walks the tour, skips sign-in, and lands in the closet", async ({ page }) => {
		await seedConsentOnly(page);
		await page.goto("/");

		// Tour: four value screens.
		await expect(page.getByRole("heading", { name: /your closet/i })).toBeVisible();
		await page.getByRole("button", { name: /^next$/i }).click();
		await expect(page.getByRole("heading", { name: /your inbox already knows/i })).toBeVisible();
		await page.getByRole("button", { name: /^next$/i }).click();
		await expect(page.getByRole("heading", { name: /care for what you love/i })).toBeVisible();
		await page.getByRole("button", { name: /^next$/i }).click();
		await expect(page.getByRole("heading", { name: /find anything in seconds/i })).toBeVisible();
		await page.getByRole("button", { name: /get started/i }).click();

		// Sign-in screen with the unverified-app reassurance.
		await expect(page.getByRole("button", { name: /sign in with google/i })).toBeVisible();
		await expect(page.getByText(/Google will display an additional verification/i)).toBeVisible();
		await page.getByRole("button", { name: /skip for now/i }).click();

		// Install card, then done.
		await expect(page.getByRole("heading", { name: /one tap away/i })).toBeVisible();
		await page.getByRole("button", { name: /maybe later/i }).click();

		// Landed in the app; completion flag persisted.
		await expect(page.locator(".top-nav")).toBeVisible();
		const flag = await page.evaluate(() => localStorage.getItem("closetly-onboarding-complete"));
		expect(flag).toBe("true");

		// Reload must not re-show the tour.
		await page.reload();
		await expect(page.locator(".top-nav")).toBeVisible();
		await expect(page.getByRole("heading", { name: /your closet, in your pocket/i })).toHaveCount(0);
	});

	test("Skip on the tour still routes through the sign-in decision", async ({ page }) => {
		await seedConsentOnly(page);
		await page.goto("/");
		await expect(page.getByRole("heading", { name: /your closet/i })).toBeVisible();
		await page.getByRole("button", { name: /^skip$/i }).click();
		await expect(page.getByRole("button", { name: /sign in with google/i })).toBeVisible();
	});

	test("resumes at sign-in when OAuth was cancelled mid-flow", async ({ page }) => {
		await seedConsentOnly(page);
		await page.addInitScript(() => {
			localStorage.setItem("closetly-onboarding-stage", "awaiting-auth");
		});
		await page.goto("/");
		await expect(page.getByRole("button", { name: /sign in with google/i })).toBeVisible();
		await expect(page.getByText(/Google will display an additional verification/i)).toBeVisible();
	});

	test("resumes at the install card after a reload during the final steps", async ({ page }) => {
		await seedConsentOnly(page);
		await page.addInitScript(() => {
			localStorage.setItem("closetly-onboarding-stage", "install");
		});
		await page.goto("/");
		await expect(page.getByRole("heading", { name: /one tap away/i })).toBeVisible();
	});

	test("signed-out profile view offers Google sign-in", async ({ page }) => {
		await seedConsentOnly(page);
		await page.addInitScript(() => {
			localStorage.setItem("closetly-onboarding-complete", "true");
		});
		await page.goto("/");
		await page.getByRole("button", { name: /^profile$/i }).click();
		await expect(page.getByRole("button", { name: /sign in with google/i })).toBeVisible();
		await expect(page.getByText(/nothing to wear · v/i)).toBeVisible();
	});
});
