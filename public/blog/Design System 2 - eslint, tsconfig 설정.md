---
title: "Design System 2. eslint, tsconfig 설정"
pubDatetime: 2024-02-01
description: 모노레포 환경의 eslint와 tsconfig 공통 설정
tags: ["개인", "Frontend"]
---

## 1) eslint-config

eslint config 파일을 먼저 설정한다. pnpm으로 프로젝트를 구성하여 `--filter` 옵션을 사용하면 root에서도 해당 패키지에 설치할 수 있다.

`packages/eslint-config`로 이동하여 `package.json`을 구성한다:

```json
{
  "name": "@breadlee/eslint-config",
  "version": "1.0.0",
  "description": "leeyc package eslint config 파일입니다",
  "main": "index.js",
  "publishConfig": {
    "access": "public"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {}
}
```

`name`을 `@leeyc/eslint-config`로 설정하면 `pnpm --filter @leeyc/eslint-config`로 해당 package에 설치할 수 있다.

eslint 설정에 필요한 패키지를 설치한다:

```bash
pnpm add @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint-config-prettier eslint-config-turbo eslint-import-resolver-typescript eslint-plugin-import eslint-plugin-prettier eslint-plugin-react eslint-plugin-react-hooks eslint-plugin-sort-destructure-keys --filter @leeyc/eslint-config
```

`index.js`를 생성하고 eslint config를 설정한다:

```javascript
/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: [
    'plugin:react/recommended',
    // ...
  ],
  plugins: ['react', '@typescript-eslint', 'import', 'sort-destructure-keys'],
  parserOptions: {
    ecmaFeatures: { jsx: true },
    ecmaVersion: 12,
    sourceType: 'module',
  },
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  settings: {
    'import/resolver': {
      typescript: {
        project: ['tsconfig.json', 'packages/*/tsconfig.json'],
      },
    },
  },
  ignorePatterns: ['node_modules/', 'dist/'],
  rules: {
    'prettier/prettier': [
      'error',
      {
        parser: 'typescript',
        singleQuote: true,
        printWidth: 120,
        tabWidth: 2,
        trailingComma: 'all',
        bracketSpacing: true,
        semi: true,
        useTabs: false,
        arrowParens: 'avoid',
        endOfLine: 'auto',
      },
    ],
  },
};
```

## 2) tsconfig

typescript config 파일도 eslint와 마찬가지로 `package.json`부터 설정한다:

```json
{
  "name": "@breadlee/tsconfig",
  "version": "0.0.0",
  "private": true,
  "license": "MIT",
  "publishConfig": {
    "access": "public"
  }
}
```

js 파일을 생성하여 필요한 tsconfig 설정을 한다:

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "display": "Default",
  "compilerOptions": {
    "target": "ES5",
    "lib": ["DOM", "DOM.Iterable", "ESNext"],
    "composite": false,
    "declaration": true,
    "declarationMap": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "inlineSources": false,
    "isolatedModules": true,
    "module": "ESNext",
    "moduleResolution": "Node",
    "resolveJsonModule": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "preserveWatchOutput": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true
  },
  "exclude": ["node_modules"]
}
```

## 3) root 설정

root 디렉토리에서 `.eslintrc.js`를 생성하고 다음과 같이 작성한다:

```javascript
/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  extends: ['@breadlee/eslint-config'],
};
```

eslint가 제대로 설정된 것을 확인한다.

자세한 설정은 [GitHub 저장소](https://github.com/leeyc924/leeyc-package)에서 확인할 수 있다.
