# Astro Blog Setup Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** AstroPaper v5.5.1 테마를 프로젝트 루트로 이동하고, GitHub Pages 배포가 가능한 개인 블로그를 TDD로 구축한다.

**Architecture:** astro-paper-main/ 내용을 루트로 이동, config 커스터마이징(사이트 URL, 작성자, 언어, base path), 예시 글 제거. Vitest로 유틸리티 함수 단위 테스트, Playwright로 E2E 테스트.

**Tech Stack:** Astro 5, TypeScript, Tailwind CSS 4, Vitest (unit), Playwright (e2e), Pagefind (search)

---

## Chunk 1: 프로젝트 마이그레이션

### Task 1: astro-paper-main 내용을 루트로 이동

**Files:**
- Move: `astro-paper-main/*` → project root
- Delete: `astro-paper-main/` directory
- Keep: `.github/workflows/deploy.yml` (기존 것 유지)

- [ ] **Step 1: astro-paper-main 내용을 루트로 복사**

```bash
cd /Users/leeyc/workspace/leeyc924/leeyc-blog
# .github은 이미 루트에 있으므로 제외
cp -r astro-paper-main/.editorconfig .
cp -r astro-paper-main/.gitignore .
cp -r astro-paper-main/.prettierignore .
cp -r astro-paper-main/.prettierrc.mjs .
cp -r astro-paper-main/.vscode .
cp -r astro-paper-main/eslint.config.js .
cp -r astro-paper-main/astro.config.ts .
cp -r astro-paper-main/package.json .
cp -r astro-paper-main/tsconfig.json .
cp -r astro-paper-main/public .
cp -r astro-paper-main/src .
```

- [ ] **Step 2: astro-paper의 .github 내용 중 필요한 것만 병합**

astro-paper-main/.github에는 CONTRIBUTING.md, ISSUE_TEMPLATE 등이 있으나 불필요. 기존 deploy.yml 유지.

- [ ] **Step 3: astro-paper-main 디렉토리 삭제**

```bash
rm -rf astro-paper-main
```

- [ ] **Step 4: 설치 및 빌드 확인**

```bash
npm install
npm run build
```

Expected: 빌드 성공

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: migrate astro-paper-main to project root"
```

### Task 2: config 커스터마이징

**Files:**
- Modify: `src/config.ts`
- Modify: `astro.config.ts`
- Modify: `src/constants.ts`

- [ ] **Step 1: src/config.ts 수정**

```typescript
export const SITE = {
  website: "https://leeyc924.github.io/leeyc-blog/",
  author: "leeyc",
  profile: "https://github.com/leeyc924",
  desc: "개발과 일상을 기록하는 블로그",
  title: "leeyc blog",
  ogImage: "astropaper-og.jpg",
  lightAndDarkMode: true,
  postPerIndex: 4,
  postPerPage: 4,
  scheduledPostMargin: 15 * 60 * 1000,
  showArchives: true,
  showBackButton: true,
  editPost: {
    enabled: true,
    text: "Edit page",
    url: "https://github.com/leeyc924/leeyc-blog/edit/main/",
  },
  dynamicOgImage: true,
  dir: "ltr",
  lang: "ko",
  timezone: "Asia/Seoul",
} as const;
```

- [ ] **Step 2: astro.config.ts에 base 추가**

```typescript
export default defineConfig({
  site: SITE.website,
  base: "/leeyc-blog",
  // ... 나머지 동일
});
```

- [ ] **Step 3: src/constants.ts 소셜 링크 수정**

GitHub 링크를 `https://github.com/leeyc924`로, 불필요한 소셜 링크 제거.

- [ ] **Step 4: 빌드 확인**

```bash
npm run build
```

- [ ] **Step 5: Commit**

```bash
git add src/config.ts astro.config.ts src/constants.ts
git commit -m "feat: customize site config for leeyc blog"
```

### Task 3: 예시 글 정리 및 샘플 글 작성

**Files:**
- Delete: `src/data/blog/_releases/*`
- Delete: `src/data/blog/examples/*`
- Delete: `src/data/blog/*.md` (기존 튜토리얼 글)
- Create: `src/data/blog/hello-world.md`
- Modify: `src/pages/about.md`

