# Blog Redesign Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** AstroPaper 블로그를 Tailwind Blog 스타일로 전면 리디자인 (라이트 전용, Teal 액센트, 푸터 없음)

**Architecture:** 기존 Astro + Tailwind 구조 유지. 컴포넌트 삭제/수정으로 진행. MD 콘텐츠를 public/에 카테고리별 이동. 다크모드 관련 코드 전면 제거.

**Tech Stack:** Astro 5, Tailwind CSS 4, TypeScript, Pagefind

---

## Chunk 1: Foundation (Config, Styles, Theme Removal)

### Task 1: Config 업데이트

**Files:**
- Modify: `src/config.ts`

- [ ] **Step 1: config 값 변경**

```typescript
export const SITE = {
  website: "https://leeyc924.github.io/blog/",
  author: "leeyc",
  profile: "https://github.com/leeyc924",
  desc: "개발과 일상을 기록하는 블로그",
  title: "leeyc blog",
  ogImage: "astropaper-og.jpg",
  lightAndDarkMode: false,
  postPerIndex: 4,
  postPerPage: 4,
  scheduledPostMargin: 15 * 60 * 1000,
  showArchives: false,
  showBackButton: false,
  editPost: {
    enabled: false,
    text: "Edit page",
    url: "https://github.com/leeyc924/blog/edit/main/",
  },
  dynamicOgImage: true,
  dir: "ltr",
  lang: "ko",
  timezone: "Asia/Seoul",
} as const;
```

- [ ] **Step 2: 빌드 확인**

Run: `cd "/Users/leeyc/workspace/사이드/blog" && pnpm run build`
Expected: 빌드 성공 (경고 있을 수 있지만 에러 없음)

- [ ] **Step 3: Commit**

```bash
git add src/config.ts
git commit -m "chore: update config - disable dark mode, archives, editPost"
```

### Task 2: 다크모드 & 컬러 스타일 교체

**Files:**
- Modify: `src/styles/global.css`
- Modify: `src/styles/typography.css`
- Delete: `src/scripts/theme.ts`

- [ ] **Step 1: global.css를 라이트 전용 Teal 테마로 교체**

`src/styles/global.css` 전체를 다음으로 교체:

```css
@import "tailwindcss";
@import "./typography.css";

:root {
  --background: #ffffff;
  --foreground: #111827;
  --body: #374151;
  --accent: #0d9488;
  --accent-bg: #f0fdfa;
  --muted: #9ca3af;
  --border: #f3f4f6;
  --border-strong: #e5e7eb;
}

@theme inline {
  --font-app: "Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, "Helvetica Neue", "Segoe UI", "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", sans-serif;
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-body: var(--body);
  --color-accent: var(--accent);
  --color-accent-bg: var(--accent-bg);
  --color-muted: var(--muted);
  --color-border: var(--border);
  --color-border-strong: var(--border-strong);
}

@layer base {
  * {
    @apply border-border outline-accent/75;
    scrollbar-width: auto;
    scrollbar-color: var(--color-muted) transparent;
  }
  html {
    @apply overflow-y-scroll scroll-smooth;
  }
  body {
    @apply flex min-h-svh flex-col bg-background font-app text-body selection:bg-accent/75 selection:text-background;
  }
  a,
  button {
    @apply outline-offset-1 outline-accent focus-visible:no-underline focus-visible:outline-2 focus-visible:outline-dashed;
  }
  button:not(:disabled),
  [role="button"]:not(:disabled) {
    cursor: pointer;
  }
}

@utility max-w-app {
  @apply max-w-3xl xl:max-w-5xl;
}

@utility app-layout {
  @apply mx-auto w-full max-w-app px-4 sm:px-6 xl:px-0;
}

.active-nav {
  @apply underline decoration-wavy decoration-2 underline-offset-8;
}

:target {
  scroll-margin-block: 1rem;
}
```

- [ ] **Step 2: typography.css에서 다크모드 코드 제거**

