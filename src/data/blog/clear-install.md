---
title: clear-install
pubDatetime: 2024-02-18
description: Turborepo 프로젝트의 node_modules 제거 및 재설치 스크립트
tags: ["개인", "Frontend"]
---

Turborepo 프로젝트에서 모든 `node_modules` 디렉토리를 제거하고 의존성을 재설치하는 bash 스크립트입니다.

```bash
#!/bin/bash

echo "remove node_modules:"
echo "  \$ROOT/node_modules"
rm -r "node_modules"
for d in packages/*/node_modules; do
  echo "  $d"
  rm -r "$d"
done

for d in apps/*/node_modules; do
  echo "  $d"
  rm -r "$d"
done

pnpm store prune

pnpm install
```

root, packages, apps 디렉토리의 모든 node_modules를 삭제한 뒤 pnpm store 캐시를 정리하고 pnpm install로 재설치합니다.
