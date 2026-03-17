import { test, expect } from "@playwright/test";

test.describe("Categories", () => {
  test("should display categories page with all categories", async ({
    page,
  }) => {
    await page.goto("/blog/categories");
    await expect(page.locator("h1")).toContainText("Categories");
    await expect(page.locator("a[href*='/categories/dev/']")).toBeVisible();
    await expect(page.locator("a[href*='/categories/ai/']")).toBeVisible();
    await expect(page.locator("a[href*='/categories/etc/']")).toBeVisible();
  });

  test("should navigate to category posts page", async ({ page }) => {
    await page.goto("/blog/categories");
    await page.click("a[href*='/categories/dev/']");
    await expect(page.locator("h1")).toContainText("Development");
  });

  test("should display posts in category page", async ({ page }) => {
    await page.goto("/blog/categories/dev/");
    const posts = page.locator("ul.divide-y > li");
    await expect(posts.first()).toBeVisible();
  });

  test("should have Categories link in header", async ({ page }) => {
    await page.goto("/blog/");
    const categoriesLink = page.locator("header a[href*='/categories']");
    await expect(categoriesLink).toBeVisible();
    await categoriesLink.click();
    await expect(page).toHaveURL(/\/categories/);
  });

  test("should paginate category posts when exceeding page size", async ({
    page,
  }) => {
    // dev category has 17 posts, postPerPage is 10, so page 2 should exist
    await page.goto("/blog/categories/dev/2/");
    await expect(page.locator("h1")).toContainText("Development");
    const posts = page.locator("ul.divide-y > li");
    await expect(posts.first()).toBeVisible();
  });
});
