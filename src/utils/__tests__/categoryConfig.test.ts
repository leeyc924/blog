// src/utils/__tests__/categoryConfig.test.ts
import { describe, it, expect } from "vitest";

describe("categoryConfig", () => {
  it("should export CATEGORY_MAP with all categories", async () => {
    const { CATEGORY_MAP } = await import("../categoryConfig");
    expect(CATEGORY_MAP).toEqual({
      dev: "Development",
      ai: "AI",
      etc: "ETC",
    });
  });

  it("should export getCategoryDisplayName", async () => {
    const { getCategoryDisplayName } = await import("../categoryConfig");
    expect(getCategoryDisplayName("dev")).toBe("Development");
    expect(getCategoryDisplayName("ai")).toBe("AI");
    expect(getCategoryDisplayName("etc")).toBe("ETC");
  });

  it("should export CATEGORY_SLUGS array", async () => {
    const { CATEGORY_SLUGS } = await import("../categoryConfig");
    expect(CATEGORY_SLUGS).toEqual(["dev", "ai", "etc"]);
  });
});
