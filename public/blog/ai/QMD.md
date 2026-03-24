---
title: "QMD - 로컬에서 돌아가는 마크다운 검색 엔진"
pubDatetime: 2026-03-24
description: "Shopify CEO Tobi Lutke가 만든 QMD(Query Markup Documents) 분석 - BM25 + 벡터 검색 + LLM 리랭킹을 결합한 온디바이스 하이브리드 검색 엔진으로 토큰 사용량 95% 절감"
tags: ["AI", "Search", "RAG", "MCP"]
category: "ai"
---

## QMD란?

[QMD(Query Markup Documents)](https://github.com/tobi/qmd)는 Shopify CEO **Tobi Lutke**가 만든 온디바이스 검색 엔진이다. 마크다운 노트, 회의록, 문서, 지식 베이스를 **로컬에서** 검색한다.

핵심 아이디어는 단순하다. **검색을 LLM 밖으로 꺼내서 로컬 머신에서 처리한다.**

```
문서 → 인덱싱 → BM25 + 벡터 + 리랭킹 → 정확한 결과만 LLM에 전달
```

클라우드 API 호출 없이, 약 2GB의 GGUF 모델 3개로 모든 것이 로컬에서 동작한다. 토큰 사용량을 **95% 이상** 줄인다.

---

## 왜 주목할 만한가?

Shopify 내부에서 이미 코드 모노레포의 문서 검색에 통합되어 사용 중이다. Tobi Lutke는 X에서 이렇게 말했다.

> "Shopify에서 너무 많은 사람들이 쓰고 있어서, 코드 모노레포의 문서 검색에 통합 버전을 만들었다."

단순한 개인 프로젝트가 아니라, **$150B 기업의 실제 워크플로우**에서 검증된 도구다.

| 특징 | 내용 |
|---|---|
| 개발자 | Tobi Lutke (Shopify CEO) |
| 라이선스 | MIT |
| 런타임 | 완전 로컬 (API 키 불필요) |
| 모델 크기 | ~2GB (GGUF 3개) |
| 토큰 절감 | 95%+ |

---

## 아키텍처: 3계층 하이브리드 검색

QMD의 검색 파이프라인은 세 가지 방식을 결합한다.

```
┌──────────────────────────────────────────────────────┐
│                  QMD Search Pipeline                  │
│                                                      │
│  ┌──────────────┐                                    │
│  │ Query Input  │                                    │
│  └──────┬───────┘                                    │
│         ↓                                            │
│  ┌──────────────────┐                                │
│  │ Query Expansion  │  qmd-query-expansion-1.7B      │
│  │ (서브쿼리 생성)   │  자연어 → 타입별 서브쿼리      │
│  └──────┬───────────┘                                │
│         ↓                                            │
│  ┌──────────┐    ┌───────────────┐                   │
│  │  BM25    │    │ Vector Search │                   │
│  │ (키워드) │    │ (의미 유사도)  │  embedding-gemma  │
│  └────┬─────┘    └──────┬────────┘                   │
│       └────────┬────────┘                            │
│                ↓                                     │
│  ┌─────────────────────────┐                         │
│  │ Reciprocal Rank Fusion  │  결과 리스트 통합        │
│  └────────────┬────────────┘                         │
│               ↓                                      │
│  ┌──────────────────┐                                │
│  │   LLM Reranking  │  Qwen3-Reranker-0.6B          │
│  │  (최종 품질 정렬) │                                │
│  └──────────────────┘                                │
│               ↓                                      │
│         최종 결과 반환                                 │
└──────────────────────────────────────────────────────┘
```

### 검색 모드 비교

| 모드 | 명령어 | 방식 | 속도 | 품질 |
|---|---|---|---|---|
| Full-text | `qmd search` | BM25 키워드 매칭 | 가장 빠름 | 정확한 키워드에 강함 |
| Semantic | `qmd vsearch` | 벡터 임베딩 유사도 | 보통 | 개념 검색에 강함 |
| Hybrid | `qmd query` | BM25 + 벡터 + 리랭킹 | 가장 느림 | 최고 품질 |

**Full-text 검색**은 에러 메시지, 코드 심볼, ID 같은 정확한 키워드를 찾을 때 쓴다. **Semantic 검색**은 "사용자 인증은 어떻게 처리하지?"처럼 개념으로 검색할 때 유용하다. **Hybrid 검색**은 둘을 결합하고 리랭킹까지 거쳐 최고 품질의 결과를 반환한다.

---

## 로컬 모델 스택

QMD는 세 개의 GGUF 모델을 사용한다. 모두 로컬에서 실행되며 총 약 2GB다.

| 모델 | 역할 | 크기 |
|---|---|---|
| embedding-gemma-300M | 문서/쿼리 벡터 임베딩 | ~300M |
| Qwen3-Reranker-0.6B | 검색 결과 리랭킹 | ~600M |
| qmd-query-expansion-1.7B | 자연어 → 서브쿼리 확장 | ~1.7B |

**Query Expansion 모델**이 특히 흥미롭다. Tobi Lutke가 직접 **2단계 학습(SFT → GRPO)**으로 훈련한 모델이다. 자연어 쿼리를 lexical, vector, HyDE 타입의 서브쿼리로 분해한다. HuggingFace에서 공개되어 있다.

---

## 지능형 청킹(Intelligent Chunking)

QMD는 마크다운 문서를 단순히 토큰 수로 자르지 않는다. **자연스러운 분리점을 찾는 스코어링 알고리즘**을 사용한다.

- 섹션, 단락, 코드 블록 등 **의미 단위**를 유지한다
- **Code Fence Protection**: 코드 블록 내부에서는 절대 분리하지 않는다
- 코드 블록이 청크 크기를 초과하면 통째로 유지한다

이건 RAG 시스템에서 흔히 겪는 "코드 블록이 중간에 잘리는" 문제를 구조적으로 해결한다.

---

## CLI 사용법

### 설치

```bash
npm install -g @tobilu/qmd
# 또는
bun install -g @tobilu/qmd
```

### 컬렉션 생성 및 인덱싱

```bash
# 문서 디렉토리를 컬렉션으로 등록
qmd add docs /path/to/your/docs

# 인덱스 생성
qmd update

# 벡터 임베딩 생성 (semantic search용)
qmd embed
```

### 검색

```bash
# 키워드 검색 (가장 빠름)
qmd search "authentication error"

# 의미 검색
qmd vsearch "사용자 인증은 어떻게 처리하나"

# 하이브리드 검색 (최고 품질)
qmd query "JWT 토큰 갱신 로직"

# 특정 문서 가져오기
qmd get docs/auth.md

# 글로브 패턴으로 여러 문서 가져오기
qmd multi-get "docs/**/*.md"
```

### 출력 형식

```bash
# JSON 출력 (에이전트 워크플로우용)
qmd query --json "search query"

# 파일 목록만
qmd query --files "search query"
```

---

## MCP 서버 통합

QMD는 **MCP(Model Context Protocol) 서버**를 내장하고 있어, Claude Code 같은 AI 어시스턴트와 직접 연동할 수 있다.

### MCP 도구

| 도구 | 설명 |
|---|---|
| `query` | 하이브리드 검색 (서브쿼리 확장 + RRF + 리랭킹) |
| `get` | 퍼지 매칭으로 특정 문서 가져오기 |
| `multi_get` | 글로브 패턴으로 배치 검색 |
| `status` | 인덱스 상태 모니터링 |

### 배포 모드

```bash
# stdio 모드 (기본, 클라이언트당 서브프로세스)
qmd mcp

# HTTP 모드 (장기 실행 서버, 모델 VRAM에 유지)
qmd mcp --http

# 데몬 모드 (백그라운드 실행)
qmd mcp --daemon
```

HTTP/데몬 모드에서는 모델이 VRAM에 로드된 상태로 유지되고, 임베딩 컨텍스트는 5분 유휴 시 자동 해제된다. 이는 반복 검색 시 응답 속도를 크게 향상시킨다.

---

## SDK로 프로그래밍 방식 사용

CLI뿐 아니라 TypeScript/JavaScript 라이브러리로도 사용할 수 있다.

```typescript
import { createStore } from '@tobilu/qmd'

const store = await createStore({
  dbPath: './index.sqlite',
  config: {
    collections: {
      docs: { path: '/path/to/docs' }
    }
  }
})

// 하이브리드 검색
const results = await store.search({ query: "authentication" })

// BM25만
const lexResults = await store.searchLex({ query: "JWT token" })

// 벡터만
const vecResults = await store.searchVector({ query: "인증 처리 방법" })

// 수동 쿼리 확장
const expanded = await store.expandQuery("user login flow")

await store.close()
```

---

## 컨텍스트 시스템

QMD의 **Context**는 컬렉션이나 경로에 계층적으로 메타데이터를 부착하는 기능이다. 검색 결과와 함께 반환되어 LLM이 더 나은 판단을 내릴 수 있게 한다.

```bash
# 컬렉션에 컨텍스트 추가
qmd context docs "이 디렉토리는 API 인증 관련 문서를 포함합니다"

# 하위 경로에 세부 컨텍스트
qmd context docs/auth "OAuth 2.0과 JWT 기반 인증 구현 가이드"
```

에이전트가 검색 결과를 받을 때, 해당 문서가 어떤 맥락에서 중요한지를 함께 전달받는다. 단순 텍스트 매칭을 넘어 **맥락 기반 검색**이 가능해진다.

---

## 기존 도구들과의 차이점

| 비교 항목 | 클라우드 RAG | 로컬 grep/ripgrep | QMD |
|---|---|---|---|
| 프라이버시 | 클라우드 전송 | 완전 로컬 | 완전 로컬 |
| 의미 검색 | O | X | O |
| 키워드 검색 | O | O | O |
| 리랭킹 | 일부 지원 | X | O (로컬 LLM) |
| 토큰 비용 | 높음 | 없음 | 없음 |
| 코드 블록 보존 | 서비스별 상이 | 해당 없음 | O |
| MCP 통합 | 별도 구현 필요 | X | 내장 |
| 오프라인 | X | O | O |

---

## 에코시스템

QMD를 중심으로 생태계가 형성되고 있다.

- **[lazyqmd](https://alexanderzeitler.com/articles/introducing-lazyqmd-a-tui-for-qmd/)**: QMD용 TUI(Terminal UI) 클라이언트
- **[ehc-io/qmd](https://github.com/ehc-io/qmd)**: 마크다운 지식 베이스용 MCP 서버 변형
- **OpenClaw 통합**: AI 에이전트의 메모리 검색에 QMD 활용
- **Raycast 확장**: macOS에서 빠른 QMD 검색

---

## 마무리

QMD의 핵심 통찰은 **"검색은 LLM이 할 일이 아니다"**라는 것이다. 전체 문서를 컨텍스트 윈도우에 넣는 대신, 로컬에서 정밀한 검색을 수행하고 **필요한 부분만** LLM에 전달한다.

이 접근은 세 가지 문제를 동시에 해결한다.

1. **비용**: 토큰 사용량 95%+ 절감
2. **프라이버시**: 문서가 로컬을 벗어나지 않음
3. **품질**: BM25 + 벡터 + 리랭킹으로 단순 RAG보다 높은 검색 품질

Shopify 규모에서 검증되었고, MIT 라이선스로 완전 오픈소스다. AI 에이전트 시대에 **로컬 검색 인프라**로서 주목할 만한 도구다.
