# Zola 기반 개발 블로그 구현 계획

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** GitHub Pages에 호스팅되는 Zola 기반 노션 스타일 개발 블로그를 구축한다.

**Architecture:** Zola SSG로 MD 파일을 HTML로 빌드하고, GitHub Actions가 자동 배포한다. tabi 테마를 베이스로 노션 스타일 CSS를 커스터마이징한다. 검색은 Zola 내장 elasticlunr, 다크모드는 CSS 변수 + localStorage로 구현한다.

**Tech Stack:** Zola (Rust SSG), Tera 템플릿, SCSS, elasticlunr (검색), GitHub Actions, GitHub Pages

---

## 파일 구조

| 파일 | 역할 |
|------|------|
| `config.toml` | Zola 전역 설정 (사이트명, URL, 검색, 테마 등) |
| `content/_index.md` | 홈 페이지 메타 |
| `content/rust/_index.md` | Rust 카테고리 인덱스 |
| `content/rust/ownership.md` | 샘플 글 (시리즈 포함) |
| `content/rust/lifetime.md` | 샘플 글 (시리즈 2번째) |
| `templates/base.html` | 공통 레이아웃 (head, header, footer, 다크모드 토글) |
| `templates/index.html` | 홈 - 글 목록 |
| `templates/page.html` | 글 상세 (TOC, 시리즈, 읽기 시간) |
| `templates/section.html` | 카테고리/섹션 목록 |
| `templates/tags/list.html` | 태그 전체 목록 |
| `templates/tags/single.html` | 태그별 글 목록 |
| `templates/shortcodes/callout.html` | 노션 스타일 콜아웃 블록 |
| `sass/style.scss` | 메인 스타일 (import 허브) |
| `sass/_variables.scss` | CSS 변수 (색상, 폰트, 브레이크포인트) |
| `sass/_base.scss` | 기본 타이포그래피, 레이아웃 |
| `sass/_dark.scss` | 다크모드 색상 오버라이드 |
| `sass/_code.scss` | 코드 블록 스타일 |
| `sass/_components.scss` | 태그, TOC, 시리즈 박스, 콜아웃 등 |
| `static/js/search.js` | 검색 UI (elasticlunr 연동) |
| `static/js/dark-mode.js` | 다크모드 토글 + localStorage |
| `static/robots.txt` | 검색 엔진 크롤링 허용 |
| `.github/workflows/deploy.yml` | GitHub Actions 배포 워크플로우 |
| `.gitignore` | public/, .superpowers/ 제외 |

---

## Chunk 1: 프로젝트 초기화 및 기본 구조

### Task 1: Zola 설치 확인 및 프로젝트 초기화

**Files:**
- Create: `config.toml`
- Create: `.gitignore`

- [ ] **Step 1: Zola 설치 확인**

```bash
zola --version
```

설치 안 되어 있으면:
```bash
brew install zola
```

- [ ] **Step 2: Git 초기화**

```bash
cd /Users/leeyc/workspace/leeyc924/leeyc-blog
git init
```

- [ ] **Step 3: config.toml 생성**

```toml
base_url = "https://leeyc924.github.io"
title = "leeyc blog"
description = "개발 기록과 학습 노트"
default_language = "ko"
theme = ""

compile_sass = true
build_search_index = true
generate_feeds = true
feed_filenames = ["atom.xml"]

taxonomies = [
    { name = "tags", feed = false },
]

[search]
include_title = true
include_description = true
include_content = true

[markdown]
highlight_code = true
highlight_theme = "base16-ocean-dark"
extra_syntaxes_and_themes = []

[extra]
author = "leeyc"
```

- [ ] **Step 4: .gitignore 생성**

```
public/
.superpowers/
.DS_Store
```

- [ ] **Step 5: 빈 디렉토리 구조 생성**

```bash
mkdir -p content/rust content/react templates/tags templates/shortcodes sass static/js static/images .github/workflows
```

- [ ] **Step 6: 빌드 확인 (실패 예상 — 템플릿 없음)**

```bash
zola build
```

Expected: 에러 (템플릿 없음) — 정상, 다음 태스크에서 추가

- [ ] **Step 7: 커밋**

```bash
git add config.toml .gitignore
git commit -m "chore: init zola project with config"
```

---

### Task 2: 기본 템플릿 (base.html)

**Files:**
- Create: `templates/base.html`

- [ ] **Step 1: base.html 작성**

