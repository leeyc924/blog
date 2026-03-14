---
title: LangChain
pubDatetime: 2026-03-14
description: LLM 기반 애플리케이션 개발을 위한 오픈소스 프레임워크
tags: ["AI"]
---

> LangChain은 대규모 언어 모델(LLM)을 활용한 애플리케이션 개발을 위한 오픈소스 프레임워크입니다.

---

## 1. LangChain이란?

LangChain은 LLM 기반 애플리케이션을 빠르고 체계적으로 개발할 수 있도록 돕는 프레임워크입니다. 2022년 Harrison Chase가 처음 공개했으며, Python과 JavaScript/TypeScript 버전을 모두 지원합니다.

### 주요 특징

- **모듈식 설계**: 각 컴포넌트를 독립적으로 사용하거나 조합 가능
- **다양한 LLM 지원**: OpenAI, Anthropic, Google, Hugging Face 등
- **풍부한 통합**: 100+ 벡터 DB, 문서 로더, 도구 연동
- **체인 구성**: 복잡한 워크플로우를 선언적으로 표현

### LangChain 생태계

```
langchain-core       # 핵심 추상화 및 LCEL
langchain            # 체인, 에이전트, 검색 전략
langchain-community  # 서드파티 통합 모듈
langchain-openai     # OpenAI 전용 패키지
langchain-anthropic  # Anthropic 전용 패키지
langgraph            # 그래프 기반 에이전트 오케스트레이션
langserve            # LangChain 앱을 REST API로 배포
```

---

## 2. 핵심 개념

### Runnable 인터페이스

LangChain의 모든 컴포넌트는 `Runnable` 인터페이스를 구현합니다.

|메서드|설명|
|---|---|
|`invoke(input)`|단일 입력 처리|
|`stream(input)`|스트리밍 출력|
|`batch(inputs)`|여러 입력 병렬 처리|
|`ainvoke(input)`|비동기 단일 처리|
|`astream(input)`|비동기 스트리밍|

### 파이프라인 구조

```
Input → Prompt → LLM → OutputParser → Output
```

각 단계를 `|` 연산자로 연결하여 체인을 구성합니다.

---

## 3. 설치 및 환경 설정

### 패키지 설치

```bash
# 기본 설치
pip install langchain

# OpenAI 연동
pip install langchain-openai

# Anthropic 연동
pip install langchain-anthropic

# 커뮤니티 통합 패키지
pip install langchain-community

# 벡터 스토어 (ChromaDB 예시)
pip install chromadb
```

### 환경 변수 설정

```bash
# .env 파일
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
LANGCHAIN_API_KEY=ls__...       # LangSmith 추적용 (선택)
LANGCHAIN_TRACING_V2=true       # 추적 활성화 (선택)
```

```python
from dotenv import load_dotenv
load_dotenv()
```

---

## 4. 주요 컴포넌트

### 4.1 LLM / ChatModel

```python
from langchain_openai import ChatOpenAI
from langchain_anthropic import ChatAnthropic

# OpenAI
llm = ChatOpenAI(model="gpt-4o", temperature=0)

# Anthropic
llm = ChatAnthropic(model="claude-3-5-sonnet-20241022")

# 호출
response = llm.invoke("파이썬이란 무엇인가요?")
print(response.content)
```

### 4.2 프롬프트 템플릿 (PromptTemplate)

```python
from langchain_core.prompts import ChatPromptTemplate

# 기본 템플릿
prompt = ChatPromptTemplate.from_messages([
    ("system", "당신은 {role} 전문가입니다."),
    ("human", "{question}"),
])

# 값 채우기
formatted = prompt.invoke({
    "role": "Python",
    "question": "리스트 컴프리헨션을 설명해주세요."
})
```

### 4.3 출력 파서 (OutputParser)

