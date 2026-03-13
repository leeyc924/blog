import { describe, it, expect, vi, beforeEach } from "vitest";

describe("withBase", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("should prepend base to absolute path", async () => {
    vi.stubEnv("BASE_URL", "/leeyc-blog/");
    const mod = await import("../getBase");
    expect(mod.withBase("/posts")).toContain("/posts");
  });

  it("should not modify external URLs", async () => {
    const { withBase } = await import("../getBase");
    expect(withBase("https://github.com")).toBe("https://github.com");
  });

  it("should not modify hash links", async () => {
    const { withBase } = await import("../getBase");
    expect(withBase("#main")).toBe("#main");
  });

  it("should handle paths without leading slash", async () => {
    const { withBase } = await import("../getBase");
    const result = withBase("posts");
    expect(result).toContain("/posts");
  });

  it("should return path with base prefix", async () => {
    const { withBase } = await import("../getBase");
    const result = withBase("/tags/react");
    expect(result).toContain("/tags/react");
  });
});