```html
<!DOCTYPE html>
<html lang="{{ lang }}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{% block title %}{{ config.title }}{% endblock %}</title>
    <meta name="description" content="{% block description %}{{ config.description }}{% endblock %}">

    <!-- Open Graph -->
    <meta property="og:title" content="{% block og_title %}{{ config.title }}{% endblock %}">
    <meta property="og:description" content="{% block og_description %}{{ config.description }}{% endblock %}">
    <meta property="og:type" content="website">
    <meta property="og:url" content="{{ current_url | default(value=config.base_url) }}">

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary">
    <meta name="twitter:title" content="{% block twitter_title %}{{ config.title }}{% endblock %}">
    <meta name="twitter:description" content="{% block twitter_description %}{{ config.description }}{% endblock %}">

    <link rel="stylesheet" href="{{ get_url(path='style.css') }}">
    <link rel="alternate" type="application/atom+xml" title="RSS" href="{{ get_url(path='atom.xml') }}">

    {% if config.build_search_index %}
    <!-- Zola가 빌드 시 elasticlunr.min.js와 search_index.en.js를 public/에 자동 생성 -->
    <script src="{{ get_url(path='elasticlunr.min.js') }}" defer></script>
    <script src="{{ get_url(path='search_index.en.js') }}" defer></script>
    <script src="{{ get_url(path='js/search.js') }}" defer></script>
    {% endif %}
    <script src="{{ get_url(path='js/dark-mode.js') }}"></script>
</head>
<body>
    <header class="site-header">
        <div class="header-inner">
            <a href="{{ config.base_url }}" class="site-title">{{ config.title }}</a>
            <nav class="site-nav">
                <a href="{{ get_url(path='tags') }}">태그</a>
                <a href="{{ get_url(path='atom.xml') }}">RSS</a>
                <button id="dark-mode-toggle" class="dark-toggle" aria-label="다크모드 토글">🌙</button>
            </nav>
        </div>
    </header>

    <main class="site-main">
        {% block content %}{% endblock %}
    </main>

    <footer class="site-footer">
        <div class="footer-inner">
            <p>&copy; {{ now() | date(format="%Y") }} {{ config.extra.author }}. Built with <a href="https://www.getzola.org" target="_blank" rel="noopener">Zola</a>.</p>
        </div>
    </footer>
</body>
</html>
```

- [ ] **Step 2: 커밋**

```bash
git add templates/base.html
git commit -m "feat: add base template with header, footer, SEO meta tags"
```

---

### Task 3: 홈 페이지 (index.html + content)

**Files:**
- Create: `templates/index.html`
- Create: `content/_index.md`

- [ ] **Step 1: content/_index.md 작성**

```markdown
+++
title = "leeyc blog"
description = "개발 기록과 학습 노트"
sort_by = "date"
paginate_by = 10
+++
```

- [ ] **Step 2: templates/index.html 작성**

```html
{% extends "base.html" %}

{% block content %}
<div class="home">
    <div class="home-header">
        <h1>{{ section.title }}</h1>
        <p class="home-description">{{ section.description }}</p>
    </div>

    {% set all_pages = section.pages %}

    <!-- 태그 필터 -->
    <div class="tag-filter">
        <span class="tag-pill active" data-tag="all">전체</span>
        {% set tags = get_taxonomy(kind="tags") %}
        {% for tag in tags.items %}
        <span class="tag-pill" data-tag="{{ tag.name }}">{{ tag.name }}</span>
        {% endfor %}
    </div>

    <!-- 검색 -->
    <div class="search-container">
        <input type="text" id="search-input" class="search-input" placeholder="검색...">
        <div id="search-results" class="search-results"></div>
    </div>

    <!-- 글 목록 -->
    <div class="post-list">
        {% for page in all_pages %}
        <article class="post-item" data-tags="{{ page.taxonomies.tags | join(sep=',') }}">
            <h2 class="post-title">
                <a href="{{ page.permalink }}">{{ page.title }}</a>
            </h2>
            {% if page.description %}
            <p class="post-description">{{ page.description }}</p>
            {% endif %}
            <div class="post-meta">
                <time datetime="{{ page.date }}">{{ page.date | date(format="%Y-%m-%d") }}</time>
                {% if page.taxonomies.tags %}
                {% for tag in page.taxonomies.tags %}
                <a href="{{ get_taxonomy_url(kind='tags', name=tag) }}" class="tag">{{ tag }}</a>
                {% endfor %}
                {% endif %}
                {% if page.reading_time %}
                <span class="reading-time">· {{ page.reading_time }}분</span>
                {% endif %}
            </div>
        </article>
        {% endfor %}
    </div>

    <!-- 페이지네이션 -->
    {% if paginator %}
    <nav class="pagination">
        {% if paginator.previous %}
        <a href="{{ paginator.previous }}" class="prev">← 이전</a>
        {% endif %}
        {% if paginator.next %}
        <a href="{{ paginator.next }}" class="next">다음 →</a>
        {% endif %}
    </nav>
    {% endif %}
</div>
{% endblock %}
```

- [ ] **Step 3: 빌드 확인**

```bash
zola build
```

Expected: 성공 (아직 page.html, section.html 없으면 경고 있을 수 있으나 빌드 가능)

- [ ] **Step 4: 커밋**

```bash
git add templates/index.html content/_index.md
git commit -m "feat: add home page template with post list and tag filter"
```

---

### Task 4: 글 상세 페이지 (page.html)

**Files:**
- Create: `templates/page.html`

- [ ] **Step 1: templates/page.html 작성**