```python
from langchain_core.output_parsers import StrOutputParser, JsonOutputParser
from langchain_core.pydantic_v1 import BaseModel, Field

# 문자열 파서
str_parser = StrOutputParser()

# JSON 파서 (구조화된 출력)
class Book(BaseModel):
    title: str = Field(description="책 제목")
    author: str = Field(description="저자")
    year: int = Field(description="출판 연도")

json_parser = JsonOutputParser(pydantic_object=Book)
```

### 4.4 문서 로더 (Document Loader)

```python
from langchain_community.document_loaders import (
    PyPDFLoader,
    WebBaseLoader,
    CSVLoader,
    TextLoader,
)

# PDF 로드
loader = PyPDFLoader("document.pdf")
docs = loader.load()

# 웹 페이지 로드
loader = WebBaseLoader("https://example.com")
docs = loader.load()
```

### 4.5 텍스트 분할기 (Text Splitter)

```python
from langchain_text_splitters import RecursiveCharacterTextSplitter

splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,       # 청크 최대 크기
    chunk_overlap=200,     # 청크 간 겹침
    length_function=len,
)

chunks = splitter.split_documents(docs)
```

### 4.6 임베딩 & 벡터 스토어

```python
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import Chroma

# 임베딩 모델
embeddings = OpenAIEmbeddings(model="text-embedding-3-small")

# 벡터 스토어 생성
vectorstore = Chroma.from_documents(
    documents=chunks,
    embedding=embeddings,
    persist_directory="./chroma_db"
)

# 유사도 검색
retriever = vectorstore.as_retriever(search_kwargs={"k": 5})
results = retriever.invoke("질문 내용")
```

---

## 5. LCEL (LangChain Expression Language)

LCEL은 체인을 선언적으로 구성하는 방법입니다. `|` 파이프 연산자를 사용합니다.

### 기본 체인

```python
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from langchain_core.output_parsers import StrOutputParser

prompt = ChatPromptTemplate.from_template("{topic}에 대해 한 문단으로 설명해주세요.")
llm = ChatOpenAI(model="gpt-4o-mini")
parser = StrOutputParser()

# 체인 구성
chain = prompt | llm | parser

# 실행
result = chain.invoke({"topic": "머신러닝"})
print(result)
```

### 스트리밍

```python
for chunk in chain.stream({"topic": "딥러닝"}):
    print(chunk, end="", flush=True)
```

### 병렬 실행 (RunnableParallel)

```python
from langchain_core.runnables import RunnableParallel

parallel_chain = RunnableParallel({
    "summary": summary_chain,
    "keywords": keyword_chain,
})

result = parallel_chain.invoke({"text": "분석할 텍스트..."})
# result = {"summary": "...", "keywords": "..."}
```

### 조건 분기 (RunnableBranch)

```python
from langchain_core.runnables import RunnableBranch

branch = RunnableBranch(
    (lambda x: x["language"] == "ko", korean_chain),
    (lambda x: x["language"] == "en", english_chain),
    default_chain,  # 기본값
)
```

---

## 6. RAG (검색 증강 생성)

RAG는 외부 지식베이스를 검색하여 LLM의 응답 품질을 향상시키는 기법입니다.

### RAG 파이프라인

```
문서 수집 → 청킹 → 임베딩 → 벡터 DB 저장
                                    ↓
사용자 질문 → 질문 임베딩 → 유사 문서 검색 → LLM 생성 → 응답
```

### 기본 RAG 구현

```python
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_core.output_parsers import StrOutputParser

# 1. 리트리버 준비
embeddings = OpenAIEmbeddings()
vectorstore = Chroma(persist_directory="./db", embedding_function=embeddings)
retriever = vectorstore.as_retriever()

# 2. 프롬프트
rag_prompt = ChatPromptTemplate.from_template("""
다음 컨텍스트를 참고하여 질문에 답하세요.
컨텍스트에 없는 내용은 모른다고 하세요.

컨텍스트:
{context}

질문: {question}
""")

# 3. 체인 구성
def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)

rag_chain = (
    {"context": retriever | format_docs, "question": RunnablePassthrough()}
    | rag_prompt
    | ChatOpenAI(model="gpt-4o")
    | StrOutputParser()
)

# 4. 실행
answer = rag_chain.invoke("LangChain의 주요 기능은 무엇인가요?")
```

