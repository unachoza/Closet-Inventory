import { test, expect } from "@playwright/test";

/**
 * Cross-browser smoke test — the bootstrap for the E2E suite.
 *
 * Goal: prove the app boots and renders its landing view identically across
 * the whole browser/device matrix (chromium, firefox, webkit, Mobile Safari,
 * Mobile Chrome) with no uncaught JS errors. Catching a script that throws in
 * WebKit but not Chromium is exactly the class of bug this harness exists for.
 *
 * Deliberately viewport-agnostic and OAuth-free so it stays green on `main`.
 * Richer flows (add-item, search/filter, mobile modals) build on top of this.
 */

test.describe("app smoke", () => {
	test("loads the landing view with no uncaught page errors", async ({ page }) => {
		const pageErrors: Error[] = [];
		page.on("pageerror", (err) => pageErrors.push(err));

		await page.goto("/");

		// Default view is the carousel (ViewProvider initialView="carousel").
		await expect(page.getByRole("heading", { name: "My Closet Inventory" })).toBeVisible();
		await expect(page.getByTestId("carousel")).toBeVisible();
		await expect(page.getByTestId("closet-container")).toBeVisible();

		expect(pageErrors, `Uncaught page errors:\n${pageErrors.map((e) => e.message).join("\n")}`).toEqual([]);
	});

	test("exposes the primary navigation entry point", async ({ page }) => {
		await page.goto("/");

		// The hamburger menu trigger is present on every viewport (its visibility
		// is CSS-driven; existence is the cross-viewport-stable assertion).
		await expect(page.getByRole("button", { name: "Open menu" })).toBeAttached();
	});
});