```html
{% extends "base.html" %}

{% block title %}{{ page.title }} | {{ config.title }}{% endblock %}
{% block description %}{{ page.description | default(value=config.description) }}{% endblock %}
{% block og_title %}{{ page.title }}{% endblock %}
{% block og_description %}{{ page.description | default(value=config.description) }}{% endblock %}
{% block twitter_title %}{{ page.title }}{% endblock %}
{% block twitter_description %}{{ page.description | default(value=config.description) }}{% endblock %}

{% block content %}
<article class="post">
    <header class="post-header">
        <h1 class="post-title">{{ page.title }}</h1>
        <div class="post-meta">
            <time datetime="{{ page.date }}">{{ page.date | date(format="%Y-%m-%d") }}</time>
            {% if page.updated %}
            <span class="updated">(수정: {{ page.updated | date(format="%Y-%m-%d") }})</span>
            {% endif %}
            {% if page.reading_time %}
            <span class="reading-time">· {{ page.reading_time }}분</span>
            {% endif %}
        </div>
        {% if page.taxonomies.tags %}
        <div class="post-tags">
            {% for tag in page.taxonomies.tags %}
            <a href="{{ get_taxonomy_url(kind='tags', name=tag) }}" class="tag">{{ tag }}</a>
            {% endfor %}
        </div>
        {% endif %}
    </header>

    <!-- TOC -->
    {% if page.toc %}
    <nav class="toc">
        <details open>
            <summary>📑 목차</summary>
            <ul>
                {% for h in page.toc %}
                <li>
                    <a href="{{ h.permalink }}">{{ h.title }}</a>
                    {% if h.children %}
                    <ul>
                        {% for child in h.children %}
                        <li><a href="{{ child.permalink }}">{{ child.title }}</a></li>
                        {% endfor %}
                    </ul>
                    {% endif %}
                </li>
                {% endfor %}
            </ul>
        </details>
    </nav>
    {% endif %}

    <!-- 본문 -->
    <div class="post-content">
        {{ page.content | safe }}
    </div>

    <!-- 시리즈 네비게이션 -->
    {% if page.extra.series %}
    {% set series_name = page.extra.series %}
    {% set current_order = page.extra.series_order | default(value=0) %}
    {% set section = get_section(path=page.ancestors | last) %}
    {% set series_pages = section.pages | filter(attribute="extra.series", value=series_name) | sort(attribute="extra.series_order") %}

    <div class="series-box">
        <div class="series-title">📚 {{ series_name }}</div>
        <ol class="series-list">
            {% for sp in series_pages %}
            <li class="{% if sp.permalink == page.permalink %}current{% endif %}">
                {% if sp.permalink == page.permalink %}
                <span>{{ sp.title }} (현재 글)</span>
                {% else %}
                <a href="{{ sp.permalink }}">{{ sp.title }}</a>
                {% endif %}
            </li>
            {% endfor %}
        </ol>
    </div>
    {% endif %}
</article>
{% endblock %}
```

- [ ] **Step 2: 커밋**

```bash
git add templates/page.html
git commit -m "feat: add post detail template with TOC and series navigation"
```

---

### Task 5: 섹션 및 태그 템플릿

**Files:**
- Create: `templates/section.html`
- Create: `templates/tags/list.html`
- Create: `templates/tags/single.html`

- [ ] **Step 1: templates/section.html 작성**

```html
{% extends "base.html" %}

{% block title %}{{ section.title }} | {{ config.title }}{% endblock %}

{% block content %}
<div class="section-page">
    <h1>{{ section.title }}</h1>
    {% if section.description %}
    <p class="section-description">{{ section.description }}</p>
    {% endif %}

    <div class="post-list">
        {% for page in section.pages %}
        <article class="post-item">
            <h2 class="post-title">
                <a href="{{ page.permalink }}">{{ page.title }}</a>
            </h2>
            {% if page.description %}
            <p class="post-description">{{ page.description }}</p>
            {% endif %}
            <div class="post-meta">
                <time datetime="{{ page.date }}">{{ page.date | date(format="%Y-%m-%d") }}</time>
                {% if page.taxonomies.tags %}
                {% for tag in page.taxonomies.tags %}
                <a href="{{ get_taxonomy_url(kind='tags', name=tag) }}" class="tag">{{ tag }}</a>
                {% endfor %}
                {% endif %}
            </div>
        </article>
        {% endfor %}
    </div>
</div>
{% endblock %}
```

- [ ] **Step 2: templates/tags/list.html 작성**

```html
{% extends "base.html" %}

{% block title %}태그 | {{ config.title }}{% endblock %}

{% block content %}
<div class="tags-page">
    <h1>태그</h1>
    <div class="tags-cloud">
        {% for term in terms %}
        <a href="{{ term.permalink }}" class="tag-cloud-item">
            {{ term.name }} <span class="tag-count">({{ term.pages | length }})</span>
        </a>
        {% endfor %}
    </div>
</div>
{% endblock %}
```

- [ ] **Step 3: templates/tags/single.html 작성**

