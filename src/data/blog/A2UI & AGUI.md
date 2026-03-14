---
title: A2UI & AGUI
pubDatetime: 2026-03-14
description: 에이전트 UI 기술 비교 가이드 - A2UI와 AGUI
tags: ["AI"]
---

> 2025년 12월 기준 최신 정보를 반영한 에이전트 UI 기술 비교 가이드입니다.

---

## 1. 개요

AI 에이전트가 텍스트 응답을 넘어 **풍부한 UI를 직접 생성하고 제어**해야 하는 시대가 되었습니다.  
기존의 정적 인터페이스는 에이전트의 동적인 특성을 따라갈 수 없었고, 여기서 새로운 세 가지 기술이 탄생했습니다.

| 기술        | 핵심 역할                                      |
| --------- | ------------------------------------------ |
| **SDUI**  | 서버가 UI 레이아웃을 결정하고 클라이언트에 전달 (전통적 패턴)       |
| **A2UI**  | AI 에이전트가 선언형 JSON으로 UI 컴포넌트를 기술하는 사양(Spec) |
| **AG-UI** | 에이전트 백엔드 ↔ 프론트엔드를 연결하는 실시간 양방향 통신 프로토콜     |

---

## 2. A2UI (Agent-to-UI)

### 2.1 개념

**A2UI**는 Google이 2025년 12월 오픈소스로 공개한 **에이전트 생성 UI 표준 사양(Specification)** 입니다.  
AI 에이전트가 텍스트 대신 **선언형 JSON 형식**으로 UI 컴포넌트를 기술하면, 클라이언트가 자신의 네이티브 컴포넌트로 렌더링합니다.

> "에이전트는 HTML이나 JavaScript를 출력하지 않습니다. 대신 UI의 의도를 기술하는 A2UI 응답(JSON payload)을 출력합니다." — Google A2UI 공식 문서

### 2.2 핵심 설계 원칙

#### 🔒 보안 우선 (Security First)

- A2UI는 **실행 코드가 아닌 선언형 데이터** 형식입니다.
- 클라이언트 앱이 "신뢰 카탈로그(trusted catalog)"를 관리하며, 에이전트는 카탈로그에 등록된 컴포넌트만 요청할 수 있습니다.
- LLM이 임의 스크립트를 실행하는 UI 인젝션(injection) 공격을 방지합니다.

#### 🤖 LLM 친화적 구조 (LLM-Friendly)

- UI를 **ID 참조가 있는 평탄한(flat) 컴포넌트 목록**으로 표현합니다.
- LLM이 점진적으로 생성하기 쉬운 구조이며, 스트리밍 렌더링을 지원합니다.
- 대화가 진행되면서 전체 트리를 재생성하지 않고 필요한 부분만 증분 업데이트합니다.

#### 🌐 프레임워크 독립적 (Framework-Agnostic)

- 동일한 A2UI JSON 페이로드를 React, Angular, Flutter, SwiftUI 등 어떤 프레임워크에서도 렌더링할 수 있습니다.
- UI 구조(Structure)와 UI 구현(Implementation)을 분리합니다.

### 2.3 동작 흐름

```
[AI 에이전트 (Gemini / 기타 LLM)]
        ↓  JSON 페이로드 생성
[A2UI Response (JSON)]
  - 컴포넌트 목록: type, properties, data model
        ↓  전송 (A2A Protocol / AG-UI / REST API)
[클라이언트 A2UI 렌더러]
  - JSON 파싱 및 컴포넌트 권한 검증
  - 카탈로그 내 컴포넌트 확인
  - 추상 컴포넌트 → 네이티브 구현으로 변환
        ↓
[사용자 화면에 네이티브 UI 렌더링]
```

### 2.4 A2UI JSON 예시

```json
{
  "components": [
    {
      "id": "reservation-form",
      "type": "card",
      "children": ["date-picker", "time-selector", "submit-btn"]
    },
    {
      "id": "date-picker",
      "type": "date-field",
      "label": "예약 날짜",
      "required": true
    },
    {
      "id": "time-selector",
      "type": "select",
      "label": "예약 시간",
      "options": ["17:00", "17:30", "18:00", "20:30", "21:00"]
    },
    {
      "id": "submit-btn",
      "type": "button",
      "label": "예약하기",
      "action": "submit"
    }
  ]
}
```

클라이언트는 `type: "date-field"`를 Material Design Input, Chakra UI 필드 등 자신의 네이티브 컴포넌트로 매핑합니다.

### 2.5 지원 플랫폼 및 생태계

