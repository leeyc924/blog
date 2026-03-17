import type { CollectionEntry } from "astro:content";

type BlogEntry = CollectionEntry<"blog">;

export function createMockPost(
  overrides: Partial<BlogEntry["data"]> = {}
): BlogEntry {
  return {
    id: overrides.title ?? "test-post",
    collection: "blog",
    data: {
      title: "Test Post",
      pubDatetime: new Date("2025-01-01"),
      description: "Test description",
      author: "leeyc",
      tags: ["test"],
      category: "etc" as const,
      draft: false,
      ...overrides,
    },
  } as BlogEntry;
}