```html
{% extends "base.html" %}

{% block title %}#{{ term.name }} | {{ config.title }}{% endblock %}

{% block content %}
<div class="tag-page">
    <h1>#{{ term.name }}</h1>
    <p class="tag-description">{{ term.pages | length }}개의 글</p>

    <div class="post-list">
        {% for page in term.pages %}
        <article class="post-item">
            <h2 class="post-title">
                <a href="{{ page.permalink }}">{{ page.title }}</a>
            </h2>
            {% if page.description %}
            <p class="post-description">{{ page.description }}</p>
            {% endif %}
            <div class="post-meta">
                <time datetime="{{ page.date }}">{{ page.date | date(format="%Y-%m-%d") }}</time>
            </div>
        </article>
        {% endfor %}
    </div>
</div>
{% endblock %}
```

- [ ] **Step 4: 커밋**

```bash
git add templates/section.html templates/tags/
git commit -m "feat: add section and tag templates"
```

---

### Task 6: 콜아웃 shortcode

**Files:**
- Create: `templates/shortcodes/callout.html`

- [ ] **Step 1: callout.html 작성**

```html
<div class="callout callout-{{ type | default(value='info') }}">
    {% if icon | default(value="") != "" %}
    <span class="callout-icon">{{ icon }}</span>
    {% elif type | default(value="info") == "info" %}
    <span class="callout-icon">💡</span>
    {% elif type == "warning" %}
    <span class="callout-icon">⚠️</span>
    {% elif type == "error" %}
    <span class="callout-icon">🚫</span>
    {% elif type == "success" %}
    <span class="callout-icon">✅</span>
    {% endif %}
    <div class="callout-content">{{ body }}</div>
</div>
```

사용법 (MD 파일에서):
```markdown
{%/* callout(type="info") */%}
소유권은 Rust의 핵심 메커니즘입니다.
{%/* end */%}
```

- [ ] **Step 2: 커밋**

```bash
git add templates/shortcodes/callout.html
git commit -m "feat: add notion-style callout shortcode"
```

---

## Chunk 2: 스타일링 (SCSS)

### Task 7: CSS 변수 및 기본 스타일

**Files:**
- Create: `sass/style.scss`
- Create: `sass/_variables.scss`
- Create: `sass/_base.scss`

- [ ] **Step 1: sass/_variables.scss 작성**

```scss
:root {
    // 색상 — 노션 스타일
    --bg-primary: #ffffff;
    --bg-secondary: #f7f6f3;
    --bg-code: #f6f8fa;
    --text-primary: #111111;
    --text-secondary: #555555;
    --text-muted: #999999;
    --border-color: #f0f0f0;
    --link-color: #2b6cb0;
    --link-hover: #1a4a7a;

    // 태그 색상
    --tag-rust-bg: #f1e8ff;
    --tag-rust-color: #6b3fa0;
    --tag-react-bg: #e8f4f8;
    --tag-react-color: #2b6cb0;
    --tag-devops-bg: #fde8e8;
    --tag-devops-color: #c53030;
    --tag-default-bg: #f1f1f0;
    --tag-default-color: #555555;

    // 콜아웃
    --callout-info-bg: #f7f6f3;
    --callout-info-border: #6b3fa0;
    --callout-warning-bg: #fef3cd;
    --callout-warning-border: #ffc107;
    --callout-error-bg: #fde8e8;
    --callout-error-border: #c53030;
    --callout-success-bg: #d4edda;
    --callout-success-border: #28a745;

    // 시리즈
    --series-bg: #f0f4ff;
    --series-border: #2b6cb0;

    // 레이아웃
    --content-width: 680px;
    --header-height: 56px;

    // 폰트
    --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    --font-mono: "Fira Code", "Cascadia Code", "JetBrains Mono", monospace;
    --font-size-base: 16px;
    --line-height: 1.8;
}
```

- [ ] **Step 2: sass/_base.scss 작성**

```scss
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

html {
    font-size: var(--font-size-base);
    scroll-behavior: smooth;
}

body {
    font-family: var(--font-sans);
    color: var(--text-primary);
    background-color: var(--bg-primary);
    line-height: var(--line-height);
    -webkit-font-smoothing: antialiased;
}

a {
    color: var(--link-color);
    text-decoration: none;
    &:hover {
        color: var(--link-hover);
    }
}

// 헤더
.site-header {
    height: var(--header-height);
    border-bottom: 1px solid var(--border-color);
    display: flex;
    align-items: center;
    justify-content: center;
}

.header-inner {
    width: 100%;
    max-width: var(--content-width);
    padding: 0 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.site-title {
    font-size: 18px;
    font-weight: 700;
    color: var(--text-primary);
    &:hover { color: var(--text-primary); }
}

.site-nav {
    display: flex;
    align-items: center;
    gap: 16px;
    font-size: 14px;

    a { color: var(--text-secondary); }
}

.dark-toggle {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 18px;
    padding: 4px;
}

// 메인
.site-main {
    max-width: var(--content-width);
    margin: 0 auto;
    padding: 40px 24px;
}

// 푸터
.site-footer {
    border-top: 1px solid var(--border-color);
    padding: 24px;
    text-align: center;
    font-size: 13px;
    color: var(--text-muted);
}

.footer-inner {
    max-width: var(--content-width);
    margin: 0 auto;
}

// 반응형
@media (max-width: 768px) {
    .site-main {
        padding: 24px 16px;
    }

    .header-inner {
        padding: 0 16px;
    }
}
```

