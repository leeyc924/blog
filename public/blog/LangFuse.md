---
title: LangFuse
pubDatetime: 2026-03-14
description: LLM 애플리케이션을 위한 오픈소스 엔지니어링 플랫폼
tags: ["AI"]
---

> LLM 애플리케이션을 위한 오픈소스 엔지니어링 플랫폼

---

## 1. Langfuse란?

Langfuse는 LLM(대규모 언어 모델) 애플리케이션 개발을 위한 **오픈소스 엔지니어링 플랫폼**입니다. 팀이 AI 애플리케이션을 협업하여 디버깅하고, 분석하며, 지속적으로 개선할 수 있도록 돕습니다.

### 왜 필요한가?

일반 소프트웨어와 달리, LLM 애플리케이션은 다음과 같은 복잡성을 가집니다:

- **비결정론적 특성**: 같은 입력에도 다른 출력이 나올 수 있음
- **복잡한 파이프라인**: RAG, 에이전트, 멀티-턴 대화 등 여러 단계로 구성
- **비용 추적 어려움**: 토큰 사용량 및 API 비용 관리가 복잡
- **품질 평가의 어려움**: 출력 품질을 체계적으로 측정하기 어려움

Langfuse는 이 모든 문제를 해결하는 **통합 관측성(Observability) 플랫폼**입니다.

### 주요 특징

- ✅ **오픈소스** — GitHub에서 소스 공개, 자유로운 커스터마이징 가능
- ✅ **셀프 호스팅 가능** — 데이터를 외부에 보내지 않고 자체 인프라에서 운영
- ✅ **클라우드 제공** — 무료 Hobby 플랜으로 즉시 시작 가능
- ✅ **다양한 통합** — OpenAI, LangChain, LlamaIndex, LiteLLM 등 50개 이상 지원
- ✅ **YC W23 지원 기업** — 16,500개 이상의 GitHub 스타 보유

---

## 2. 핵심 기능

### 🔍 LLM 관측성 (Observability)

- LLM 호출 및 애플리케이션 내 모든 관련 로직 추적
- 복잡한 로그와 사용자 세션 검사 및 디버깅
- 검색, 임베딩, API 호출 등 비LLM 호출도 포함한 전체 트레이스 제공
- 멀티-턴 대화와 에이전트 워크플로우를 **세션(Session)** 단위로 추적
- **타임라인 뷰**로 지연(latency) 문제 분석
- 사용자별 비용 및 사용량 모니터링

### 📝 프롬프트 관리 (Prompt Management)

- UI, SDK, API를 통한 중앙 집중식 프롬프트 관리
- 버전 관리 및 협업 편집
- 코드 변경 없이 레이블(label)을 통해 프로덕션 배포
- 프롬프트 버전별 지연, 비용, 평가 지표 비교
- 플레이그라운드에서 즉시 테스트

### 📊 평가 (Evaluation)

- **LLM-as-a-Judge**: 자동화된 LLM 평가자로 품질 측정
- **사용자 피드백 수집**: 프론트엔드 SDK를 통한 사용자 반응 캡처
- **수동 레이블링**: Annotation Queue를 통한 인간 평가 워크플로우
- **실험(Experiments)**: 데이터셋 기반의 프롬프트/모델 비교 실험
- 커스텀 평가 파이프라인 (숫자, 불리언, 카테고리 값 지원)

### 📈 대시보드 및 분석

- 전체 볼륨, 모델별 사용량, 토큰 유형별 비용 분석
- 사용자별 비용 분류
- 지연(latency) 분포 시각화
- 품질 지표 추적

### 🎮 LLM 플레이그라운드

- 프롬프트와 모델 설정을 직접 테스트
- 트레이싱에서 문제가 발견되면 플레이그라운드로 즉시 이동하여 반복 실험

---

## 3. 시작하기

### 3.1 계정 생성 (클라우드)

