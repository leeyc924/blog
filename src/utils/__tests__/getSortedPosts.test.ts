import { describe, it, expect, vi } from "vitest";
import { createMockPost } from "./helpers";

vi.mock("@/config", () => ({
  SITE: { scheduledPostMargin: 15 * 60 * 1000 },
}));

describe("getSortedPosts", () => {
  it("should sort posts by date descending", async () => {
    const { default: getSortedPosts } = await import("../getSortedPosts");
    const posts = [
      createMockPost({ title: "Old", pubDatetime: new Date("2025-01-01") }),
      createMockPost({ title: "New", pubDatetime: new Date("2025-06-01") }),
      createMockPost({ title: "Mid", pubDatetime: new Date("2025-03-01") }),
    ];
    const sorted = getSortedPosts(posts);
    expect(sorted.map(p => p.data.title)).toEqual(["New", "Mid", "Old"]);
  });

  it("should use modDatetime for sorting when available", async () => {
    const { default: getSortedPosts } = await import("../getSortedPosts");
    const posts = [
      createMockPost({
        title: "A",
        pubDatetime: new Date("2025-01-01"),
        modDatetime: new Date("2025-12-01"),
      }),
      createMockPost({ title: "B", pubDatetime: new Date("2025-06-01") }),
    ];
    const sorted = getSortedPosts(posts);
    expect(sorted[0].data.title).toBe("A");
  });

  it("should filter out draft posts", async () => {
    const { default: getSortedPosts } = await import("../getSortedPosts");
    const posts = [
      createMockPost({
        title: "Published",
        draft: false,
        pubDatetime: new Date("2025-01-01"),
      }),
      createMockPost({ title: "Draft", draft: true }),
    ];
    const sorted = getSortedPosts(posts);
    expect(sorted).toHaveLength(1);
    expect(sorted[0].data.title).toBe("Published");
  });

  it("should return empty array for empty input", async () => {
    const { default: getSortedPosts } = await import("../getSortedPosts");
    expect(getSortedPosts([])).toEqual([]);
  });
});
