import { test, expect } from "@playwright/test";

test.describe("Blog Post", () => {
  test("should navigate to a post and display content", async ({ page }) => {
    await page.goto("/leeyc-blog/");
    const firstPost = page.locator("a[href*='/posts/']").first();
    await firstPost.click();
    await expect(page.locator("article")).toBeVisible();
  });

  test("should display post title", async ({ page }) => {
    await page.goto("/leeyc-blog/");
    const firstPost = page.locator("a[href*='/posts/']").first();
    await firstPost.click();
    const heading = page.locator("article h1, h1");
    await expect(heading.first()).toBeVisible();
  });

  test("should display post metadata", async ({ page }) => {
    await page.goto("/leeyc-blog/");
    const firstPost = page.locator("a[href*='/posts/']").first();
    await firstPost.click();
    await expect(page.locator("time").first()).toBeVisible();
  });
});
