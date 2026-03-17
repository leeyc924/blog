// src/utils/categoryConfig.ts
export const CATEGORY_MAP = {
  dev: "Development",
  ai: "AI",
  etc: "ETC",
} as const;

export type CategorySlug = keyof typeof CATEGORY_MAP;

export const CATEGORY_SLUGS = Object.keys(CATEGORY_MAP) as CategorySlug[];

export const getCategoryDisplayName = (slug: CategorySlug): string =>
  CATEGORY_MAP[slug];