- [ ] **Step 3: sass/style.scss 작성**

```scss
@import "variables";
@import "base";
@import "components";
@import "code";
@import "dark";
```

- [ ] **Step 4: 커밋**

```bash
git add sass/style.scss sass/_variables.scss sass/_base.scss
git commit -m "feat: add base SCSS with variables and layout"
```

---

### Task 8: 컴포넌트 스타일

**Files:**
- Create: `sass/_components.scss`

- [ ] **Step 1: sass/_components.scss 작성**

```scss
// 홈 헤더
.home-header {
    margin-bottom: 32px;

    h1 {
        font-size: 28px;
        font-weight: 700;
    }

    .home-description {
        color: var(--text-muted);
        font-size: 14px;
        margin-top: 4px;
    }
}

// 태그 필터
.tag-filter {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    margin-bottom: 24px;
}

.tag-pill {
    font-size: 12px;
    padding: 4px 12px;
    border-radius: 4px;
    background: var(--tag-default-bg);
    color: var(--tag-default-color);
    cursor: pointer;
    transition: opacity 0.2s;

    &:hover { opacity: 0.8; }
    &.active {
        background: var(--text-primary);
        color: var(--bg-primary);
    }
}

// 검색
.search-container {
    margin-bottom: 24px;
}

.search-input {
    width: 100%;
    padding: 10px 14px;
    border: 1px solid var(--border-color);
    border-radius: 6px;
    font-size: 14px;
    font-family: var(--font-sans);
    background: var(--bg-primary);
    color: var(--text-primary);

    &:focus {
        outline: none;
        border-color: var(--link-color);
    }
}

.search-results {
    margin-top: 8px;
}

// 글 목록
.post-list {
    border-top: 1px solid var(--border-color);
}

.post-item {
    padding: 20px 0;
    border-bottom: 1px solid var(--border-color);
}

.post-title {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 4px;

    a {
        color: var(--text-primary);
        &:hover { color: var(--link-color); }
    }
}

.post-description {
    font-size: 14px;
    color: var(--text-secondary);
    line-height: 1.6;
    margin-bottom: 8px;
}

.post-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    color: var(--text-muted);
    flex-wrap: wrap;
}

.reading-time {
    color: var(--text-muted);
}

// 태그
.tag {
    font-size: 11px;
    padding: 2px 8px;
    border-radius: 4px;
    background: var(--tag-default-bg);
    color: var(--tag-default-color);
}

.post-tags {
    display: flex;
    gap: 6px;
    margin-top: 8px;
}

// TOC
.toc {
    background: var(--bg-secondary);
    border-radius: 6px;
    padding: 16px 20px;
    margin-bottom: 24px;

    summary {
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        margin-bottom: 8px;
    }

    ul {
        list-style: none;
        padding-left: 0;

        li {
            font-size: 13px;
            line-height: 1.8;

            a { color: var(--link-color); }
        }

        ul {
            padding-left: 16px;
        }
    }
}

// 글 본문
.post-content {
    h2 {
        font-size: 22px;
        font-weight: 700;
        margin: 32px 0 12px;
        padding-bottom: 8px;
        border-bottom: 1px solid var(--border-color);
    }

    h3 {
        font-size: 18px;
        font-weight: 600;
        margin: 24px 0 8px;
    }

    p {
        margin-bottom: 16px;
    }

    ul, ol {
        margin-bottom: 16px;
        padding-left: 24px;
    }

    img {
        max-width: 100%;
        border-radius: 6px;
        margin: 16px 0;
    }

    blockquote {
        border-left: 3px solid var(--border-color);
        padding-left: 16px;
        color: var(--text-secondary);
        margin: 16px 0;
    }

    table {
        width: 100%;
        border-collapse: collapse;
        margin: 16px 0;
        font-size: 14px;

        th, td {
            border: 1px solid var(--border-color);
            padding: 8px 12px;
            text-align: left;
        }

        th {
            background: var(--bg-secondary);
            font-weight: 600;
        }
    }
}

// 콜아웃
.callout {
    border-radius: 6px;
    padding: 12px 16px;
    margin: 16px 0;
    display: flex;
    gap: 10px;
    font-size: 14px;

    &-icon {
        flex-shrink: 0;
    }

    &-content {
        flex: 1;
    }

    &-info {
        background: var(--callout-info-bg);
        border-left: 3px solid var(--callout-info-border);
    }

    &-warning {
        background: var(--callout-warning-bg);
        border-left: 3px solid var(--callout-warning-border);
    }

    &-error {
        background: var(--callout-error-bg);
        border-left: 3px solid var(--callout-error-border);
    }

    &-success {
        background: var(--callout-success-bg);
        border-left: 3px solid var(--callout-success-border);
    }
}

// 시리즈 박스
.series-box {
    background: var(--series-bg);
    border-radius: 6px;
    padding: 16px 20px;
    margin-top: 32px;
}

.series-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--series-border);
    margin-bottom: 10px;
}

.series-list {
    padding-left: 20px;
    font-size: 13px;
    line-height: 1.8;

    li.current {
        font-weight: 600;
        color: var(--series-border);
    }

    a { color: var(--text-secondary); }
}

// 태그 클라우드
.tags-cloud {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 16px;
}

.tag-cloud-item {
    font-size: 14px;
    padding: 6px 14px;
    border-radius: 6px;
    background: var(--bg-secondary);
    color: var(--text-primary);

    .tag-count {
        color: var(--text-muted);
        font-size: 12px;
    }
}

// 페이지네이션
.pagination {
    display: flex;
    justify-content: space-between;
    margin-top: 32px;
    padding-top: 16px;
    border-top: 1px solid var(--border-color);
    font-size: 14px;
}

// 반응형 — 컴포넌트
@media (max-width: 768px) {
    .home-header h1 {
        font-size: 24px;
    }

    .post-title {
        font-size: 16px;
    }

    .post-content h2 {
        font-size: 20px;
    }
}
```

