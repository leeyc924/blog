import { describe, it, expect, vi } from "vitest";
import { createMockPost } from "./helpers";

vi.mock("@/config", () => ({
  SITE: { scheduledPostMargin: 15 * 60 * 1000 },
}));

describe("getPostsByCategory", () => {
  it("should return posts matching the given category", async () => {
    const { default: getPostsByCategory } = await import(
      "../getPostsByCategory"
    );
    const posts = [
      createMockPost({
        title: "Dev Post",
        category: "dev" as const,
        pubDatetime: new Date("2025-01-01"),
      }),
      createMockPost({
        title: "AI Post",
        category: "ai" as const,
        pubDatetime: new Date("2025-02-01"),
      }),
      createMockPost({
        title: "Dev Post 2",
        category: "dev" as const,
        pubDatetime: new Date("2025-03-01"),
      }),
    ];
    const result = getPostsByCategory(posts, "dev");
    expect(result.map(p => p.data.title)).toEqual([
      "Dev Post 2",
      "Dev Post",
    ]);
  });

  it("should return empty array if no posts match", async () => {
    const { default: getPostsByCategory } = await import(
      "../getPostsByCategory"
    );
    const posts = [
      createMockPost({ category: "dev" as const }),
    ];
    expect(getPostsByCategory(posts, "ai")).toEqual([]);
  });

  it("should exclude draft posts", async () => {
    const { default: getPostsByCategory } = await import(
      "../getPostsByCategory"
    );
    const posts = [
      createMockPost({ category: "dev" as const, draft: false }),
      createMockPost({ category: "dev" as const, draft: true }),
    ];
    const result = getPostsByCategory(posts, "dev");
    expect(result).toHaveLength(1);
  });

  it("should return sorted by date descending", async () => {
    const { default: getPostsByCategory } = await import(
      "../getPostsByCategory"
    );
    const posts = [
      createMockPost({
        title: "Old",
        category: "ai" as const,
        pubDatetime: new Date("2025-01-01"),
      }),
      createMockPost({
        title: "New",
        category: "ai" as const,
        pubDatetime: new Date("2025-06-01"),
      }),
    ];
    const result = getPostsByCategory(posts, "ai");
    expect(result[0].data.title).toBe("New");
  });
});
