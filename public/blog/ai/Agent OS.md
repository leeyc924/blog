---
title: "Agent OS - AI 에이전트를 위한 경량 운영체제"
pubDatetime: 2026-04-07
description: "Rivet의 Agent OS 분석 - WebAssembly + V8 Isolate 기반 인프로세스 가상화로 VM 대비 92x 빠른 콜드 스타트(~6ms), 32x 저렴한 비용을 달성하는 AI 에이전트 전용 OS"
tags: ["AI", "Agent", "Sandbox", "WebAssembly", "Infrastructure"]
category: "ai"
---

## Agent OS란?

[Agent OS](https://github.com/rivet-dev/agent-os)는 **AI 코딩 에이전트를 위한 경량 운영체제**다. Y Combinator 출신 스타트업 [Rivet](https://rivet.dev)이 만들었다. Claude Code, Codex, Amp, OpenCode 같은 AI 에이전트가 코드를 실행할 때, VM이나 컨테이너 대신 **인프로세스 가상화 환경**을 제공한다.

핵심 아이디어는 단순하다. **WebAssembly와 V8 Isolate로 POSIX 호환 환경을 프로세스 안에서 구현한다.**

```
에이전트 코드 → Agent OS 커널 → WASM/V8 Isolate → 격리된 실행
                                (VM/컨테이너 불필요)
```

기존 샌드박스(E2B, Daytona)가 전체 Linux VM을 부팅하는 동안, Agent OS는 **~6ms**만에 실행 환경을 준비한다. Rust로 작성되었고, Apache 2.0 라이선스로 공개되어 있다.

---

## 왜 주목할 만한가?

AI 에이전트가 코드를 실행하려면 **샌드박스**가 필요하다. 현재 주류 접근은 E2B, Daytona 같은 클라우드 VM 기반 샌드박스를 쓰는 것이다. 문제는 이게 **느리고 비싸다**는 것이다.

| 지표 | Agent OS | 최고 샌드박스 | 개선 |
|---|---|---|---|
| 콜드 스타트 (p50) | 4.8ms | 440ms (E2B) | 92x |
| 콜드 스타트 (p99) | 6.1ms | 3,150ms (E2B) | 516x |
| 메모리 (코딩 에이전트) | ~131MB | ~1,024MB (Daytona) | 8x |
| 메모리 (단순 셸) | ~22MB | ~1,024MB (Daytona) | 47x |
| 비용/초 (Hetzner ARM) | $0.0000011 | $0.019 (Daytona) | 17x |

콜드 스타트 92배, 메모리 8배, 비용 17배 차이다. 에이전트를 대규모로 운영할 때 이 차이는 결정적이다.

| 항목 | 내용 |
|---|---|
| 개발사 | Rivet (YC 출신) |
| 설립자 | Nathan Flurry, Nicholas Kissel |
| 라이선스 | Apache 2.0 |
| 언어 | Rust + TypeScript |
| GitHub Stars | ~2,100+ |
| 첫 릴리스 | 2026년 3월 31일 (v0.1.0) |

---

## 아키텍처: 인프로세스 OS 커널

Agent OS는 **진짜 운영체제 커널**을 프로세스 안에 구현했다. VM이 아니라, POSIX 시스템 콜을 소프트웨어로 에뮬레이션한다.

```
┌─────────────────────────────────────────────────────┐
│                    Agent OS Kernel                    │
│                                                     │
│  ┌──────────────────────────────────────────────┐   │
│  │              3개의 실행 런타임                  │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────────┐  │   │
│  │  │  WASM    │ │ V8       │ │ Pyodide      │  │   │
│  │  │ coreutils│ │ Isolate  │ │ (Python/WASM)│  │   │
│  │  │ grep,sed │ │ JS/TS    │ │              │  │   │
│  │  │ jq,curl  │ │ 실행      │ │              │  │   │
│  │  └──────────┘ └──────────┘ └──────────────┘  │   │
│  └──────────────────────────────────────────────┘   │
│                                                     │
│  ┌────────────┐ ┌────────────┐ ┌────────────────┐  │
│  │ Virtual FS │ │ Process    │ │ Virtual Net    │  │
│  │ (VFS)      │ │ Table      │ │ Stack          │  │
│  │ S3, GDrive │ │ PID, 시그널 │ │ TCP/UDP/Unix   │  │
│  │ SQLite 마운트│ │ 좀비 정리   │ │ 루프백, 프록시  │  │
│  └────────────┘ └────────────┘ └────────────────┘  │
│                                                     │
│  ┌────────────┐ ┌────────────┐ ┌────────────────┐  │
│  │ Pipes/PTY  │ │ Permission │ │ Resource       │  │
│  │ 64KB 버퍼   │ │ deny-by-   │ │ Limits         │  │
│  │ IPC        │ │ default    │ │ CPU/Mem/FD     │  │
│  └────────────┘ └────────────┘ └────────────────┘  │
└─────────────────────────────────────────────────────┘
```

### 커널 서브시스템

**Virtual Filesystem (VFS)**: 계층형 청크 아키텍처로 구현된 가상 파일시스템이다. `/dev/null`, `/dev/urandom`, `/proc/[pid]/*` 같은 디바이스 파일과 proc 파일시스템을 지원한다. S3, Google Drive, SQLite, 호스트 디렉토리를 마운트 포인트로 붙일 수 있다.

**Process Table**: 완전한 POSIX 프로세스 모델을 구현한다. 부모-자식 관계, 프로세스 그룹, 세션, 시그널(SIGCHLD, SIGTERM, SIGWINCH), 좀비 프로세스 정리, waitpid를 지원한다. Node 프로세스가 WASM 셸을 스폰하는 것처럼 **런타임을 넘나드는 프로세스 생성**도 가능하다.

**Virtual Network Stack**: TCP/UDP/Unix 도메인 소켓을 지원하는 소켓 테이블. 루프백은 커널 내부에서 처리하고, 외부 연결은 HostNetworkAdapter에 위임한다. 아웃바운드 연결을 허용, 거부, 프록시로 제어할 수 있다.

**Permissions**: 파일시스템, 네트워크, 자식 프로세스, 환경 변수 4개 도메인에 걸쳐 **deny-by-default** 접근 제어를 적용한다.

---

## 3개의 실행 런타임

Agent OS는 용도에 따라 세 가지 런타임을 사용한다.

### 1. WebAssembly (WASM)

POSIX 유틸리티들을 Rust/C 소스에서 WASM으로 컴파일했다. 에이전트는 익숙한 Linux CLI 환경을 그대로 사용할 수 있다.

```
포함된 도구들:
coreutils, grep, sed, find, tar, gzip, ripgrep,
jq, sqlite3, curl, wget, git ...
```

패키지 레지스트리 시스템이 있어, 필요한 도구만 골라 구성할 수 있다. apt처럼 사전 빌드된 WASM 바이너리를 설치한다.

### 2. V8 Isolates

JavaScript/TypeScript 에이전트 코드가 V8 샌드박스 안에서 실행된다. Node.js 빌트인 모듈(`fs`, `os`, `tls` 등)을 커널 기반 폴리필로 교체해서, `require('fs')`가 호출되면 실제 파일시스템이 아닌 VFS를 참조한다.

### 3. Pyodide (실험적)

CPython을 WASM으로 컴파일한 Pyodide로 Python 실행을 지원한다.

---

## 가상화 불변 규칙

Agent OS는 8개의 엄격한 가상화 불변 규칙을 문서화하고 있다. 핵심 원칙은 **게스트 코드가 가상 환경과 실제 환경을 구별할 수 없어야 한다**는 것이다.

```
불변 규칙 (발췌):
1. 모든 게스트 시스콜은 커널을 경유한다
2. 호스트의 실제 빌트인이 게스트에 노출되지 않는다
3. 호스트는 게스트에게 보이지 않는 구현 세부사항이다
4. 폴리필은 래퍼가 아닌 완전한 재구현이어야 한다
5. 제어 채널은 데이터 채널과 분리되어야 한다
6. 리소스 소비는 제한되어야 한다
```

`process.pid`는 커널 PID를 반환하고, `os.hostname()`은 커널 호스트네임을 반환하며, `fs.readdirSync('/')`는 VFS 루트를 보여준다. 게스트 코드 입장에서는 진짜 Linux에서 실행되는 것과 동일한 경험이다.

---

## 에이전트 관리

### 멀티 에이전트 지원

Agent OS는 다양한 AI 에이전트를 통합 API로 관리한다.

```
지원 에이전트:
- Claude Code
- Codex (OpenAI)
- Amp
- OpenCode
- Pi (Rivet 자체)
```

**Agent Communication Protocol (ACP)** 표준을 채택해 세션 생성, 관리, 재개를 처리한다. 모든 에이전트의 대화 로그가 **통합 트랜스크립트 형식**으로 저장되어 디버깅과 감사에 활용된다.

### Host Tools

JavaScript 함수를 에이전트가 CLI 명령처럼 호출할 수 있는 **Host Tool**로 정의할 수 있다. 네트워크 홉 없이 에이전트가 백엔드 함수를 직접 실행한다.

```typescript
// Host Tool 정의 예시
const tools = {
  "query-db": async (args) => {
    const result = await db.query(args.sql);
    return JSON.stringify(result);
  }
};

// 에이전트는 VM 안에서 이렇게 호출
// $ query-db --sql "SELECT * FROM users LIMIT 10"
```

---

## 오케스트레이션

### 멀티플레이어

여러 클라이언트가 동일한 에이전트 세션을 **실시간으로 관찰하고 협업**할 수 있다.

### 에이전트 간 위임

에이전트가 다른 에이전트에게 작업을 위임한다. Host Tool을 통해 에이전트 A가 에이전트 B를 호출하고 결과를 받는 구조다.

### 워크플로우

에이전트 작업을 **내구성 있는 워크플로우**로 체이닝한다. 재시도, 분기, 재개 가능한 실행을 지원한다.

```
워크플로우 예시:
코드 생성 → 테스트 실행 → 코드 리뷰 → 배포
    ↓ 실패 시
  재시도 (최대 3회) → 사람에게 에스컬레이션
```

---

## 하이브리드 샌드박스

Agent OS는 전체 샌드박스를 **대체하려는 게 아니다**. 경량 작업은 인프로세스에서 처리하고, 브라우저 실행이나 네이티브 컴파일 같은 **무거운 작업은 E2B/Daytona 샌드박스를 온디맨드로 연결**한다.

```
┌─────────────────────────────────────────────┐
│              Agent OS (기본)                  │
│  경량 작업: 파일 편집, 검색, 스크립트 실행      │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │ Sandbox Extension (필요 시)          │    │
│  │ E2B / Daytona 연결                   │    │
│  │ 브라우저, 네이티브 빌드, GPU 작업      │    │
│  └─────────────────────────────────────┘    │
└─────────────────────────────────────────────┘
```

기본은 가볍게, 필요하면 무겁게. 이 하이브리드 접근이 실용적이다.

---

## 배포

npm 패키지로 배포된다. Docker도, 특별한 인프라도 필요 없다.

```bash
npm install @rivet-dev/agent-os
```

노트북, Vercel, Railway, Kubernetes, Rivet Cloud 어디서든 동작한다. 내장 기능으로 Cron, Webhook, Queue도 지원한다.

---

## 기존 샌드박스와의 비교

| 비교 항목 | 클라우드 VM 샌드박스 | 컨테이너 (Docker) | Agent OS |
|---|---|---|---|
| 콜드 스타트 | 수백ms~수초 | 수초 | ~6ms |
| 메모리 | ~1GB | 수백MB | ~22-131MB |
| 격리 수준 | VM 레벨 | 커널 공유 | 인프로세스 (WASM/V8) |
| 네트워크 | 별도 서비스 | 별도 서비스 | 인프로세스 |
| POSIX 호환 | 완전 | 완전 | 부분적 (확장 중) |
| 비용 | 높음 | 중간 | 매우 낮음 |
| 배포 | 클라우드 필수 | Docker 필수 | npm install |
| 에이전트 통합 | API별 개별 구현 | 없음 | 통합 API (ACP) |

---

## 현재 한계

Agent OS는 아직 v0.1.0이다. 몇 가지 알려진 한계가 있다.

- **Node.js 폴리필 미완성**: `net`, `dgram`, `dns`, `http`, `vm`, `worker_threads` 등 일부 빌트인 모듈의 커널 폴리필이 아직 구현 중이다. 프로젝트 자체 문서에서 "KNOWN DEFICIENT"로 표시하고 있다.
- **POSIX 호환성**: 전체 Linux 환경 대비 지원 범위가 제한적이다. 복잡한 네이티브 의존성이 있는 프로젝트는 여전히 전체 샌드박스가 필요하다.
- **Python 지원**: Pyodide 기반 Python 실행은 실험적 단계다.

---

## 마무리

Agent OS의 핵심 통찰은 **"AI 에이전트에게 전체 Linux VM은 과하다"**는 것이다. 에이전트가 실제로 하는 작업의 대부분은 파일 읽기/쓰기, 검색, 스크립트 실행이다. 이 정도 작업에 1GB 메모리와 수초의 부팅 시간을 쓸 이유가 없다.

Agent OS는 세 가지를 동시에 달성한다.

1. **속도**: 콜드 스타트 ~6ms (VM 대비 92x)
2. **비용**: 메모리 8x, 비용 17x 절감
3. **통합**: 멀티 에이전트 통합 API + 워크플로우 오케스트레이션

아직 초기 단계이고 Node.js 폴리필 등 미완성 부분이 있지만, **에이전트 인프라의 비용 구조를 근본적으로 바꿀 수 있는** 접근이다. WebAssembly와 V8 Isolate라는 검증된 기술 위에 POSIX 커널을 구현한 아키텍처가 인상적이다.