- [ ] **Step 2: 커밋**

```bash
git add sass/_components.scss
git commit -m "feat: add component styles (post list, tags, TOC, series, callout)"
```

---

### Task 9: 코드 블록 및 다크모드 스타일

**Files:**
- Create: `sass/_code.scss`
- Create: `sass/_dark.scss`

- [ ] **Step 1: sass/_code.scss 작성**

```scss
// 코드 블록
pre {
    background: var(--bg-code);
    border-radius: 6px;
    padding: 16px;
    overflow-x: auto;
    margin: 16px 0;
    font-size: 14px;
    line-height: 1.6;

    code {
        font-family: var(--font-mono);
        background: none;
        padding: 0;
    }
}

code {
    font-family: var(--font-mono);
    font-size: 0.9em;
    background: var(--bg-secondary);
    padding: 2px 6px;
    border-radius: 3px;
}

// Zola syntect 라인 넘버
pre table {
    width: 100%;
    border: none;
    margin: 0;

    td {
        border: none;
        padding: 0;
    }

    .line-number {
        color: var(--text-muted);
        user-select: none;
        padding-right: 16px;
        text-align: right;
        width: 1%;
        white-space: nowrap;
    }
}
```

- [ ] **Step 2: sass/_dark.scss 작성**

```scss
[data-theme="dark"] {
    --bg-primary: #191919;
    --bg-secondary: #252525;
    --bg-code: #2d2d2d;
    --text-primary: #e0e0e0;
    --text-secondary: #a0a0a0;
    --text-muted: #666666;
    --border-color: #333333;
    --link-color: #6ba3d6;
    --link-hover: #8bbde8;

    --tag-rust-bg: #2d2040;
    --tag-rust-color: #c4a5e8;
    --tag-react-bg: #1e3040;
    --tag-react-color: #7bb8d6;
    --tag-devops-bg: #3d2020;
    --tag-devops-color: #e89090;
    --tag-default-bg: #2a2a2a;
    --tag-default-color: #a0a0a0;

    --callout-info-bg: #252525;
    --callout-warning-bg: #332d1a;
    --callout-error-bg: #331a1a;
    --callout-success-bg: #1a331a;

    --series-bg: #1a2030;

    img {
        opacity: 0.9;
    }
}

@media (prefers-color-scheme: dark) {
    :root:not([data-theme="light"]) {
        --bg-primary: #191919;
        --bg-secondary: #252525;
        --bg-code: #2d2d2d;
        --text-primary: #e0e0e0;
        --text-secondary: #a0a0a0;
        --text-muted: #666666;
        --border-color: #333333;
        --link-color: #6ba3d6;
        --link-hover: #8bbde8;

        --tag-rust-bg: #2d2040;
        --tag-rust-color: #c4a5e8;
        --tag-react-bg: #1e3040;
        --tag-react-color: #7bb8d6;
        --tag-devops-bg: #3d2020;
        --tag-devops-color: #e89090;
        --tag-default-bg: #2a2a2a;
        --tag-default-color: #a0a0a0;

        --callout-info-bg: #252525;
        --callout-warning-bg: #332d1a;
        --callout-error-bg: #331a1a;
        --callout-success-bg: #1a331a;

        --series-bg: #1a2030;

        img {
            opacity: 0.9;
        }
    }
}
```

- [ ] **Step 3: 커밋**

```bash
git add sass/_code.scss sass/_dark.scss
git commit -m "feat: add code block and dark mode styles"
```

---

## Chunk 3: JavaScript 및 샘플 콘텐츠

### Task 10: 다크모드 토글 스크립트

**Files:**
- Create: `static/js/dark-mode.js`

- [ ] **Step 1: static/js/dark-mode.js 작성**

