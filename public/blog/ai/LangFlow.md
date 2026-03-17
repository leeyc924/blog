---
title: LangFlow
pubDatetime: 2026-03-14
description: 오픈소스 로우코드 AI 애플리케이션 빌더
tags: ["AI"]
category: "ai"
---

## 1. Langflow란?

Langflow는 오픈소스 기반의 로우코드(Low-Code) AI 애플리케이션 빌더입니다. Python으로 개발되었으며, 비주얼 에디터를 통해 드래그 앤 드롭 방식으로 AI 워크플로우를 구축할 수 있습니다. 특정 LLM이나 벡터 스토어에 종속되지 않아 다양한 서비스와 유연하게 연동할 수 있습니다.

### 주요 특징

- **비주얼 워크플로우 에디터**: 코드 없이 컴포넌트를 연결하여 AI 파이프라인 구성
- **에이전트(Agent) 지원**: 도구(Tool)를 활용한 자율적 작업 수행이 가능한 AI 에이전트 구축
- **MCP(Model Context Protocol) 지원**: MCP 클라이언트 및 서버로 동작하여 외부 도구와 연동
- **다양한 LLM 지원**: OpenAI, Anthropic, Cohere, Ollama(로컬 모델) 등
- **커스텀 컴포넌트**: Python으로 직접 컴포넌트를 만들어 기능 확장 가능
- **API 배포**: 구축한 플로우를 REST API로 즉시 서빙

### 활용 사례

- 챗봇 및 대화형 AI 애플리케이션
- RAG(Retrieval-Augmented Generation) 시스템
- 문서 분석 및 질의응답 시스템
- 콘텐츠 생성 자동화
- 멀티 에이전트 시스템
- AI 코딩 에이전트

---

## 2. 설치 방법

### 시스템 요구사항

|항목|요구사항|
|---|---|
|Python|3.10 ~ 3.13|
|CPU|듀얼코어 이상|
|RAM|최소 2GB (복잡한 파이프라인은 더 필요)|
|API 키|사용하려는 LLM 서비스의 API 키|

### 방법 1: pip 설치 (가장 간단)

```bash
pip install langflow
```

설치 후 실행:

```bash
langflow run
```

서버가 `http://127.0.0.1:7860`에서 시작됩니다.

### 방법 2: uv 패키지 매니저 (권장)

```bash
uv pip install langflow
langflow run
```

### 방법 3: Langflow Desktop

