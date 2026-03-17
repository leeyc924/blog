# Category Feature Design

## Overview

블로그에 카테고리 시스템을 추가한다. 현재는 1-depth 플랫 구조(`dev`, `ai`, `etc`)로 시작하되, 향후 2-depth 서브카테고리 확장이 가능하도록 설계한다. 기존 태그 시스템과 공존하며, 포스트 하나에 카테고리 하나를 지정한다 (1:1). 전용 카테고리 페이지를 통해 접근한다.

## Categories

| Slug | Display Name | Description |
|------|-------------|-------------|
| dev  | Development | 개발 관련 포스트 |
| ai   | AI          | AI 관련 포스트 |
| etc  | ETC         | 기타 (기본값) |

카테고리 목록은 포스트 frontmatter의 `category` 값에서 자동 수집된다. 존재하지 않는 카테고리 slug로 접근 시 Astro의 static path 기본 동작에 따라 404를 반환한다.

## Data Model

### Frontmatter 변경

```yaml
---
title: "Post Title"
category: "dev"       # "dev" | "ai" | "etc", 기본값 "etc"
tags: ["React", "TypeScript"]
# ... 기존 필드 유지
---
```

### Schema 변경 (`src/content.config.ts`)

`category` 필드 추가:
- 타입: `z.enum(["dev", "ai", "etc"]).default("etc")`
- 잘못된 카테고리 값 입력 시 Zod가 빌드 타임에 에러를 발생시킨다
- 기존 34개 포스트에 `category` 필드 추가 필요

### 카테고리 설정 (`src/utils/categoryConfig.ts`)

```typescript
const CATEGORY_MAP = {
  dev: "Development",
  ai: "AI",
  etc: "ETC",
} as const;

// enum은 CATEGORY_MAP의 키에서 파생하여 단일 소스 유지
type CategorySlug = keyof typeof CATEGORY_MAP;
```

- slug → 표시명 매핑 관리
- 새 카테고리 추가 시: CATEGORY_MAP에 추가 → content.config.ts의 enum에도 추가
- 향후 2-depth 확장 시 서브카테고리 정의도 여기에 추가

## Utility Functions

### `src/utils/getUniqueCategories.ts`

- CATEGORY_MAP에 정의된 모든 카테고리 반환 (포스트가 0개인 카테고리도 포함)
- 각 카테고리별 포스트 수 포함
- 반환: `{ category: string, categoryName: string, count: number }[]`
- 카테고리는 enum 기반이므로 slugify 불필요 (직접 equality 비교)

### `src/utils/getPostsByCategory.ts`

- 특정 카테고리의 포스트 필터링 (직접 equality 비교, slugify 불필요)
- 기존 `postFilter`(draft/publish 필터)와 조합
- 반환: 정렬된 포스트 배열

## Routing

```
pages/
├── categories/
│   ├── index.astro              # /categories - 카테고리 목록
│   └── [category]/
│       └── [...page].astro      # /categories/dev, /categories/dev/2
```

### `/categories` (index)

- 모든 카테고리를 리스트로 표시
- 각 카테고리 옆에 포스트 수 표시
- Tags 인덱스 페이지와 유사한 레이아웃
- 페이지 타이틀: `Categories | {SITE.title}`

### `/categories/[category]/[...page]`

- 해당 카테고리의 포스트 목록
- 기존 `postPerPage` 설정(config.ts) 사용한 페이지네이션
- 페이지 타이틀: `Category: {displayName} | {SITE.title}`

## Components

### 새 컴포넌트

**`src/components/Category.astro`**
- Tag 컴포넌트와 유사한 구조
- 카테고리 slug + 표시명 렌더링
- `/categories/{slug}` 링크
- 포스트 카드와 포스트 상세에서 사용

### 기존 컴포넌트 수정

**`Card.astro`**
- 태그 목록 앞에 카테고리 배지 표시
- 카테고리 클릭 시 `/categories/{slug}`로 이동

**`PostDetails` 레이아웃**
- 포스트 상단 메타 영역(날짜 옆)에 카테고리 표시

**`Header.astro`**
- nav 메뉴에 "Categories" 링크 추가
- 순서: Categories, Tags, About, Search

## Testing

### Unit Tests

**`src/utils/__tests__/getUniqueCategories.test.ts`**
- 모든 정의된 카테고리 반환 확인
- 포스트 수 카운트 정확성
- 기본값("etc") 처리
- draft 포스트 제외

**`src/utils/__tests__/getPostsByCategory.test.ts`**
- 카테고리별 필터링 정확성
- draft 포스트 제외
- 정렬 순서 확인
- 존재하지 않는 카테고리 시 빈 배열 반환

**`src/utils/__tests__/helpers.ts` 수정**
- `createMockPost`에 `category` 필드 추가 (기본값: `"etc"`)

### E2E Tests

**`e2e/categories.spec.ts`**
- `/categories` 페이지 접근 시 카테고리 목록 표시
- 카테고리 클릭 시 해당 카테고리 포스트 목록으로 이동
- 포스트 목록에서 페이지네이션 동작 확인
- 헤더 "Categories" 링크 동작 확인

## Migration

기존 34개 포스트에 `category` 필드를 추가해야 한다. 분류 기준:

**`ai` 카테고리:**
- 포스트 제목/내용에 AI, Agent, MCP, LLM, Claude, GPT, Cognee, LangChain, LangGraph 등 AI 도구/프레임워크가 주제인 경우

**`dev` 카테고리:**
- Frontend, Backend, DevOps, 디자인 시스템, 모듈 페더레이션 등 소프트웨어 개발이 주제인 경우

**`etc` 카테고리:**
- 위 두 카테고리에 해당하지 않는 포스트
- `category` 필드를 명시하지 않은 포스트 (스키마 기본값)
