import { defineConfig, devices } from "@playwright/test";

/**
 * PWA/offline e2e config (E5-3.1). The service worker is disabled in dev
 * (`devOptions.enabled: false`), so these specs must run against a production
 * `vite preview` of the built app — a separate webServer from the main
 * playwright.config.ts dev-server suite. Run with `npm run test:e2e:pwa`.
 *
 * Chromium-only: Playwright's WebKit has unreliable service-worker +
 * setOffline behaviour; the SW code path itself is browser-neutral Workbox.
 */
// Not vite's default 4173 — other local projects tend to occupy it.
const PORT = 4174;
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
	testDir: "./e2e",
	testMatch: /\.pwa\.spec\.ts$/,
	fullyParallel: false,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 1 : 0,
	reporter: [["list"]],

	use: {
		baseURL: BASE_URL,
		trace: "on-first-retry",
		screenshot: "only-on-failure",
	},

	projects: [
		{
			name: "Mobile Chrome (Pixel 7)",
			use: { ...devices["Pixel 7"] },
		},
		{
			name: "Desktop Chrome",
			use: { ...devices["Desktop Chrome"] },
		},
	],

	webServer: {
		command: `npm run build && npm run preview -- --port ${PORT} --strictPort`,
		url: BASE_URL,
		// Never reuse: a stale preview server would test an old build.
		reuseExistingServer: false,
		timeout: 240_000,
	},
});
