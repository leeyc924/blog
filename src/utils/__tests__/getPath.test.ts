import { describe, it, expect, vi } from "vitest";

vi.mock("@/content.config", () => ({
  BLOG_PATH: "src/data/blog",
}));

describe("getPath", () => {
  it("should return simple post path", async () => {
    const { getPath } = await import("../getPath");
    expect(getPath("hello-world", "src/data/blog/hello-world.md")).toBe(
      "/posts/hello-world"
    );
  });

  it("should handle subdirectory paths", async () => {
    const { getPath } = await import("../getPath");
    expect(getPath("sub/my-post", "src/data/blog/sub/my-post.md")).toBe(
      "/posts/sub/my-post"
    );
  });

  it("should exclude directories starting with underscore", async () => {
    const { getPath } = await import("../getPath");
    expect(
      getPath("_releases/v1", "src/data/blog/_releases/v1.md")
    ).toBe("/posts/v1");
  });

  it("should work without includeBase", async () => {
    const { getPath } = await import("../getPath");
    expect(
      getPath("hello-world", "src/data/blog/hello-world.md", false)
    ).toBe("/hello-world");
  });

  it("should handle undefined filePath", async () => {
    const { getPath } = await import("../getPath");
    expect(getPath("my-post", undefined)).toBe("/posts/my-post");
  });

  it("should handle nested subdirectories", async () => {
    const { getPath } = await import("../getPath");
    expect(
      getPath("deep/nested/post", "src/data/blog/deep/nested/post.md")
    ).toBe("/posts/deep/nested/post");
  });
});