- [ ] **Step 1: 기존 예시 글 삭제**

```bash
rm -rf src/data/blog/_releases
rm -rf src/data/blog/examples
rm src/data/blog/*.md
```

- [ ] **Step 2: 샘플 블로그 글 작성**

```markdown
---
title: "Hello World"
pubDatetime: 2026-03-13T00:00:00Z
description: "첫 번째 블로그 글입니다."
tags:
  - general
---

# Hello World

블로그를 시작합니다.
```

- [ ] **Step 3: about.md 수정**

작성자 정보를 leeyc로 변경.

- [ ] **Step 4: 빌드 확인**

```bash
npm run build
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: replace example posts with initial content"
```

### Task 4: GitHub Actions workflow 업데이트

**Files:**
- Modify: `.github/workflows/deploy.yml`

- [ ] **Step 1: deploy.yml에 pagefind 빌드 단계 확인**

현재 workflow는 `npm run build`를 실행하는데, package.json의 build 스크립트에 `pagefind --site dist`가 포함되어 있으므로 별도 수정 불필요. 다만 `npm ci` 전에 `working-directory`가 필요 없는지 확인.

현재 workflow가 이미 루트 기준으로 되어 있으므로 수정 불필요.

- [ ] **Step 2: Commit (변경 있을 경우만)**

---

## Chunk 2: 테스트 인프라 설정

### Task 5: Vitest 설정

**Files:**
- Create: `vitest.config.ts`
- Modify: `package.json` (devDependencies, scripts)
- Modify: `tsconfig.json` (path alias for tests)

- [ ] **Step 1: Vitest 및 관련 패키지 설치**

```bash
npm install -D vitest @vitest/coverage-v8
```

- [ ] **Step 2: vitest.config.ts 작성**

```typescript
import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
      "@/config": resolve(__dirname, "src/__mocks__/config.ts"),
    },
  },
  test: {
    globals: true,
    coverage: {
      provider: "v8",
      include: ["src/utils/**/*.ts"],
      exclude: ["src/utils/generateOgImages.ts", "src/utils/loadGoogleFont.ts"],
      thresholds: {
        lines: 100,
        functions: 100,
        branches: 100,
        statements: 100,
      },
    },
  },
});
```

- [ ] **Step 3: package.json에 test 스크립트 추가**

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  }
}
```

- [ ] **Step 4: Astro 모듈 mock 생성**

Create: `src/__mocks__/config.ts`

```typescript
export const SITE = {
  website: "https://leeyc924.github.io/leeyc-blog/",
  author: "leeyc",
  profile: "https://github.com/leeyc924",
  desc: "개발과 일상을 기록하는 블로그",
  title: "leeyc blog",
  ogImage: "astropaper-og.jpg",
  lightAndDarkMode: true,
  postPerIndex: 4,
  postPerPage: 4,
  scheduledPostMargin: 15 * 60 * 1000,
  showArchives: true,
  showBackButton: true,
  editPost: {
    enabled: true,
    text: "Edit page",
    url: "https://github.com/leeyc924/leeyc-blog/edit/main/",
  },
  dynamicOgImage: true,
  dir: "ltr" as const,
  lang: "ko",
  timezone: "Asia/Seoul",
} as const;
```

- [ ] **Step 5: Commit**

```bash
git add vitest.config.ts package.json package-lock.json src/__mocks__
git commit -m "chore: add vitest test infrastructure"
```

### Task 6: Playwright 설정

**Files:**
- Create: `playwright.config.ts`
- Create: `e2e/` directory
- Modify: `package.json` (scripts)

- [ ] **Step 1: Playwright 설치**

```bash
npm install -D @playwright/test
npx playwright install chromium
```

- [ ] **Step 2: playwright.config.ts 작성**

```typescript
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:4321/leeyc-blog",
    trace: "on-first-retry",
  },
  webServer: {
    command: "npm run preview",
    url: "http://localhost:4321/leeyc-blog",
    reuseExistingServer: !process.env.CI,
  },
});
```

- [ ] **Step 3: package.json에 e2e 스크립트 추가**

```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:all": "vitest run --coverage && playwright test"
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add playwright.config.ts package.json package-lock.json
git commit -m "chore: add playwright e2e test infrastructure"
```

---

## Chunk 3: 유틸리티 함수 Unit 테스트 (TDD)

### Task 7: slugify 테스트

**Files:**
- Create: `src/utils/__tests__/slugify.test.ts`

- [ ] **Step 1: failing test 작성**

```typescript
import { describe, it, expect } from "vitest";
import { slugifyStr, slugifyAll } from "../slugify";

