import { describe, it, expect } from "vitest";
import getPostsByGroupCondition from "../getPostsByGroupCondition";
import { createMockPost } from "./helpers";

describe("getPostsByGroupCondition", () => {
  it("should group posts by year", () => {
    const posts = [
      createMockPost({ title: "A", pubDatetime: new Date("2025-01-01") }),
      createMockPost({ title: "B", pubDatetime: new Date("2025-06-01") }),
      createMockPost({ title: "C", pubDatetime: new Date("2024-01-01") }),
    ];
    const grouped = getPostsByGroupCondition(posts, post =>
      new Date(post.data.pubDatetime).getFullYear()
    );
    expect(Object.keys(grouped).sort()).toEqual(["2024", "2025"]);
    expect(grouped[2025]).toHaveLength(2);
    expect(grouped[2024]).toHaveLength(1);
  });

  it("should return empty object for empty input", () => {
    expect(getPostsByGroupCondition([], () => "key")).toEqual({});
  });

  it("should group by custom function", () => {
    const posts = [
      createMockPost({ title: "A", tags: ["react"] }),
      createMockPost({ title: "B", tags: ["vue"] }),
      createMockPost({ title: "C", tags: ["react"] }),
    ];
    const grouped = getPostsByGroupCondition(posts, post => post.data.tags[0]);
    expect(grouped["react"]).toHaveLength(2);
    expect(grouped["vue"]).toHaveLength(1);
  });
});