`src/styles/typography.css`에서 `html[data-theme="dark"] .astro-code` 블록을 제거. 나머지 유지.

- [ ] **Step 3: theme.ts 삭제**

```bash
rm src/scripts/theme.ts
```

- [ ] **Step 4: 빌드 확인**

Run: `pnpm run build`
Expected: theme.ts import 에러 발생 (다음 태스크에서 수정)

- [ ] **Step 5: Commit**

```bash
git add src/styles/global.css src/styles/typography.css
git rm src/scripts/theme.ts
git commit -m "feat: replace theme with light-only teal color scheme"
```

### Task 3: Layout.astro에서 다크모드 제거

**Files:**
- Modify: `src/layouts/Layout.astro`

- [ ] **Step 1: Layout.astro 전체를 다음으로 교체**

```astro
---
import { ClientRouter } from "astro:transitions";
import { PUBLIC_GOOGLE_SITE_VERIFICATION } from "astro:env/client";
import { SITE } from "@/config";
import "@/styles/global.css";
import { withBase } from "@/utils/getBase";

type Props = {
  title?: string;
  author?: string;
  profile?: string;
  description?: string;
  ogImage?: string;
  canonicalURL?: string;
  pubDatetime?: Date;
  modDatetime?: Date | null;
  scrollSmooth?: boolean;
};

const {
  title = SITE.title,
  author = SITE.author,
  profile = SITE.profile,
  description = SITE.desc,
  ogImage = SITE.ogImage ? `${import.meta.env.BASE_URL}${SITE.ogImage}` : `${import.meta.env.BASE_URL}og.png`,
  canonicalURL = new URL(Astro.url.pathname, Astro.url),
  pubDatetime,
  modDatetime,
  scrollSmooth = false,
} = Astro.props;

const socialImageURL = new URL(ogImage, Astro.url);

const structuredData = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: `${title}`,
  image: `${socialImageURL}`,
  datePublished: `${pubDatetime?.toISOString()}`,
  ...(modDatetime && { dateModified: modDatetime.toISOString() }),
  author: [
    {
      "@type": "Person",
      name: `${author}`,
      ...(profile && { url: profile }),
    },
  ],
};
---

<!doctype html>
<html
  dir={SITE.dir}
  lang={`${SITE.lang ?? "en"}`}
  class={`${scrollSmooth && "scroll-smooth"}`}
>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width" />
    <link rel="icon" type="image/svg+xml" href={withBase("/favicon.svg")} />
    <link rel="canonical" href={canonicalURL} />
    <meta name="generator" content={Astro.generator} />

    <link
      rel="stylesheet"
      as="style"
      crossorigin
      href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
    />

    <title>{title}</title>
    <meta name="title" content={title} />
    <meta name="description" content={description} />
    <meta name="author" content={author} />
    <link rel="sitemap" href={withBase("/sitemap-index.xml")} />

    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:url" content={canonicalURL} />
    <meta property="og:image" content={socialImageURL} />

    {pubDatetime && <meta property="article:published_time" content={pubDatetime.toISOString()} />}
    {modDatetime && <meta property="article:modified_time" content={modDatetime.toISOString()} />}

    <meta property="twitter:card" content="summary_large_image" />
    <meta property="twitter:url" content={canonicalURL} />
    <meta property="twitter:title" content={title} />
    <meta property="twitter:description" content={description} />
    <meta property="twitter:image" content={socialImageURL} />

    <script type="application/ld+json" is:inline set:html={JSON.stringify(structuredData)} />

    <link rel="alternate" type="application/rss+xml" title={SITE.title} href={new URL("rss.xml", Astro.site)} />

    {PUBLIC_GOOGLE_SITE_VERIFICATION && <meta name="google-site-verification" content={PUBLIC_GOOGLE_SITE_VERIFICATION} />}

    <ClientRouter />
  </head>
  <body>
    <slot />
  </body>
</html>
```

- [ ] **Step 2: 빌드 확인**

