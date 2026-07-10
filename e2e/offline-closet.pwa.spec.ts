import { test, expect } from "@playwright/test";
import { skipOnboarding } from "./helpers/navHelpers";

/**
 * E5-3.1 / US-5.3 — cached closet viewable offline.
 *
 * Runs against a production preview build (playwright.pwa.config.ts) because
 * the service worker is disabled in dev. Flow: first visit installs the SW and
 * persists the closet to localStorage; cutting the network and reloading must
 * still serve the app shell (Workbox precache) and render the closet cards
 * (localStorage seed via useCloudCloset — NOT SW response caching; the SW
 * deliberately never caches *.supabase.co).
 */
test.describe("Offline closet (PWA)", () => {
	test("app shell + closet render fully offline", async ({ page, context }) => {
		await skipOnboarding(page);

		// First (online) visit: closet renders, SW installs + takes control.
		await page.goto("/");
		await expect(page.getByTestId("clothes-card").first()).toBeVisible({ timeout: 10_000 });
		await page.waitForFunction(() => navigator.serviceWorker?.controller != null, undefined, {
			timeout: 20_000,
		});
		await page.waitForFunction(() => localStorage.getItem("my_closet_key") !== null);

		// Cut the network and cold-reload.
		await context.setOffline(true);
		await page.reload();

		expect(await page.evaluate(() => navigator.onLine)).toBe(false);
		// App shell served from the SW precache… (on mobile both the top nav
		// and the bottom "Primary" nav render — first() avoids strict mode)
		await expect(
			page.getByRole("navigation", { name: "Primary" }).or(page.locator(".top-nav")).first(),
		).toBeVisible({ timeout: 10_000 });
		// …and the closet renders from the localStorage mirror.
		await expect(page.getByTestId("clothes-card").first()).toBeVisible({ timeout: 10_000 });
	});

	test("service worker precache never includes Supabase responses", async ({ page }) => {
		await skipOnboarding(page);
		await page.goto("/");
		await page.waitForFunction(() => navigator.serviceWorker?.controller != null, undefined, {
			timeout: 20_000,
		});

		// Guard against the stale-rows/auth-caching trap: no cached entry may
		// point at Supabase (REST, auth, or storage).
		const cachedSupabaseUrls = await page.evaluate(async () => {
			const names = await caches.keys();
			const urls: string[] = [];
			for (const name of names) {
				const cache = await caches.open(name);
				for (const req of await cache.keys()) {
					if (req.url.includes("supabase")) urls.push(req.url);
				}
			}
			return urls;
		});
		expect(cachedSupabaseUrls).toEqual([]);
	});
});
