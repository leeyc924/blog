// src/utils/__tests__/getUniqueCategories.test.ts
import { describe, it, expect, vi } from "vitest";
import { createMockPost } from "./helpers";

vi.mock("@/config", () => ({
  SITE: { scheduledPostMargin: 15 * 60 * 1000 },
}));

describe("getUniqueCategories", () => {
  it("should return all defined categories with post counts", async () => {
    const { default: getUniqueCategories } = await import(
      "../getUniqueCategories"
    );
    const posts = [
      createMockPost({ category: "dev" as const }),
      createMockPost({ category: "dev" as const }),
      createMockPost({ category: "ai" as const }),
    ];
    const categories = getUniqueCategories(posts);
    expect(categories).toEqual([
      { category: "dev", categoryName: "Development", count: 2 },
      { category: "ai", categoryName: "AI", count: 1 },
      { category: "etc", categoryName: "ETC", count: 0 },
    ]);
  });

  it("should exclude draft posts from counts", async () => {
    const { default: getUniqueCategories } = await import(
      "../getUniqueCategories"
    );
    const posts = [
      createMockPost({ category: "dev" as const, draft: false }),
      createMockPost({ category: "dev" as const, draft: true }),
    ];
    const categories = getUniqueCategories(posts);
    const dev = categories.find(c => c.category === "dev");
    expect(dev?.count).toBe(1);
  });

  it("should return all categories even with no posts", async () => {
    const { default: getUniqueCategories } = await import(
      "../getUniqueCategories"
    );
    const categories = getUniqueCategories([]);
    expect(categories).toHaveLength(3);
    expect(categories.every(c => c.count === 0)).toBe(true);
  });

  it("should count posts with default category as etc", async () => {
    const { default: getUniqueCategories } = await import(
      "../getUniqueCategories"
    );
    const posts = [createMockPost({})]; // category defaults to "etc"
    const categories = getUniqueCategories(posts);
    const etc = categories.find(c => c.category === "etc");
    expect(etc?.count).toBe(1);
  });
});