Run: `pnpm run build`
Expected: 빌드 성공 (Footer import 에러 있을 수 있음 — 다음 태스크에서 수정)

- [ ] **Step 3: Commit**

```bash
git add src/layouts/Layout.astro
git commit -m "feat: remove dark mode from Layout.astro"
```

---

## Chunk 2: Component Cleanup (Delete & Simplify)

### Task 4: 불필요한 컴포넌트 삭제

**Files:**
- Delete: `src/components/Footer.astro`
- Delete: `src/components/BackToTopButton.astro`
- Delete: `src/components/BackButton.astro`
- Delete: `src/components/EditPost.astro`
- Delete: `src/pages/archives/index.astro`

- [ ] **Step 1: 파일 삭제**

```bash
git rm src/components/Footer.astro
git rm src/components/BackToTopButton.astro
git rm src/components/BackButton.astro
git rm src/components/EditPost.astro
git rm src/pages/archives/index.astro
```

- [ ] **Step 2: Commit**

```bash
git commit -m "chore: remove Footer, BackToTopButton, BackButton, EditPost, Archives"
```

### Task 5: Header에서 다크모드 토글 & Archives 제거

**Files:**
- Modify: `src/components/Header.astro`

- [ ] **Step 1: Header.astro 전체를 다음으로 교체**

```astro
---
import IconX from "@/assets/icons/IconX.svg";
import IconSearch from "@/assets/icons/IconSearch.svg";
import IconMenuDeep from "@/assets/icons/IconMenuDeep.svg";
import LinkButton from "./LinkButton.astro";
import { SITE } from "@/config";
import { withBase } from "@/utils/getBase";

const { pathname } = Astro.url;

const currentPath =
  pathname.endsWith("/") && pathname !== "/" ? pathname.slice(0, -1) : pathname;

const isActive = (path: string) => {
  const currentPathArray = currentPath.split("/").filter(p => p.trim());
  const pathArray = path.split("/").filter(p => p.trim());
  return currentPath === path || currentPathArray[0] === pathArray[0];
};
---

<a
  id="skip-to-content"
  href="#main-content"
  class="absolute start-16 -top-full z-50 bg-background px-3 py-2 text-accent backdrop-blur-lg transition-all focus:top-4"
>
  Skip to content
</a>

<header class="app-layout flex flex-col items-center justify-between sm:flex-row">
  <div
    id="top-nav-wrap"
    class:list={[
      "py-4 sm:py-6",
      "border-b border-border-strong",
      "relative w-full bg-background",
      "flex items-baseline justify-between sm:items-center",
    ]}
  >
    <a
      href={withBase("/")}
      class="absolute py-1 text-xl leading-8 font-semibold whitespace-nowrap text-foreground sm:static sm:my-auto sm:text-2xl sm:leading-none"
    >
      {SITE.title}
    </a>
    <nav
      id="nav-menu"
      class="flex w-full flex-col items-center sm:ms-2 sm:flex-row sm:justify-end sm:space-x-4 sm:py-0"
    >
      <button
        id="menu-btn"
        class="focus-outline self-end p-2 sm:hidden"
        aria-label="Open Menu"
        aria-expanded="false"
        aria-controls="menu-items"
      >
        <IconX id="close-icon" class="hidden" />
        <IconMenuDeep id="menu-icon" />
      </button>
      <ul
        id="menu-items"
        class:list={[
          "mt-4 grid w-44 grid-cols-2 place-content-center gap-2",
          "[&>li>a]:block [&>li>a]:px-4 [&>li>a]:py-3 [&>li>a]:text-center [&>li>a]:font-medium [&>li>a]:hover:text-accent sm:[&>li>a]:px-2 sm:[&>li>a]:py-1",
          "hidden",
          "sm:mt-0 sm:flex sm:w-auto sm:gap-x-5 sm:gap-y-0",
        ]}
      >
        <li class="col-span-2">
          <a href={withBase("/posts")} class:list={{ "active-nav": isActive("/posts") }}>
            Blog
          </a>
        </li>
        <li class="col-span-2">
          <a href={withBase("/tags")} class:list={{ "active-nav": isActive("/tags") }}>
            Tags
          </a>
        </li>
        <li class="col-span-2">
          <a href={withBase("/about")} class:list={{ "active-nav": isActive("/about") }}>
            About
          </a>
        </li>
        <li class="col-span-1 flex items-center justify-center">
          <LinkButton
            href={withBase("/search")}
            class:list={[
              "focus-outline flex p-3 sm:p-1",
              { "[&>svg]:stroke-accent": isActive("/search") },
            ]}
            title="Search"
            aria-label="search"
          >
            <IconSearch />
            <span class="sr-only">Search</span>
          </LinkButton>
        </li>
      </ul>
    </nav>
  </div>
</header>

<script>
  function toggleNav() {
    const menuBtn = document.querySelector("#menu-btn");
    const menuItems = document.querySelector("#menu-items");
    const menuIcon = document.querySelector("#menu-icon");
    const closeIcon = document.querySelector("#close-icon");

    if (!menuBtn || !menuItems || !menuIcon || !closeIcon) return;

    menuBtn.addEventListener("click", () => {
      const openMenu = menuBtn.getAttribute("aria-expanded") === "true";
      menuBtn.setAttribute("aria-expanded", openMenu ? "false" : "true");
      menuBtn.setAttribute("aria-label", openMenu ? "Open Menu" : "Close Menu");
      menuItems.classList.toggle("hidden");
      menuIcon.classList.toggle("hidden");
      closeIcon.classList.toggle("hidden");
    });
  }

  toggleNav();
  document.addEventListener("astro:after-swap", toggleNav);
</script>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Header.astro
git commit -m "feat: simplify Header - remove dark toggle and archives link"
```