```javascript
(function () {
    const STORAGE_KEY = "theme";

    function getPreferredTheme() {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) return stored;
        return window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light";
    }

    function applyTheme(theme) {
        document.documentElement.setAttribute("data-theme", theme);
        const toggle = document.getElementById("dark-mode-toggle");
        if (toggle) {
            toggle.textContent = theme === "dark" ? "☀️" : "🌙";
        }
    }

    // 페이지 로드 전 깜빡임 방지
    applyTheme(getPreferredTheme());

    document.addEventListener("DOMContentLoaded", function () {
        const toggle = document.getElementById("dark-mode-toggle");
        if (!toggle) return;

        applyTheme(getPreferredTheme());

        toggle.addEventListener("click", function () {
            const current = document.documentElement.getAttribute("data-theme");
            const next = current === "dark" ? "light" : "dark";
            localStorage.setItem(STORAGE_KEY, next);
            applyTheme(next);
        });
    });
})();
```

- [ ] **Step 2: 커밋**

```bash
git add static/js/dark-mode.js
git commit -m "feat: add dark mode toggle with localStorage persistence"
```

---

### Task 11: 검색 스크립트

**Files:**
- Create: `static/js/search.js`

- [ ] **Step 1: static/js/search.js 작성**

```javascript
(function () {
    function debounce(fn, delay) {
        let timer;
        return function () {
            var context = this;
            var args = arguments;
            clearTimeout(timer);
            timer = setTimeout(function () {
                fn.apply(context, args);
            }, delay);
        };
    }

    function initSearch() {
        var input = document.getElementById("search-input");
        var resultsContainer = document.getElementById("search-results");
        if (!input || !resultsContainer) return;
        if (typeof window.elasticlunr === "undefined") return;

        var searchIndex = null;

        try {
            searchIndex = elasticlunr.Index.load(window.searchIndex);
        } catch (e) {
            console.error("Failed to load search index:", e);
            return;
        }

        var onInput = debounce(function () {
            var query = input.value.trim();
            if (query.length < 2) {
                resultsContainer.innerHTML = "";
                return;
            }

            var results = searchIndex.search(query, {
                fields: {
                    title: { boost: 2 },
                    body: { boost: 1 },
                },
                bool: "OR",
                expand: true,
            });

            if (results.length === 0) {
                resultsContainer.innerHTML =
                    '<div class="search-empty">검색 결과가 없습니다.</div>';
                return;
            }

            var html = results
                .slice(0, 10)
                .map(function (result) {
                    var item = searchIndex.documentStore.getDoc(result.ref);
                    return (
                        '<a href="' +
                        result.ref +
                        '" class="search-result-item">' +
                        '<div class="search-result-title">' +
                        escapeHtml(item.title) +
                        "</div>" +
                        '<div class="search-result-body">' +
                        truncate(escapeHtml(item.body), 120) +
                        "</div>" +
                        "</a>"
                    );
                })
                .join("");

            resultsContainer.innerHTML = html;
        }, 200);

        input.addEventListener("input", onInput);
    }

    function escapeHtml(str) {
        var div = document.createElement("div");
        div.textContent = str;
        return div.innerHTML;
    }

    function truncate(str, len) {
        if (str.length <= len) return str;
        return str.substring(0, len) + "...";
    }

    document.addEventListener("DOMContentLoaded", initSearch);
})();
```

- [ ] **Step 2: 커밋**

```bash
git add static/js/search.js
git commit -m "feat: add client-side search with elasticlunr"
```

---

### Task 12: 샘플 콘텐츠 작성

**Files:**
- Create: `content/rust/_index.md`
- Create: `content/rust/ownership.md`
- Create: `content/rust/lifetime.md`
- Create: `content/react/_index.md`

- [ ] **Step 1: content/rust/_index.md 작성**

```markdown
+++
title = "Rust"
description = "Rust 프로그래밍 학습 기록"
sort_by = "date"
template = "section.html"
+++
```

- [ ] **Step 2: content/rust/ownership.md 작성**

```markdown
+++
title = "Rust Ownership 정리"
date = 2026-03-13
description = "소유권 시스템은 Rust가 GC 없이 메모리 안전성을 보장하는 핵심 메커니즘입니다."

[taxonomies]
tags = ["rust", "study"]

[extra]
series = "Rust 기초"
series_order = 1
+++

## 소유권이란?

{% callout(type="info") %}
소유권은 Rust가 가비지 컬렉터 없이 메모리 안전성을 보장하는 핵심 메커니즘입니다.
{% end %}

Rust의 각 값은 **소유자**(owner)라는 변수를 가집니다. 값은 한 번에 하나의 소유자만 가질 수 있으며, 소유자가 스코프를 벗어나면 값은 자동으로 해제됩니다.

## 소유권 규칙

1. Rust의 각 값은 소유자(owner)라는 변수를 가진다
2. 한 번에 하나의 소유자만 존재할 수 있다
3. 소유자가 스코프를 벗어나면 값은 버려진다(dropped)

```rust
let s1 = String::from("hello");
let s2 = s1; // s1의 소유권이 s2로 이동 (move)
// println!("{}", s1); // 컴파일 에러! s1은 더 이상 유효하지 않음
println!("{}", s2); // OK
```

## 참조와 빌림

소유권을 넘기지 않고 값을 사용하려면 **참조**(reference)를 사용합니다.

```rust
fn calculate_length(s: &String) -> usize {
    s.len()
}