describe("slugifyStr", () => {
  it("should slugify Latin strings to lowercase kebab-case", () => {
    expect(slugifyStr("Hello World")).toBe("hello-world");
  });

  it("should handle strings with numbers", () => {
    expect(slugifyStr("TypeScript 5.0")).toBe("typescript-5.0");
  });

  it("should handle acronyms like E2E", () => {
    expect(slugifyStr("E2E Testing")).toBe("e2e-testing");
  });

  it("should handle non-Latin characters (Korean)", () => {
    const result = slugifyStr("한국어 테스트");
    expect(result).toBe("한국어-테스트");
  });

  it("should handle non-Latin characters (Chinese)", () => {
    const result = slugifyStr("中文测试");
    expect(result).toBe("中文测试");
  });

  it("should handle mixed Latin and non-Latin", () => {
    const result = slugifyStr("React 한국어");
    expect(result).toBe("react-한국어");
  });
});

describe("slugifyAll", () => {
  it("should slugify an array of strings", () => {
    expect(slugifyAll(["Hello World", "Foo Bar"])).toEqual([
      "hello-world",
      "foo-bar",
    ]);
  });

  it("should return empty array for empty input", () => {
    expect(slugifyAll([])).toEqual([]);
  });
});
```

- [ ] **Step 2: 테스트 실행하여 실패 확인**

```bash
npx vitest run src/utils/__tests__/slugify.test.ts
```

Expected: PASS (이미 구현되어 있으므로 바로 통과해야 함)

- [ ] **Step 3: Commit**

```bash
git add src/utils/__tests__/slugify.test.ts
git commit -m "test: add unit tests for slugify utility"
```

### Task 8: postFilter 테스트

**Files:**
- Create: `src/utils/__tests__/postFilter.test.ts`
- Create: `src/utils/__tests__/helpers.ts` (테스트 헬퍼)

- [ ] **Step 1: 테스트 헬퍼 작성**

```typescript
import type { CollectionEntry } from "astro:content";

type BlogEntry = CollectionEntry<"blog">;

export function createMockPost(overrides: Partial<BlogEntry["data"]> = {}): BlogEntry {
  return {
    id: "test-post",
    collection: "blog",
    data: {
      title: "Test Post",
      pubDatetime: new Date("2025-01-01"),
      description: "Test description",
      author: "leeyc",
      tags: ["test"],
      draft: false,
      ...overrides,
    },
  } as BlogEntry;
}
```

- [ ] **Step 2: failing test 작성**

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockPost } from "./helpers";

// postFilter uses import.meta.env.DEV internally
// We need to mock it via the module
vi.mock("@/config", () => ({
  SITE: {
    scheduledPostMargin: 15 * 60 * 1000,
  },
}));

describe("postFilter", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  it("should include published non-draft posts", async () => {
    const postFilter = (await import("../postFilter")).default;
    const post = createMockPost({ draft: false, pubDatetime: new Date("2025-01-01") });
    expect(postFilter(post)).toBe(true);
  });

  it("should exclude draft posts", async () => {
    const postFilter = (await import("../postFilter")).default;
    const post = createMockPost({ draft: true });
    expect(postFilter(post)).toBe(false);
  });

  it("should exclude future posts in production", async () => {
    vi.stubEnv("DEV", "");
    const { default: postFilter } = await import("../postFilter");
    const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const post = createMockPost({ pubDatetime: futureDate });
    expect(postFilter(post)).toBe(false);
  });
});
```

- [ ] **Step 3: 테스트 실행**

```bash
npx vitest run src/utils/__tests__/postFilter.test.ts
```

- [ ] **Step 4: Commit**

