import { defineConfig, devices } from "@playwright/test";

/**
 * E2E config focused on mobile viewports. Tests live in ./e2e and are run with
 * `npm run test:e2e` (separate from the Vitest unit suite).
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

	projects: [
		{
			name: "Mobile Safari (iPhone 13)",
			use: { ...devices["iPhone 13"] },
		},
		{
			name: "Mobile Chrome (Pixel 7)",
			use: { ...devices["Pixel 7"] },
		},
	],

	webServer: {
		command: "npm run dev",
		url: BASE_URL,
		reuseExistingServer: !process.env.CI,
		timeout: 120_000,
	},
});
