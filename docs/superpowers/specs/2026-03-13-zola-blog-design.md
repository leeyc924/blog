# Zola 기반 개발 블로그 설계

## 개요

GitHub Pages에서 호스팅되는 Zola(Rust) 기반 정적 개발 블로그. 노션 스타일 디자인으로, MD 파일을 작성하고 git push하면 자동 배포된다.

## 기술 스택

| 항목 | 선택 |
|------|------|
| SSG | Zola (Rust) |
| 호스팅 | GitHub Pages |
| 배포 | GitHub Actions |
| 도메인 | leeyc924.github.io |
| 테마 베이스 | tabi (후보: tabi, adidoks, serene) |
| 문법 하이라이팅 | syntect (Zola 내장), base16-ocean-dark 테마 |

## 테마 후보 평가

| 테마 | TOC | 태그 | 검색 | 다크모드 | 코드 하이라이팅 | 평가 |
|------|-----|------|------|----------|----------------|------|
| **tabi** | O | O | O | O | O | 가장 유사, 미니멀 기반 |
| adidoks | O | O | O | O | O | 문서 스타일 강함 |
| serene | X | O | X | O | O | 심플하지만 기능 부족 |

tabi를 베이스로 선택하고, 노션 스타일에 맞게 커스터마이징한다.

## 디자인 스타일

노션 스타일:
- 넓은 여백, 최대 너비 680px 콘텐츠 영역
- 큰 제목 (28px, font-weight 700)
- 콜아웃 블록 (배경 #f7f6f3, 좌측 보더 3px solid #6b3fa0)
- 컬러 태그 (카테고리별 색상 구분)
- 코드 블록: syntect, base16-ocean-dark, Fira Code 폰트, 라인 넘버 표시
- 라이트/다크 모드 지원
- 반응형: 모바일(~768px), 태블릿(768~1024px), 데스크탑(1024px~)

## 기능 상세

### 1. 글 목록 (홈)

최신순 정렬, 제목/요약/날짜/태그/읽기 시간 표시.

### 2. 글 상세

MD 렌더링, 코드 하이라이팅(syntect), 읽기 시간 표시.
- 읽기 시간: v1에서는 Zola 내장 `page.reading_time` 사용 (영어 WPM 기준 근사치). v2에서 한국어 전용 계산(500자/분, 코드 100자/분) 커스텀 구현 고려.

### 3. 태그 분류

태그별 필터링, `/tags/` 페이지에서 전체 태그와 글 수 표시.

### 4. 카테고리

`content/` 하위 디렉토리 기반 (rust, react, devops 등). 디렉토리 구조가 곧 카테고리.

### 5. 검색

Zola 내장 elasticlunr 기반 클라이언트 사이드 검색.
- 빌드 시 `search_index.en.js` 자동 생성 (config.toml에서 `build_search_index = true`)
- 인덱싱 대상: title, description, body
- 결과 표시: 제목 + 요약 + 하이라이트된 매칭 텍스트

### 6. 다크모드

- `prefers-color-scheme` 미디어 쿼리로 시스템 설정 감지
- 수동 토글 버튼 (헤더 우측)
- 사용자 선택은 `localStorage`에 저장, 재방문 시 유지

### 7. 목차 (TOC)

글 상세 페이지 본문 상단에 자동 생성. Zola의 `page.toc` 변수 활용.

### 8. 시리즈

- 데이터 모델: frontmatter의 `extra.series` (시리즈명)와 `extra.series_order` (순서 번호)
- 한 글은 하나의 시리즈에만 속할 수 있음
- UI: 글 하단에 시리즈 박스 표시 (시리즈명, 전체 글 목록, 현재 위치 표시)
- 별도 시리즈 랜딩 페이지는 v1에서 미포함

### 9. RSS 피드

- 형식: Atom 1.0 (Zola 기본)
- 경로: `/atom.xml`
- 전체 본문 포함
- 카테고리별 피드는 v1에서 미포함

### 10. SEO

- Open Graph, Twitter Card 메타 태그 자동 생성
- `sitemap.xml` 자동 생성 (Zola 기본)
- `robots.txt` 포함

## 페이지 구성

### 홈 (/)

- 블로그 제목 + 소개 문구
- 태그 필터 버튼
- 글 목록 (제목, 요약, 날짜, 태그, 읽기 시간)

### 글 상세 (/카테고리/슬러그/)

- 제목, 태그, 날짜, 읽기 시간
- 목차 (TOC)
- 본문 (MD 렌더링)
- 시리즈 네비게이션 (해당 시리즈가 있을 때)

### 태그 목록 (/tags/)

- 전체 태그와 글 수

### 태그 상세 (/tags/태그명/)

- 해당 태그의 글 목록

## 글 작성 frontmatter

```toml
+++
title = "글 제목"                    # 필수
date = 2026-03-13                   # 필수
description = "글 요약 (2줄 이내)"    # 필수
draft = false                       # 선택, 기본값 false
updated = 2026-03-14                # 선택, 수정일

[taxonomies]
tags = ["rust", "study"]            # 필수

[extra]
series = "Rust 기초"                 # 선택, 시리즈명
series_order = 1                    # 선택, 시리즈 내 순서
+++
```

- slug: 파일명에서 자동 생성 (ownership.md → /rust/ownership/)
- 카테고리: 디렉토리 구조에서 자동 결정

## 프로젝트 구조

```
leeyc924.github.io/
├── config.toml              # Zola 설정
├── content/
│   ├── _index.md            # 홈 페이지
│   ├── rust/
│   │   ├── _index.md        # 카테고리 인덱스
│   │   └── ownership.md     # 개별 글
│   └── react/
│       ├── _index.md
│       └── app-router.md
├── templates/
│   ├── base.html            # 공통 레이아웃 (head, header, footer)
│   ├── index.html           # 홈
│   ├── page.html            # 글 상세
│   ├── section.html         # 카테고리/섹션
│   ├── tags/
│   │   ├── list.html        # 태그 목록
│   │   └── single.html      # 태그 상세
│   └── shortcodes/
│       └── callout.html     # 노션 스타일 콜아웃
├── static/
│   ├── js/search.js         # 검색 UI
│   └── images/              # 글에 사용할 이미지
├── sass/
│   ├── style.scss           # 메인 스타일
│   ├── _variables.scss      # 색상, 폰트, 브레이크포인트
│   ├── _dark.scss           # 다크모드
│   └── _code.scss           # 코드 블록 스타일
└── .github/
    └── workflows/
        └── deploy.yml       # GitHub Actions 배포
```

## 이미지 관리

- 글에 사용하는 이미지는 `static/images/카테고리/` 하위에 저장
- MD에서 참조: `![alt](/images/rust/ownership-diagram.png)`
- 이미지 최적화는 커밋 전 수동으로 처리 (v1 범위)

## 배포 플로우

1. MD 파일 작성/수정
2. `git push` to `main` branch
3. GitHub Actions 트리거
4. Zola build 실행
5. 빌드 결과물을 GitHub Pages에 배포
6. `leeyc924.github.io`에서 확인

빌드 실패 시: GitHub Actions에서 실패 알림, 이전 배포 상태 유지 (롤백 불필요).

## GitHub Actions 워크플로우

- 트리거: `main` 브랜치 push
- Zola 버전: 최신 stable
- `zola build` 실행 후 `gh-pages` 브랜치에 배포
- `actions/deploy-pages` 사용

## 추후 추가 (v2)

- 댓글 시스템 (Giscus)
- 카테고리별 RSS 피드
- 시리즈 랜딩 페이지
- 이미지 자동 최적화
