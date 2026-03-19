---
title: "OpenEvals - LLM 평가 프레임워크 가이드"
pubDatetime: 2026-03-19
description: "LangChain의 OpenEvals로 LLM 애플리케이션을 체계적으로 평가하는 방법과 하네스 아키텍처 분석"
tags: ["AI", "LLM", "Evaluation", "LangChain"]
category: "ai"
---

## Table of contents

## OpenEvals란?

[OpenEvals](https://github.com/langchain-ai/openevals)는 LangChain에서 만든 오픈소스 LLM 평가 프레임워크다. LLM 애플리케이션의 출력을 체계적으로 평가하기 위한 도구 모음으로, 29개의 사전 정의된 평가 프롬프트와 다양한 평가 방식을 제공한다.

핵심 아이디어는 단순하다. **팩토리 함수로 평가자(evaluator)를 생성하고, 입력/출력을 넣으면 점수가 나온다.**

```bash
# Python
pip install openevals

# TypeScript
npm install openevals @langchain/core
```

## 하네스 아키텍처 (Harness Architecture)

OpenEvals의 아키텍처는 **팩토리 패턴 기반의 평가 하네스(Evaluation Harness)** 구조를 따른다. 테스트 하네스가 테스트 케이스를 실행하고 결과를 수집하듯, OpenEvals는 LLM 출력에 대한 평가를 실행하고 구조화된 결과를 반환한다.

### 전체 구조

```
┌─────────────────────────────────────────────────────┐
│                  Evaluation Harness                  │
│                                                      │
│  ┌──────────────┐    ┌──────────────┐               │
│  │   Factory     │    │   Protocols  │               │
│  │   Functions   │    │   & Types    │               │
│  │              │    │              │               │
│  │ create_llm_  │    │ SimpleEval-  │               │
│  │ as_judge()   │    │ uator        │               │
│  │              │    │              │               │
│  │ create_json_ │    │ Evaluator-   │               │
│  │ match_eval() │    │ Result       │               │
│  └──────┬───────┘    └──────┬───────┘               │
│         │                    │                       │
│         ▼                    ▼                       │
│  ┌──────────────────────────────────────┐           │
│  │         Evaluator Callable           │           │
│  │  (inputs, outputs, ref) → Result     │           │
│  └──────────────┬───────────────────────┘           │
│                 │                                    │
│    ┌────────────┼────────────┐                      │
│    ▼            ▼            ▼                       │
│ ┌──────┐  ┌──────────┐  ┌──────────┐              │
│ │ LLM  │  │ Code     │  │ Hybrid   │              │
│ │Judge │  │Evaluator │  │Evaluator │              │
│ └──────┘  └──────────┘  └──────────┘              │
│                                                      │
│  ┌──────────────────────────────────────┐           │
│  │         Prompt Templates (29)        │           │
│  │  Quality│RAG│Safety│Security│Image   │           │
│  └──────────────────────────────────────┘           │
└─────────────────────────────────────────────────────┘
```

### 핵심 컴포넌트

**1. Protocol 인터페이스**

모든 평가자는 동일한 호출 규약을 따른다.

```python
# 평가자의 기본 시그니처
def evaluator(
    inputs: dict,           # 입력 데이터
    outputs: dict,          # LLM 출력
    reference_outputs: dict # 정답 (선택)
) -> EvaluatorResult
```

**2. EvaluatorResult 타입**

평가 결과는 일관된 구조로 반환된다.

```python
class EvaluatorResult(TypedDict):
    key: str              # 평가 식별자 (예: "correctness")
    score: float | bool   # 점수 (True/False 또는 0.0~1.0)
    comment: str | None   # 설명 (선택)
    metadata: dict | None # 추가 메타데이터
```

**3. Factory Functions**

평가자를 생성하는 팩토리 함수들이 하네스의 핵심이다.

| 팩토리 함수 | 용도 |
|---|---|
| `create_llm_as_judge()` | LLM 기반 평가 |
| `create_json_match_evaluator()` | JSON 구조 비교 |
| `create_trajectory_match_evaluator()` | 에이전트 경로 평가 |
| `create_pyright_evaluator()` | Python 타입 체크 |
| `create_embedding_similarity_evaluator()` | 의미 유사도 |
| `create_e2b_execution_evaluator()` | 샌드박스 코드 실행 |

### LLM-as-Judge 내부 흐름

`create_llm_as_judge()`가 만든 평가자의 실행 흐름:

```
입력 파라미터
    │
    ▼
파라미터 직렬화 (JSON 변환)
    │
    ▼
프롬프트 포맷팅 (템플릿에 변수 삽입)
    │
    ▼
메시지 구성 (시스템 메시지 + 사용자 메시지)
    │
    ▼
Few-shot 예시 주입 (XML 형식)
    │
    ▼
출력 스키마 생성 (bool / float / discrete)
    │
    ▼
Judge LLM 호출 (structured output)
    │
    ▼
응답 파싱 → EvaluatorResult 반환
```

## 평가자 유형 총정리

### A. LLM-as-Judge 평가 (29개 프롬프트)

사전 정의된 프롬프트를 사용해 LLM이 다른 LLM의 출력을 판단한다.

| 카테고리 | 프롬프트 | 설명 |
|---|---|---|
| **품질** | Correctness, Conciseness, Hallucination 등 7개 | 응답 정확도, 간결성, 환각 검사 |
| **RAG** | Groundedness, Helpfulness, Retrieval Relevance | RAG 파이프라인 평가 |
| **안전** | Toxicity, Fairness | 유해성, 공정성 검사 |
| **보안** | PII Leakage, Prompt Injection, Jailbreak, Code Injection | 보안 취약점 검사 |
| **경로** | Accuracy, Task Completion, Tool Selection 등 9개 | 에이전트 행동 평가 |
| **이미지** | Relevance, Visual Hallucination 등 4개 | 멀티모달 평가 |

### B. 코드 기반 평가 (LLM 불필요)

```python
from openevals.exact import exact_match

# 정확 일치
result = exact_match(
    outputs="hello world",
    reference_outputs="hello world"
)
# → EvaluatorResult(key="exact_match", score=True)
```

### C. 하이브리드 평가 (코드 + LLM)

JSON의 특정 키는 정확 매칭, 나머지는 LLM 판단을 결합한다.

```python
from openevals.json import create_json_match_evaluator

evaluator = create_json_match_evaluator(
    aggregator="average",
    rubric={"summary": "핵심 내용을 빠짐없이 포함하는가?"},
    model="openai:gpt-4o"
)

result = evaluator(
    outputs={"name": "Alice", "summary": "AI 기반 검색 시스템"},
    reference_outputs={"name": "Alice", "summary": "AI 검색 엔진"}
)
```

`name`은 코드로 정확 매칭하고, `summary`는 rubric에 따라 LLM이 판단한다.

## 실전 사용 가이드

### 1. 기본 품질 평가

```python
from openevals.llm import create_llm_as_judge
from openevals.prompts import CORRECTNESS_PROMPT

evaluator = create_llm_as_judge(
    prompt=CORRECTNESS_PROMPT,
    model="openai:gpt-4o"
)

result = evaluator(
    inputs="Python에서 리스트를 뒤집는 방법은?",
    outputs="list[::-1] 슬라이싱을 사용하세요.",
    reference_outputs="reversed() 함수나 [::-1] 슬라이싱을 사용합니다."
)

print(result)
# {'key': 'correctness', 'score': True, 'comment': '...'}
```

### 2. RAG 파이프라인 평가

```python
from openevals.prompts import RAG_GROUNDEDNESS_PROMPT

evaluator = create_llm_as_judge(
    prompt=RAG_GROUNDEDNESS_PROMPT,
    model="anthropic:claude-sonnet-4-20250514"
)

result = evaluator(
    context={
        "documents": [
            "서울의 인구는 약 950만 명이다.",
            "서울은 대한민국의 수도이다."
        ]
    },
    outputs={"answer": "서울의 인구는 약 950만 명이며 대한민국의 수도입니다."}
)
```

### 3. 커스텀 프롬프트

```python
evaluator = create_llm_as_judge(
    prompt="""다음 번역의 품질을 평가하세요.

원문: {source_text}
번역: {outputs}

자연스러운 한국어인지, 원문의 의미를 정확히 전달하는지 평가하세요.""",
    model="openai:gpt-4o"
)

result = evaluator(
    outputs="오늘 날씨가 좋습니다.",
    source_text="The weather is nice today."
)
```

### 4. 점수 체계 커스터마이징

```python
# 이진 평가 (기본값)
evaluator = create_llm_as_judge(prompt=..., model=...)
# → score: True/False

# 연속 점수 (0.0 ~ 1.0)
evaluator = create_llm_as_judge(prompt=..., model=..., continuous=True)
# → score: 0.0 ~ 1.0

# 이산 선택지
evaluator = create_llm_as_judge(prompt=..., model=..., choices=[0.0, 0.5, 1.0])
# → score: 0.0, 0.5, 또는 1.0
```

### 5. 커스텀 출력 스키마

```python
from typing import TypedDict

class TranslationResult(TypedDict):
    fluency_score: float
    accuracy_score: float
    overall_pass: bool

evaluator = create_llm_as_judge(
    prompt="번역 품질을 fluency, accuracy, overall로 평가하세요...",
    model="openai:gpt-4o",
    output_schema=TranslationResult
)
```

### 6. 에이전트 경로(Trajectory) 평가

에이전트가 올바른 도구를 올바른 순서로 호출했는지 평가한다.

```python
from openevals.trajectory import create_trajectory_match_evaluator

evaluator = create_trajectory_match_evaluator(
    trajectory_match_mode="unordered"  # strict | unordered | subset | superset
)

result = evaluator(
    outputs=[
        {"role": "assistant", "tool_calls": [{"function": {"name": "search", "arguments": "{\"q\": \"서울 날씨\"}"}}]},
        {"role": "tool", "content": "맑음, 22도"},
        {"role": "assistant", "content": "서울은 현재 맑고 22도입니다."}
    ],
    reference_outputs=[
        {"role": "assistant", "tool_calls": [{"function": {"name": "search", "arguments": "{\"q\": \"서울 날씨\"}"}}]},
        {"role": "tool", "content": "맑음, 22도"},
        {"role": "assistant", "content": "서울 날씨는 맑으며 기온은 22도입니다."}
    ]
)
```

### 7. 코드 평가 (타입 체크)

```python
from openevals.code.pyright import create_pyright_evaluator

evaluator = create_pyright_evaluator()

result = evaluator(
    outputs="""
def add(a: int, b: int) -> int:
    return a + b
"""
)
# Pyright 타입 체크 통과 여부 반환
```

### 8. 멀티모달 평가

```python
from openevals.prompts import IMAGE_RELEVANCE_PROMPT

evaluator = create_llm_as_judge(
    prompt=IMAGE_RELEVANCE_PROMPT,
    model="openai:gpt-4o"
)

result = evaluator(
    inputs="고양이 사진을 생성해주세요",
    outputs="귀여운 고양이가 창가에 앉아있는 이미지입니다.",
    attachments=[
        {"url": "https://example.com/cat.jpg"}
        # 또는 {"data": "base64...", "mime_type": "image/jpeg"}
    ]
)
```

## 모델 지원

`model` 파라미터에 프로바이더 접두사를 붙여 사용한다.

```python
# OpenAI
model="openai:gpt-4o"

# Anthropic
model="anthropic:claude-sonnet-4-20250514"

# Google
model="google_genai:gemini-2.0-flash"
```

또는 LangChain 모델 인스턴스를 직접 전달할 수도 있다.

```python
from langchain_anthropic import ChatAnthropic

judge = ChatAnthropic(model="claude-sonnet-4-20250514", temperature=0)
evaluator = create_llm_as_judge(prompt=..., judge=judge)
```

## LangSmith 통합

OpenEvals의 `EvaluatorResult`는 LangSmith의 피드백 형식과 호환된다.

```python
# pytest와 LangSmith를 사용한 평가 테스트
import pytest
from openevals.llm import create_llm_as_judge
from openevals.prompts import CORRECTNESS_PROMPT

evaluator = create_llm_as_judge(
    prompt=CORRECTNESS_PROMPT,
    feedback_key="correctness",  # LangSmith 대시보드에 표시될 키
    model="openai:gpt-4o"
)

def test_qa_correctness():
    result = evaluator(
        inputs="대한민국 수도는?",
        outputs="서울입니다.",
        reference_outputs="서울"
    )
    assert result["score"] is True
```

`feedback_key`는 LangSmith 대시보드에서 평가 결과를 추적하고 시각화하는 데 사용된다.

## 하네스 관점에서의 설계 원칙

### 1. 단일 인터페이스 원칙

모든 평가자가 `(inputs, outputs, reference_outputs) → EvaluatorResult` 시그니처를 따른다. LLM 기반이든 코드 기반이든 호출 방식이 동일하므로 교체가 쉽다.

### 2. 팩토리를 통한 설정 분리

평가 로직과 설정을 분리한다. 팩토리 함수 호출 시 설정을 주입하고, 반환된 평가자는 순수하게 평가만 수행한다.

```python
# 설정 단계 (한 번)
evaluator = create_llm_as_judge(
    prompt=CORRECTNESS_PROMPT,
    model="openai:gpt-4o",
    continuous=True
)

# 실행 단계 (여러 번)
for case in test_cases:
    result = evaluator(inputs=case["input"], outputs=case["output"])
```

### 3. 조합 가능성

하이브리드 평가자처럼 코드 평가와 LLM 평가를 하나의 평가자 안에서 조합할 수 있다. JSON 매칭에서 일부 키는 정확 매칭, 일부는 LLM 판단을 적용하는 것이 대표적이다.

### 4. 비동기 지원

모든 평가자에 async 변형이 존재해 대규모 평가를 병렬로 처리할 수 있다.

```python
from openevals.llm import create_async_llm_as_judge

evaluator = create_async_llm_as_judge(prompt=..., model="openai:gpt-4o")
result = await evaluator(inputs="...", outputs="...")
```

## 정리

| 항목 | 내용 |
|---|---|
| **핵심 패턴** | 팩토리 함수 → 평가자 callable → 구조화된 결과 |
| **평가 방식** | LLM-as-Judge, 코드 기반, 하이브리드 |
| **프롬프트** | 29개 사전 정의 (품질, RAG, 안전, 보안, 경로, 이미지) |
| **모델 지원** | OpenAI, Anthropic, Google + LangChain 호환 모델 |
| **멀티모달** | 이미지, 오디오, PDF |
| **언어** | Python, TypeScript 모두 지원 |
| **통합** | LangSmith 피드백 형식 호환, pytest/vitest 연동 |

OpenEvals는 "LLM 출력을 어떻게 체계적으로 평가할 것인가"라는 문제에 대해 깔끔한 팩토리 패턴 기반 하네스로 답한다. 사전 정의된 프롬프트로 빠르게 시작하고, 커스텀 프롬프트와 스키마로 확장하는 구조가 실용적이다.