### 고급 검색 전략

```python
# MMR (Maximal Marginal Relevance) - 다양성 확보
retriever = vectorstore.as_retriever(
    search_type="mmr",
    search_kwargs={"k": 5, "fetch_k": 20}
)

# 유사도 점수 필터링
retriever = vectorstore.as_retriever(
    search_type="similarity_score_threshold",
    search_kwargs={"score_threshold": 0.7}
)
```

---

## 7. 에이전트 (Agents)

에이전트는 LLM이 도구(Tools)를 선택하고 실행하며 목표를 달성하는 구조입니다.

### 도구 정의

```python
from langchain_core.tools import tool

@tool
def search_web(query: str) -> str:
    """웹에서 최신 정보를 검색합니다."""
    # 실제 검색 로직
    return f"{query}에 대한 검색 결과..."

@tool
def calculate(expression: str) -> str:
    """수학 계산을 수행합니다."""
    return str(eval(expression))

tools = [search_web, calculate]
```

### ReAct 에이전트

```python
from langchain.agents import create_react_agent, AgentExecutor
from langchain import hub

# 프롬프트 (허브에서 가져오기)
prompt = hub.pull("hwchase17/react")

llm = ChatOpenAI(model="gpt-4o", temperature=0)
agent = create_react_agent(llm, tools, prompt)

agent_executor = AgentExecutor(
    agent=agent,
    tools=tools,
    verbose=True,
    max_iterations=5,
)

result = agent_executor.invoke({"input": "서울의 현재 날씨를 알려주세요"})
```

### LangGraph 에이전트 (권장)

```python
from langgraph.prebuilt import create_react_agent

agent = create_react_agent(
    model=ChatOpenAI(model="gpt-4o"),
    tools=tools,
)

result = agent.invoke({"messages": [("human", "질문 내용")]})
```

---

## 8. 메모리 (Memory)

대화 히스토리를 관리하여 멀티턴 대화를 구현합니다.

### 메시지 히스토리 관리

```python
from langchain_core.chat_history import InMemoryChatMessageHistory
from langchain_core.runnables.history import RunnableWithMessageHistory

# 세션별 히스토리 저장소
store = {}

def get_session_history(session_id: str):
    if session_id not in store:
        store[session_id] = InMemoryChatMessageHistory()
    return store[session_id]

# 히스토리가 포함된 체인
chain_with_history = RunnableWithMessageHistory(
    chain,
    get_session_history,
    input_messages_key="input",
    history_messages_key="history",
)

# 실행 (session_id로 대화 구분)
response = chain_with_history.invoke(
    {"input": "안녕하세요!"},
    config={"configurable": {"session_id": "user_123"}}
)
```

### 요약 메모리

긴 대화를 요약하여 토큰 사용량을 줄입니다.

```python
from langchain.memory import ConversationSummaryBufferMemory

memory = ConversationSummaryBufferMemory(
    llm=ChatOpenAI(),
    max_token_limit=500,  # 이 이상이면 요약
    return_messages=True,
)
```

---

## 9. 실전 예제

### 예제 1: PDF 기반 Q&A 챗봇

