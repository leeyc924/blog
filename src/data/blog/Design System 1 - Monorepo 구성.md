---
title: "Design System 1. Monorepo 구성"
pubDatetime: 2024-02-01
description: turborepo와 pnpm workspace를 이용한 모노레포 구성
tags: ["개인", "Frontend"]
---

매번 프로젝트를 할 때마다 컴포넌트를 새로 만들고 utility를 새로 만드는 불편함이 있어 나만의 package를 구성하려고 시작한 프로젝트이다. 최종 결과물로 design system까지 구성하는 것을 목표로 삼았다.

[turborepo](https://turbo.build/repo/docs)를 이용해서 monorepo로 구성했다.

## 기술스택

- react, typescript
- tsup, vite, rollup
- bash
- turborepo

## 프로젝트 구조

```
- apps
  - storybook
  ...
- packages
  - components
  - util
  - eslint-config
  - tsconfig
  - ui
  ...
script
  ...
package.json
pnpm-lock.yaml
pnpm-workspace.yaml
turbo.json
```

packages에서는 `@leeyc/**` 패키지를 개발하고 apps에서는 storybook과 같은 서버를 띄울 예정이다.

자세한 소스는 [GitHub](https://github.com/leeyc924/leeyc-package)에서 확인할 수 있다.
