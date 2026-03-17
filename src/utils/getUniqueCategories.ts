// src/utils/getUniqueCategories.ts
import type { CollectionEntry } from "astro:content";
import { CATEGORY_MAP, type CategorySlug } from "./categoryConfig";
import postFilter from "./postFilter";

interface Category {
  category: CategorySlug;
  categoryName: string;
  count: number;
}

const getUniqueCategories = (
  posts: CollectionEntry<"blog">[]
): Category[] => {
  const filteredPosts = posts.filter(postFilter);

  return (Object.entries(CATEGORY_MAP) as [CategorySlug, string][]).map(
    ([slug, displayName]) => ({
      category: slug,
      categoryName: displayName,
      count: filteredPosts.filter(post => post.data.category === slug).length,
    })
  );
};

export default getUniqueCategories;
