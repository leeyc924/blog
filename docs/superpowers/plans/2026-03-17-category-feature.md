# Category Feature Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 블로그에 카테고리 시스템(dev, ai, etc)을 추가하여 포스트를 그룹화하고, 전용 카테고리 페이지로 탐색할 수 있게 한다.

**Architecture:** 기존 Tags 시스템의 구조를 따라 독립적인 Category 유틸/컴포넌트/페이지를 추가한다. frontmatter에 `category` 필드(enum, 기본값 "etc")를 추가하고, 전용 `/categories` 라우트를 생성한다.

**Tech Stack:** Astro 5, TypeScript, Tailwind CSS v4, Vitest, Playwright

**TDD 요구사항:** 커버리지 100% 준수. 테스트 먼저 작성 후 구현.

---

## File Structure

### New Files
- `src/utils/categoryConfig.ts` — 카테고리 slug→표시명 매핑 (단일 소스)
- `src/utils/getUniqueCategories.ts` — 고유 카테고리 목록 + 포스트 수
- `src/utils/getPostsByCategory.ts` — 카테고리별 포스트 필터링
- `src/utils/__tests__/categoryConfig.test.ts` — config 테스트
- `src/utils/__tests__/getUniqueCategories.test.ts` — 카테고리 추출 테스트
- `src/utils/__tests__/getPostsByCategory.test.ts` — 카테고리 필터링 테스트
- `src/components/Category.astro` — 카테고리 배지 컴포넌트
- `src/pages/categories/index.astro` — 카테고리 목록 페이지
- `src/pages/categories/[category]/[...page].astro` — 카테고리별 포스트 목록
- `e2e/categories.spec.ts` — E2E 테스트

### Modified Files
- `src/content.config.ts` — `category` 필드 추가
- `src/utils/__tests__/helpers.ts` — `createMockPost`에 category 추가
- `src/components/Card.astro` — 카테고리 배지 표시
- `src/layouts/PostDetails.astro` — 카테고리 표시
- `src/components/Header.astro` — Categories 네비게이션 추가

---

## Chunk 1: Data Layer (categoryConfig, schema, test helper)

### Task 1: categoryConfig 유틸

**Files:**
- Create: `src/utils/categoryConfig.ts`
- Create: `src/utils/__tests__/categoryConfig.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/utils/__tests__/categoryConfig.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Write minimal implementation**

```typescript
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/utils/__tests__/categoryConfig.test.ts`
Expected: PASS — 3 tests pass

- [ ] **Step 5: Commit**

```bash
git add src/utils/categoryConfig.ts src/utils/__tests__/categoryConfig.test.ts
git commit -m "feat: add category config with slug-to-display-name mapping"
```

---

### Task 2: Schema 변경 + test helper 수정

**Files:**
- Modify: `src/content.config.ts:10-22`
- Modify: `src/utils/__tests__/helpers.ts:5-21`

- [ ] **Step 1: Update content schema**

`src/content.config.ts`에서 import 추가 후 schema에 `category` 필드 추가:

```typescript
// import 추가
import { CATEGORY_SLUGS } from "@/utils/categoryConfig";

// z.object 안에 추가 (tags 아래) — CATEGORY_SLUGS에서 파생하여 단일 소스 유지
category: z.enum(CATEGORY_SLUGS as [string, ...string[]]).default("etc"),
```

- [ ] **Step 2: Update test helper**

`src/utils/__tests__/helpers.ts`의 `createMockPost` 기본 data에 추가:

```typescript
// data 객체 안에 추가 (tags 아래)
category: "etc" as const,
```

- [ ] **Step 3: Run existing tests to verify no regression**

Run: `npx vitest run`
Expected: 모든 기존 테스트 PASS

- [ ] **Step 4: Commit**

```bash
git add src/content.config.ts src/utils/__tests__/helpers.ts
git commit -m "feat: add category field to blog schema with default 'etc'"
```

---

## Chunk 2: Utility Functions (TDD)

### Task 3: getUniqueCategories

**Files:**
- Create: `src/utils/__tests__/getUniqueCategories.test.ts`
- Create: `src/utils/getUniqueCategories.ts`

- [ ] **Step 1: Write the failing tests**

```typescript
// src/utils/__tests__/getUniqueCategories.test.ts
import { describe, it, expect, vi } from "vitest";
import { createMockPost } from "./helpers";

