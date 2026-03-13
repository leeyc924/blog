import { describe, it, expect, vi } from "vitest";
import { createMockPost } from "./helpers";
import postFilter from "../postFilter";

vi.mock("@/config", () => ({
  SITE: {
    scheduledPostMargin: 15 * 60 * 1000,
  },
}));

describe("postFilter", () => {
  it("should include published non-draft posts with past date", () => {
    const post = createMockPost({
      draft: false,
      pubDatetime: new Date("2025-01-01"),
    });
    expect(postFilter(post)).toBe(true);
  });

  it("should exclude draft posts", () => {
    const post = createMockPost({ draft: true });
    expect(postFilter(post)).toBe(false);
  });

  it("should include posts without draft field (defaults to false)", () => {
    const post = createMockPost({});
    expect(postFilter(post)).toBe(true);
  });

  it("should handle post with pubDatetime near current time", () => {
    const nearFuture = new Date(Date.now() + 10 * 60 * 1000); // 10 min from now (within 15 min margin)
    const post = createMockPost({ pubDatetime: nearFuture });
    expect(postFilter(post)).toBe(true);
  });
});