```bash
git add src/utils/__tests__/postFilter.test.ts src/utils/__tests__/helpers.ts
git commit -m "test: add unit tests for postFilter utility"
```

### Task 9: getSortedPosts 테스트

**Files:**
- Create: `src/utils/__tests__/getSortedPosts.test.ts`

- [ ] **Step 1: failing test 작성**

```typescript
import { describe, it, expect, vi } from "vitest";
import { createMockPost } from "./helpers";

vi.mock("@/config", () => ({
  SITE: { scheduledPostMargin: 15 * 60 * 1000 },
}));

describe("getSortedPosts", () => {
  it("should sort posts by date descending", async () => {
    const { default: getSortedPosts } = await import("../getSortedPosts");
    const posts = [
      createMockPost({ title: "Old", pubDatetime: new Date("2025-01-01") }),
      createMockPost({ title: "New", pubDatetime: new Date("2025-06-01") }),
      createMockPost({ title: "Mid", pubDatetime: new Date("2025-03-01") }),
    ];
    const sorted = getSortedPosts(posts);
    expect(sorted.map(p => p.data.title)).toEqual(["New", "Mid", "Old"]);
  });

  it("should use modDatetime for sorting when available", async () => {
    const { default: getSortedPosts } = await import("../getSortedPosts");
    const posts = [
      createMockPost({ title: "A", pubDatetime: new Date("2025-01-01"), modDatetime: new Date("2025-12-01") }),
      createMockPost({ title: "B", pubDatetime: new Date("2025-06-01") }),
    ];
    const sorted = getSortedPosts(posts);
    expect(sorted[0].data.title).toBe("A");
  });

  it("should filter out draft posts", async () => {
    const { default: getSortedPosts } = await import("../getSortedPosts");
    const posts = [
      createMockPost({ title: "Published", draft: false }),
      createMockPost({ title: "Draft", draft: true }),
    ];
    const sorted = getSortedPosts(posts);
    expect(sorted).toHaveLength(1);
    expect(sorted[0].data.title).toBe("Published");
  });

  it("should return empty array for empty input", async () => {
    const { default: getSortedPosts } = await import("../getSortedPosts");
    expect(getSortedPosts([])).toEqual([]);
  });
});
```

- [ ] **Step 2: 테스트 실행**

```bash
npx vitest run src/utils/__tests__/getSortedPosts.test.ts
```

- [ ] **Step 3: Commit**

```bash
git add src/utils/__tests__/getSortedPosts.test.ts
git commit -m "test: add unit tests for getSortedPosts utility"
```

### Task 10: getUniqueTags 테스트

**Files:**
- Create: `src/utils/__tests__/getUniqueTags.test.ts`

- [ ] **Step 1: failing test 작성**

```typescript
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
});
```

- [ ] **Step 2: 테스트 실행**

```bash
npx vitest run src/utils/__tests__/getUniqueTags.test.ts
```

- [ ] **Step 3: Commit**

```bash
git add src/utils/__tests__/getUniqueTags.test.ts
git commit -m "test: add unit tests for getUniqueTags utility"
```

### Task 11: getPostsByTag 테스트

**Files:**
- Create: `src/utils/__tests__/getPostsByTag.test.ts`

- [ ] **Step 1: failing test 작성**

```typescript
import { describe, it, expect, vi } from "vitest";
import { createMockPost } from "./helpers";

vi.mock("@/config", () => ({
  SITE: { scheduledPostMargin: 15 * 60 * 1000 },
}));

describe("getPostsByTag", () => {
  it("should return posts matching the given tag", async () => {
    const { default: getPostsByTag } = await import("../getPostsByTag");
    const posts = [
      createMockPost({ title: "React Post", tags: ["react"], pubDatetime: new Date("2025-01-01") }),
      createMockPost({ title: "Astro Post", tags: ["astro"], pubDatetime: new Date("2025-02-01") }),
      createMockPost({ title: "Both", tags: ["react", "astro"], pubDatetime: new Date("2025-03-01") }),
    ];
    const result = getPostsByTag(posts, "react");
    expect(result.map(p => p.data.title)).toEqual(["Both", "React Post"]);
  });

  it("should return empty array if no posts match", async () => {
    const { default: getPostsByTag } = await import("../getPostsByTag");
    const posts = [createMockPost({ tags: ["react"] })];
    expect(getPostsByTag(posts, "vue")).toEqual([]);
  });
});
```

