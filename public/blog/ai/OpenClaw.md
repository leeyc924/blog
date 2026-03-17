---
title: OpenClaw
pubDatetime: 2026-03-14
description: 실제로 일을 처리하는 AI 에이전트 플랫폼
tags: ["AI"]
category: "ai"
---

> **"단순히 대답하는 AI가 아니라, 실제로 일을 처리하는 AI"**
---

## OpenClaw란?

OpenClaw(오픈클로)는 **로컬 컴퓨터에서 직접 실행되는 오픈소스 AI 에이전트 플랫폼**입니다.

기존 ChatGPT나 Claude 같은 AI가 "조언을 주는 컨설턴트"라면, OpenClaw는 **직접 실행하는 실무자**입니다. 사용자가 잠든 사이에도 이메일을 확인하고, 파일을 작성하고, 브라우저를 조작하는 등 실제 작업을 수행합니다.

### 프로젝트 역사

| 시기           | 이름              | 비고                                |
| ------------ | --------------- | --------------------------------- |
| 2025년 11월    | WhatsApp Relay  | iOS 개발자 Peter Steinberger가 취미로 시작 |
| 2025년 말      | Clawdbot (클로드봇) | GitHub에서 1주일 만에 ⭐ 10만 개 돌파        |
| 2026년 1월     | Moltbot         | 상표 이슈로 이름 변경                      |
| 2026년 1월 30일 | **OpenClaw**    | 현재 이름으로 최종 확정                     |

현재 GitHub에서 **191,000개 이상의 스타**를 받은 역사상 가장 빠르게 성장한 오픈소스 AI 프로젝트 중 하나입니다.

---

## 주요 특징

- **자율 실행**: 단순 답변을 넘어 파일 열기, 브라우저 검색, 코드 실행 등 실제 작업 수행
- **메신저 연동**: WhatsApp, Telegram, Discord, Slack, Signal, iMessage 등에서 문자 보내듯 AI에 명령
- **멀티 AI 지원**: Claude, ChatGPT, Gemini, 로컬 모델(Ollama) 등 다양한 AI 엔진 선택 가능
- **영구 메모리**: 사용자 선호사항, 작업 내역을 마크다운 파일로 기억
- **스킬 시스템**: 13,000개 이상의 커뮤니티 스킬로 기능 확장 가능
- **완전 오픈소스**: MIT 라이선스, 데이터가 내 컴퓨터에만 저장
- **자율 스케줄링**: 사람 명령 없이도 매일 정해진 시간에 작업 자동 실행

---

## 동작 원리

```
사용자 입력 (메신저 or 웹 UI)
        ↓
   목표 이해 (AI가 의도 파악)
        ↓
   계획 수립 (단계별 작업 분해)
        ↓
   실행 (브라우저 조작 / 파일 처리 / 셸 명령 등)
        ↓
   결과 반환 (메신저로 응답)
```

예를 들어 "네이버에서 오늘 날씨 검색해서 알려줘"라고 하면:

1. **이해**: 날씨 검색 요청
2. **계획**: 브라우저로 네이버 접속 → 날씨 검색
3. **실행**: 실제로 브라우저를 열고 검색
4. **반환**: 결과를 메신저로 전송

---

## 설치 방법

### 사전 요구사항

- **Node.js** (없으면 설치 스크립트가 자동 설치)
- **운영체제**: Windows, macOS, Linux 모두 지원

### Windows (PowerShell)

> ⚠️ PowerShell은 반드시 **관리자 모드**로 실행하세요 (우클릭 → 관리자 권한으로 실행)

powershell

```powershell
npm i -g openclaw
```

Node.js가 없는 경우, 위 명령어를 실행하면 자동으로 설치됩니다.

### macOS (Homebrew 권장)

bash

```bash
curl -fsSL https://openclaw.ai/install.sh | bash
```

또는 npm으로 설치:

bash

```bash
npm i -g openclaw
```

### Linux

bash

```bash
npm i -g openclaw
```

Ubuntu, Debian, Fedora, Arch 등 주요 배포판을 모두 지원합니다.

---

## 초기 설정

설치 후 터미널(또는 PowerShell)을 **새로 열고** 아래 명령어를 실행합니다:

bash

```bash
openclaw onboard
```

초기 설정 시 다음과 같은 경고가 표시됩니다:

> ⚠️ AI가 파일 접근, 브라우저 조작 등의 권한을 가질 수 있으며, 의도치 않은 파일 수정/삭제 및 개인정보 유출 위험이 있습니다.

주의사항을 확인하고 설정을 진행하세요.

---

## AI 모델 연결 (API 키 설정)

OpenClaw 자체는 AI가 아니므로, 사용할 AI 모델의 **API 키**를 별도로 설정해야 합니다.

### 무료로 시작하기 (추천: Gemini)

비용 없이 테스트하고 싶다면 Google AI Studio의 Gemini API를 사용하세요.

