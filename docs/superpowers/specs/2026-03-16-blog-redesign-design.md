# Blog Redesign: Tailwind Blog Style

## Overview

AstroPaper 기반 블로그를 Tailwind Next.js Starter Blog 스타일로 전면 리디자인한다.
라이트 테마 전용, 푸터 제거, Teal 액센트 컬러 적용.

## Pages

### 홈 (/)
- 좌측 날짜(120px) + 우측 제목/태그/요약 그리드 (`xl:grid-cols-4 xl:items-baseline`)
- 포스트 간 `divide-y` 구분선
- 태그: pill 형태 뱃지 (teal 텍스트 + teal-50 배경)
- 하단 페이지네이션: `← Previous | 1 of N | Next →`
- "All Posts →" 링크

### 블로그 목록 (/posts/[...page])
- 홈과 동일한 레이아웃 (사이드바 없음)
- 전체 너비 포스트 리스트
- 페이지네이션

### 포스트 상세 (/posts/[slug])
- "← Back to blog" 링크
- 제목 (좌측 정렬, 28px, font-weight 800)
- 메타: 날짜 + 읽기시간 (gray-400)
- 태그 뱃지 (제목 아래)
- 본문: prose 타이포, max-width 65ch
- 하단: 이전/다음 포스트 네비게이션

### 태그 목록 (/tags)
- 전체 태그 나열 (개수 포함)

### 태그별 포스트 (/tags/[tag]/[...page])
- 해당 태그의 포스트 리스트 + 페이지네이션

### 검색 (/search)
- Pagefind 검색 유지

### About (/about)
- 기존 마크다운 콘텐츠

### 404
- 기존 유지

## Header

- 좌측: `leeyc blog` (사이트 타이틀, font-weight 700)
- 우측: Blog, Tags, About, 검색 아이콘
- active nav: wavy underline 유지
- 다크모드 토글 제거
- 반응형: 모바일 햄버거 메뉴 유지

## Color Scheme (Light Only)

| Token | Value | Usage |
|-------|-------|-------|
| accent | #0d9488 (teal-600) | 링크, 태그 텍스트, active nav |
| accent-bg | #f0fdfa (teal-50) | 태그 뱃지 배경 |
| foreground | #111827 (gray-900) | 제목 |
| body | #374151 (gray-700) | 본문 텍스트 |
| muted | #9ca3af (gray-400) | 날짜, 보조 텍스트 |
| border | #f3f4f6 (gray-100) | 구분선 |
| border-strong | #e5e7eb (gray-200) | 헤더 구분선 |
| background | #ffffff | 페이지 배경 |

## Typography

- 폰트: Pretendard Variable (유지)
- 제목: gray-900, bold/extrabold
- 본문: gray-700, line-height 1.8
- 코드 블록: gray-50 배경, border

## Layout

- 전체 너비: `max-w-3xl px-4 sm:px-6 xl:max-w-5xl xl:px-0`
- 본문 읽기 영역: `max-w-[65ch]`

## Removed Features

- Footer 컴포넌트
- 다크모드 (CSS 변수, theme.ts, 토글 버튼)
- Archives 페이지
- BackToTopButton
- EditPost 컴포넌트
- BackButton 컴포넌트

## Content Files

- MD 파일을 `public/` 디렉토리에 카테고리별로 저장
- 기존 `src/data/blog/` 구조에서 이동

## Files to Modify

### 삭제
- `src/components/Footer.astro`
- `src/components/BackToTopButton.astro`
- `src/components/BackButton.astro`
- `src/components/EditPost.astro`
- `src/scripts/theme.ts`
- `src/pages/archives/index.astro`

### 대폭 수정
- `src/styles/global.css` — 다크모드 변수 제거, teal 컬러 적용, 레이아웃 너비 변경
- `src/layouts/Layout.astro` — 다크모드 스크립트 제거, 테마 토글 제거
- `src/layouts/PostDetails.astro` — 좌측 정렬, back link, 읽기시간, 저자 제거
- `src/components/Header.astro` — 다크모드 토글 제거, Archives 링크 제거
- `src/components/Card.astro` — 좌측 날짜 + 우측 콘텐츠 그리드 레이아웃
- `src/pages/index.astro` — 새 레이아웃 적용, 푸터 제거
- `src/pages/posts/[...page].astro` — 사이드바 없는 전체 너비 리스트
- `src/pages/posts/[...slug]/index.astro` — 새 PostDetails 레이아웃
- `src/config.ts` — lightAndDarkMode: false, showArchives: false

### 소폭 수정
- `src/components/Tag.astro` — teal 스타일 pill 뱃지
- `src/components/Datetime.astro` — 읽기시간 추가
- `src/components/Pagination.astro` — 새 스타일
- `src/layouts/Main.astro` — 푸터 참조 제거
- `src/layouts/AboutLayout.astro` — 푸터 참조 제거
- `src/content.config.ts` — public/ 경로로 변경