vi.mock("@/config", () => ({
  SITE: { scheduledPostMargin: 15 * 60 * 1000 },
}));

describe("getUniqueCategories", () => {
  it("should return all defined categories with post counts", async () => {
    const { default: getUniqueCategories } = await import(
      "../getUniqueCategories"
    );
    const posts = [
      createMockPost({ category: "dev" as const }),
      createMockPost({ category: "dev" as const }),
      createMockPost({ category: "ai" as const }),
    ];
    const categories = getUniqueCategories(posts);
    expect(categories).toEqual([
      { category: "dev", categoryName: "Development", count: 2 },
      { category: "ai", categoryName: "AI", count: 1 },
      { category: "etc", categoryName: "ETC", count: 0 },
    ]);
  });

  it("should exclude draft posts from counts", async () => {
    const { default: getUniqueCategories } = await import(
      "../getUniqueCategories"
    );
    const posts = [
      createMockPost({ category: "dev" as const, draft: false }),
      createMockPost({ category: "dev" as const, draft: true }),
    ];
    const categories = getUniqueCategories(posts);
    const dev = categories.find(c => c.category === "dev");
    expect(dev?.count).toBe(1);
  });

  it("should return all categories even with no posts", async () => {
    const { default: getUniqueCategories } = await import(
      "../getUniqueCategories"
    );
    const categories = getUniqueCategories([]);
    expect(categories).toHaveLength(3);
    expect(categories.every(c => c.count === 0)).toBe(true);
  });

  it("should count posts with default category as etc", async () => {
    const { default: getUniqueCategories } = await import(
      "../getUniqueCategories"
    );
    const posts = [createMockPost({})]; // category defaults to "etc"
    const categories = getUniqueCategories(posts);
    const etc = categories.find(c => c.category === "etc");
    expect(etc?.count).toBe(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/utils/__tests__/getUniqueCategories.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Write minimal implementation**

```typescript
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/utils/__tests__/getUniqueCategories.test.ts`
Expected: PASS — 4 tests pass

- [ ] **Step 5: Commit**

```bash
git add src/utils/getUniqueCategories.ts src/utils/__tests__/getUniqueCategories.test.ts
git commit -m "feat: add getUniqueCategories utility with full test coverage"
```

---

### Task 4: getPostsByCategory

**Files:**
- Create: `src/utils/__tests__/getPostsByCategory.test.ts`
- Create: `src/utils/getPostsByCategory.ts`

- [ ] **Step 1: Write the failing tests**

```typescript
// src/utils/__tests__/getPostsByCategory.test.ts
import { describe, it, expect, vi } from "vitest";
import { createMockPost } from "./helpers";

vi.mock("@/config", () => ({
  SITE: { scheduledPostMargin: 15 * 60 * 1000 },
}));

describe("getPostsByCategory", () => {
  it("should return posts matching the given category", async () => {
    const { default: getPostsByCategory } = await import(
      "../getPostsByCategory"
    );
    const posts = [
      createMockPost({
        title: "Dev Post",
        category: "dev" as const,
        pubDatetime: new Date("2025-01-01"),
      }),
      createMockPost({
        title: "AI Post",
        category: "ai" as const,
        pubDatetime: new Date("2025-02-01"),
      }),
      createMockPost({
        title: "Dev Post 2",
        category: "dev" as const,
        pubDatetime: new Date("2025-03-01"),
      }),
    ];
    const result = getPostsByCategory(posts, "dev");
    expect(result.map(p => p.data.title)).toEqual([
      "Dev Post 2",
      "Dev Post",
    ]);
  });

  it("should return empty array if no posts match", async () => {
    const { default: getPostsByCategory } = await import(
      "../getPostsByCategory"
    );
    const posts = [
      createMockPost({ category: "dev" as const }),
    ];
    expect(getPostsByCategory(posts, "ai")).toEqual([]);
  });

  it("should exclude draft posts", async () => {
    const { default: getPostsByCategory } = await import(
      "../getPostsByCategory"
    );
    const posts = [
      createMockPost({ category: "dev" as const, draft: false }),
      createMockPost({ category: "dev" as const, draft: true }),
    ];
    const result = getPostsByCategory(posts, "dev");
    expect(result).toHaveLength(1);
  });

  it("should return sorted by date descending", async () => {
    const { default: getPostsByCategory } = await import(
      "../getPostsByCategory"
    );
    const posts = [
      createMockPost({
        title: "Old",
        category: "ai" as const,
        pubDatetime: new Date("2025-01-01"),
      }),
      createMockPost({
        title: "New",
        category: "ai" as const,
        pubDatetime: new Date("2025-06-01"),
      }),
    ];
    const result = getPostsByCategory(posts, "ai");
    expect(result[0].data.title).toBe("New");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/utils/__tests__/getPostsByCategory.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Write minimal implementation**

```typescript
// src/utils/getPostsByCategory.ts
import type { CollectionEntry } from "astro:content";
import type { CategorySlug } from "./categoryConfig";
import getSortedPosts from "./getSortedPosts";

const getPostsByCategory = (
  posts: CollectionEntry<"blog">[],
  category: CategorySlug
) =>
  getSortedPosts(
    posts.filter(post => post.data.category === category)
  );

export default getPostsByCategory;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/utils/__tests__/getPostsByCategory.test.ts`
Expected: PASS — 4 tests pass

- [ ] **Step 5: Run all tests for regression check**

Run: `npx vitest run`
Expected: 모든 테스트 PASS

- [ ] **Step 6: Commit**

```bash
git add src/utils/getPostsByCategory.ts src/utils/__tests__/getPostsByCategory.test.ts
git commit -m "feat: add getPostsByCategory utility with full test coverage"
```

---

## Chunk 3: UI Components & Pages

### Task 5: Category 컴포넌트

**Files:**
- Create: `src/components/Category.astro`

- [ ] **Step 1: Create Category component**

```astro
---
import { withBase } from "@/utils/getBase";

type Props = {
  category: string;
  categoryName: string;
  size?: "sm" | "lg";
};

const { category, categoryName, size = "lg" } = Astro.props;
---

<li class="inline-block">
  <a
    href={withBase(`/categories/${category}/`)}
    transition:name={`category-${category}`}
    class:list={[
      "rounded-full bg-accent-bg text-accent hover:bg-accent hover:text-white transition-colors",
      { "px-2.5 py-0.5 text-xs": size === "sm" },
      { "px-3 py-1 text-sm": size === "lg" },
    ]}
  >
    {categoryName}
  </a>
</li>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Category.astro
git commit -m "feat: add Category component"
```

---

### Task 6: Categories 목록 페이지

**Files:**
- Create: `src/pages/categories/index.astro`

- [ ] **Step 1: Create categories index page**

```astro
---
import { getCollection } from "astro:content";
import Main from "@/layouts/Main.astro";
import Layout from "@/layouts/Layout.astro";
import Header from "@/components/Header.astro";
import Category from "@/components/Category.astro";
import getUniqueCategories from "@/utils/getUniqueCategories";
import { SITE } from "@/config";

const posts = await getCollection("blog");
const categories = getUniqueCategories(posts);
---

<Layout title={`Categories | ${SITE.title}`}>
  <Header />
  <Main pageTitle="Categories" pageDesc="All the categories used in posts.">
    <ul class="flex flex-wrap gap-3">
      {categories.map(({ category, categoryName, count }) => (
        <Category {category} categoryName={`${categoryName} (${count})`} />
      ))}
    </ul>
  </Main>
</Layout>
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/categories/index.astro
git commit -m "feat: add categories index page"
```

---

### Task 7: 카테고리별 포스트 목록 페이지

**Files:**
- Create: `src/pages/categories/[category]/[...page].astro`

- [ ] **Step 1: Create category posts page with pagination**

```astro
---
import { getCollection } from "astro:content";
import type { GetStaticPathsOptions } from "astro";
import Main from "@/layouts/Main.astro";
import Layout from "@/layouts/Layout.astro";
import Header from "@/components/Header.astro";
import Card from "@/components/Card.astro";
import Pagination from "@/components/Pagination.astro";
import getUniqueCategories from "@/utils/getUniqueCategories";
import getPostsByCategory from "@/utils/getPostsByCategory";
import type { CategorySlug } from "@/utils/categoryConfig";
import { SITE } from "@/config";

export async function getStaticPaths({ paginate }: GetStaticPathsOptions) {
  const posts = await getCollection("blog");
  const categories = getUniqueCategories(posts);

  return categories.flatMap(({ category, categoryName }) => {
    const categoryPosts = getPostsByCategory(
      posts,
      category as CategorySlug
    );

    return paginate(categoryPosts, {
      params: { category },
      props: { categoryName },
      pageSize: SITE.postPerPage,
    });
  });
}

const { category } = Astro.params;
const { page, categoryName } = Astro.props;
---

<Layout title={`Category: ${categoryName} | ${SITE.title}`}>
  <Header />
  <Main
    pageTitle={[`Category:`, `${categoryName}`]}
    titleTransition={`category-${category}`}
    pageDesc={`All the articles with the category "${categoryName}".`}
  >
    <ul class="divide-y divide-border">
      {page.data.map(data => <Card {...data} />)}
    </ul>
  </Main>
  <Pagination {page} />
</Layout>
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/categories/
git commit -m "feat: add category posts page with pagination"
```

---

### Task 8: Header에 Categories 네비게이션 추가

**Files:**
- Modify: `src/components/Header.astro:67-72`

- [ ] **Step 1: Add Categories link before Tags in Header**

`src/components/Header.astro`에서 Tags `<li>` 바로 앞에 Categories 링크 추가:

```html
<li class="col-span-2">
  <a href={withBase("/categories")} class:list={{ "active-nav": isActive("/categories") }}>
    Categories
  </a>
</li>
```

기존 Tags `<li>` 바로 위에 삽입.

- [ ] **Step 2: Commit**

```bash
git add src/components/Header.astro
git commit -m "feat: add Categories link to header navigation"
```

---

### Task 9: Card에 카테고리 배지 추가

**Files:**
- Modify: `src/components/Card.astro:1-35`

- [ ] **Step 1: Add category badge to Card component**

`src/components/Card.astro`에서:

1. import 추가:
```typescript
import { getCategoryDisplayName, type CategorySlug } from "@/utils/categoryConfig";
import Category from "./Category.astro";
```

2. `const { title, description, tags, ...props } = data;`를:
```typescript
const { title, description, tags, category, ...props } = data;
```

3. 기존 태그 `<ul>` (lines 30-32)을 **교체**. 기존 코드:
```html
<ul class="mt-1.5 flex flex-wrap gap-1.5">
  {tags.map(tag => <Tag tag={slugifyStr(tag)} tagName={tag} size="sm" />)}
</ul>
```
교체할 코드 (카테고리 배지를 태그 앞에 추가):
```html
<ul class="mt-1.5 flex flex-wrap gap-1.5">
  <Category
    category={category}
    categoryName={getCategoryDisplayName(category as CategorySlug)}
    size="sm"
  />
  {tags.map(tag => <Tag tag={slugifyStr(tag)} tagName={tag} size="sm" />)}
</ul>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Card.astro
git commit -m "feat: display category badge in post cards"
```

---

### Task 10: PostDetails에 카테고리 표시

**Files:**
- Modify: `src/layouts/PostDetails.astro:1-92`

- [ ] **Step 1: Add category display to PostDetails**

`src/layouts/PostDetails.astro`에서:

1. import 추가:
```typescript
import { getCategoryDisplayName, type CategorySlug } from "@/utils/categoryConfig";
import Category from "@/components/Category.astro";
```

2. destructuring에 category 추가:
```typescript
const {
  title,
  author,
  description,
  ogImage: initOgImage,
  canonicalURL,
  pubDatetime,
  modDatetime,
  timezone,
  tags,
  category,
} = post.data;
```

3. 기존 태그 `<ul>` (lines 90-92)을 **교체**. 기존 코드:
```html
<ul class="mt-3 flex flex-wrap gap-1.5">
  {tags.map(tag => <Tag tag={slugifyStr(tag)} tagName={tag} size="sm" />)}
</ul>
```
교체할 코드 (카테고리 배지를 태그 앞에 추가):
```html
<ul class="mt-3 flex flex-wrap gap-1.5">
  <Category
    category={category}
    categoryName={getCategoryDisplayName(category as CategorySlug)}
    size="sm"
  />
  {tags.map(tag => <Tag tag={slugifyStr(tag)} tagName={tag} size="sm" />)}
</ul>
```

- [ ] **Step 2: Commit**

```bash
git add src/layouts/PostDetails.astro
git commit -m "feat: display category in post detail page"
```

---

## Chunk 4: Migration & E2E Tests

### Task 11: 기존 포스트에 category 필드 추가

**Files:**
- Modify: `public/blog/*.md` (34 files)

- [ ] **Step 1: Add category to AI-related posts**

다음 포스트에 `category: "ai"` 추가 (frontmatter에):

```
A2UI & AGUI.md
Agent Harness.md
AI Code Review.md
Cognee.md
GitNexus.md
InsForge.md
LangChain.md
LangFlow.md
LangFuse.md
LangGraph.md
LangSmith.md
Lightpanda.md
MiroFish.md
Multi-Agent, Workflow.md
OpenClaw.md
Prompt.md
RAG.md
```

- [ ] **Step 2: Add category to dev-related posts**

다음 포스트에 `category: "dev"` 추가:

```
브라우저 렌더링 과정.md
clear-install.md
Design System 기반 회원관리앱 Migration.md
Design System 1 - Monorepo 구성.md
Design System 2 - eslint, tsconfig 설정.md
Design System 3 - npm publish.md
Design System 4 - icon.md
Design System 5 - ui.md
Design System 6 - utils.md
Design System 7 - Storybook.md
Module Federation을 이용한 Runtime integration.md
Polymorphic component.md
PWA를 이용한 회원관리 앱만들기.md
ReactFiber와 렌더링 과정.md
UnControlled Component.md
Vanilla-Extract 도입기.md
vite를 이용한 react library 만들기.md
```

- [ ] **Step 3: Remaining posts default to "etc"**

`category` 필드를 명시하지 않은 포스트는 schema 기본값으로 `"etc"` 자동 배정. 현재 34개 포스트가 모두 위 두 카테고리에 배정되므로 etc는 없음.

- [ ] **Step 4: Build를 실행하여 모든 포스트가 유효한지 확인**

Run: `npx astro check`
Expected: 에러 없음

- [ ] **Step 5: Commit**

```bash
git add public/blog/
git commit -m "feat: add category field to all blog posts"
```

---

### Task 12: E2E 테스트

**Files:**
- Create: `e2e/categories.spec.ts`

- [ ] **Step 1: Write E2E tests**

```typescript
// e2e/categories.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Categories", () => {
  test("should display categories page with all categories", async ({
    page,
  }) => {
    await page.goto("/blog/categories");
    await expect(page.locator("h1")).toContainText("Categories");
    await expect(page.locator("a[href*='/categories/dev/']")).toBeVisible();
    await expect(page.locator("a[href*='/categories/ai/']")).toBeVisible();
    await expect(page.locator("a[href*='/categories/etc/']")).toBeVisible();
  });

  test("should navigate to category posts page", async ({ page }) => {
    await page.goto("/blog/categories");
    await page.click("a[href*='/categories/dev/']");
    await expect(page.locator("h1")).toContainText("Development");
  });

  test("should display posts in category page", async ({ page }) => {
    await page.goto("/blog/categories/dev/");
    const posts = page.locator("ul.divide-y > li");
    await expect(posts.first()).toBeVisible();
  });

  test("should have Categories link in header", async ({ page }) => {
    await page.goto("/blog/");
    const categoriesLink = page.locator(
      "header a[href*='/categories']"
    );
    await expect(categoriesLink).toBeVisible();
    await categoriesLink.click();
    await expect(page).toHaveURL(/\/categories/);
  });

  test("should paginate category posts when exceeding page size", async ({
    page,
  }) => {
    // dev category has 17 posts, postPerPage is 10, so page 2 should exist
    await page.goto("/blog/categories/dev/2/");
    await expect(page.locator("h1")).toContainText("Development");
    const posts = page.locator("ul.divide-y > li");
    await expect(posts.first()).toBeVisible();
  });
});
```

- [ ] **Step 2: Run E2E tests**

Run: `npx playwright test e2e/categories.spec.ts`
Expected: 모든 E2E 테스트 PASS

- [ ] **Step 3: Commit**

```bash
git add e2e/categories.spec.ts
git commit -m "test: add E2E tests for category pages"
```

---

### Task 13: 전체 검증

- [ ] **Step 1: Run all unit tests with coverage**

Run: `npx vitest run --coverage`
Expected: 100% 커버리지, 모든 테스트 PASS

- [ ] **Step 2: Run all E2E tests**

Run: `npx playwright test`
Expected: 모든 E2E 테스트 PASS

- [ ] **Step 3: Build verification**

Run: `npm run build`
Expected: 빌드 성공, 에러 없음

- [ ] **Step 4: Final commit (if any fixes needed)**

```bash
git add -A
git commit -m "fix: resolve any remaining issues from full verification"
```
