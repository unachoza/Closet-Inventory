import { test, expect, type Page } from "@playwright/test";

/**
 * Drag-and-drop reordering on the closet overview grid.
 *
 * Reorder is driven by @dnd-kit's PointerSensor with an 8px activation
 * distance, so a real drag needs a press + several incremental moves past the
 * threshold + release. Playwright's single `dragTo` doesn't always clear the
 * sensor, so we drive page.mouse manually with intermediate steps.
 *
 * The new order is persisted to localStorage under `my_closet_key`; we assert
 * against that as the source of truth (the DOM reflects it, but the persisted
 * array is what survives reloads).
 */

const STORAGE_KEY = "my_closet_key";

async function readOrder(page: Page): Promise<string[]> {
	return page.evaluate((key) => {
		const raw = localStorage.getItem(key);
		return raw ? JSON.parse(raw).map((i: { id: string }) => i.id) : [];
	}, STORAGE_KEY);
}

/** Press a drag handle and move it onto a target handle in small steps. */
async function dragHandleOnto(page: Page, fromIndex: number, toIndex: number, handleSelector = ".drag-handle") {
	const handles = page.locator(handleSelector);
	const from = await handles.nth(fromIndex).boundingBox();
	const to = await handles.nth(toIndex).boundingBox();
	if (!from || !to) throw new Error("drag handles not found");

	const startX = from.x + from.width / 2;
	const startY = from.y + from.height / 2;
	const endX = to.x + to.width / 2;
	const endY = to.y + to.height / 2;

	await page.mouse.move(startX, startY);
	await page.mouse.down();
	// Several intermediate moves so the PointerSensor activates and dnd-kit can
	// compute collisions against the target.
	const steps = 8;
	for (let i = 1; i <= steps; i++) {
		await page.mouse.move(startX + ((endX - startX) * i) / steps, startY + ((endY - startY) * i) / steps);
		await page.waitForTimeout(20);
	}
	// Settle on the target a beat before releasing.
	await page.mouse.move(endX, endY);
	await page.waitForTimeout(50);
	await page.mouse.up();
	await page.waitForTimeout(100);
}

test.describe("Closet overview — drag to reorder", () => {
	test.beforeEach(async ({ page }) => {
		// Skip the first-run onboarding screen so the closet (and its cards)
		// render on landing. Must run before any page script executes.
		await page.addInitScript(() => {
			localStorage.setItem("closetly-onboarding-complete", "true");
		});
		await page.goto("/");
		await expect(page.getByTestId("clothes-card").first()).toBeVisible();
	});

	test("each card has a drag handle", async ({ page }) => {
		const handles = page.locator(".drag-handle");
		await expect(handles.first()).toBeVisible();
		expect(await handles.count()).toBeGreaterThan(1);
		await expect(handles.first()).toHaveAccessibleName(/drag to reorder/i);
	});

	test("dragging the first card onto the third changes the persisted order", async ({ page }) => {
		const before = await readOrder(page);
		expect(before.length).toBeGreaterThanOrEqual(3);

		await dragHandleOnto(page, 0, 2);

		const after = await readOrder(page);
		// The order must change, and the formerly-first item must no longer be first.
		expect(after).not.toEqual(before);
		expect(after[0]).not.toBe(before[0]);
		// No items lost or duplicated.
		expect([...after].sort()).toEqual([...before].sort());
	});

	test("reordered position survives a page reload", async ({ page }) => {
		await dragHandleOnto(page, 0, 2);
		const afterDrag = await readOrder(page);

		await page.reload();
		await expect(page.getByTestId("clothes-card").first()).toBeVisible();

		const afterReload = await readOrder(page);
		expect(afterReload).toEqual(afterDrag);
	});
});

test.describe("Entire-closet (filtered) grid — drag to reorder", () => {
	const FILTERED_HANDLE = ".filtered-items-parent .drag-handle";

	test.beforeEach(async ({ page }) => {
		await page.addInitScript(() => {
			localStorage.setItem("closetly-onboarding-complete", "true");
		});
		await page.goto("/");
		await expect(page.getByTestId("clothes-card").first()).toBeVisible();

		// Navigate to the "View All" (entire closet) screen.
		await page.getByRole("button", { name: /open menu/i }).click();
		await page.getByRole("button", { name: /view all/i }).click();
		await expect(page.locator(".filtered-items-parent")).toBeVisible();
		await expect(page.locator(FILTERED_HANDLE).first()).toBeVisible();
	});

	test("dragging reorders the persisted closet (regression: this grid used to no-op)", async ({ page }) => {
		const before = await readOrder(page);
		expect(before.length).toBeGreaterThanOrEqual(4);

		await dragHandleOnto(page, 0, 3, FILTERED_HANDLE);

		const after = await readOrder(page);
		expect(after).not.toEqual(before);
		// No items lost or duplicated.
		expect([...after].sort()).toEqual([...before].sort());
	});
});
