---
title: RAG
pubDatetime: 2026-03-14
description: 검색 증강 생성(Retrieval-Augmented Generation) 기법 가이드
tags: ["AI"]
category: "ai"
---

## 1. RAG란 무엇인가?

**RAG(Retrieval-Augmented Generation)** 는 대규모 언어 모델(LLM)이 답변을 생성할 때, **외부 지식 베이스에서 관련 정보를 검색(Retrieve)하여 함께 활용**하는 기법입니다.

2020년 Meta AI Research에서 처음 제안되었으며, 현재는 기업용 AI 시스템에서 가장 널리 사용되는 아키텍처 패턴 중 하나입니다.

```
사용자 질문 → [검색기] → 관련 문서 조각 → [LLM] → 최종 답변
                  ↑
             벡터 데이터베이스
             (회사 문서, FAQ, 매뉴얼 등)
```

---

## 2. 왜 RAG가 필요한가?

### LLM의 한계

| 문제                          | 설명                    |
| --------------------------- | --------------------- |
| **지식 단절(Knowledge Cutoff)** | 모델 학습 이후의 최신 정보를 모름   |
| **환각(Hallucination)**       | 모르는 내용을 그럴듯하게 지어냄     |
| **사내 정보 부재**                | 기업 내부 문서, 정책, 데이터를 모름 |
| **출처 불투명**                  | 어디서 나온 정보인지 알 수 없음    |

### RAG가 해결하는 것

- ✅ 최신 문서 기반으로 정확한 답변 제공
- ✅ 출처 문서를 함께 제시하여 신뢰성 향상
- ✅ 기업 내부 데이터를 안전하게 활용
- ✅ 모델 재학습 없이 지식 업데이트 가능

---

## 3. RAG의 동작 원리

RAG는 크게 **인덱싱(Indexing)** 단계와 **질의응답(Query)** 단계로 나뉩니다.

### 3.1 인덱싱 단계 (사전 준비)

```
원본 문서
   │
   ▼
[문서 로딩]         PDF, Word, HTML, DB 등 수집
   │
   ▼
[청킹(Chunking)]    문서를 작은 조각으로 분할 (예: 500 토큰씩)
   │
   ▼
[임베딩(Embedding)] 각 조각을 벡터(숫자 배열)로 변환
   │
   ▼
[벡터 DB 저장]      Pinecone, Chroma, FAISS 등에 저장
```

### 3.2 질의응답 단계 (실시간)

```
사용자 질문
   │
   ▼
[질문 임베딩]       질문도 동일한 방식으로 벡터 변환
   │
   ▼
[유사도 검색]       벡터 DB에서 가장 관련 있는 청크 k개 검색
   │
   ▼
[프롬프트 조합]     "다음 문서를 참고하여 질문에 답하세요: [검색결과] + [질문]"
   │
   ▼
[LLM 생성]         GPT, Claude, Llama 등이 최종 답변 생성
   │
   ▼
최종 답변 (+ 출처)
```

---

## 4. RAG 파이프라인 구성 요소

### 4.1 문서 로더 (Document Loader)

다양한 형식의 문서를 불러옵니다.

- PDF, DOCX, TXT, HTML
- 데이터베이스 (SQL, NoSQL)
- 웹 크롤링, API
- Confluence, Notion, Google Docs 등

### 4.2 텍스트 청킹 (Text Chunking)

문서를 적절한 크기의 조각으로 나눕니다.

|방식|설명|특징|
|---|---|---|
|**Fixed-size**|고정 토큰 수로 분할|단순하지만 문맥 단절 위험|
|**Recursive**|문단 → 문장 → 단어 순서로 분할|의미 단위 유지|
|**Semantic**|의미 유사도 기반 분할|정확하지만 복잡|
|**Document-based**|문서 구조(헤더, 섹션) 기반|구조화된 문서에 적합|

> 💡 **팁**: 청크 크기는 보통 256~1024 토큰, 청크 간 20~10% 오버랩을 권장합니다.

### 4.3 임베딩 모델 (Embedding Model)

텍스트를 벡터로 변환하는 모델입니다.

