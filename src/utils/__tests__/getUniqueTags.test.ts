import { describe, it, expect, vi } from "vitest";
import { createMockPost } from "./helpers";

vi.mock("@/config", () => ({
  SITE: { scheduledPostMargin: 15 * 60 * 1000 },
}));

describe("getUniqueTags", () => {
  it("should return unique tags sorted alphabetically", async () => {
    const { default: getUniqueTags } = await import("../getUniqueTags");
    const posts = [
      createMockPost({ tags: ["React", "TypeScript"] }),
      createMockPost({ tags: ["TypeScript", "Astro"] }),
    ];
    const tags = getUniqueTags(posts);
    expect(tags.map(t => t.tag)).toEqual(["astro", "react", "typescript"]);
  });

  it("should preserve original tag names", async () => {
    const { default: getUniqueTags } = await import("../getUniqueTags");
    const posts = [createMockPost({ tags: ["TypeScript"] })];
    const tags = getUniqueTags(posts);
    expect(tags[0].tagName).toBe("TypeScript");
  });

  it("should exclude draft posts", async () => {
    const { default: getUniqueTags } = await import("../getUniqueTags");
    const posts = [
      createMockPost({ tags: ["visible"], draft: false }),
      createMockPost({ tags: ["hidden"], draft: true }),
    ];
    const tags = getUniqueTags(posts);
    expect(tags.map(t => t.tag)).toEqual(["visible"]);
  });

  it("should return empty array for no posts", async () => {
    const { default: getUniqueTags } = await import("../getUniqueTags");
    expect(getUniqueTags([])).toEqual([]);
  });

  it("should deduplicate tags with same slugified value", async () => {
    const { default: getUniqueTags } = await import("../getUniqueTags");
    const posts = [
      createMockPost({ tags: ["React"] }),
      createMockPost({ tags: ["react"] }),
    ];
    const tags = getUniqueTags(posts);
    expect(tags).toHaveLength(1);
  });
});
