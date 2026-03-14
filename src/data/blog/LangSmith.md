---
title: LangSmith
pubDatetime: 2026-03-14
description: LangChain 기반 LLM 애플리케이션 모니터링 및 디버깅 플랫폼
tags: ["AI"]
---

## 1. LangSmith란?

**LangSmith**는 LangChain 팀이 개발한 **LLM 애플리케이션 개발 및 운영 플랫폼**입니다.  
LLM 기반 앱을 디버깅하고, 테스트하고, 평가하고, 모니터링하는 데 필요한 모든 도구를 제공합니다.

> 한 줄 요약: **"LLM 앱을 위한 개발자 도구 + 관측 가능성(Observability) 플랫폼"**

### LangSmith가 필요한 이유

LLM 앱 개발에서 흔히 겪는 문제들:

- 체인/에이전트가 왜 엉뚱한 답변을 내놓는지 알 수 없다
- 프롬프트를 바꾸면 전체 품질이 나아지는지 확인하기 어렵다
- 프로덕션에서 어떤 요청이 실패했는지 추적하기 힘들다
- 모델 응답 품질을 체계적으로 측정할 방법이 없다

LangSmith는 이 모든 문제를 해결해 줍니다.

---

## 2. 핵심 기능

| 기능             | 설명                                   |
| -------------- | ------------------------------------ |
| **Tracing**    | LLM 호출, 체인, 에이전트의 모든 실행 흐름을 시각적으로 추적 |
| **Evaluation** | 데이터셋 기반으로 모델/프롬프트 품질을 자동 평가          |
| **Prompt Hub** | 프롬프트를 버전 관리하고 팀과 공유                  |
| **Datasets**   | 테스트용 입출력 예제 데이터셋 관리                  |
| **Monitoring** | 프로덕션 환경의 레이턴시, 비용, 에러율 실시간 모니터링      |
| **Playground** | 프롬프트를 브라우저에서 바로 테스트                  |

---

## 3. 시작하기

### 3-1. 계정 생성 및 API 키 발급