| 모델                       | 제공사         | 특징       |
| ------------------------ | ----------- | -------- |
| `text-embedding-3-large` | OpenAI      | 고성능, 유료  |
| `text-embedding-3-small` | OpenAI      | 가성비 우수   |
| `embed-english-v3.0`     | Cohere      | 다국어 지원   |
| `all-MiniLM-L6-v2`       | HuggingFace | 오픈소스, 무료 |
| `ko-sbert-nli`           | HuggingFace | 한국어 특화   |

### 4.4 벡터 데이터베이스 (Vector Database)

벡터를 저장하고 유사도 검색을 수행합니다.

| DB           | 형태            | 특징                |
| ------------ | ------------- | ----------------- |
| **Chroma**   | 로컬/클라우드       | 개발/프로토타입에 적합      |
| **FAISS**    | 로컬            | Meta 오픈소스, 대용량 처리 |
| **Pinecone** | 클라우드          | 완전 관리형, 쉬운 확장     |
| **Weaviate** | 로컬/클라우드       | 풍부한 필터 기능         |
| **Qdrant**   | 로컬/클라우드       | 고성능, Rust 기반      |
| **pgvector** | PostgreSQL 확장 | 기존 PG 인프라 활용      |

### 4.5 검색기 (Retriever)

질문과 관련된 청크를 찾는 방식입니다.

- **Dense Retrieval**: 벡터 유사도 검색 (의미 기반)
- **Sparse Retrieval**: BM25 키워드 검색 (단어 매칭)
- **Hybrid Retrieval**: Dense + Sparse 결합 (권장)

---

## 5. RAG vs Fine-tuning

| 비교 항목       | RAG             | Fine-tuning      |
| ----------- | --------------- | ---------------- |
| **지식 업데이트** | 실시간 가능          | 재학습 필요           |
| **비용**      | 상대적으로 낮음        | 높음 (GPU 필요)      |
| **구현 난이도**  | 중간              | 높음               |
| **출처 제시**   | 가능              | 어려움              |
| **개인화**     | 제한적             | 강력               |
| **적합한 케이스** | 지식 기반 QA, 문서 검색 | 특정 말투/형식, 전문 도메인 |

> 💡 실무에서는 **RAG + Fine-tuning 병행** 전략도 자주 사용됩니다.

---

## 6. RAG 구현 예시 (Python)

### 기본 RAG (LangChain + OpenAI + Chroma)

```python
# 필요 패키지 설치
# pip install langchain openai chromadb tiktoken

from langchain.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores import Chroma
from langchain.chat_models import ChatOpenAI
from langchain.chains import RetrievalQA

# 1. 문서 로드
loader = PyPDFLoader("company_manual.pdf")
documents = loader.load()

# 2. 청킹
splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,
    chunk_overlap=50
)
chunks = splitter.split_documents(documents)

# 3. 임베딩 & 벡터 DB 저장
embeddings = OpenAIEmbeddings()
vectordb = Chroma.from_documents(chunks, embeddings)

# 4. QA 체인 구성
llm = ChatOpenAI(model="gpt-4o", temperature=0)
qa_chain = RetrievalQA.from_chain_type(
    llm=llm,
    retriever=vectordb.as_retriever(search_kwargs={"k": 3}),
    return_source_documents=True
)

# 5. 질의응답
result = qa_chain("연차 휴가는 몇 일인가요?")
print(result["result"])
print("출처:", result["source_documents"])
```

### 출처 포함 프롬프트 예시

```python
prompt_template = """
다음 문서를 참고하여 질문에 답변하세요.
문서에 없는 내용은 "문서에서 확인할 수 없습니다"라고 답하세요.

[참고 문서]
{context}

[질문]
{question}

[답변]
"""
```

---

## 7. 고급 RAG 기법

### 7.1 HyDE (Hypothetical Document Embeddings)

질문을 그대로 검색하는 대신, LLM이 "가상의 답변 문서"를 먼저 생성하고 그 문서로 검색합니다. 질문과 문서 간의 표현 차이를 줄여 검색 품질을 높입니다.

### 7.2 Query Rewriting

