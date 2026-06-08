import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright E2E config — cross-browser/device matrix.
 *
 * Tests live in ./e2e (kept out of Vitest's `src/**` unit suite — see the
 * `exclude` in vite.config.ts). Run with `npm run test:e2e`.
 *
 * The dev server is started automatically via `webServer` below. Locally it
 * reuses an already-running `npm run dev`; in CI it boots a fresh one.
 */
const PORT = 5173;
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
	testDir: "./e2e",
	/* Run tests within a file in parallel */
	fullyParallel: true,
	/* Fail the build on CI if a test.only was left in the source. */
	forbidOnly: !!process.env.CI,
	/* Retry on CI only. */
	retries: process.env.CI ? 2 : 0,
	/* Opt out of parallel workers on CI for stability. */
	workers: process.env.CI ? 1 : undefined,
	reporter: "html",
	use: {
		baseURL,
		/* Capture a trace on the first retry of a failing test. */
		trace: "on-first-retry",
	},

	/* Browser/device matrix — mirrors the matrix in TESTING_PLAN.md.
	   P0: chromium, webkit (desktop Safari), Mobile Safari.
	   P1: firefox, Mobile Chrome. */
	projects: [
		{ name: "chromium", use: { ...devices["Desktop Chrome"] } },
		{ name: "firefox", use: { ...devices["Desktop Firefox"] } },
		{ name: "webkit", use: { ...devices["Desktop Safari"] } },
		{ name: "Mobile Safari", use: { ...devices["iPhone 13"] } },
		{ name: "Mobile Chrome", use: { ...devices["Pixel 5"] } },
	],

	/* Start the Vite dev server before the tests run. */
	webServer: {
		command: "npm run dev",
		url: baseURL,
		reuseExistingServer: !process.env.CI,
		timeout: 120_000,
	},
});
