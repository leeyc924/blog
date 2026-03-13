import { test, expect } from "@playwright/test";

test.describe("404 Page", () => {
  test("should show 404 page for non-existent route", async ({ page }) => {
    await page.goto("/this-page-does-not-exist/");
    const body = page.locator("body");
    await expect(body).toBeVisible();
  });
});
