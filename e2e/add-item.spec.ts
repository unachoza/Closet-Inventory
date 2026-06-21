import { test, expect } from "@playwright/test";
import { clickNavAction, skipOnboarding } from "./helpers/navHelpers";

/**
 * E2E: Add Item — full 9-step form flow.
 *
 * Runs across all configured projects (mobile + desktop).
 * Verifies the happy path: navigate all 9 steps, submit, item appears in grid.
 * Also verifies back-navigation and the category dropdown default.
 */

test.describe("Add Item — 9-step form", () => {
	test.beforeEach(async ({ page }) => {
		await skipOnboarding(page);
		await page.goto("/");
		await expect(page.getByTestId("clothes-card").first()).toBeVisible({ timeout: 8000 });
	});

	test("navigates through all 9 steps and submits", async ({ page }) => {
		await clickNavAction(page, /add item/i);

		const form = page.getByTestId("multistep-form");
		await expect(form).toBeVisible();

		// Step 1 — Category: open the custom dropdown and pick "Tops"
		await expect(form.getByText(/clothing category/i)).toBeVisible();
		await form.locator(".dropdown-header").click();
		await form.locator(".dropdown-option", { hasText: "Tops" }).click();
		await form.getByRole("button", { name: /next/i }).click();

		// Step 2 — Color: pick "black" (Radix Checkbox renders as role="checkbox")
		await expect(form.getByText(/color/i).first()).toBeVisible();
		await form.getByRole("checkbox", { name: "black" }).click();
		await form.getByRole("button", { name: /next/i }).click();

		// Step 3 — Size
		await expect(form.getByText(/size/i).first()).toBeVisible();
		await form.getByRole("checkbox", { name: "m" }).click();
		await form.getByRole("button", { name: /next/i }).click();

		// Step 4 — Brand (CheckPill, also Radix Checkbox)
		await expect(form.getByText(/brand/i).first()).toBeVisible();
		await form.getByRole("checkbox", { name: "zara" }).click();
		await form.getByRole("button", { name: /next/i }).click();

		// Step 5 — Material (skip)
		await expect(form.getByText(/material composition/i)).toBeVisible();
		await form.getByRole("button", { name: /next/i }).click();

		// Step 6 — Occasion (skip)
		await expect(form.getByText(/occasion/i).first()).toBeVisible();
		await form.getByRole("button", { name: /next/i }).click();

		// Step 7 — Condition & Purchase Date (skip)
		await expect(form.getByText(/condition/i).first()).toBeVisible();
		await form.getByRole("button", { name: /next/i }).click();

		// Step 8 — Care (skip)
		await expect(form.getByText(/care instructions/i).first()).toBeVisible();
		await form.getByRole("button", { name: /next/i }).click();

		// Step 9 — Photo → Submit
		await expect(form.getByText(/photo/i).first()).toBeVisible();
		await form.getByRole("button", { name: /submit/i }).click();

		// Toast confirms success
		await expect(page.getByText(/added to your closet/i)).toBeVisible({ timeout: 5000 });

		// Back in the grid with at least one card
		await expect(page.getByTestId("clothes-card").first()).toBeVisible({ timeout: 5000 });
	});

	test("back button returns to previous step", async ({ page }) => {
		await clickNavAction(page, /add item/i);

		const form = page.getByTestId("multistep-form");
		await expect(form).toBeVisible();

		// Advance to step 2
		await form.getByRole("button", { name: /next/i }).click();
		await expect(form.getByText(/color/i).first()).toBeVisible();

		// Go back to step 1
		await form.getByRole("button", { name: /back/i }).click();
		await expect(form.getByText(/clothing category/i)).toBeVisible();
	});

	test("category dropdown shows Tops as first option", async ({ page }) => {
		await clickNavAction(page, /add item/i);

		const form = page.getByTestId("multistep-form");
		await expect(form).toBeVisible();

		// Open the dropdown and verify "Tops" is among the first options
		await form.locator(".dropdown-header").click();
		await expect(form.locator(".dropdown-option").first()).toContainText(/tops/i);
	});
});
