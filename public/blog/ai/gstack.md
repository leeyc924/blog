---
title: "gstack - Claude Code를 가상 엔지니어링 팀으로 만드는 AI 툴킷"
pubDatetime: 2026-03-24
description: "Y Combinator CEO Garry Tan이 만든 gstack 분석 - 28개 슬래시 커맨드로 Think → Plan → Build → Review → Test → Ship → Reflect 스프린트를 자동화하는 오픈소스 AI 개발 프레임워크"
tags: ["AI", "Agent", "Claude Code", "DevOps"]
category: "ai"
---

## gstack이란?

[gstack](https://github.com/garrytan/gstack)은 Y Combinator CEO **Garry Tan**이 만든 오픈소스 툴킷이다. Claude Code를 단순한 코파일럿이 아닌, **가상 엔지니어링 팀**으로 변환한다.

핵심 아이디어는 간단하다. **AI에게 역할을 부여하고, 스프린트 프로세스를 따르게 한다.**

```
Think → Plan → Build → Review → Test → Ship → Reflect
```

28개의 슬래시 커맨드 스킬이 이 스프린트 단계별로 조직되어 있고, 각 스킬은 이전 단계의 출력을 읽어 피드백 루프를 형성한다.

---

## 왜 주목할 만한가?

Garry Tan은 gstack으로 60일간 **60만 줄 이상의 프로덕션 코드**(35%가 테스트)를 작성했다. YC를 풀타임으로 운영하면서도 하루 **1~2만 줄**을 찍어낸 셈이다.

| 지표 | 수치 |
|---|---|
| 60일간 총 코드량 | 600,000+ 줄 |
| 일일 코드 생산량 | 10,000~20,000 줄 |
| 1주일 기록 | 140,751줄 추가, 362 커밋 |
| 2026년 총 기여 | 1,237+ 커밋 |

핵심은 단순히 코드를 많이 생성하는 게 아니라, **리뷰-테스트-배포까지 포함한 전체 프로세스**를 자동화했다는 점이다.

---

## 아키텍처: 스프린트 기반 스킬 시스템

gstack의 설계 철학은 **프로세스 우선(Process-first)**이다. 랜덤한 도구 모음이 아니라, 실제 소프트웨어 개발 스프린트를 그대로 따른다.

```
┌──────────────────────────────────────────────────────────────┐
│                    gstack Sprint Process                      │
│                                                              │
│  ┌─────────┐   ┌──────┐   ┌───────┐   ┌────────┐            │
│  │  Think   │ → │ Plan │ → │ Build │ → │ Review │            │
│  │          │   │      │   │       │   │        │            │
│  │ /office- │   │/plan-│   │Claude │   │/review │            │
│  │  hours   │   │ ceo- │   │ Code  │   │        │            │
│  │          │   │review│   │       │   │        │            │
│  └─────────┘   └──────┘   └───────┘   └────────┘            │
│       ↓             ↓          ↓            ↓                │
│  ┌─────────┐   ┌──────┐   ┌───────┐   ┌────────┐            │
│  │  Test   │ → │ Ship │ → │Deploy │ → │Reflect │            │
│  │         │   │      │   │       │   │        │            │
│  │  /qa    │   │/ship │   │/land- │   │ /retro │            │
│  │  /cso   │   │      │   │and-   │   │        │            │
│  │         │   │      │   │deploy │   │        │            │
│  └─────────┘   └──────┘   └───────┘   └────────┘            │
│                                                              │
│  각 스킬은 이전 단계의 출력을 입력으로 사용 (피드백 루프)       │
└──────────────────────────────────────────────────────────────┘
```

---

## 20개 핵심 스킬 상세

### 1. 기획 & 디자인 (Planning & Design)

| 스킬 | 설명 |
|---|---|
| `/office-hours` | YC 스타일 제품 리프레이밍. 6가지 강제 질문으로 아이디어를 재구성 |
| `/plan-ceo-review` | CEO 관점 스코프 리뷰. 확장/선택적 확장/유지/축소 4가지 모드 |
| `/plan-eng-review` | 아키텍처 확정. 다이어그램과 테스트 매트릭스 포함 |
| `/plan-design-review` | 디자인 감사. 0-10점 평가와 개선 가이드 |
| `/design-consultation` | 디자인 시스템을 처음부터 생성 |

`/office-hours`가 특히 흥미롭다. 단순히 "이거 만들어줘"가 아니라, YC 오피스 아워처럼 **제품의 본질을 재정의**하는 과정을 거친다.

### 2. 개발 & 리뷰 (Development & Review)

| 스킬 | 설명 |
|---|---|
| `/review` | Staff Engineer 수준의 코드 리뷰. 명백한 문제는 자동 수정 |
| `/investigate` | 가설 기반 디버깅. 3번 실패하면 자동 중단 |
| `/design-review` | 디자인 감사 + 구현. atomic commit 단위로 작업 |

`/investigate`의 **3회 실패 자동 중단** 메커니즘이 눈에 띈다. AI가 무한 루프에 빠지는 것을 방지하는 실용적인 설계다.

### 3. 테스트 & 품질 (Testing & Quality)

| 스킬 | 설명 |
|---|---|
| `/qa` | 브라우저 테스트 + 버그 수정 + 회귀 테스트 자동 생성 |
| `/qa-only` | 코드 변경 없이 버그 리포트만 생성 |
| `/cso` | OWASP Top 10 + STRIDE 위협 모델링 기반 보안 감사 |

`/qa`는 실제 Chromium 브라우저를 사용하는 것이 핵심이다. mocking이 아닌 **실제 브라우저 자동화**로 테스트한다.

### 4. 릴리스 & 운영 (Release & Operations)

| 스킬 | 설명 |
|---|---|
| `/ship` | 테스트 스위트 동기화, 커버리지 감사, PR 생성 |
| `/land-and-deploy` | PR 머지부터 프로덕션 검증까지 한 명령으로 |
| `/canary` | 배포 후 콘솔 에러, 성능 회귀 모니터링 |
| `/benchmark` | Core Web Vitals, 페이지 로드 타임 비교 |

### 5. 유틸리티 (Utilities)

| 스킬 | 설명 |
|---|---|
| `/browse` | Chromium 브라우저 자동화 (명령당 ~100ms) |
| `/document-release` | 문서 자동 업데이트 |
| `/retro` | 주간 회고. 팀원별 분석 포함 |
| `/autoplan` | 리뷰 포함 전체 계획 한 번에 생성 |
| `/codex` | OpenAI Codex CLI를 통한 크로스 모델 코드 리뷰 |

---

## 안전장치 (Power Tools)

gstack은 AI가 위험한 작업을 수행하는 것을 방지하는 8가지 안전 스킬을 제공한다.

```
/careful   → 파괴적 명령 실행 전 경고 + 확인 요구
/freeze    → 디버깅 중 특정 디렉토리만 편집 허용
/guard     → /careful + /freeze 결합 (프로덕션 작업용)
/unfreeze  → 편집 제한 해제
```

이건 실제로 매우 실용적이다. Claude Code가 실수로 잘못된 파일을 수정하거나, 위험한 git 명령을 실행하는 것을 **구조적으로 방지**한다.

---

## 실제 워크플로우 예시

"일일 캘린더 브리핑 앱"을 만드는 시나리오를 보자.

```
1. /office-hours     → "개인 비서 AI"로 제품 리프레이밍
2. /plan-ceo-review  → 스코프 도전, 핵심 기능 확정
3. /plan-eng-review  → 아키텍처 확정 (ASCII 다이어그램 + 테스트 매트릭스)
4. Claude Code 구현   → 11개 파일, 2,400줄 (~8분)
5. /review           → 2개 이슈 발견, 자동 수정
6. /qa               → 스테이징 테스트, 버그 1개 발견 및 수정
7. /ship             → PR 생성 (테스트 커버리지 검증 포함)
```

**총 8개 명령**으로 대화부터 배포 가능한 PR까지 완성된다.

---

## 병렬 실행: Conductor 연동

gstack은 [Conductor](https://conductor.build)와 연동하여 **여러 Claude Code 세션을 동시에** 실행할 수 있다. 각 에이전트가 격리된 워크스페이스에서 자신의 역할을 수행하고, 언제 멈춰야 할지 알고 있다.

스프린트 구조 자체가 병렬성을 가능하게 한다. 개별 도구가 아닌 **프로세스 단위의 병렬화**다.

---

## 설치 (30초)

### 요구 사항
- Claude Code
- Git
- Bun v1.0+

### 글로벌 설치

```bash
git clone https://github.com/garrytan/gstack.git ~/.claude/skills/gstack
cd ~/.claude/skills/gstack
./setup
```

### 프로젝트별 설치

```bash
cp -Rf ~/.claude/skills/gstack .claude/skills/gstack
rm -rf .claude/skills/gstack/.git
cd .claude/skills/gstack
./setup
```

### Codex / Gemini CLI / Cursor 지원

```bash
git clone https://github.com/garrytan/gstack.git .agents/skills/gstack
cd .agents/skills/gstack
./setup --host codex  # 또는 'gemini', 'auto'
```

모든 파일은 `.claude/` 또는 `.agents/skills/` 안에 위치한다. 시스템 경로를 수정하거나 백그라운드 서비스를 실행하지 않는다.

---

## 크로스 플랫폼 호환성

gstack은 SKILL.md 표준을 사용하여 여러 AI 코딩 도구에서 작동한다.

| 플랫폼 | 지원 |
|---|---|
| Claude Code | O (기본) |
| OpenAI Codex CLI | O |
| Cursor | O |
| Gemini CLI | O |

---

## 프라이버시 & 텔레메트리

| 항목 | 내용 |
|---|---|
| 기본 설정 | **꺼짐** (opt-in) |
| 수집 데이터 (활성화 시) | 스킬 이름, 소요 시간, 성공/실패, 버전, OS |
| 절대 수집하지 않는 것 | 코드, 파일 경로, 레포 이름, 브랜치, 프롬프트 |
| 비활성화 | `gstack-config set telemetry off` |

---

## 기존 도구들과의 차이점

| 비교 항목 | 일반 AI 코파일럿 | gstack |
|---|---|---|
| 접근 방식 | 빈 캔버스에서 시작 | 스프린트 프로세스 기반 |
| 코드 리뷰 | 수동 요청 | `/review`로 Staff Engineer 수준 자동 리뷰 |
| 테스트 | 별도 설정 필요 | `/qa`로 실제 브라우저 테스트 자동화 |
| 보안 | 개발자 책임 | `/cso`로 OWASP/STRIDE 자동 감사 |
| 배포 | 수동 | `/land-and-deploy`로 원커맨드 배포 |
| 안전장치 | 없음 | `/careful`, `/freeze`, `/guard` |
| 피드백 루프 | 없음 | 각 스킬이 이전 단계 출력을 읽음 |

---

## 핵심 설계 원칙

1. **프로세스 우선**: 랜덤한 도구 모음이 아닌 실제 스프린트를 따른다
2. **피드백 루프**: 각 스킬이 이전 단계의 출력을 입력으로 사용한다
3. **안전 우선**: 파괴적 명령 경고, 편집 잠금, 3회 실패 시 자동 중단
4. **Zero False Positive**: 보안 감사에서 거짓 양성을 최소화한다
5. **자체 업데이트**: `/gstack-upgrade`로 항상 최신 버전 유지

---

## 마무리

gstack의 핵심 통찰은 **AI에게 빈 캔버스를 주는 것이 아니라, 역할과 프로세스를 부여하는 것**이다. 각 슬래시 커맨드가 특정 역할(CEO, Staff Engineer, QA, Security Officer)을 수행하고, 스프린트 순서를 따르면서 피드백 루프를 형성한다.

Karpathy가 2026년 3월 No Priors 팟캐스트에서 말한 것처럼, "12월 이후로 코드를 한 줄도 직접 타이핑하지 않았다"는 시대가 오고 있다. gstack은 그 시대를 위한 **구조화된 프레임워크**다.

- MIT 라이선스, 완전 오픈소스
- 프리미엄 티어 없음, 대기 리스트 없음