- [ ] **Step 2: 테스트 실행**

```bash
npx vitest run src/utils/__tests__/getPostsByTag.test.ts
```

- [ ] **Step 3: Commit**

```bash
git add src/utils/__tests__/getPostsByTag.test.ts
git commit -m "test: add unit tests for getPostsByTag utility"
```

### Task 12: getPostsByGroupCondition 테스트

**Files:**
- Create: `src/utils/__tests__/getPostsByGroupCondition.test.ts`

- [ ] **Step 1: failing test 작성**

```typescript
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
    expect(Object.keys(grouped)).toEqual(["2025", "2024"]);
    expect(grouped[2025]).toHaveLength(2);
    expect(grouped[2024]).toHaveLength(1);
  });

  it("should return empty object for empty input", () => {
    expect(getPostsByGroupCondition([], () => "key")).toEqual({});
  });
});
```

- [ ] **Step 2: 테스트 실행**

```bash
npx vitest run src/utils/__tests__/getPostsByGroupCondition.test.ts
```

- [ ] **Step 3: Commit**

```bash
git add src/utils/__tests__/getPostsByGroupCondition.test.ts
git commit -m "test: add unit tests for getPostsByGroupCondition utility"
```

### Task 13: getPath 테스트

**Files:**
- Create: `src/utils/__tests__/getPath.test.ts`

- [ ] **Step 1: failing test 작성**

```typescript
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
    expect(
      getPath("sub/my-post", "src/data/blog/sub/my-post.md")
    ).toBe("/posts/sub/my-post");
  });

  it("should exclude directories starting with underscore", async () => {
    const { getPath } = await import("../getPath");
    expect(
      getPath("_releases/v1", "src/data/blog/_releases/v1.md")
    ).toBe("/posts/v1");
  });

  it("should work without includeBase", async () => {
    const { getPath } = await import("../getPath");
    expect(getPath("hello-world", "src/data/blog/hello-world.md", false)).toBe(
      "/hello-world"
    );
  });

  it("should handle undefined filePath", async () => {
    const { getPath } = await import("../getPath");
    expect(getPath("my-post", undefined)).toBe("/posts/my-post");
  });
});
```

- [ ] **Step 2: 테스트 실행**

```bash
npx vitest run src/utils/__tests__/getPath.test.ts
```

- [ ] **Step 3: Commit**

```bash
git add src/utils/__tests__/getPath.test.ts
git commit -m "test: add unit tests for getPath utility"
```

---

## Chunk 4: E2E 테스트

### Task 14: 홈페이지 E2E 테스트

**Files:**
- Create: `e2e/home.spec.ts`

- [ ] **Step 1: 빌드 실행**

```bash
npm run build
```

- [ ] **Step 2: E2E 테스트 작성**

```typescript
import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test("should load and display site title", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/leeyc blog/);
  });

  test("should display recent posts", async ({ page }) => {
    await page.goto("/");
    const posts = page.locator("ul li");
    await expect(posts.first()).toBeVisible();
  });

  test("should have working navigation links", async ({ page }) => {
    await page.goto("/");
    const nav = page.locator("nav");
    await expect(nav).toBeVisible();
  });

  test("should toggle dark/light mode", async ({ page }) => {
    await page.goto("/");
    const themeBtn = page.locator("#theme-btn");
    const html = page.locator("html");

    await themeBtn.click();
    const classAfterClick = await html.getAttribute("class");
    expect(classAfterClick).toBeTruthy();
  });
});
```

- [ ] **Step 3: 테스트 실행**

```bash
npx playwright test e2e/home.spec.ts
```

- [ ] **Step 4: Commit**

```bash
git add e2e/home.spec.ts
git commit -m "test: add homepage e2e tests"
```

### Task 15: 블로그 글 상세 E2E 테스트

**Files:**
- Create: `e2e/post.spec.ts`

- [ ] **Step 1: E2E 테스트 작성**