1. [cloud.langfuse.com](https://cloud.langfuse.com/)에서 무료 계정 생성
2. 새 프로젝트 생성
3. 프로젝트 설정에서 API 키 확인 (`LANGFUSE_PUBLIC_KEY`, `LANGFUSE_SECRET_KEY`)

### 3.2 Python SDK 설치

```bash
pip install langfuse
```

### 3.3 환경 변수 설정

```bash
# .env 파일 또는 환경 변수로 설정
LANGFUSE_PUBLIC_KEY="pk-lf-..."
LANGFUSE_SECRET_KEY="sk-lf-..."
LANGFUSE_BASE_URL="https://cloud.langfuse.com"   # EU 리전 (기본값)
# LANGFUSE_BASE_URL="https://us.cloud.langfuse.com"  # US 리전
```

### 3.4 첫 번째 트레이스 생성

```python
from langfuse import observe
from langfuse.openai import openai  # OpenAI 자동 계측

@observe()  # 함수에 데코레이터 추가 — 모든 중첩 호출이 자동으로 연결됨
def story():
    return openai.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": "Langfuse가 뭐야?"}],
    ).choices[0].message.content

@observe()
def main():
    return story()

main()
```

실행 후 Langfuse 대시보드에서 트레이스를 확인할 수 있습니다.

---

## 4. 트레이싱

### 핵심 개념

|개념|설명|
|---|---|
|**Trace**|하나의 사용자 요청에 대한 전체 실행 흐름|
|**Span**|트레이스 내의 단일 작업 단위 (검색, 임베딩 등)|
|**Generation**|LLM 호출을 나타내는 특수 Span (입력/출력 포함)|
|**Session**|여러 턴으로 이루어진 대화나 에이전트 워크플로우의 묶음|

### @observe() 데코레이터 사용

```python
from langfuse import observe

@observe()
def retrieve_context(query: str) -> str:
    # 벡터 DB 검색 로직
    return "관련 문서 내용..."

@observe()
def generate_answer(query: str, context: str) -> str:
    from langfuse.openai import openai
    response = openai.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": f"Context: {context}"},
            {"role": "user", "content": query},
        ],
    )
    return response.choices[0].message.content

@observe()
def rag_pipeline(query: str) -> str:
    context = retrieve_context(query)
    return generate_answer(query, context)

# 실행
result = rag_pipeline("Langfuse의 주요 기능은?")
```

### 세션 및 사용자 추적

```python
from langfuse import get_client

langfuse = get_client()

# 멀티-턴 대화를 세션으로 묶기
with langfuse.start_as_current_span(
    name="chat-session",
    input={"user": "사용자 질문"},
    session_id="session-abc-123",
    user_id="user-xyz-456",
) as span:
    # 비즈니스 로직
    result = generate_answer("질문", "컨텍스트")
    span.update(output={"answer": result})
```

### 수동 Span 생성 (저수준 API)

```python
from langfuse import get_client

langfuse = get_client()

trace = langfuse.trace(
    name="my-rag-app",
    user_id="user-123",
    metadata={"env": "production"},
)

span = trace.span(
    name="retrieval",
    input={"query": "검색 쿼리"},
)

# ... 검색 로직 실행 ...

span.end(output={"docs": ["doc1", "doc2"]})

# 반드시 flush 호출 (동기 환경)
langfuse.flush()
```

---

## 5. 프롬프트 관리

### UI에서 프롬프트 생성

1. Langfuse 대시보드 → **Prompts** 메뉴
2. `+ New Prompt` 클릭
3. 이름, 내용 작성 후 저장 (자동으로 버전 1 생성)
4. 레이블 (`production`, `staging` 등)을 붙여 환경별 배포

### SDK에서 프롬프트 가져오기

```python
from langfuse import get_client

langfuse = get_client()

# 프롬프트 가져오기 (클라이언트 사이드 캐싱으로 지연 없음)
prompt = langfuse.get_prompt("my-prompt-name")

# 변수 치환
compiled = prompt.compile(
    user_name="홍길동",
    topic="AI 트렌드",
)

# OpenAI와 함께 사용
from langfuse.openai import openai

response = openai.chat.completions.create(
    model="gpt-4o",
    messages=compiled,
)
```

### 특정 버전 또는 레이블로 가져오기

```python
# 특정 버전
prompt_v2 = langfuse.get_prompt("my-prompt", version=2)

# 특정 레이블 (프로덕션용)
prod_prompt = langfuse.get_prompt("my-prompt", label="production")
```

---

## 6. 평가

### 트레이스에 점수 추가

```python
from langfuse import get_client

langfuse = get_client()

# 특정 트레이스에 점수 기록
langfuse.score(
    trace_id="trace-id-here",
    name="relevance",        # 평가 지표 이름
    value=0.85,              # 0~1 사이의 숫자값
    comment="답변이 관련성 높음",
)

# 카테고리형 점수
langfuse.score(
    trace_id="trace-id-here",
    name="quality",
    value="good",            # 카테고리 값
)
```

### LLM-as-a-Judge 설정

Langfuse UI에서 자동 평가자를 설정할 수 있습니다:

1. **Evaluations** → **Managed Evaluators** 메뉴
2. `+ New Evaluator` 클릭
3. 평가 기준(정확성, 관련성, 유해성 등) 선택
4. 평가에 사용할 LLM 모델 선택
5. 자동으로 트레이스에 점수 적용

### 사용자 피드백 수집

```python
# 서버 사이드에서 사용자 피드백 기록
langfuse.score(
    trace_id="trace-id-here",
    name="user-feedback",
    value=1,   # 좋아요 = 1, 싫어요 = -1
    data_type="BOOLEAN",
)
```

### 데이터셋 기반 실험

```python
from langfuse import get_client

langfuse = get_client()

# 데이터셋 생성
dataset = langfuse.create_dataset(name="qa-test-set")

# 아이템 추가
langfuse.create_dataset_item(
    dataset_name="qa-test-set",
    input={"question": "RAG란 무엇인가요?"},
    expected_output={"answer": "Retrieval-Augmented Generation의 약자입니다..."},
)

# 실험 실행
dataset = langfuse.get_dataset("qa-test-set")
for item in dataset.items:
    with item.observe(run_name="experiment-v1") as trace_id:
        output = rag_pipeline(item.input["question"])
        # 평가 로직 추가 가능
```

---

## 7. 주요 프레임워크 통합

### OpenAI SDK

```python
# 기존 openai 대신 langfuse.openai 사용 (드롭인 교체)
from langfuse.openai import openai

response = openai.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "안녕하세요"}],
)
```

### LangChain

```python
from langfuse.callback import CallbackHandler

# 콜백 핸들러를 LangChain에 전달
langfuse_handler = CallbackHandler(
    public_key="pk-lf-...",
    secret_key="sk-lf-...",
    host="https://cloud.langfuse.com",
)

# LangChain 체인에 콜백 추가
chain.invoke(
    {"input": "질문"},
    config={"callbacks": [langfuse_handler]},
)
```

### LlamaIndex

```python
from langfuse.llama_index import LlamaIndexInstrumentor

# LlamaIndex 전역 계측 활성화
instrumentor = LlamaIndexInstrumentor()
instrumentor.start()

# 이후 모든 LlamaIndex 호출이 자동으로 트레이스됨
```

### LiteLLM (100개 이상 모델 지원)

```python
import litellm

litellm.success_callback = ["langfuse"]

# Claude, Gemini, Mistral 등 어떤 모델이든 트레이스 가능
response = litellm.completion(
    model="claude-3-5-sonnet-20241022",
    messages=[{"role": "user", "content": "안녕하세요"}],
)
```

---

## 8. 셀프 호스팅

### Docker Compose로 로컬 실행

```bash
# 1. 저장소 클론
git clone https://github.com/langfuse/langfuse.git
cd langfuse

# 2. Docker Compose 실행 (PostgreSQL + ClickHouse + Langfuse 포함)
docker compose up
```

이후 `http://localhost:3000`에서 대시보드에 접근할 수 있습니다.

### 환경 변수 수정

셀프 호스팅 시 `LANGFUSE_BASE_URL`을 자신의 서버 주소로 변경합니다:

```bash
LANGFUSE_BASE_URL="http://localhost:3000"
# 또는
LANGFUSE_BASE_URL="https://your-langfuse.example.com"
```

### 프로덕션 배포 옵션

|방법|설명|
|---|---|
|**Docker Compose**|단일 VM에서 빠른 설정|
|**Kubernetes**|대규모 프로덕션 환경|
|**AWS / GCP / Azure**|클라우드별 Terraform 템플릿 제공|

---

## 9. 언제 Langfuse를 사용해야 하나?

### 사용을 권장하는 경우

- 여러 팀원이 프롬프트를 공동 작업하고 버전 관리가 필요할 때
- 실제 사용자가 있는 프로덕션 애플리케이션에서 비용과 성능을 추적해야 할 때
- RAG 시스템, 멀티-에이전트 구조, 대화형 체인 등 복잡한 워크플로우를 디버깅할 때
- 수동 점검이 아닌 체계적인 품질 테스트가 필요할 때

### 아직 필요 없는 경우

- 간단한 프로토타입이나 개인 실험 프로젝트
- 실제 사용자가 없는 초기 PoC 단계

### 지원 모델 및 프레임워크

Langfuse는 특정 모델이나 프레임워크에 종속되지 않습니다:

- **모델**: OpenAI, Anthropic Claude, Google Gemini, Mistral, Llama, HuggingFace 등
- **프레임워크**: LangChain, LlamaIndex, LangGraph, CrewAI, AutoGen, Haystack 등
- **운영 환경**: Python, JavaScript/TypeScript, 그 외 언어는 OpenTelemetry로 지원

---

## 참고 링크

- 공식 문서: [langfuse.com/docs](https://langfuse.com/docs)
- GitHub: [github.com/langfuse/langfuse](https://github.com/langfuse/langfuse)
- 클라우드 시작: [cloud.langfuse.com](https://cloud.langfuse.com/)
- 인터랙티브 데모: [langfuse.com/docs](https://langfuse.com/docs) (Try Demo 버튼)
- Python SDK PyPI: [pypi.org/project/langfuse](https://pypi.org/project/langfuse/)

---