1. [smith.langchain.com](https://smith.langchain.com/) 접속
2. 회원가입 (GitHub/Google 계정 사용 가능)
3. **Settings → API Keys → Create API Key** 클릭
4. 발급된 키를 안전하게 보관

### 3-2. 패키지 설치

```bash
pip install langsmith
# LangChain과 함께 사용 시
pip install langchain langchain-openai
```

### 3-3. 환경 변수 설정

```bash
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT="my-project"
```

`.env` 파일로 관리하는 경우:

```env
LANGCHAIN_TRACING_V2=true
LANGCHAIN_API_KEY=ls__xxxxxxxxxxxxxxxx
LANGCHAIN_PROJECT=my-awesome-project
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxx
```

```python
from dotenv import load_dotenv
load_dotenv()
```

---

## 4. Tracing (추적)

Tracing은 LangSmith의 핵심 기능입니다.  
LLM 호출의 입력/출력, 소요 시간, 토큰 수, 비용 등을 자동으로 기록합니다.

### 4-1. LangChain 자동 추적

환경 변수만 설정하면 LangChain 코드가 **자동으로** 추적됩니다.

```python
import os
os.environ["LANGCHAIN_TRACING_V2"] = "true"
os.environ["LANGCHAIN_API_KEY"] = "ls__..."

from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage

llm = ChatOpenAI(model="gpt-4o")
response = llm.invoke([HumanMessage(content="서울의 인구는?")])
print(response.content)
# LangSmith 대시보드에서 이 호출을 즉시 확인 가능
```

### 4-2. @traceable 데코레이터 (순수 Python 함수)

LangChain 없이 일반 함수도 추적할 수 있습니다.

```python
from langsmith import traceable
from openai import OpenAI

client = OpenAI()

@traceable
def call_openai(prompt: str) -> str:
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}]
    )
    return response.choices[0].message.content

@traceable
def rag_pipeline(question: str) -> str:
    docs = retrieve_documents(question)
    context = "\n".join(docs)
    return call_openai(f"Context: {context}\n\nQuestion: {question}")

result = rag_pipeline("LangSmith의 주요 기능은?")
```

### 4-3. 추적 데이터 확인

LangSmith 대시보드 → **Projects** → 프로젝트 선택 → 실행 목록

각 실행에서 볼 수 있는 정보:

- 입력 / 출력
- 실행 시간 (레이턴시)
- 사용 토큰 수 및 예상 비용
- 중첩된 서브 실행 트리
- 에러 메시지 (실패 시)

---

## 5. Evaluation (평가)

### 5-1. 데이터셋 생성

```python
from langsmith import Client

client = Client()

examples = [
    {"input": {"question": "파이썬이란?"},
     "output": {"answer": "파이썬은 범용 프로그래밍 언어입니다."}},
    {"input": {"question": "LangChain이란?"},
     "output": {"answer": "LLM 앱 개발 프레임워크입니다."}},
]

dataset = client.create_dataset(
    dataset_name="qa-test-set",
    description="QA 파이프라인 테스트용 데이터셋"
)

for ex in examples:
    client.create_example(
        inputs=ex["input"],
        outputs=ex["output"],
        dataset_id=dataset.id
    )
```

### 5-2. 평가 실행

```python
from langsmith.evaluation import evaluate

def my_qa_app(inputs: dict) -> dict:
    return {"answer": call_openai(inputs["question"])}

def correctness_evaluator(run, example) -> dict:
    predicted = run.outputs.get("answer", "")
    expected = example.outputs.get("answer", "")
    score = 1.0 if expected.split()[0] in predicted else 0.0
    return {"key": "correctness", "score": score}

results = evaluate(
    my_qa_app,
    data="qa-test-set",
    evaluators=[correctness_evaluator],
    experiment_prefix="gpt4o-baseline"
)
```

### 5-3. LLM-as-Judge

```python
from langsmith.evaluation import LangChainStringEvaluator

qa_evaluator = LangChainStringEvaluator(
    "qa",
    config={"llm": ChatOpenAI(model="gpt-4o")}
)

results = evaluate(
    my_qa_app,
    data="qa-test-set",
    evaluators=[qa_evaluator],
    experiment_prefix="gpt4o-llm-judge"
)
```

---

## 6. Prompt Hub

팀 전체가 프롬프트를 버전 관리하고 공유할 수 있는 저장소입니다.

### 6-1. 프롬프트 push (업로드)

```python
from langchain_core.prompts import ChatPromptTemplate
from langsmith import Client

client = Client()

prompt = ChatPromptTemplate.from_messages([
    ("system", "당신은 {role} 전문가입니다. 친절하고 명확하게 답변하세요."),
    ("human", "{question}")
])

client.push_prompt("my-expert-prompt", object=prompt)
```

### 6-2. 프롬프트 pull (다운로드)

```python
from langsmith import Client

client = Client()

# 최신 버전
prompt = client.pull_prompt("my-expert-prompt")

# 특정 버전 고정
prompt = client.pull_prompt("my-expert-prompt:abc123de")

chain = prompt | ChatOpenAI(model="gpt-4o")
response = chain.invoke({"role": "Python", "question": "데코레이터란?"})
```

---

## 7. Monitoring (모니터링)

### 대시보드 주요 지표

- **레이턴시**: 평균/P50/P99 응답 시간
- **토큰 사용량**: 입력/출력 토큰 추이
- **비용**: 모델별 API 비용
- **에러율**: 실패한 실행 비율
- **실행 볼륨**: 시간대별 요청 수

### 사용자 피드백 수집

```python
from langsmith import Client
from langsmith.run_helpers import get_current_run_tree

client = Client()

@traceable
def my_app(question: str) -> str:
    run = get_current_run_tree()
    answer = call_openai(question)

    client.create_feedback(
        run.id,
        key="user_rating",
        score=1,       # 1: 긍정, 0: 부정
        comment="좋은 답변이에요!"
    )
    return answer
```

---

## 8. 실전 예제 — RAG 파이프라인 전체 추적

```python
import os
from langsmith import traceable
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_core.prompts import ChatPromptTemplate

os.environ["LANGCHAIN_TRACING_V2"] = "true"
os.environ["LANGCHAIN_API_KEY"] = "ls__..."
os.environ["LANGCHAIN_PROJECT"] = "rag-demo"

embeddings = OpenAIEmbeddings()
llm = ChatOpenAI(model="gpt-4o")

vectorstore = FAISS.from_texts(
    ["LangSmith는 LLM 앱 관측 플랫폼입니다.",
     "LangChain은 LLM 앱 개발 프레임워크입니다."],
    embedding=embeddings
)

prompt = ChatPromptTemplate.from_template("""
다음 컨텍스트를 바탕으로 질문에 답하세요.

컨텍스트:
{context}

질문: {question}
""")

@traceable(name="RAG Pipeline")
def rag_answer(question: str) -> str:
    docs = vectorstore.similarity_search(question, k=3)
    context = "\n".join([d.page_content for d in docs])
    chain = prompt | llm
    response = chain.invoke({"context": context, "question": question})
    return response.content

answer = rag_answer("LangSmith가 뭔가요?")
print(answer)
```

---

## 9. 요금제

|플랜|가격|특징|
|---|---|---|
|**Developer (Free)**|무료|월 5,000 트레이스, 1명|
|**Plus**|$39/월|월 50,000 트레이스, 협업 기능|
|**Enterprise**|문의|무제한, SSO, 전용 지원|

> 💡 개인 프로젝트나 학습 목적이라면 **무료 플랜으로 충분**합니다.

---

## 참고 링크

- 공식 문서: https://docs.smith.langchain.com
- 대시보드: https://smith.langchain.com
- LangChain 공식 문서: https://python.langchain.com
- GitHub: https://github.com/langchain-ai/langsmith-sdk

---