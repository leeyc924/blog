---
title: "[React] vite를 이용한 react library 만들기"
pubDatetime: 2024-12-30
description: Vite와 Rollup 기반 React 라이브러리 번들링 가이드
tags: ["개인", "Frontend"]
---

## Bundle?

웹 개발 및 프론트엔드 개발에서 주로 사용되는 용어로, 일반적으로 여러 파일을 하나로 결합하는 작업을 나타낸다.

이렇게 하나의 파일로 결합하는 것을 "번들링"이라고도 하는데 번들링은 주로 JavaScript 및 CSS 파일을 하나의 파일로 결합하는 것을 의미한다.

이를 통해 웹 애플리케이션의 성능을 최적화하고 관리를 더 쉽게 만드는데 도움이 된다.

## 왜 Vite 인가?

번들링 시, [Rollup](https://rollupjs.org/) 기반의 다양한 빌드 커맨드를 사용할 수 있습니다.

이는 높은 수준으로 최적화된 정적(Static) 리소스들을 배포할 수 있게끔 하며, 미리 정의된 설정(Pre-configured)을 제공합니다.

또한 스토리북에서도 vite를 기반으로 연동할 수 있어 편리하게 스토리북까지 이용 가능합니다.

## Vite Config & Build

config 구성하는 방법은 다음과 같습니다

### 1. vite project 생성

```bash
pnpm create vite {package name}
```

### 2. package install

```bash
# react
pnpm add react react-dom

# vite config package
pnpm add -D vite vite-plugin-dts @vitejs/plugin-react vite-tsconfig-paths rollup-preserve-directives glob @vanilla-extract/vite-plugin

# vanilla-extract package
pnpm add -D @vanilla-extract/css
```

### 3. vite.config.ts 설정

```typescript
import { extname, relative, resolve } from 'path';
import { fileURLToPath } from 'url';
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';
import react from '@vitejs/plugin-react';
import { glob } from 'glob';
import preserveDirectives from 'rollup-preserve-directives';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import tsconfigPaths from 'vite-tsconfig-paths';
import packageJson from './package.json';

export default defineConfig({
  plugins: [
    react(),
    dts({
      rollupTypes: true,
    }),
    tsconfigPaths(),
    vanillaExtractPlugin({
      identifiers: 'debug',
    }),
    preserveDirectives(),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es'],
    },
    rollupOptions: {
      external: [
        ...Object.keys(packageJson.peerDependencies || {}),
        ...Object.keys(packageJson.dependencies || {}),
        'react/jsx-runtime',
      ],
      input: Object.fromEntries(
        glob
          .sync(['src/**/*.{ts,tsx}'], {
            ignore: ['src/**/*.d.ts', 'src/**/*.stories.{ts,tsx}'],
          })
          .map(file => {
            return [
              relative('src', file.slice(0, file.length - extname(file).length)),
              fileURLToPath(new URL(file, import.meta.url)),
            ];
          }),
      ),
      output: {
        chunkFileNames: 'chunk/[name].js',
        assetFileNames: 'theme.css',
        entryFileNames(info) {
          if (!info.exports.length) {
            return 'rmdir/[name].js';
          }
          return '[name].js';
        },
      },
    },
  },
});
```

### 4. package.json 수정

```json
{
  "name": "@breadlee/ui",
  "version": "0.0.0",
  "sideEffects": false,
  "type": "module",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    },
    "./theme.css": "./dist/theme.css",
    "./reset.css": "./dist/reset.css"
  },
  "main": "dist/index.js",
  "module": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "prebuild": "[ ! -d dist ] && mkdir -p dist || rm -rf dist/*",
    "build": "vite build",
    "postbuild": "rm -rf dist/rmdir"
  },
  "peerDependencies": {
    "react": "^19.0",
    "react-dom": "^19.0"
  }
}
```

### 5. build

```bash
pnpm build
```

## 사용

```bash
pnpm add @breadlee/ui
```

```javascript
import '@breadlee/ui/reset.css';
import '@breadlee/ui/theme.css';
import { ThemeProvider } from 'next-themes';
import { Typography } from '@breadlee/ui';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='ko'>
      <body>
        <ThemeProvider>
          {children}
          <Typography>test</Typography>
        </ThemeProvider>
      </body>
    </html>
  );
}
```
