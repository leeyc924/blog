---
title: "Design System 5. ui"
pubDatetime: 2024-02-13
description: Vanilla Extract를 활용한 UI 패키지 개발
tags: ["개인", "Frontend"]
category: "dev"
---

## 프로젝트 UI 패키지 개발

공통 컴포넌트를 제작하는 UI 패키지를 구성했습니다.

### Directory 구조

- **components**: Button, Input 등의 컴포넌트
- **hooks**: 커스텀 훅 관리
- **styles**: reset.css, palette.css 등 공통 CSS
- **types**: 헬퍼 타입 정의

### Style 솔루션

[Vanilla Extract](https://vanilla-extract.style/)를 활용했습니다.

주요 특징:
- "Type safe하게 theme를 다룰 수 있습니다"
- 프레임워크에 독립적
- Atomic CSS 구성 가능
- Variant 기반 스타일링 지원

### Bundling 설정

Rollup을 사용하여 번들링을 구성했습니다.

```javascript
// rollup.config.js 주요 설정
const config = [
  {
    input: 'src/index.ts',
    output: [{ file: pkg.types, format: 'esm' }],
    plugins: [dts()],
  },
  {
    // ESM 포맷, 'use client' 배너 추가
    // vanilla-extract CSS는 css 디렉토리에 생성
  }
];
```

Post-build 스크립트로 모든 CSS 파일을 `dist/css/index.css`로 병합합니다.

### Button 컴포넌트 예시

```tsx
interface ButtonOwnProps {
  children: ReactNode;
  color?: 'primary' | 'secondary' | 'tertiary' | 'error';
  size?: 'xlarge' | 'large' | 'medium' | 'small';
  isFullWidth?: boolean;
}
```

Vanilla Extract로 스타일을 정의하여 타입 안전성을 확보했습니다.

### 참고

[GitHub 저장소](https://github.com/leeyc924/leeyc-package/tree/main/packages/ui)에서 전체 소스를 확인할 수 있습니다.