---

## Chunk 3: Card, Tag, Datetime Components

### Task 6: Card 컴포넌트를 그리드 레이아웃으로 변경

**Files:**
- Modify: `src/components/Card.astro`

- [ ] **Step 1: Card.astro 전체를 다음으로 교체**

```astro
---
import type { CollectionEntry } from "astro:content";
import { slugifyStr } from "@/utils/slugify";
import { getPath } from "@/utils/getPath";
import { withBase } from "@/utils/getBase";
import Datetime from "./Datetime.astro";
import Tag from "./Tag.astro";

type Props = {
  variant?: "h2" | "h3";
} & CollectionEntry<"blog">;

const { variant: Heading = "h2", id, data, filePath } = Astro.props;
const { title, description, tags, ...props } = data;
---

<li class="grid grid-cols-1 gap-2 py-6 xl:grid-cols-[120px_1fr] xl:gap-4 [&:not(:last-child)]:border-b [&:not(:last-child)]:border-border">
  <Datetime {...props} class="text-muted xl:pt-1" />
  <div>
    <a
      href={withBase(getPath(id, filePath))}
      class="inline-block text-lg font-semibold text-foreground hover:text-accent"
    >
      <Heading
        style={{ viewTransitionName: slugifyStr(title.replaceAll(".", "-")) }}
      >
        {title}
      </Heading>
    </a>
    <ul class="mt-1.5 flex flex-wrap gap-1.5">
      {tags.map(tag => <Tag tag={slugifyStr(tag)} tagName={tag} size="sm" />)}
    </ul>
    <p class="mt-2 text-sm leading-relaxed text-muted">{description}</p>
  </div>
</li>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Card.astro
git commit -m "feat: Card component with date-left grid layout"
```

### Task 7: Tag 컴포넌트를 pill 뱃지 스타일로 변경

**Files:**
- Modify: `src/components/Tag.astro`

- [ ] **Step 1: Tag.astro 전체를 다음으로 교체**

