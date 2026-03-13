import { test, expect } from "@playwright/test";

test.describe("Tags", () => {
  test("should display tags page", async ({ page }) => {
    await page.goto("/tags/");
    await expect(page.locator("main")).toBeVisible();
  });

  test("should navigate to tag and show filtered posts", async ({ page }) => {
    await page.goto("/tags/");
    const firstTag = page.locator("a[href*='/tags/']").first();
    if (await firstTag.isVisible()) {
      await firstTag.click();
      await expect(page.locator("main")).toBeVisible();
    }
  });
});

test.describe("Search", () => {
  test("should display search page", async ({ page }) => {
    await page.goto("/search/");
    await expect(page.locator("main")).toBeVisible();
  });
});

test.describe("Archives", () => {
  test("should display archives page", async ({ page }) => {
    await page.goto("/archives/");
    await expect(page.locator("main")).toBeVisible();
  });
});

test.describe("About", () => {
  test("should display about page", async ({ page }) => {
    await page.goto("/about/");
    await expect(page.locator("main")).toBeVisible();
  });
});