|항목|내용|
|---|---|
|**라이선스**|Apache 2.0|
|**제작사**|Google (CopilotKit 커뮤니티 협력)|
|**현재 버전**|v0.8 (Public Preview), v0.9 (Draft)|
|**클라이언트 렌더러**|Angular, Flutter, Lit, Web Components, Markdown|
|**전송 프로토콜**|A2A Protocol, AG-UI, REST API|
|**GitHub**|[github.com/google/A2UI](https://github.com/google/A2UI)|

### 2.6 활용 사례

- 레스토랑 예약 시스템: 에이전트가 날짜·시간 선택 폼 직접 생성
- 조경 견적 앱: 사용자가 사진 업로드 → 에이전트가 커스텀 견적 폼 자동 생성
- 데이터 분석 대시보드: 수치 요약 질문에 차트 컴포넌트로 응답
- 위치 기반 서비스: 지도 컴포넌트를 선택하여 응답

---

## 3. AG-UI (Agent-User Interaction Protocol)

### 3.1 개념

**AG-UI**는 CopilotKit이 2025년 5월 공개한 **에이전트 백엔드와 프론트엔드 사이의 범용 양방향 통신 프로토콜**입니다.  
A2UI가 UI를 _어떻게 기술하는가_의 사양이라면, AG-UI는 에이전트와 UI 사이의 _실시간 통신을 어떻게 처리하는가_의 프로토콜입니다.

> "AG-UI는 에이전트를 백그라운드 프로세스에서 진정한 협업자로 변환하는 연결 레이어입니다." — AG-UI 공식 문서

### 3.2 핵심 특징

#### ⚡ 이벤트 기반 실시간 스트리밍

- 단일 HTTP POST 요청 후 **Server-Sent Events(SSE)** 스트림을 청취하는 구조
- 에이전트가 토큰을 생성하는 즉시 UI에 전달 (블로킹 없음)
- WebSocket, HTTP, WebRTC 등 다양한 전송 방식 지원

#### 🔄 양방향 상태 동기화 (Shared State)

- `STATE_DELTA` 이벤트로 변경된 부분만 전송하여 대역폭 절약
- 에이전트와 앱이 항상 동일한 상태를 공유
- 프론트엔드에서 에이전트로의 읽기/쓰기 양방향 동기화

#### 🎛️ Human-in-the-Loop 지원

- 에이전트가 작업 중간에 사용자 승인을 요청하고 대기
- 사용자 입력 후 에이전트가 작업 재개
- 실행 취소(cancellation) 및 동시성(concurrency) 관리

### 3.3 주요 이벤트 타입

| 이벤트 타입                 | 설명                |
| ---------------------- | ----------------- |
| `RUN_STARTED`          | 에이전트가 작업 시작       |
| `RUN_FINISHED`         | 에이전트 작업 완료        |
| `TEXT_MESSAGE_START`   | 새 메시지 시작          |
| `TEXT_MESSAGE_CONTENT` | 스트리밍 텍스트 내용       |
| `TOOL_CALL_START`      | 외부 API/함수 호출 시작   |
| `TOOL_CALL_RESULT`     | 도구 호출 결과          |
| `STATE_DELTA`          | 상태 부분 업데이트 (diff) |

### 3.4 동작 흐름

```
[프론트엔드 (React 등)]
        ↓  HTTP POST (사용자 프롬프트 + 현재 상태)
[AG-UI 엔드포인트]
        ↓  SSE 이벤트 스트림
[에이전트 백엔드 (LangGraph / CrewAI / Google ADK 등)]
        ↓  JSON 이벤트 스트림 반환
        ↓  TEXT_MESSAGE_CONTENT, STATE_DELTA, TOOL_CALL_START...
[프론트엔드 — 실시간 렌더링]
```

### 3.5 지원 생태계

|항목|내용|
|---|---|
|**제작사**|CopilotKit|
|**라이선스**|오픈소스|
|**SDK**|TypeScript, Python, Kotlin, Go, Java, Rust|
|**1st-party 통합**|LangGraph, CrewAI, Mastra, PydanticAI, Agno, LlamaIndex|
|**플랫폼 지원**|Microsoft Agent Framework, Google ADK, AWS Strands Agents|
|**npm 다운로드**|`@ag-ui/core` — 주간 178,751회 (2025.12 기준)|
|**문서**|[docs.ag-ui.com](https://docs.ag-ui.com/)|

### 3.6 코드 예시 (React)

```tsx
import { useAGUI } from '@copilotkit/react'

const MyAgentComponent = () => {
  const { agent, ui } = useAGUI()

  return (
    <div>
      {/* 에이전트 메시지 실시간 스트리밍 */}
      {agent.messages.map(msg => (
        <div key={msg.id}>{msg.content}</div>
      ))}
      
      {/* 에이전트가 생성한 UI (A2UI 컴포넌트) */}
      {ui.components && <A2UIRenderer components={ui.components} />}
    </div>
  )
}
```

---

## 4. A2UI + AG-UI 함께 사용하기

A2UI와 AG-UI는 **경쟁 기술이 아니라 상호 보완적** 기술입니다.

```
[AI 에이전트]
    │
    │  1. A2UI JSON 생성 (UI 컴포넌트 기술)
    ↓
[A2UI Response (JSON Payload)]
    │
    │  2. AG-UI가 에이전트 → 프론트엔드로 전송
    ↓
[AG-UI 이벤트 스트림]
    │
    │  3. 프론트엔드가 A2UI를 네이티브 컴포넌트로 렌더링
    ↓
[사용자 화면 — 네이티브 UI]
    │
    │  4. 사용자 인터랙션이 AG-UI를 통해 에이전트로 전달
    └─────────────────────────────────→ [에이전트]
```

|역할|담당 기술|
|---|---|
|UI가 어떻게 생겼는가 (What)|**A2UI**|
|UI가 어떻게 전달되는가 (How)|**AG-UI**|

**실전 예시 스택:**  
Google ADK (에이전트) + A2UI (UI 생성 포맷) + AG-UI (통신) + CopilotKit (프론트엔드 렌더링)

---

## 5. SDUI (Server-Driven UI)

### 5.1 개념

**SDUI**는 2010년대부터 Airbnb, Netflix, Uber 등이 도입한 **서버가 UI 레이아웃을 결정하고 클라이언트에 전달하는 아키텍처 패턴**입니다.  
앱 스토어 업데이트 없이 UI를 변경하고, 다양한 플랫폼에서 일관된 UI를 유지하기 위해 개발되었습니다.

### 5.2 핵심 특징

- **서버가 UI 구조를 결정:** 서버가 JSON 스키마로 어떤 컴포넌트를 어떤 순서로 보여줄지 지정
- **클라이언트는 렌더러:** 클라이언트 앱은 사전에 등록된 컴포넌트를 렌더링하는 역할만 수행
- **앱 업데이트 불필요:** UI 변경 시 서버만 업데이트하면 모든 클라이언트에 즉시 반영
- **A/B 테스트 용이:** 서버에서 다양한 UI 레이아웃 실험 가능

### 5.3 SDUI 구조

```
[백엔드 서버]
  - 비즈니스 로직
  - UI 레이아웃 결정
  - JSON 스키마 반환
        ↓  JSON (컴포넌트 트리)
[클라이언트 앱]
  - 미리 등록된 컴포넌트 라이브러리
  - JSON → 네이티브 컴포넌트 매핑
  - 렌더링
```

### 5.4 도입 사례

|기업|활용 방식|
|---|---|
|**Airbnb**|Magma 시스템 — 모바일 앱 스토어 출시 없이 레이아웃 변경, A/B 테스트|
|**Netflix**|홈화면 레이아웃을 서버에서 동적 제어, 신규 콘텐츠 프로모션|
|**Uber**|지역별/이벤트별 UI 변경|
|**Flipkart**|대규모 세일 이벤트(Big Billion Days) 시 앱 배포 없이 UI 변경|

---

## 6. A2UI vs AG-UI vs SDUI 비교

### 6.1 핵심 차이점 요약

| 구분           | **SDUI**         | **A2UI**            | **AG-UI**           |
| ------------ | ---------------- | ------------------- | ------------------- |
| **정의**       | 서버 주도 UI 아키텍처 패턴 | 에이전트 생성 UI 선언형 사양   | 에이전트-UI 실시간 통신 프로토콜 |
| **등장 배경**    | 모바일 앱 배포 주기 단축   | AI 에이전트의 안전한 UI 생성  | 에이전트와 프론트엔드 표준 연결   |
| **UI 생성 주체** | 개발자가 작성한 서버 로직   | LLM (AI 에이전트)       | 해당 없음 (전송 계층)       |
| **UI 기술 방식** | JSON 컴포넌트 트리     | 선언형 JSON (LLM 친화적)  | 이벤트 스트림 (JSON)      |
| **통신 방식**    | 단방향 (서버 → 클라이언트) | 단방향 (에이전트 → 클라이언트)  | 양방향 실시간 스트리밍        |
| **보안 모델**    | 서버 신뢰 기반         | 컴포넌트 카탈로그 기반 화이트리스트 | 경계 보안 (가드레일, 감사 로그) |
| **실시간성**     | 요청-응답            | 증분 스트리밍 지원          | 이벤트 기반 실시간          |
| **상태 동기화**   | 없음 (일반적으로)       | 없음                  | 양방향 상태 동기화          |
| **주요 사용처**   | 모바일 앱 배포 최적화     | AI 에이전트 UI 생성       | AI 앱 에이전트 통신        |
| **프레임워크**    | 플랫폼 종속적          | 프레임워크 독립적           | 프레임워크 독립적           |

### 6.2 UI 생성 방식 비교

```
SDUI
  개발자 → [서버 로직] → JSON 스키마 → [클라이언트] → 렌더링
  (미리 결정된 레이아웃, 예측 가능)

A2UI
  LLM → [A2UI JSON] → [클라이언트 렌더러] → 네이티브 UI
  (대화 맥락에 따라 동적 생성, 예측 불가)

AG-UI (독립적 사용 시)
  에이전트 백엔드 ←→ [이벤트 스트림] ←→ 프론트엔드
  (텍스트/도구 호출/상태 전달에 집중)
```

### 6.3 보안 모델 비교

|구분|SDUI|A2UI|AG-UI|
|---|---|---|---|
|**신뢰 경계**|서버 = 신뢰됨|컴포넌트 카탈로그 = 신뢰됨, 에이전트 = 제한됨|경계에서 가드레일 적용|
|**코드 실행**|클라이언트 측 없음|실행 코드 전혀 없음 (순수 데이터)|이벤트 기반, 코드 실행 없음|
|**UI 인젝션**|낮은 위험|명시적으로 방지|프롬프트 인젝션 방지 내장|

### 6.4 진화 관점에서의 관계

```
SDUI (2010~)
  └─ 서버가 UI를 결정하는 패턴 확립
  └─ 한계: 사람이 로직을 작성해야 함, AI 친화적이지 않음

          ↓ AI 에이전트 시대 도래

A2UI (2025~)
  └─ SDUI의 진화: LLM이 UI를 동적 생성
  └─ LLM 친화적 포맷, 보안 강화, 크로스플랫폼 네이티브

AG-UI (2025~)
  └─ A2UI를 포함한 모든 에이전트 통신을 표준화
  └─ 에이전트 ↔ UI의 실시간 양방향 연결 레이어
```

---

## 7. 언제 무엇을 선택할까?

### ✅ SDUI를 선택하는 경우

- 앱 스토어 업데이트 없이 **모바일 UI를 빠르게 변경**해야 할 때
- 서버에서 **A/B 테스트**나 **개인화 레이아웃**을 관리할 때
- AI 에이전트 없이 **규칙 기반 UI 변경**이 필요할 때
- 이미 SDUI 인프라가 구축된 대규모 서비스를 운영 중일 때

### ✅ A2UI를 선택하는 경우

- **AI 에이전트가 대화 맥락에 따라 UI를 동적으로 생성**해야 할 때
- 에이전트가 텍스트 대신 **폼, 차트, 지도 등 인터랙티브 컴포넌트**로 응답해야 할 때
- 크로스플랫폼(Web, Flutter, iOS, Android)에서 **통일된 에이전트 UI**가 필요할 때
- 보안이 중요한 멀티 에이전트 환경에서 **UI 인젝션을 방지**해야 할 때

### ✅ AG-UI를 선택하는 경우

- **에이전트 백엔드(LangGraph, CrewAI 등)와 React/Vue 프론트엔드를 연결**해야 할 때
- 에이전트의 작업 진행 상황을 **실시간으로 사용자에게 보여줘야** 할 때
- **Human-in-the-Loop** (사용자 승인 후 에이전트 작업 재개)가 필요할 때
- 에이전트와 UI 간 **공유 상태 동기화**가 필요할 때

### ✅ A2UI + AG-UI를 함께 사용하는 경우

- **풀스택 AI 에이전트 앱**: 에이전트가 UI를 생성하고(A2UI) + 사용자와 실시간 협업(AG-UI)
- 레스토랑 예약, 폼 기반 워크플로우, 대화형 대시보드 등

---

## 8. 참고 자료

- [A2UI 공식 사이트](https://a2ui.org/)
- [Google A2UI GitHub](https://github.com/google/A2UI)
- [Google Developers Blog — A2UI 소개](https://developers.googleblog.com/introducing-a2ui-an-open-project-for-agent-driven-interfaces/)
- [AG-UI 공식 문서](https://docs.ag-ui.com/)
- [AG-UI GitHub](https://github.com/ag-ui-protocol/ag-ui)
- [CopilotKit — AG-UI와 A2UI 차이](https://www.copilotkit.ai/ag-ui-and-a2ui)
- [A2UI + AG-UI 풀스택 가이드 (CopilotKit Blog)](https://www.copilotkit.ai/blog/build-with-googles-new-a2ui-spec-agent-user-interfaces-with-a2ui-ag-ui)

---