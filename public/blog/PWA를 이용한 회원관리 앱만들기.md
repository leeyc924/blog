---
title: PWA를 이용한 회원관리 앱만들기
pubDatetime: 2024-02-13
description: PWA 기술을 활용한 배드민턴 동호회 회원관리 앱 개발기
tags: ["개인", "Frontend"]
category: "dev"
---

## 프로젝트 배경

배드민턴 동호회를 오픈카톡으로 운영하던 중 회원관리의 어려움을 해결하기 위해 시작한 프로젝트입니다. PWA 기술을 학습하면서 동시에 실용적인 앱을 개발하고자 했습니다.

## 유령회원 파악 기준

- 가입 후 1개월 이내 미참여 사용자
- 월 2회 이하 참여 사용자

## 프로젝트 목표

1. 회원 데이터 관리 및 유령회원 파악
2. Next.js App Router 학습
3. PostgreSQL & Express 학습
4. PWA 기술 학습

## PWA란

"Progressive Web Apps의 줄임말로 모바일 기기에서 네이티브 앱과 같은 사용자 경험을 제공하는 앱"

## 기술 스택

- **프론트엔드**: Next.js (Netlify 배포)
- **백엔드**: Node.js & Express (CloudType 배포)
- **데이터베이스**: PostgreSQL (CloudType 배포)

### 주요 기능

- 회원 CRUD 기능
- 게임 참여 현황 CRUD 기능

### PWA 구현

```bash
pnpm add next-pwa
```

**next.config.js 설정:**
```javascript
const withPWA = require('next-pwa')({
  dest: 'public',
});

const nextConfig = {
  output: 'standalone',
  modularizeImports: {
    '@mui/icons-material': {
      transform: '@mui/icons-material/{{member}}',
    },
  },
};

module.exports = withPWA(nextConfig);
```

**manifest.webmanifest 파일** (src/app 위치):
- 앱 이름, 디스플레이 설정, 테마 색상 구성
- 다양한 해상도의 아이콘 정의 (128x128 ~ 512x512)
- 범위 및 시작 URL 설정

**app/layout.tsx 메타데이터:**
```javascript
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1.0,
  themeColor: 'black',
};
```

아이콘 파일은 public/icons 디렉토리에 배치합니다.

### 검증

Lighthouse의 "Progressive Web App" 감사를 통해 PWA 구현 완성도를 확인할 수 있습니다.

### 배포

[PWA Builder](https://www.pwabuilder.com/)를 활용하여 웹 애플리케이션을 모바일 앱으로 빌드할 수 있습니다.