let s1 = String::from("hello");
let len = calculate_length(&s1);
println!("'{}' 의 길이는 {} 입니다.", s1, len);
```

## 슬라이스 타입

슬라이스는 컬렉션의 일부를 참조할 수 있게 해줍니다.

```rust
let s = String::from("hello world");
let hello = &s[0..5];
let world = &s[6..11];
```
```

- [ ] **Step 3: content/rust/lifetime.md 작성**

```markdown
+++
title = "Rust Lifetime 이해하기"
date = 2026-03-14
description = "라이프타임은 참조가 유효한 범위를 명시하여 댕글링 참조를 방지합니다."

[taxonomies]
tags = ["rust", "study"]

[extra]
series = "Rust 기초"
series_order = 2
+++

## 라이프타임이란?

{% callout(type="info") %}
라이프타임은 참조가 유효한 범위를 컴파일러에게 알려주는 어노테이션입니다.
{% end %}

모든 참조에는 라이프타임이 있습니다. 대부분의 경우 컴파일러가 자동으로 추론하지만, 명시적으로 지정해야 하는 경우도 있습니다.

## 라이프타임 어노테이션

```rust
fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() > y.len() {
        x
    } else {
        y
    }
}
```

이 함수는 두 문자열 슬라이스 중 더 긴 것을 반환합니다. 라이프타임 `'a`는 반환값이 두 입력 참조 중 더 짧은 라이프타임을 가짐을 나타냅니다.
```

- [ ] **Step 4: content/react/_index.md 작성**

```markdown
+++
title = "React"
description = "React 프론트엔드 개발 기록"
sort_by = "date"
template = "section.html"
+++
```

- [ ] **Step 5: 커밋**

```bash
git add content/
git commit -m "feat: add sample content with Rust series and React category"
```

---

### Task 13: robots.txt 및 GitHub Actions

**Files:**
- Create: `static/robots.txt`
- Create: `.github/workflows/deploy.yml`

- [ ] **Step 1: static/robots.txt 작성**

```
User-agent: *
Allow: /
Sitemap: https://leeyc924.github.io/sitemap.xml
```

- [ ] **Step 2: .github/workflows/deploy.yml 작성**

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Install Zola
        uses: taiki-e/install-action@v2
        with:
          tool: zola@0.19.2

      - name: Build
        run: zola build

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./public

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 3: 커밋**

```bash
git add static/robots.txt .github/workflows/deploy.yml
git commit -m "feat: add robots.txt and GitHub Actions deploy workflow"
```

---

## Chunk 4: 빌드 검증 및 마무리

### Task 14: 전체 빌드 및 로컬 서버 확인

- [ ] **Step 1: 전체 빌드**

```bash
cd /Users/leeyc/workspace/leeyc924/leeyc-blog
zola build
```

Expected: 성공, `public/` 디렉토리에 빌드 결과물 생성

- [ ] **Step 2: 빌드 에러 수정 (필요 시)**

빌드 에러 메시지를 확인하고 해당 파일 수정. 일반적으로 Tera 템플릿 문법 오류가 대부분.

- [ ] **Step 3: 로컬 서버 실행**

```bash
zola serve
```

Expected: `http://127.0.0.1:1111` 에서 블로그 확인 가능

- [ ] **Step 4: 확인 체크리스트**

수동으로 확인:
- 홈 페이지에 글 목록이 표시되는가
- 글 상세 페이지에서 TOC가 동작하는가
- 태그 필터가 동작하는가
- 다크모드 토글이 동작하는가 (localStorage 유지)
- 검색이 동작하는가
- 시리즈 박스가 표시되는가
- 콜아웃 shortcode가 렌더링되는가
- 모바일 반응형이 동작하는가 (DevTools)
- RSS 피드 (/atom.xml) 접근 가능한가
- `public/elasticlunr.min.js`와 `public/search_index.en.js`가 빌드 시 생성되었는가

> **참고:** 읽기 시간은 Zola 내장 `page.reading_time`(영어 WPM 기준)을 사용. 한국어 전용 계산(500자/분)은 v2에서 커스텀 구현 고려.

- [ ] **Step 5: 커밋 (수정사항 있을 경우)**

```bash
git add -A
git commit -m "fix: resolve build issues from integration testing"
```

---

### Task 15: GitHub 저장소 생성 및 첫 배포

- [ ] **Step 1: GitHub에 저장소 생성**

```bash
gh repo create leeyc924.github.io --public --source=. --remote=origin
```

또는 이미 생성되어 있다면:
```bash
git remote add origin https://github.com/leeyc924/leeyc924.github.io.git
```

- [ ] **Step 2: push**

```bash
git push -u origin main
```

- [ ] **Step 3: GitHub Pages 설정**

GitHub repo → Settings → Pages → Source를 "GitHub Actions"로 설정.

```bash
gh api repos/leeyc924/leeyc924.github.io/pages -X PUT -f build_type=workflow
```

- [ ] **Step 4: 배포 확인**

```bash
gh run list --limit 1
```

Actions 완료 후 `https://leeyc924.github.io` 접속하여 확인.

- [ ] **Step 5: 최종 커밋**

```bash
git add -A
git commit -m "docs: finalize blog setup and deployment"
```