1. [Google AI Studio](https://aistudio.google.com) 접속
2. **API 키 만들기** 클릭
3. 생성된 키 복사
4. OpenClaw 설정에서 Gemini API 키 입력

> 💡 **모델 추천**
> 
> - 무료 체험: `Gemini Flash` (빠르고 무료)
> - 일반 사용: `Gemini 2.5 Flash`
> - 최고 성능: `Claude Opus` (유료, 비용 높음)

### 유료 모델

|제공사|모델 예시|특징|
|---|---|---|
|Anthropic|Claude Opus / Sonnet|최고 성능, 비용 높음|
|OpenAI|GPT-4o|범용적, 안정적|
|Google|Gemini 2.5 Flash|빠름, 비용 효율적|
|OpenRouter|여러 모델 통합|API 키 하나로 다양한 모델 사용|

> 💡 여러 AI를 바꿔 쓰려면 **OpenRouter** 사용을 권장합니다. API 키를 매번 바꿀 필요 없이 하나의 키로 다양한 모델을 선택할 수 있습니다.

---

## 메신저 연동

OpenClaw의 핵심 기능입니다. 익숙한 메신저 앱에서 AI에게 지시를 내릴 수 있습니다.

### 지원 메신저

|개인용|업무용|기타|
|---|---|---|
|WhatsApp|Slack|Signal|
|Telegram|Discord|iMessage|
|-|Microsoft Teams|Matrix|

### Discord 연동 예시

1. Discord에서 봇 토큰 발급
2. `openclaw onboard` 에서 Discord 선택
3. 설정 완료 후 Discord 채널에서 AI에게 명령 전송

설정 완료 후 **"gateway"** 창이 별도로 실행되며, 이 창이 정상적으로 열리면 연동 성공입니다.

---

## 스킬(Skills) 추가하기

스킬은 OpenClaw의 기능을 확장하는 **플러그인**입니다. 현재 ClawHub에 **13,729개 이상**의 커뮤니티 스킬이 등록되어 있습니다.

### 스킬 설치 방법

**방법 1**: 스킬 이름으로 설치

```
채팅창에서: "nano-banana-pro 스킬 설치해줘"
```

**방법 2**: GitHub 링크로 설치

스킬의 GitHub 저장소 링크를 채팅창에 붙여넣으면 AI가 자동으로 설치합니다.

### 인기 스킬 예시

|스킬|기능|
|---|---|
|`nano-banana-pro`|AI 이미지 생성|
|`academic-research`|학술 논문 검색 (OpenAlex API)|
|`azure-devops`|Azure DevOps 관리|
|`biz-reporter`|비즈니스 리포트 자동화|
|`adblock-dns`|DNS 레벨 광고 차단|

---

## 활용 사례

### 개인 비서

- 이메일 분류 및 요약
- 캘린더 일정 관리
- 보고서 초안 작성
- 항공편 체크인

### 개발 자동화

- 코드베이스 리팩토링
- 단위 테스트 자동 작성
- PostgreSQL 쿼리 최적화
- Kubernetes 클러스터 배포

### 스마트 라이프

- 스마트홈 기기 제어
- SNS 콘텐츠 예약 발행
- 온라인 쇼핑 자동화
- 여가 예약

### 자율 실행 (스케줄링)

매일 아침 뉴스 요약, 주간 보고서 생성 등 **정기 작업을 자동화**할 수 있습니다:

```
"매일 오전 8시에 오늘의 AI 뉴스 3개 요약해서 Telegram으로 보내줘"
```

---

## 비용 안내

OpenClaw 소프트웨어 자체는 **무료(MIT 라이선스)**입니다. AI 모델 API 사용 비용만 발생합니다.

|사용 빈도|예상 월 비용|
|---|---|
|가벼운 사용|$10 ~ $30|
|일반 사용|$30 ~ $70|
|헤비 자동화|$100 ~ $150 이상|

### 비용 절감 방법

- **Gemini API 무료 플랜** 활용 (월 일정량 무료)
- **Ollama**로 로컬 모델 실행 (API 비용 없음, 단 고성능 GPU 필요)
- **mini 버전 모델** 사용 (성능은 낮지만 비용 대폭 절감)

> ⚠️ OpenClaw는 여러 세션을 통해 AI와 소통하는 특성상, 단순 채팅보다 토큰을 많이 소모합니다. 처음에는 저렴한 모델로 테스트하세요.

---

## 주의사항 및 보안

### 핵심 위험 요소

1. **파일 임의 삭제**: AI가 명령을 잘못 해석해 파일을 삭제할 수 있음
2. **개인정보 유출**: 민감한 정보가 인터넷에 전송될 수 있음
3. **금융 정보 접근**: 결제 관련 정보에 접근하도록 설정한 경우 주의

### 안전한 사용 방법

**방법 1: 별도 PC 사용 (권장)**

- 메인 컴퓨터가 아닌 전용 PC, 노트북, 또는 안 쓰는 기기에 설치
- 중요 파일과 격리된 환경 구성

**방법 2: Docker 가상화 사용**

bash

```bash
# Docker 컨테이너 내에서 실행하여 시스템 격리
docker run -it openclaw/openclaw
```

### 주의 포인트

- 명령은 **명확하고 구체적으로** 전달하세요 (애매한 명령 = 예측 불가능한 결과)
- 처음에는 **중요하지 않은 파일만 있는 환경**에서 테스트
- OpenClaw 자체는 AI가 아니므로 반드시 **AI API 키 별도 발급 필요**

---

## 문제 해결 (트러블슈팅)

### 웹 UI가 열리지 않거나 gateway가 실행되지 않을 때

bash

```bash
# 1. Ctrl+C로 현재 실행 중단
# 2. 터미널 완전히 종료 후 재시작
# 3. 관리자 권한으로 PowerShell 재실행
# 4. 아래 명령어로 자동 진단 및 수정
openclaw doctor
```

### Node.js 관련 오류

bash

```bash
# Node.js 버전 확인
node --version

# Node.js가 없거나 구버전인 경우 재설치 후 다시 시도
npm i -g openclaw
```

### API 키 오류

- API 키는 **발급 후 한 번만 표시**되므로 반드시 복사해두세요
- 분실 시 해당 서비스에서 새 키를 재발급받아야 합니다

---

## 유용한 링크

- 🌐 공식 사이트: [openclaw.ai](https://openclaw.ai)
- 📦 GitHub: [github.com/openclaw/openclaw](https://github.com/openclaw/openclaw)
- 🔧 스킬 레지스트리: ClawHub
- 📚 공식 문서: [docs.openclaw.ai](https://docs.openclaw.ai)