```astro
---
import { withBase } from "@/utils/getBase";

type Props = {
  tag: string;
  tagName: string;
  size?: "sm" | "lg";
};

const { tag, tagName, size = "lg" } = Astro.props;
---

<li class="inline-block">
  <a
    href={withBase(`/tags/${tag}/`)}
    transition:name={tag}
    class:list={[
      "rounded-full bg-accent-bg text-accent hover:bg-accent hover:text-white transition-colors",
      { "px-2.5 py-0.5 text-xs": size === "sm" },
      { "px-3 py-1 text-sm": size === "lg" },
    ]}
  >
    {tagName}
  </a>
</li>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Tag.astro
git commit -m "feat: Tag component as teal pill badge"
```

### Task 8: Datetime 컴포넌트 간소화

**Files:**
- Modify: `src/components/Datetime.astro`

- [ ] **Step 1: Datetime.astro 전체를 다음으로 교체**

```astro
---
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { SITE } from "@/config";

dayjs.extend(utc);
dayjs.extend(timezone);

type Props = {
  class?: string;
  size?: "sm" | "lg";
  pubDatetime: string | Date;
  timezone?: string;
  modDatetime?: string | Date | null;
};

const {
  pubDatetime,
  modDatetime,
  size = "sm",
  class: className = "",
  timezone: postTimezone,
} = Astro.props;

const isModified = modDatetime && modDatetime > pubDatetime;

const datetime = dayjs(isModified ? modDatetime : pubDatetime).tz(
  postTimezone || SITE.timezone
);

const date = datetime.format("YYYY.MM.DD");
---

<time
  class:list={[
    "text-muted",
    { "text-sm": size === "sm" },
    { "text-base": size === "lg" },
    className,
  ]}
  datetime={datetime.toISOString()}
>
  {date}
</time>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Datetime.astro
git commit -m "feat: simplify Datetime component"
```

---

## Chunk 4: Page Templates

### Task 9: 홈페이지 리디자인

**Files:**
- Modify: `src/pages/index.astro`

- [ ] **Step 1: index.astro 전체를 다음으로 교체**

```astro
---
import { getCollection } from "astro:content";
import Layout from "@/layouts/Layout.astro";
import Header from "@/components/Header.astro";
import LinkButton from "@/components/LinkButton.astro";
import Card from "@/components/Card.astro";
import getSortedPosts from "@/utils/getSortedPosts";
import IconArrowRight from "@/assets/icons/IconArrowRight.svg";
import { SITE } from "@/config";
import { withBase } from "@/utils/getBase";

const posts = await getCollection("blog");
const sortedPosts = getSortedPosts(posts);
const recentPosts = sortedPosts.slice(0, SITE.postPerIndex);
---

<Layout>
  <Header />
  <main id="main-content" class="app-layout py-12">
    <ul class="divide-y divide-border">
      {recentPosts.map(data => <Card variant="h3" {...data} />)}
    </ul>

    {sortedPosts.length > SITE.postPerIndex && (
      <div class="mt-8 text-center">
        <LinkButton href={withBase("/posts/")}>
          All Posts
          <IconArrowRight class="inline-block rtl:-rotate-180" />
        </LinkButton>
      </div>
    )}
  </main>
</Layout>
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: redesign homepage with grid card layout"
```

### Task 10: 블로그 목록 페이지 리디자인

**Files:**
- Modify: `src/pages/posts/[...page].astro`
- Modify: `src/layouts/Main.astro`

- [ ] **Step 1: Main.astro에서 backUrl 로직 제거하고 간소화**

```astro
---
import Breadcrumb from "@/components/Breadcrumb.astro";

type StringTitle = { pageTitle: string };
type ArrayTitle = { pageTitle: [string, string]; titleTransition: string };

type Props = (StringTitle | ArrayTitle) & { pageDesc?: string };

const { props } = Astro;
---

<Breadcrumb />
<main id="main-content" class="app-layout pb-4">
  {
    "titleTransition" in props ? (
      <h1 class="text-2xl font-semibold text-foreground sm:text-3xl">
        {props.pageTitle[0]}
        <span transition:name={props.titleTransition}>
          {props.pageTitle[1]}
        </span>
      </h1>
    ) : (
      <h1 class="text-2xl font-semibold text-foreground sm:text-3xl">{props.pageTitle}</h1>
    )
  }
  {props.pageDesc && <p class="mt-2 mb-6 text-muted">{props.pageDesc}</p>}
  <slot />
</main>
```

