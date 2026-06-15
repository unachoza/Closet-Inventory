import { defineConfig, devices } from "@playwright/test";

/**
 * E2E config covering mobile and desktop viewports. Tests live in ./e2e and
 * are run with `npm run test:e2e` (separate from the Vitest unit suite).
 *
 * The webServer block boots Vite automatically; locally it reuses an already
 * running dev server if you have one on :5173.
 */
const PORT = 5173;
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
	testDir: "./e2e",
	// Snapshots (toHaveScreenshot baselines) live next to the specs.
	snapshotDir: "./e2e/__screenshots__",
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 1 : 0,
	reporter: [["html", { open: "never" }], ["list"]],

	use: {
		baseURL: BASE_URL,
		trace: "on-first-retry",
		screenshot: "only-on-failure",
	},

	// Visual baselines run over screens with a photographic background + async
	// card images, so allow a small per-pixel + ratio tolerance to absorb
	// anti-aliasing/image-load noise without masking real layout regressions.
	expect: {
		toHaveScreenshot: {
			animations: "disabled",
			caret: "hide",
			maxDiffPixelRatio: 0.02,
		},
	},

	projects: [
		{
			name: "Mobile Safari (iPhone 13)",
			use: { ...devices["iPhone 13"] },
		},
		{
			name: "Mobile Chrome (Pixel 7)",
			use: { ...devices["Pixel 7"] },
		},
		{
			name: "Desktop Chrome",
			use: { ...devices["Desktop Chrome"] },
		},
		{
			name: "Desktop Safari (WebKit)",
			use: { ...devices["Desktop Safari"] },
		},
	],

	webServer: {
		command: "npm run dev",
		url: BASE_URL,
		reuseExistingServer: !process.env.CI,
		timeout: 120_000,
	},
});
