---
title: Design System 기반 회원관리앱 Migration
pubDatetime: 2024-03-13
description: mui에서 자체 Design System으로의 회원관리앱 마이그레이션
tags: ["개인", "Frontend"]
category: "dev"
---

본 글은 [PWA를 이용한 회원관리 앱만들기](https://leeyc924.tistory.com/10)와 이어집니다

## 서론

회원관리앱으로 몇달간 운영해본 결과 개선이 필요한 문제점들을 발견하여 프로젝트를 진행하게 되었습니다.

주요 문제점:

1. mui 기반 수많은 커스텀으로 인한 코드 복잡성 및 유지보수 어려움
2. PWA 앱에서 브라우저 히스토리 삭제시 로그인 풀림 현상
3. nextjs app router에서 pwa 미지원으로 기능 추가 곤란
4. 게임참여관리의 1~4부 구분에서 참여 날짜 중심으로의 entity 수정 필요

## Migration 과정

### FRONT END

기존 nextjs를 걷어내고 react vite 기반으로 migration을 진행했습니다.

**UI/UX 변경점:**

- mui 제거 후 [leeyc design system](https://65d092e55038add0e921289f-xwvphhjnrf.chromatic.com/) 적용
- 다크모드 지원 추가
- 홈화면에 신규회원 목록, 참여왕 추가
- 게임 목록 UI/UX 개편
