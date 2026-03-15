---
title: Lightpanda
pubDatetime: 2026-03-16
description: AI 에이전트와 자동화를 위해 처음부터 새로 만든 초경량 헤드리스 브라우저
tags: ["AI", "Agent", "Automation", "Browser"]
---

> Chromium을 억지로 서버에 올리는 대신, **AI 에이전트용 헤드리스 브라우저를 아예 새로 만들자**는 발상에서 나온 프로젝트.

## Lightpanda란?

Lightpanda는 **AI 에이전트와 자동화를 위한 헤드리스 브라우저**입니다.

핵심은 아주 분명합니다.
- Chromium 포크가 아닙니다.
- WebKit 패치판도 아닙니다.
- **Zig로 처음부터 새로 구현한 브라우저**입니다.

공식 소개도 이 방향을 강하게 밀고 있습니다. 요약하면 “브라우저 자동화가 필요하다고 해서 늘 무거운 Chrome 계열을 수백 개씩 띄울 필요는 없다”는 문제의식입니다.

즉 Lightpanda는 단순 스크래퍼가 아니라,
**자바스크립트 실행이 필요한 웹 자동화를 더 가볍고 빠르게 처리하려는 실행 엔진**에 가깝습니다.

- GitHub: https://github.com/lightpanda-io/browser
- 홈페이지: https://lightpanda.io
- 성격: 오픈소스 헤드리스 브라우저
- 주 용도: AI agent browsing, scraping, testing, automation

## 왜 지금 주목받는가?

### 1. 에이전트 시대에 브라우저는 다시 핵심 인프라가 됨

요즘 에이전트는 문서 요약만 하지 않습니다.
실제 웹페이지를 열고,
폼을 채우고,
검색 결과를 따라가고,
자바스크립트가 많은 사이트에서도 상태를 확인해야 합니다.

문제는 여기서 보통 Chrome 계열 브라우저가 너무 무겁다는 점입니다.
Lightpanda는 이 지점을 정면으로 찌릅니다.

### 2. 성능 메시지가 매우 강함

프로젝트가 내세우는 포인트는 다음과 같습니다.
- **Chrome 대비 메모리 사용량이 훨씬 낮음**
- **실행 속도가 빠름**
- **시작이 즉시 이루어짐**

README 기준 표현으로는
- 메모리는 Chrome보다 약 9배 적고
- 실행은 약 11배 빠르다고 설명합니다.

물론 이런 수치는 환경과 시나리오를 타지만,
적어도 Lightpanda가 노리는 시장이 “범용 데스크톱 브라우저”가 아니라
**대규모 자동화와 에이전트 실행 인프라**라는 점은 매우 분명합니다.

### 3. Playwright/Puppeteer 생태계와 이어지려 함

완전히 새로운 브라우저를 만드는 프로젝트가 보통 부딪히는 문제는 생태계입니다.
Lightpanda는 이를 CDP(Chrome DevTools Protocol) 호환 쪽으로 풀고 있습니다.

즉 방향은 이렇습니다.
- 내부 구현은 새로 만들되
- 외부 사용 경험은 기존 자동화 도구와 최대한 연결
- Playwright, Puppeteer, chromedp 같은 도구가 붙기 쉽게 설계

이 전략은 꽤 현실적입니다.
새 브라우저가 시장에 들어오려면 “새로운 API를 배워라”보다
**기존 툴체인에 연결된다**가 훨씬 강하기 때문입니다.

## 핵심 기능 요약

프로젝트 소개와 README를 기준으로 보면 Lightpanda는 다음을 구현하거나 진행 중입니다.

- JavaScript 실행
- DOM tree / DOM APIs
- XHR / Fetch API
- 쿠키
- 클릭
- 폼 입력
- 커스텀 HTTP 헤더
- 프록시 지원
- 네트워크 인터셉션
- `robots.txt` 준수 옵션
- CDP / WebSocket 서버 제공

즉 “HTML만 긁는 도구”가 아니라,
**현대 웹페이지 자동화에 필요한 최소 브라우저 기능 집합을 헤드리스 특화로 제공**하는 그림입니다.

## 에이전트 하네스 아키텍처 관점에서 보면

이 프로젝트에서 특히 흥미로운 부분은,
Lightpanda가 단독 사용자 앱이라기보다 **에이전트 하네스 아래에 붙는 실행 엔진**이라는 점입니다.

구조를 단순화하면 이렇게 볼 수 있습니다.

```text
사용자 / 메신저 / 앱
        ↓
에이전트 하네스 (planner / tool runner / session manager)
        ↓
브라우저 툴 어댑터 (Playwright / Puppeteer / CDP client)
        ↓
Lightpanda
        ↓
실제 웹 페이지 상호작용
```

### 각 층의 역할

- **에이전트 하네스**
  - 어떤 사이트를 열지 결정
  - 어떤 단계로 탐색할지 계획
  - 브라우저 사용을 다른 도구 호출과 엮음
  - 세션/메모리/재시도 흐름을 관리

- **브라우저 어댑터 계층**
  - Playwright/Puppeteer/chromedp 같은 기존 클라이언트
  - 하네스의 명령을 실제 브라우저 프로토콜 호출로 바꿈

