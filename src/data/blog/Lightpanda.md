---
title: Lightpanda
pubDatetime: 2026-03-16
description: AI 에이전트와 자동화를 위해 처음부터 새로 만든 초경량 헤드리스 브라우저
tags: ["AI", "Agent", "Automation", "Browser"]
---

> Chromium을 서버에서 무겁게 돌리는 대신, **AI 에이전트용 헤드리스 브라우저를 처음부터 다시 만들자**는 문제의식에서 나온 프로젝트입니다.

## Lightpanda란?

Lightpanda는 **AI 에이전트와 자동화를 위한 오픈소스 헤드리스 브라우저**입니다.

이 프로젝트의 핵심 정체성은 아주 선명합니다.

- Chromium 포크가 아닙니다.
- WebKit 패치판도 아닙니다.
- **Zig로 처음부터 새로 만든 브라우저**입니다.

즉 Lightpanda는 “브라우저 자동화가 필요하니 Chrome을 서버에 올리자”가 아니라,
**브라우저 자동화 자체를 더 가볍고 빠른 런타임으로 다시 설계하자**는 방향을 택합니다.

- GitHub: https://github.com/lightpanda-io/browser
- 홈페이지: https://lightpanda.io
- 주 언어: Zig
- 포지션: AI agent browsing / automation / scraping / testing용 브라우저 런타임

## 왜 주목할 만한가?

### 1. 에이전트 시대에 브라우저는 다시 핵심 인프라가 됨

요즘 에이전트는 텍스트만 처리하지 않습니다.
실제로 웹페이지를 열고,
자바스크립트를 실행하고,
검색 결과를 따라가고,
버튼을 누르고,
폼을 채우는 작업까지 수행합니다.

이때 기존 브라우저 스택은 지나치게 무거운 경우가 많습니다.
Lightpanda는 바로 이 지점을 겨냥합니다.

### 2. 성능 메시지가 강력함

프로젝트 README에서 Lightpanda는 다음을 강조합니다.

- **Chrome보다 메모리 사용량이 훨씬 적음**
- **Chrome보다 훨씬 빠른 실행**
- **즉시 시작되는 스타트업 속도**

명시된 수치 표현으로는:
- 메모리 사용량은 약 9배 적고
- 실행 속도는 약 11배 빠르다고 주장합니다.

환경마다 체감은 다를 수 있으나,
적어도 이 프로젝트가 겨냥하는 대상이 “일반 사용자 브라우저”가 아니라
**대규모 자동화와 에이전트 실행 인프라**라는 점은 분명합니다.

### 3. 기존 자동화 생태계와 연결되는 전략이 현실적임

Lightpanda는 CDP(Chrome DevTools Protocol) 호환을 통해
다음과 연결되도록 설계됩니다.

- Playwright
- Puppeteer
- chromedp

즉 새로운 브라우저 엔진이지만,
사용자는 기존 자동화 툴체인을 완전히 버리지 않고도 실험할 수 있습니다.
이것은 채택 장벽을 낮추는 꽤 현실적인 접근입니다.

## 핵심 기능 요약

README 기준으로 Lightpanda는 다음 기능들을 구현했거나 진행 중입니다.

- JavaScript 실행
- DOM tree / DOM APIs
- XHR API
- Fetch API
- 클릭
- 폼 입력
- 쿠키
- 커스텀 HTTP 헤더
- 프록시 지원
- 네트워크 인터셉션
- `robots.txt` 준수 옵션
- CDP / WebSocket 서버

즉 단순 HTML 파서가 아니라,
**현대 웹 자동화에 필요한 최소 브라우저 기능을 헤드리스 특화 방식으로 제공하는 엔진**이라고 보는 편이 맞습니다.

## 에이전트 하네스 아키텍처 관점에서 보면

이 프로젝트를 더 흥미롭게 만드는 부분은,
Lightpanda가 단독 앱이라기보다 **에이전트 하네스 아래에 들어가는 브라우저 실행 계층**이라는 점입니다.

구조를 단순화하면 다음과 같습니다.

```text
사용자 / 메신저 / 앱
        ↓
에이전트 하네스 (planner / tool runner / session manager)
        ↓
브라우저 어댑터 (Playwright / Puppeteer / CDP client)
        ↓
Lightpanda
        ↓
실제 웹 페이지 로딩 / JS 실행 / 상호작용
```

### 각 계층의 역할

- **에이전트 하네스**
  - 어떤 사이트를 방문할지 결정
  - 어떤 순서로 탐색할지 계획
  - 브라우저 호출을 검색/메모리/도구 실행과 연결
  - 세션과 재시도 흐름을 관리