```python
import os
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_community.vectorstores import Chroma
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser

def build_pdf_qa(pdf_path: str):
    # 문서 로드 및 분할
    loader = PyPDFLoader(pdf_path)
    docs = loader.load()
    splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    chunks = splitter.split_documents(docs)

    # 벡터 스토어 구성
    embeddings = OpenAIEmbeddings()
    vectorstore = Chroma.from_documents(chunks, embeddings)
    retriever = vectorstore.as_retriever(search_kwargs={"k": 4})

    # 체인 구성
    prompt = ChatPromptTemplate.from_template("""
    컨텍스트를 바탕으로 질문에 답하세요:
    
    {context}
    
    질문: {question}
    """)

    chain = (
        {"context": retriever | (lambda docs: "\n\n".join(d.page_content for d in docs)),
         "question": RunnablePassthrough()}
        | prompt
        | ChatOpenAI(model="gpt-4o")
        | StrOutputParser()
    )
    return chain

# 사용
qa_chain = build_pdf_qa("report.pdf")
answer = qa_chain.invoke("이 문서의 핵심 내용은 무엇인가요?")
print(answer)
```

### 예제 2: 구조화된 데이터 추출

```python
from langchain_core.pydantic_v1 import BaseModel, Field
from langchain_openai import ChatOpenAI
from typing import List

class Person(BaseModel):
    name: str = Field(description="이름")
    age: int = Field(description="나이")
    skills: List[str] = Field(description="기술 스택")

llm = ChatOpenAI(model="gpt-4o")
structured_llm = llm.with_structured_output(Person)

result = structured_llm.invoke(
    "김철수는 28세 개발자로 Python, JavaScript, Docker를 사용합니다."
)
print(result.name)    # 김철수
print(result.skills)  # ['Python', 'JavaScript', 'Docker']
```

### 예제 3: 스트리밍 챗봇

```python
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_openai import ChatOpenAI
from langchain_core.output_parsers import StrOutputParser

prompt = ChatPromptTemplate.from_messages([
    ("system", "당신은 친절한 AI 어시스턴트입니다."),
    MessagesPlaceholder(variable_name="history"),
    ("human", "{input}"),
])

chain = prompt | ChatOpenAI(model="gpt-4o") | StrOutputParser()
history = []

def chat(user_input: str):
    print("AI: ", end="", flush=True)
    full_response = ""
    for chunk in chain.stream({"input": user_input, "history": history}):
        print(chunk, end="", flush=True)
        full_response += chunk
    print()
    history.append(("human", user_input))
    history.append(("assistant", full_response))

chat("안녕하세요!")
chat("LangChain에 대해 설명해주세요.")
```

---

## 10. 자주 묻는 질문

### LangChain vs LlamaIndex, 무엇을 선택해야 하나요?

|항목|LangChain|LlamaIndex|
|---|---|---|
|강점|에이전트, 다양한 통합|RAG 파이프라인 최적화|
|학습 곡선|보통|낮음|
|유연성|높음|중간|
|적합한 용도|복잡한 에이전트, 멀티스텝 워크플로|문서 검색, 지식베이스 Q&A|

### 토큰 비용을 줄이는 방법은?

1. **캐싱 활용**: `langchain_community.cache.InMemoryCache` 사용
2. **청크 크기 최적화**: 필요 이상으로 크게 잡지 않기
3. **작은 모델 사용**: 간단한 작업엔 `gpt-4o-mini` 활용
4. **배치 처리**: `chain.batch([...])` 으로 병렬 처리

```python
from langchain.globals import set_llm_cache
from langchain_community.cache import InMemoryCache

set_llm_cache(InMemoryCache())
```

### LangSmith로 디버깅하는 방법은?

```bash
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=ls__your_key
export LANGCHAIN_PROJECT=my-project
```

설정 후 코드를 실행하면 [smith.langchain.com](https://smith.langchain.com/)에서 모든 체인 실행 내역을 추적할 수 있습니다.

---

## 참고 자료

- [공식 문서](https://python.langchain.com/docs/)
- [LangChain GitHub](https://github.com/langchain-ai/langchain)
- [LangSmith](https://smith.langchain.com/) - 추적 및 디버깅
- [LangGraph 문서](https://langchain-ai.github.io/langgraph/)
- [LangChain Hub](https://smith.langchain.com/hub) - 프롬프트 공유

---