- **Lightpanda**
  - 실제 페이지 로딩
  - JS 실행
  - DOM 처리
  - 네트워크 요청 및 이벤트 처리

### 왜 에이전트 하네스와 잘 맞는가?

에이전트가 웹을 자주 다룰수록 병목은 모델이 아니라 브라우저 런타임인 경우가 많습니다.
특히 다음 상황에서 그렇습니다.
- 동시 실행 탭/세션이 많을 때
- 로그인 이후 탐색이 길어질 때
- JS-heavy 사이트를 여러 개 반복 처리할 때
- 브라우저를 “사람이 쓰는 앱”이 아니라 “백엔드 런타임”처럼 돌릴 때

Lightpanda는 바로 이 구간에 맞습니다.
즉 이것은 “사람용 브라우저”가 아니라,
**에이전트 하네스가 호출하는 자동화 전용 브라우저 엔진**으로 이해하는 편이 맞습니다.

### 한계도 같이 봐야 함

다만 README도 솔직합니다.
- 아직 Beta 단계
- Web API 커버리지가 완전하지 않음
- Playwright 경유 시 버전에 따라 동작 차이가 생길 수 있음

즉 아키텍처상 포지션은 멋지지만,
현 시점에서는 **Chrome 완전 대체재라기보다 빠른 실험과 비용 절감에 강한 신흥 엔진**으로 보는 것이 현실적입니다.

## 설치와 실행

### 1. 바이너리 설치

macOS:

```bash
curl -L -o lightpanda https://github.com/lightpanda-io/browser/releases/download/nightly/lightpanda-aarch64-macos && \
chmod a+x ./lightpanda
```

Linux:

```bash
curl -L -o lightpanda https://github.com/lightpanda-io/browser/releases/download/nightly/lightpanda-x86_64-linux && \
chmod a+x ./lightpanda
```

### 2. Docker 실행

```bash
docker run -d --name lightpanda -p 9222:9222 lightpanda/browser:nightly
```

### 3. CDP 서버로 띄우기

```bash
./lightpanda serve --host 127.0.0.1 --port 9222
```

이후 Puppeteer 같은 클라이언트에서 `browserWSEndpoint`로 붙는 식입니다.

### 4. Puppeteer 연결 예시

```js
import puppeteer from 'puppeteer-core';

const browser = await puppeteer.connect({
  browserWSEndpoint: 'ws://127.0.0.1:9222',
});

const context = await browser.createBrowserContext();
const page = await context.newPage();
await page.goto('https://demo-browser.lightpanda.io/amiibo/', {
  waitUntil: 'networkidle0',
});
```

즉 사용 경험은 “새 브라우저를 배운다”보다
**기존 자동화 코드의 브라우저 백엔드를 바꾼다**에 가깝습니다.

## 구현 스택과 기술적 인상

README를 보면 핵심 구현 축은 대략 이렇습니다.
- 언어: Zig
- JS 엔진: V8
- HTTP loader: libcurl
- HTML parser: html5ever

이 조합에서 드러나는 인상은 명확합니다.
- 시스템 레벨 제어권을 강하게 가져가고
- 렌더링 없는 헤드리스 시나리오에 집중하며
- 웹 자동화에 필요한 부분만 빠르게 최적화하려는 방향

즉 Chrome처럼 “모든 것을 다 하는 브라우저”보다,
**에이전트 자동화에 필요한 기능을 우선 탑재한 목적형 브라우저**라는 색이 분명합니다.

## 어떤 사람에게 맞는가?

### 잘 맞는 경우

- AI agent/browser automation 인프라를 직접 운영하는 팀
- Chrome 기반 자동화 비용이 너무 큰 팀
- 대량 스크래핑/반복 테스트/웹 탐색 파이프라인을 돌리는 팀
- CDP 기반 기존 툴을 유지하면서 더 가벼운 엔진을 실험해보고 싶은 팀

### 덜 맞는 경우

- 웹 호환성이 최우선이라서 Chrome과 거의 동일해야 하는 경우
- Playwright 모든 시나리오가 반드시 안정적으로 돌아야 하는 경우
- 브라우저 엔진 성숙도보다 즉시 실전 투입 안정성이 더 중요한 경우

즉 Lightpanda는 “모두에게 당장 갈아타라”보다는,
**에이전트 런타임 비용과 속도 병목이 큰 팀에게 매우 매력적인 선택지**입니다.

## 한 줄 총평

Lightpanda는 단순히 “빠른 스크래핑 도구”가 아닙니다.

이 프로젝트의 본질은,
**AI 에이전트가 호출할 브라우저 런타임을 Chrome 바깥에서 다시 설계하려는 시도**에 있습니다.

에이전트 하네스가 점점 더 웹을 직접 만지는 시대라면,
Lightpanda는 꽤 중요하게 봐둘 만한 인프라 프로젝트입니다.

## 참고 링크

- GitHub 저장소: https://github.com/lightpanda-io/browser
- 홈페이지: https://lightpanda.io
- 데모/벤치마크 저장소: https://github.com/lightpanda-io/demo
- Nightly releases: https://github.com/lightpanda-io/browser/releases/tag/nightly
