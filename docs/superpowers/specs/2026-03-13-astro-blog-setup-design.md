# Astro Blog Setup Design

## Overview

AstroPaper v5.5.1 테마를 기반으로 GitHub Pages에 배포되는 마크다운 기반 개인 블로그를 구축한다.

## Goals

- astro-paper-main/ 내용을 프로젝트 루트로 이동하여 바로 사용 가능한 블로그 구성
- GitHub Pages (`https://leeyc924.github.io/leeyc-blog/`) 배포
- 개발/기술 + 개인 블로그 겸용, 한국어/영어 혼용

## Architecture

### File Structure Migration

`astro-paper-main/` 디렉토리의 모든 파일을 프로젝트 루트로 이동하고, 해당 디렉토리를 삭제한다.

```
leeyc-blog/
├── src/
│   ├── config.ts
│   ├── data/blog/          # 블로그 글 (md)
│   ├── components/
│   ├── layouts/
│   └── pages/
├── public/
├── astro.config.ts
├── package.json
├── .github/workflows/deploy.yml
└── ...
```

### Configuration Changes

**src/config.ts:**
- `website`: `"https://leeyc924.github.io/leeyc-blog/"`
- `author`: `"leeyc"`
- `title`: `"leeyc blog"`
- `desc`: 블로그 설명 (사용자 확인 후 결정)
- `lang`: `"ko"`
- `timezone`: `"Asia/Seoul"`
- `editPost.url`: `"https://github.com/leeyc924/leeyc-blog/edit/main/"`

**astro.config.ts:**
- `base`: `"/leeyc-blog"` 추가 (GitHub Pages 서브 경로)

### Content Strategy

- astro-paper 예시 글 삭제 (`_releases/`, `examples/`, 기존 튜토리얼 글)
- 태그 시스템으로 글 분류 (폴더 구분 불필요)
- frontmatter에 한/영 구분 태그 사용 가능

### Features (AstroPaper 기본 제공)

- 다크/라이트 모드
- 태그 시스템
- 검색 (Pagefind)
- RSS 피드
- OG 이미지 자동 생성
- 아카이브 페이지
- About 페이지

### Deployment

- GitHub Actions workflow: `main` push 시 자동 빌드 + GitHub Pages 배포
- 기존 `.github/workflows/deploy.yml` 활용
- build 명령: `astro check && astro build && pagefind --site dist`

## Out of Scope

- 커스텀 도메인
- i18n (다국어 라우팅)
- CMS 연동
- 댓글 시스템 (추후 giscus 추가 가능)