macOS 및 Windows에서 사용할 수 있는 데스크톱 앱입니다. 모든 의존성을 번들로 포함하고 있어 별도 설정 없이 바로 사용 가능합니다. [공식 사이트](https://www.langflow.org/)에서 다운로드할 수 있습니다.

### 방법 4: Docker

```bash
docker run -it --rm -p 7860:7860 langflowai/langflow:latest
```

프로덕션 환경에서는 Docker Compose와 PostgreSQL을 함께 사용하는 것을 권장합니다.

---

## 3. 기본 개념

### 플로우(Flow)

플로우는 Langflow의 핵심 단위로, AI 애플리케이션 워크플로우를 시각적으로 표현한 것입니다. 각 플로우는 여러 컴포넌트가 연결된 형태로 구성됩니다.

### 컴포넌트(Component)

컴포넌트는 플로우를 구성하는 개별 블록입니다. 각 컴포넌트는 입력을 받아 특정 작업을 수행한 후 출력을 내보냅니다.

**주요 컴포넌트 카테고리:**

- **Inputs**: Chat Input 등 사용자 입력을 받는 컴포넌트
- **Outputs**: Chat Output 등 결과를 출력하는 컴포넌트
- **Agents**: AI 에이전트 컴포넌트 (Agent, ALTK Agent, CUGA Agent)
- **Models**: OpenAI, Anthropic, Ollama 등 LLM 모델 컴포넌트
- **Embeddings**: 텍스트 임베딩 생성 컴포넌트
- **Vector Stores**: Astra DB, Chroma, Pinecone 등 벡터 저장소
- **Data**: 파일 로더, 텍스트 스플리터 등 데이터 처리 컴포넌트
- **Memories**: 대화 기록 관리 컴포넌트

### 엣지(Edge)

컴포넌트 간의 연결선으로, 데이터의 흐름 방향을 나타냅니다. 엣지의 색상은 데이터 타입을 나타내며, 같은 색상의 포트끼리만 연결할 수 있습니다.

### 플레이그라운드(Playground)

구축한 플로우를 즉시 테스트할 수 있는 내장 채팅 인터페이스입니다. 에이전트의 추론 과정, 도구 선택 과정 등을 실시간으로 확인할 수 있습니다.

---

## 4. 첫 번째 플로우 만들기: Simple Agent

### Step 1: 새 플로우 생성

1. Langflow 실행 후 브라우저에서 대시보드 접속
2. **New Flow** 클릭
3. **Simple Agent** 템플릿 선택

### Step 2: 템플릿 구조 확인

Simple Agent 템플릿에는 다음 컴포넌트가 포함되어 있습니다:

- **Chat Input**: 사용자 메시지를 받는 입력 컴포넌트
- **Agent**: LLM과 도구를 결합한 에이전트 컴포넌트
- **Chat Output**: 에이전트의 응답을 출력하는 컴포넌트
- **Calculator**: 수학 계산을 위한 도구
- **URL**: 웹 페이지 정보를 가져오는 도구

### Step 3: API 키 설정

Agent 컴포넌트에서 사용할 LLM의 API 키를 설정합니다.

**전역 모델 설정 방법:**

1. 프로필 아이콘 → **Settings** → **Model Providers**
2. 원하는 제공자(예: OpenAI, Anthropic) 선택
3. API 키 입력
4. 사용할 모델 활성화

### Step 4: 테스트

1. **Playground** 클릭
2. Calculator 도구 테스트: "4 + 4를 계산해줘"
3. URL 도구 테스트: "최근 뉴스 요약해줘"

플레이그라운드에서 에이전트가 프롬프트를 분석하고, 적절한 도구를 선택하여 응답을 생성하는 과정을 확인할 수 있습니다.

---

## 5. 에이전트(Agent) 심화

### Agent 컴포넌트 설정

Agent 컴포넌트는 Langflow에서 에이전트 플로우를 구축하는 핵심 컴포넌트입니다.

**주요 설정 항목:**

- **Model Provider / Model Name**: LLM 제공자 및 모델 선택
- **Agent Instructions (system_prompt)**: 에이전트의 행동 지침 설정
- **Tools**: 에이전트가 사용할 도구 연결
- **Number of Chat History Messages**: 대화 기록 유지 수

### 도구(Tool) 연결하기

에이전트에 도구를 연결하면 LLM의 기본 기능을 넘어서는 작업을 수행할 수 있습니다.

**도구 연결 방법:**

1. 도구로 사용할 컴포넌트를 캔버스에 추가
2. 해당 컴포넌트의 헤더 메뉴에서 **Tool Mode** 활성화
3. 컴포넌트의 **Toolset** 출력 포트를 Agent의 **Tools** 입력 포트에 연결

거의 모든 Langflow 컴포넌트를 도구로 사용할 수 있으며, 다른 에이전트나 MCP 서버도 도구로 연결 가능합니다.

### 멀티 에이전트 구성

에이전트를 다른 에이전트의 도구로 활용하여 복잡한 멀티 에이전트 시스템을 구축할 수 있습니다.

**예시 구성:**

1. 전문 에이전트 A (예: 코드 분석 전문) → Tool Mode 활성화
2. 전문 에이전트 B (예: 문서 검색 전문) → Tool Mode 활성화
3. 메인 에이전트 → 에이전트 A, B를 도구로 연결
4. 메인 에이전트가 요청에 따라 적절한 전문 에이전트를 호출

### 대화 메모리

Agent 컴포넌트에는 채팅 메모리가 기본 내장되어 있습니다. 세션 ID(session_id)로 대화 기록을 그룹화하며, 외부 메모리 저장소(예: Mem0)를 사용하려면 Message History 컴포넌트를 추가로 연결합니다.

---

## 6. RAG 시스템 구축하기

RAG(Retrieval-Augmented Generation)는 자체 데이터를 기반으로 정확한 응답을 생성하는 시스템입니다.

### RAG 파이프라인 구조

```
문서 업로드 → 텍스트 분할 → 임베딩 생성 → 벡터 스토어 저장
                                                    ↓
사용자 질문 → 임베딩 변환 → 유사 문서 검색 → LLM에 컨텍스트 전달 → 응답 생성
```

### 구축 단계

**Step 1: Vector Store RAG 템플릿 선택**

New Flow에서 **Vector Store RAG** 템플릿을 선택합니다.

**Step 2: 문서 인덱싱 워크플로우 구성**

1. **File Loader**: 문서(PDF, TXT 등) 업로드
2. **Text Splitter**: 문서를 적절한 크기의 청크로 분할
3. **Embedding Model**: 각 청크를 벡터로 변환 (예: OpenAI Embeddings)
4. **Vector Store**: 벡터를 저장 (예: Astra DB, Chroma, Pinecone)

**Step 3: 검색 및 응답 워크플로우 구성**

1. **Chat Input**: 사용자 질문 입력
2. **Embedding Model**: 질문을 벡터로 변환
3. **Vector Store (검색 모드)**: 유사한 문서 청크 검색
4. **LLM**: 검색된 컨텍스트와 질문을 결합하여 응답 생성
5. **Chat Output**: 응답 출력

**Step 4: 테스트 및 조정**

Playground에서 다양한 질문으로 테스트하고, 청크 크기, 검색 개수, 프롬프트 등을 조정합니다.

---

## 7. MCP(Model Context Protocol) 활용

Langflow는 MCP 클라이언트와 서버 모두로 동작할 수 있어 외부 도구 및 서비스와 강력하게 연동됩니다.

### Langflow를 MCP 클라이언트로 사용

외부 MCP 서버의 도구를 Langflow 에이전트에서 활용하는 방법입니다.

**설정 방법:**

1. **MCP Tools** 컴포넌트를 플로우에 추가
2. **MCP Server** 필드에서 서버 추가:
    - **JSON**: MCP 서버의 JSON 설정 붙여넣기
    - **STDIO**: 서버 이름, 실행 명령, 인수 및 환경변수 입력
    - **HTTP/SSE**: MCP 서버의 URL 입력
3. **Tool** 필드에서 사용할 도구 선택 (비워두면 모든 도구 사용)
4. **Tool Mode** 활성화 후 Agent의 Tools 포트에 연결

Langflow 1.7부터 Streamable HTTP 전송 방식을 지원하여 대부분의 원격 MCP 서버에 연결 가능합니다.

### Langflow를 MCP 서버로 사용

Langflow에서 만든 플로우를 외부 에이전트(예: Claude Desktop, Cursor 등)의 도구로 노출하는 방법입니다.

**설정 방법:**

1. 플로우에 **Chat Output** 컴포넌트가 반드시 포함되어야 함
2. 캔버스 우측 상단 **Share** → **MCP Server** 클릭
3. 각 플로우의 도구 이름과 설명을 명확하게 설정
4. 외부 MCP 클라이언트에서 Langflow의 MCP 엔드포인트에 연결

**MCP 서버 엔드포인트:**

```
http://localhost:7860/api/v1/mcp/streamable
```

---

## 8. 커스텀 컴포넌트 만들기

Langflow의 기본 컴포넌트로 부족할 때 Python으로 직접 커스텀 컴포넌트를 만들 수 있습니다.

### 기본 구조

커스텀 컴포넌트는 입력을 받아 처리한 후 출력을 반환하는 Python 함수(또는 클래스)입니다.

```python
from langflow.custom import Component
from langflow.io import MessageTextInput, Output
from langflow.schema import Data

class TextAnalyzer(Component):
    display_name = "Text Analyzer"
    description = "텍스트를 분석하는 커스텀 컴포넌트"

    inputs = [
        MessageTextInput(
            name="input_text",
            display_name="Input Text",
            tool_mode=True,  # 에이전트의 도구로 사용 가능
        ),
    ]

    outputs = [
        Output(display_name="Analysis Result", name="result", method="analyze_text"),
    ]

    def analyze_text(self) -> Data:
        text = self.input_text
        result = {
            "length": len(text),
            "words": len(text.split()),
            "uppercase": text.upper(),
        }
        return Data(data=result)
```

### 커스텀 컴포넌트를 도구로 사용

`tool_mode=True`를 입력에 추가하면 해당 컴포넌트를 에이전트의 도구로 연결할 수 있습니다. 연결 후 Toolset 출력 포트를 Agent의 Tools 포트에 연결합니다.

---

## 9. API 배포

구축한 플로우를 외부 애플리케이션에서 호출할 수 있도록 API로 서빙할 수 있습니다.

### API 키 생성

1. 프로필 아이콘 → **Settings** → **Langflow API Keys**
2. **Add New** 클릭 → 키 이름 지정 → **Create API Key**
3. 생성된 키를 안전하게 보관

### API 호출 예시

```bash
export LANGFLOW_API_KEY="your-api-key"

curl -X POST "http://localhost:7860/api/v1/run/<flow-id>" \
  -H "Content-Type: application/json" \
  -H "x-api-key: $LANGFLOW_API_KEY" \
  -d '{
    "input_value": "안녕하세요, 도움이 필요합니다.",
    "output_type": "chat",
    "input_type": "chat"
  }'
```

### Python SDK 사용

```python
import requests

API_URL = "http://localhost:7860/api/v1/run/<flow-id>"
HEADERS = {
    "Content-Type": "application/json",
    "x-api-key": "your-api-key"
}

payload = {
    "input_value": "오늘 날씨가 어때?",
    "output_type": "chat",
    "input_type": "chat",
    "tweaks": {}  # 런타임에 플로우 설정을 임시 변경 가능
}

response = requests.post(API_URL, json=payload, headers=HEADERS)
print(response.json())
```

### Tweaks 활용

Tweaks를 사용하면 플로우를 수정하지 않고도 런타임에 특정 컴포넌트의 설정을 임시로 변경할 수 있습니다. Langflow의 코드 스니펫 기능에서 현재 설정에 맞는 tweaks 객체를 자동으로 생성해줍니다.

---

## 10. 프로덕션 배포 팁

### Docker Compose 배포

프로덕션 환경에서는 기본 SQLite 대신 PostgreSQL을 사용하는 것이 좋습니다. Docker Compose 설정에 PostgreSQL을 포함하면 영구적인 데이터 저장이 가능합니다.

### 보안 설정

- `AUTO_LOGIN=false` 설정으로 인증 활성화
- API 키를 통한 접근 제어
- Webhook 인증 활성화: `LANGFLOW_WEBHOOK_AUTH_ENABLE=True`

### 모니터링

- API 엔드포인트를 통한 로깅 및 메트릭 수집
- Langflow 1.7+의 트레이스 기능 활용
- Inspection Panel로 실시간 트러블슈팅

### 환경변수 관리

MCP 서버 등에서 사용하는 환경변수는 `.env` 파일에 정의하여 Langflow 시작 시 자동으로 전달되도록 합니다.

---

## 11. 최신 업데이트 (v1.7+)

### 새로운 에이전트 컴포넌트

- **ALTK Agent**: Agent Lifecycle Toolkit 기반으로, 도구 호출 유효성 검증(SPARC)과 JSON 응답 후처리 기능을 제공합니다.
- **CUGA Agent**: IBM Research에서 개발한 범용 에이전트 프레임워크로, 작업 분해, 계획 수립, 웹 브라우저 제어, 커스텀 코드 작성 등 복잡한 엔터프라이즈 자동화를 지원합니다.

### 기타 주요 기능

- Streamable HTTP 지원 (MCP 클라이언트/서버)
- Webhook 인증
- AWS S3 파일 스토리지 컴포넌트
- 스마트 라우팅 컴포넌트
- 글로벌 모델 제공자 설정 (v1.8)
- Knowledge Base 기능 (v1.8)
- Mustache 템플릿 지원 (v1.8)

---

## 12. 유용한 리소스

|리소스|URL|
|---|---|
|공식 문서|https://docs.langflow.org|
|공식 사이트|https://www.langflow.org|
|GitHub|https://github.com/langflow-ai/langflow|
|Discord 커뮤니티|Langflow 공식 Discord|
|YouTube 채널|Langflow 공식 YouTube|

---

## 빠른 참조: 자주 쓰는 명령어

```bash
# 설치
pip install langflow

# 실행
langflow run

# 특정 포트로 실행
langflow run --port 8080

# Docker 실행
docker run -it --rm -p 7860:7860 langflowai/langflow:latest
```

---