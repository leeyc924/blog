---
title: "Design System 6. utils"
pubDatetime: 2024-02-18
description: tsup을 이용한 유틸리티 패키지 번들링
tags: ["개인", "Frontend"]
category: "dev"
---

매번 프로젝트마다 utility 함수를 만들기는 매우 번거로운 일입니다.

## Directory

typescript 로 작성하였으며 src하위에 추가할 예정입니다

## Bundle

tsup을 이용하여 간단하게 번들링하였습니다

```javascript
// tsup.config.js
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  minify: true,
});
```

parse.ts를 예를 들어 살펴 보겠습니다

```typescript
// src/parse.ts

export function parseToNumber<T>(value: T, defaultValue = 0): number {
  const parsed = Number(value);

  if (Number.isNaN(parsed)) {
    return defaultValue;
  }

  return parsed;
}
```

value parameter를 number타입으로 변경 시켜주는 함수입니다

자세한 소스는 여기서 확인가능합니다

[https://github.com/leeyc924/leeyc-package/tree/main/packages/utils](https://github.com/leeyc924/leeyc-package/tree/main/packages/utils)