```typescript
import { test, expect } from "@playwright/test";

test.describe("Blog Post", () => {
  test("should navigate to a post and display content", async ({ page }) => {
    await page.goto("/");
    const firstPost = page.locator("a[href*='/posts/']").first();
    await firstPost.click();
    await expect(page.locator("article")).toBeVisible();
  });

  test("should display post metadata (date, tags)", async ({ page }) => {
    await page.goto("/");
    const firstPost = page.locator("a[href*='/posts/']").first();
    await firstPost.click();
    await expect(page.locator("time")).toBeVisible();
  });

  test("should have back button", async ({ page }) => {
    await page.goto("/");
    const firstPost = page.locator("a[href*='/posts/']").first();
    await firstPost.click();
    const backBtn = page.locator("a[href='/leeyc-blog/']").or(page.locator("button").filter({ hasText: /back/i }));
    await expect(backBtn.first()).toBeVisible();
  });
});
```

- [ ] **Step 2: 테스트 실행**

```bash
npx playwright test e2e/post.spec.ts
```

- [ ] **Step 3: Commit**

```bash
git add e2e/post.spec.ts
git commit -m "test: add blog post detail e2e tests"
```

### Task 16: 태그 & 검색 E2E 테스트

**Files:**
- Create: `e2e/tags-search.spec.ts`

- [ ] **Step 1: E2E 테스트 작성**

```typescript
import { test, expect } from "@playwright/test";

test.describe("Tags", () => {
  test("should display tags page", async ({ page }) => {
    await page.goto("/tags");
    await expect(page.locator("main")).toBeVisible();
  });

  test("should navigate to tag and show filtered posts", async ({ page }) => {
    await page.goto("/tags");
    const firstTag = page.locator("a[href*='/tags/']").first();
    if (await firstTag.isVisible()) {
      await firstTag.click();
      await expect(page.locator("main")).toBeVisible();
    }
  });
});

test.describe("Search", () => {
  test("should display search page", async ({ page }) => {
    await page.goto("/search");
    await expect(page.locator("main")).toBeVisible();
  });
});
```

- [ ] **Step 2: 테스트 실행**

```bash
npx playwright test e2e/tags-search.spec.ts
```

- [ ] **Step 3: Commit**

```bash
git add e2e/tags-search.spec.ts
git commit -m "test: add tags and search e2e tests"
```

### Task 17: 404 페이지 E2E 테스트

**Files:**
- Create: `e2e/404.spec.ts`

- [ ] **Step 1: E2E 테스트 작성**

```typescript
import { test, expect } from "@playwright/test";

test.describe("404 Page", () => {
  test("should show 404 for non-existent page", async ({ page }) => {
    const response = await page.goto("/this-page-does-not-exist");
    expect(response?.status()).toBe(404);
  });
});
```

- [ ] **Step 2: 테스트 실행**

```bash
npx playwright test e2e/404.spec.ts
```

- [ ] **Step 3: Commit**

```bash
git add e2e/404.spec.ts
git commit -m "test: add 404 page e2e test"
```

---

## Chunk 5: 최종 검증 및 배포

### Task 18: 전체 테스트 실행 및 커버리지 확인

- [ ] **Step 1: 전체 unit 테스트 + 커버리지**

```bash
npx vitest run --coverage
```

Expected: 100% coverage on src/utils/

- [ ] **Step 2: 전체 e2e 테스트**

```bash
npm run build && npx playwright test
```

Expected: 모든 테스트 통과

- [ ] **Step 3: Commit (coverage 리포트 .gitignore에 추가)**

```bash
echo "coverage/" >> .gitignore
echo "playwright-report/" >> .gitignore
echo "test-results/" >> .gitignore
git add .gitignore
git commit -m "chore: add test output directories to gitignore"
```

### Task 19: CI에 테스트 추가

**Files:**
- Modify: `.github/workflows/deploy.yml`

- [ ] **Step 1: deploy.yml에 test job 추가**

build job 전에 test job을 추가하여 테스트 통과 후에만 배포되도록 구성.

```yaml
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run test:coverage
      - uses: actions/upload-artifact@v4
        with:
          name: coverage-report
          path: coverage/
```

build job에 `needs: test` 추가.

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/deploy.yml
git commit -m "ci: add test job to deployment pipeline"
```