- [ ] **Step 2: posts/[...page].astro에서 Footer 제거**

```astro
---
import type { GetStaticPaths } from "astro";
import { getCollection } from "astro:content";
import Main from "@/layouts/Main.astro";
import Layout from "@/layouts/Layout.astro";
import Header from "@/components/Header.astro";
import Card from "@/components/Card.astro";
import Pagination from "@/components/Pagination.astro";
import getSortedPosts from "@/utils/getSortedPosts";
import { SITE } from "@/config";

export const getStaticPaths = (async ({ paginate }) => {
  const posts = await getCollection("blog", ({ data }) => !data.draft);
  return paginate(getSortedPosts(posts), { pageSize: SITE.postPerPage });
}) satisfies GetStaticPaths;

const { page } = Astro.props;
---

<Layout title={`Posts | ${SITE.title}`}>
  <Header />
  <Main pageTitle="Posts" pageDesc="All the articles I've posted.">
    <ul class="divide-y divide-border">
      {page.data.map(data => <Card {...data} />)}
    </ul>
  </Main>
  <Pagination {page} />
</Layout>
```

- [ ] **Step 3: Commit**

```bash
git add src/layouts/Main.astro src/pages/posts/\[...page\].astro
git commit -m "feat: redesign blog list page - remove footer, simplify layout"
```

### Task 11: PostDetails 리디자인

**Files:**
- Modify: `src/layouts/PostDetails.astro`

- [ ] **Step 1: PostDetails.astro 전체를 다음으로 교체**