사용자의 모호한 질문을 LLM이 명확한 형태로 재작성한 뒤 검색합니다.

```
원본: "저번에 말한 그 기능 어떻게 돼?"
재작성: "AI 챗봇의 스트리밍 응답 기능 구현 방법은?"
```

### 7.3 Re-ranking

1차 검색으로 많은 후보(예: 20개)를 가져온 뒤, Cross-encoder 모델로 재정렬하여 상위 3~5개만 LLM에 전달합니다.

### 7.4 Multi-Query Retrieval

하나의 질문을 여러 관점에서 재작성해 다양한 검색을 수행하고, 결과를 통합합니다.

### 7.5 Contextual Compression

검색된 청크 전체가 아닌, 질문과 관련된 부분만 추출하여 LLM에 전달해 토큰을 절약합니다.

### 7.6 Self-RAG

LLM 스스로 검색이 필요한지 판단하고, 생성된 답변이 문서와 일치하는지 자체 검증합니다.

---

## 8. 주요 프레임워크 및 도구

### 오케스트레이션 프레임워크

|프레임워크|특징|추천 대상|
|---|---|---|
|**LangChain**|가장 널리 사용, 풍부한 생태계|빠른 프로토타이핑|
|**LlamaIndex**|데이터 인덱싱에 특화|복잡한 문서 구조|
|**Haystack**|엔터프라이즈급, 파이프라인 중심|대규모 프로덕션|
|**DSPy**|프롬프트 자동 최적화|연구/고급 사용자|

### 평가 도구

|도구|특징|
|---|---|
|**RAGAS**|검색 품질 + 생성 품질 자동 평가|
|**LangSmith**|LangChain 전용 모니터링/평가|
|**TruLens**|RAG 트리아드 평가 (Context Relevance, Groundedness, Answer Relevance)|

---

## 9. 실무 적용 시 고려사항

### ✅ 성능 개선 체크리스트

- [ ] 청크 크기 실험 (256, 512, 1024 토큰 비교)
- [ ] 오버랩 비율 조정 (10~20%)
- [ ] 한국어 특화 임베딩 모델 사용
- [ ] Hybrid Search (키워드 + 벡터) 적용
- [ ] Re-ranking 추가
- [ ] 메타데이터 필터링 활용 (날짜, 부서, 문서 유형 등)

### ⚠️ 주의사항

1. **청크 경계 문제**: 중요한 내용이 청크 경계에서 잘릴 수 있음 → 오버랩으로 완화
2. **검색 실패**: 관련 문서가 없을 때 LLM이 환각할 수 있음 → "모른다" 응답 유도
3. **지연 시간**: 검색 + 생성 이중 과정으로 응답이 느림 → 캐싱, 병렬 처리 적용
4. **보안**: 민감한 문서는 접근 권한 제어 필수 → 청크 레벨 ACL 구현
5. **비용**: 임베딩 API 호출 비용 관리 → 배치 처리, 캐싱 활용

### 📊 RAG 평가 지표

|지표|설명|
|---|---|
|**Context Precision**|검색된 문서 중 실제 관련 문서 비율|
|**Context Recall**|관련 문서 중 검색된 비율|
|**Faithfulness**|답변이 검색 문서에 근거하는 정도|
|**Answer Relevance**|답변이 질문에 얼마나 적절한가|

---

## 10. 마치며

RAG는 LLM의 가장 큰 약점인 **최신성**, **정확성**, **기업 맞춤화** 문제를 해결하는 현실적인 방법입니다.

```
단순 LLM        →  RAG           →  RAG + Fine-tuning
(범용 지식만)      (외부 지식 활용)    (최고 성능, 높은 비용)
```

처음 시작한다면:

1. **LangChain** + **Chroma** + **OpenAI Embeddings** 조합으로 빠르게 프로토타입
2. 품질 평가 후 **RAGAS**로 병목 구간 파악
3. 청킹 전략, 임베딩 모델, 검색 방식을 순서대로 개선

RAG는 "완성"이 아닌 **지속적인 개선** 과정입니다. 작게 시작해서 데이터와 함께 발전시켜 나가는 것이 핵심입니다.

---