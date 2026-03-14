# leeyc blog

개발과 일상을 기록하는 개인 블로그입니다.

## Tech Stack

- [Astro](https://astro.build/) v5
- [Tailwind CSS](https://tailwindcss.com/) v4
- [TypeScript](https://www.typescriptlang.org/)
- [Pagefind](https://pagefind.app/) - 정적 사이트 검색

## Getting Started

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 결과물 미리보기
npm run preview
```

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | 개발 서버 실행 |
| `npm run build` | 프로덕션 빌드 (타입 체크 + 빌드 + pagefind 인덱싱) |
| `npm run preview` | 빌드 결과물 로컬 미리보기 |
| `npm run format` | Prettier 포맷팅 |
| `npm run lint` | ESLint 린트 |
| `npm test` | 단위 테스트 실행 |
| `npm run test:coverage` | 커버리지 포함 테스트 |
| `npm run test:e2e` | Playwright E2E 테스트 |

## Project Structure

```
src/
├── components/   # Astro/UI 컴포넌트
├── content/      # 블로그 글 (Markdown)
├── layouts/      # 레이아웃 컴포넌트
├── pages/        # 라우트 페이지
├── styles/       # 글로벌 스타일
└── utils/        # 유틸리티 함수
e2e/              # Playwright E2E 테스트
```

## Deployment

GitHub Pages에 자동 배포됩니다. `main` 브랜치에 push하면 GitHub Actions가 테스트 → 빌드 → 배포를 수행합니다.

배포 URL: https://leeyc924.github.io/blog/