```astro
---
import { render, type CollectionEntry } from "astro:content";
import Layout from "@/layouts/Layout.astro";
import Header from "@/components/Header.astro";
import Tag from "@/components/Tag.astro";
import Datetime from "@/components/Datetime.astro";
import { getPath } from "@/utils/getPath";
import { withBase } from "@/utils/getBase";
import { slugifyStr } from "@/utils/slugify";
import { SITE } from "@/config";

type Props = {
  post: CollectionEntry<"blog">;
  posts: CollectionEntry<"blog">[];
};

const { post, posts } = Astro.props;

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
} = post.data;

const { Content } = await render(post);

let ogImageUrl: string | undefined;
if (typeof initOgImage === "string") {
  ogImageUrl = initOgImage;
} else if (initOgImage?.src) {
  ogImageUrl = initOgImage.src;
}
if (!ogImageUrl && SITE.dynamicOgImage) {
  ogImageUrl = `${withBase(getPath(post.id, post.filePath))}/index.png`;
}
const ogImage = ogImageUrl
  ? new URL(ogImageUrl, Astro.url.origin).href
  : undefined;

const layoutProps = {
  title: `${title} | ${SITE.title}`,
  author,
  description,
  pubDatetime,
  modDatetime,
  canonicalURL,
  ogImage,
  scrollSmooth: true,
};

const allPosts = posts.map(({ data: { title }, id, filePath }) => ({
  id,
  title,
  filePath,
}));

const currentPostIndex = allPosts.findIndex(a => a.id === post.id);
const prevPost = currentPostIndex !== 0 ? allPosts[currentPostIndex - 1] : null;
const nextPost =
  currentPostIndex !== allPosts.length ? allPosts[currentPostIndex + 1] : null;
---

<Layout {...layoutProps}>
  <Header />
  <main id="main-content" class="app-layout py-8" data-pagefind-body>
    <a
      href={withBase("/posts/")}
      class="mb-6 inline-block text-sm text-accent hover:underline"
    >
      ← Back to blog
    </a>

    <h1
      transition:name={slugifyStr(title.replaceAll(".", "-"))}
      class="text-2xl font-extrabold text-foreground sm:text-3xl"
    >
      {title}
    </h1>

    <div class="mt-2 flex items-center gap-3 text-sm text-muted">
      <Datetime {pubDatetime} {modDatetime} {timezone} size="sm" />
    </div>

    <ul class="mt-3 flex flex-wrap gap-1.5">
      {tags.map(tag => <Tag tag={slugifyStr(tag)} tagName={tag} size="sm" />)}
    </ul>

    <article
      id="article"
      class="app-prose mt-10 w-full max-w-[65ch] prose-pre:bg-(--shiki-light-bg)"
    >
      <Content />
    </article>

    <hr class="my-8 border-border" />

    <div data-pagefind-ignore class="grid grid-cols-1 gap-6 sm:grid-cols-2">
      {prevPost && (
        <a
          href={withBase(getPath(prevPost.id, prevPost.filePath))}
          class="group flex flex-col"
        >
          <span class="text-xs text-muted">← Previous</span>
          <span class="mt-1 text-sm text-accent group-hover:underline">{prevPost.title}</span>
        </a>
      )}
      {nextPost && (
        <a
          href={withBase(getPath(nextPost.id, nextPost.filePath))}
          class="group flex flex-col text-end sm:col-start-2"
        >
          <span class="text-xs text-muted">Next →</span>
          <span class="mt-1 text-sm text-accent group-hover:underline">{nextPost.title}</span>
        </a>
      )}
    </div>
  </main>
</Layout>

<script is:inline data-astro-rerun>
  function addHeadingLinks() {
    const headings = Array.from(
      document.querySelectorAll("h2, h3, h4, h5, h6")
    );
    for (const heading of headings) {
      heading.classList.add("group");
      const link = document.createElement("a");
      link.className =
        "heading-link ms-2 no-underline opacity-75 md:opacity-0 md:group-hover:opacity-100 md:focus:opacity-100";
      link.href = "#" + heading.id;
      const span = document.createElement("span");
      span.ariaHidden = "true";
      span.innerText = "#";
      link.appendChild(span);
      heading.appendChild(link);
    }
  }
  addHeadingLinks();

  function attachCopyButtons() {
    const copyButtonLabel = "Copy";
    const codeBlocks = Array.from(document.querySelectorAll("pre"));
    for (const codeBlock of codeBlocks) {
      const wrapper = document.createElement("div");
      wrapper.style.position = "relative";
      const computedStyle = getComputedStyle(codeBlock);
      const hasFileNameOffset =
        computedStyle.getPropertyValue("--file-name-offset").trim() !== "";
      const topClass = hasFileNameOffset ? "top-(--file-name-offset)" : "-top-3";
      const copyButton = document.createElement("button");
      copyButton.className = `copy-code absolute end-3 ${topClass} rounded bg-border border border-border-strong px-2 py-1 text-xs leading-4 text-foreground font-medium`;
      copyButton.innerHTML = copyButtonLabel;
      codeBlock.setAttribute("tabindex", "0");
      codeBlock.appendChild(copyButton);
      codeBlock?.parentNode?.insertBefore(wrapper, codeBlock);
      wrapper.appendChild(codeBlock);
      copyButton.addEventListener("click", async () => {
        const code = codeBlock.querySelector("code");
        const text = code?.innerText;
        await navigator.clipboard.writeText(text ?? "");
        copyButton.innerText = "Copied";
        setTimeout(() => { copyButton.innerText = copyButtonLabel; }, 700);
      });
    }
  }
  attachCopyButtons();

  document.addEventListener("astro:after-swap", () =>
    window.scrollTo({ left: 0, top: 0, behavior: "instant" })
  );
</script>
```

- [ ] **Step 2: Commit**

```bash
git add src/layouts/PostDetails.astro
git commit -m "feat: redesign PostDetails - left aligned, back link, no author"
```

### Task 12: 태그 페이지들에서 Footer 제거

**Files:**
- Modify: `src/pages/tags/index.astro`
- Modify: `src/pages/tags/[tag]/[...page].astro`
- Modify: `src/layouts/AboutLayout.astro`

