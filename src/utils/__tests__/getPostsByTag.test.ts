import { describe, it, expect, vi } from "vitest";
import { createMockPost } from "./helpers";

vi.mock("@/config", () => ({
  SITE: { scheduledPostMargin: 15 * 60 * 1000 },
}));

describe("getPostsByTag", () => {
  it("should return posts matching the given tag", async () => {
    const { default: getPostsByTag } = await import("../getPostsByTag");
    const posts = [
      createMockPost({
        title: "React Post",
        tags: ["react"],
        pubDatetime: new Date("2025-01-01"),
      }),
      createMockPost({
        title: "Astro Post",
        tags: ["astro"],
        pubDatetime: new Date("2025-02-01"),
      }),
      createMockPost({
        title: "Both",
        tags: ["react", "astro"],
        pubDatetime: new Date("2025-03-01"),
      }),
    ];
    const result = getPostsByTag(posts, "react");
    expect(result.map(p => p.data.title)).toEqual(["Both", "React Post"]);
  });

  it("should return empty array if no posts match", async () => {
    const { default: getPostsByTag } = await import("../getPostsByTag");
    const posts = [createMockPost({ tags: ["react"] })];
    expect(getPostsByTag(posts, "vue")).toEqual([]);
  });

  it("should return sorted results", async () => {
    const { default: getPostsByTag } = await import("../getPostsByTag");
    const posts = [
      createMockPost({
        title: "Old",
        tags: ["js"],
        pubDatetime: new Date("2025-01-01"),
      }),
      createMockPost({
        title: "New",
        tags: ["js"],
        pubDatetime: new Date("2025-06-01"),
      }),
    ];
    const result = getPostsByTag(posts, "js");
    expect(result[0].data.title).toBe("New");
  });
});