- **브라우저 어댑터 계층**
  - Playwright, Puppeteer, chromedp 같은 클라이언트
  - 하네스의 의도를 CDP 호출로 변환

- **Lightpanda**
  - 실제 페이지 로딩
  - JS 실행
  - DOM 구성
  - 이벤트와 네트워크 요청 처리

### 왜 하네스와 잘 맞는가?

에이전트가 웹을 자주 다룰수록 병목은 모델이 아니라 브라우저 런타임이 되는 경우가 많습니다.
특히 다음 상황에서 그렇습니다.

- 동시 실행 세션이 많을 때
- JS-heavy 사이트를 여러 개 반복 처리할 때
- 크롤링과 테스트를 계속 돌릴 때
- 브라우저를 사람용 앱이 아니라 백엔드 런타임처럼 쓸 때

Lightpanda는 이 환경에 맞춰 설계된 쪽에 가깝습니다.
즉 이것은 “사람이 직접 쓰는 브라우저”보다,
**에이전트 하네스가 호출하는 목적형 브라우저 엔진**으로 이해하는 편이 정확합니다.

### 한계도 같이 봐야 함

README도 이 점은 분명히 밝힙니다.

- 아직 Beta 단계
- Web API 지원은 부분적이며 진행 중
- Playwright 경유 시 버전별 호환성 이슈가 생길 수 있음

즉 지금 시점의 Lightpanda는
Chrome 완전 대체재라기보다,
**비용·속도 병목이 큰 자동화 파이프라인에서 실험할 가치가 큰 신흥 브라우저 엔진**입니다.

## 설치와 실행

### 바이너리 설치

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

### Docker 실행

```bash
docker run -d --name lightpanda -p 9222:9222 lightpanda/browser:nightly
```

### CDP 서버 실행

```bash
./lightpanda serve --host 127.0.0.1 --port 9222
```

이후 Puppeteer 등에서 `browserWSEndpoint`로 연결하는 방식입니다.

### Puppeteer 연결 예시

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

즉 사용 방식은 “완전히 새로운 브라우저 API 학습”보다,
**기존 자동화 코드의 브라우저 백엔드를 바꾸는 느낌**에 가깝습니다.

## 기술 스택 관점에서 보는 인상

README를 기준으로 하면 핵심 축은 다음과 같습니다.

- 언어: Zig
- JS 엔진: V8
- HTTP loader: libcurl
- HTML parser: html5ever

이 조합에서 드러나는 방향은 매우 명확합니다.

- 시스템 레벨 제어를 강하게 가져가고
- 렌더링 없는 헤드리스 시나리오에 집중하며
- 브라우저 자동화에 필요한 부분을 우선 최적화하려는 전략

즉 Chrome처럼 모든 기능을 다 짊어진 브라우저가 아니라,
**에이전트 자동화용으로 목적 최적화된 런타임**을 만들겠다는 색이 분명합니다.

## 어떤 사람에게 맞는가?

### 잘 맞는 경우

- AI agent/browser automation 인프라를 직접 운영하는 팀
- Chrome 기반 자동화 비용이 너무 큰 팀
- 대량 스크래핑/반복 테스트를 돌리는 팀
- CDP 기반 기존 툴은 유지하면서 더 가벼운 엔진을 시험해보고 싶은 팀

### 덜 맞는 경우

- Chrome급 완전 호환성이 최우선인 경우
- Playwright 모든 시나리오가 즉시 안정적으로 돌아야 하는 경우
- 새 엔진 실험보다 운영 안정성이 훨씬 더 중요한 경우

즉 Lightpanda는 “모두가 당장 갈아타야 할 브라우저”라기보다,
**에이전트 런타임 비용과 속도 문제를 겪는 팀에게 매우 매력적인 선택지**입니다.

## 한 줄 총평

Lightpanda는 단순히 빠른 스크래핑 도구가 아닙니다.

이 프로젝트의 본질은,
**AI 에이전트가 호출할 브라우저 런타임을 Chrome 바깥에서 다시 설계하려는 시도**에 있습니다.

에이전트 하네스가 점점 더 웹을 직접 만지는 시대라면,
Lightpanda는 꽤 오래 지켜볼 가치가 있는 인프라 프로젝트입니다.

## 참고 링크

- GitHub 저장소: https://github.com/lightpanda-io/browser
- 홈페이지: https://lightpanda.io
- 데모/벤치마크 저장소: https://github.com/lightpanda-io/demo
- Nightly releases: https://github.com/lightpanda-io/browser/releases/tag/nightly