- [ ] **Step 1: tags/index.astro에서 Footer 제거**

Footer import와 `<Footer />` 사용 부분을 모두 제거.

- [ ] **Step 2: tags/[tag]/[...page].astro에서 Footer 제거**

Footer import와 `<Footer noMarginTop={page.lastPage > 1} />` 사용 부분을 제거.

- [ ] **Step 3: AboutLayout.astro에서 Footer 제거**

Footer import와 `<Footer />` 사용 부분을 제거.

- [ ] **Step 4: 빌드 확인**

Run: `pnpm run build`
Expected: 전체 빌드 성공, Footer 관련 에러 없음

- [ ] **Step 5: Commit**

```bash
git add src/pages/tags/index.astro src/pages/tags/\[tag\]/\[...page\].astro src/layouts/AboutLayout.astro
git commit -m "feat: remove Footer from tags and about pages"
```

---

## Chunk 5: Content Migration & Final Verification

### Task 13: MD 콘텐츠를 public/에 카테고리별로 이동

**Files:**
- Move: `src/data/blog/*.md` → `public/blog/<category>/*.md`
- Modify: `src/content.config.ts`

- [ ] **Step 1: public/blog 디렉토리 구조 생성**

각 MD 파일의 tags를 기준으로 카테고리별 디렉토리를 생성하고 파일을 이동. 현재 34개 파일이 있으므로 태그 기반으로 분류:

```bash
mkdir -p public/blog
# 모든 MD 파일을 public/blog/로 이동 (flat 구조로 우선 이동)
cp src/data/blog/*.md public/blog/
```

Note: 카테고리 분류는 각 파일의 frontmatter tags를 확인하여 수동으로 진행. 첫 번째 태그를 기준으로 디렉토리를 생성.

- [ ] **Step 2: content.config.ts 경로 변경**

```typescript
import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";
import { SITE } from "@/config";

export const BLOG_PATH = "public/blog";

const blog = defineCollection({
  loader: glob({ pattern: "**/[^_]*.md", base: `./${BLOG_PATH}` }),
  schema: ({ image }) =>
    z.object({
      author: z.string().default(SITE.author),
      pubDatetime: z.date(),
      modDatetime: z.date().optional().nullable(),
      title: z.string(),
      featured: z.boolean().optional(),
      draft: z.boolean().optional(),
      tags: z.array(z.string()).default(["others"]),
      ogImage: image().or(z.string()).optional(),
      description: z.string(),
      canonicalURL: z.string().optional(),
      timezone: z.string().optional(),
    }),
});

export const collections = { blog };
```

Note: `hideEditPost` 필드 제거 (EditPost 삭제됨).

- [ ] **Step 3: 기존 src/data/blog 디렉토리 삭제**

```bash
rm -rf src/data/blog/
```

- [ ] **Step 4: 빌드 확인**

Run: `pnpm run build`
Expected: 모든 포스트가 정상 빌드됨

- [ ] **Step 5: Commit**

```bash
git add public/blog/ src/content.config.ts
git rm -r src/data/blog/
git commit -m "feat: migrate blog content to public/blog"
```

### Task 14: 전체 빌드 & 데브 서버 확인

- [ ] **Step 1: 클린 빌드**

```bash
rm -rf dist .astro
pnpm run build
```

Expected: 에러 없이 빌드 성공

- [ ] **Step 2: 데브 서버 확인**

```bash
pnpm run dev
```

브라우저에서 확인할 페이지:
- `/` — 홈 (날짜+제목 그리드 레이아웃)
- `/posts/` — 블로그 목록
- `/posts/<slug>` — 포스트 상세 (좌측 정렬, back link)
- `/tags/` — 태그 목록
- `/search/` — Pagefind 검색
- `/about/` — About 페이지

- [ ] **Step 3: 최종 Commit**

```bash
git add -A
git commit -m "feat: complete blog redesign - Tailwind Blog style, light theme, teal accent"
```
