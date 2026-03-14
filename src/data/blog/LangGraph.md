---
title: LangGraph
pubDatetime: 2026-03-14
description: 그래프 기반 AI 에이전트 오케스트레이션 프레임워크
tags: ["AI"]
---

## 1. LangGraph란?

LangGraph는 LangChain 팀이 개발한 **그래프 기반 AI 에이전트 오케스트레이션 프레임워크**입니다. 복잡한 AI 워크플로우를 방향성 그래프(Directed Graph) 구조로 모델링하여, 상태 관리(State Management), 조건 분기(Conditional Branching), 순환 흐름(Cycles), 그리고 멀티 에이전트 협업까지 지원합니다.

2025년 10월에 **LangGraph 1.0**이 정식 출시되었으며, Klarna, Replit, Elastic 등 다양한 기업이 프로덕션 환경에서 활용하고 있습니다. MIT 라이선스의 오픈소스 프로젝트로, 누구나 무료로 사용할 수 있습니다.

### LangGraph를 사용해야 하는 이유

기존 LangChain의 체인(Chain) 방식은 선형적인 흐름에 적합하지만, 실제 프로덕션 시스템에서는 조건에 따른 분기, 반복, 에러 처리, 사람의 개입(Human-in-the-Loop) 등이 필요합니다. LangGraph는 이러한 복잡한 요구사항을 그래프 구조로 직관적으로 해결합니다.

LangGraph의 주요 장점은 다음과 같습니다.

- **세밀한 제어**: 에이전트 워크플로우의 모든 단계를 명시적으로 정의할 수 있습니다.
- **내구성 있는 실행(Durable Execution)**: 서버가 재시작되어도 체크포인트부터 이어서 실행합니다.
- **Human-in-the-Loop**: 워크플로우 중간에 사람의 승인이나 입력을 받을 수 있습니다.
- **스트리밍 지원**: 토큰 단위의 실시간 스트리밍이 네이티브로 지원됩니다.
- **메모리 관리**: 대화 이력과 컨텍스트를 세션 간에 유지할 수 있습니다.

---

## 2. 핵심 개념

LangGraph를 이해하기 위해 알아야 할 네 가지 핵심 개념이 있습니다.

### 2.1 State (상태)

State는 그래프 전체에서 공유되는 데이터 구조로, 워크플로우의 현재 스냅샷을 나타냅니다. 모든 노드는 이 State를 읽고 업데이트하며, 노드 간의 통신은 State를 통해 이루어집니다.

```python
from typing import TypedDict, Annotated
from langgraph.graph.message import add_messages
from langchain_core.messages import AnyMessage

# 기본적인 State 정의
class BasicState(TypedDict):
    user_input: str
    result: str

# 메시지 기반 State 정의 (챗봇용)
class ChatState(TypedDict):
    messages: Annotated[list[AnyMessage], add_messages]
```

`Annotated`와 `add_messages`를 함께 사용하면, 메시지가 덮어쓰기 되지 않고 리스트에 누적됩니다. 이를 **리듀서(Reducer)** 패턴이라 부릅니다.

### 2.2 Node (노드)

노드는 그래프 안에서 실제 작업을 수행하는 단위입니다. 일반 Python 함수로 정의하며, State를 인자로 받아 업데이트된 State를 반환합니다.

```python
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-4o")

def chatbot_node(state: ChatState):
    """LLM을 호출하여 응답을 생성하는 노드"""
    response = llm.invoke(state["messages"])
    return {"messages": [response]}

def greeting_node(state: BasicState):
    """사용자 입력에 인사를 추가하는 노드"""
    return {"result": f"안녕하세요! '{state['user_input']}'에 대해 도와드리겠습니다."}
```

노드가 수행할 수 있는 작업에는 LLM 호출, 외부 API 연동, 데이터 가공, 사용자 상호작용 등이 있습니다.

### 2.3 Edge (엣지)

엣지는 노드 간의 연결을 정의하며, 워크플로우의 흐름을 제어합니다. LangGraph는 세 가지 타입의 엣지를 지원합니다.

**일반 엣지 (Normal Edge)**: 한 노드에서 다음 노드로 무조건 이동합니다.

```python
graph.add_edge("node_a", "node_b")
```

**조건부 엣지 (Conditional Edge)**: 조건에 따라 다른 노드로 분기합니다.

```python
def route_function(state):
    if state["needs_tool"]:
        return "tool_node"
    return "response_node"

graph.add_conditional_edges("decision_node", route_function)
```

**시작/종료 엣지**: `START`와 `END`는 그래프의 진입점과 종료점을 나타냅니다.

```python
from langgraph.graph import START, END

graph.add_edge(START, "first_node")
graph.add_edge("last_node", END)
```

### 2.4 Graph (그래프)

그래프는 노드와 엣지를 조합한 전체 워크플로우의 청사진입니다. `StateGraph`를 사용하여 상태 기반 그래프를 생성합니다.

```python
from langgraph.graph import StateGraph

graph = StateGraph(BasicState)
```

---

## 3. 설치 및 환경 설정

### 설치

```bash
pip install langgraph
```

LangChain 통합을 원하면 추가 패키지도 함께 설치합니다.

```bash
pip install langgraph langchain langchain-openai
```

### 환경 변수 설정

```python
import os

os.environ["OPENAI_API_KEY"] = "your-api-key"

# LangSmith 추적을 사용하려면 (선택사항)
os.environ["LANGCHAIN_TRACING_V2"] = "true"
os.environ["LANGCHAIN_API_KEY"] = "your-langsmith-api-key"
```

---

## 4. 기본 예제: 첫 번째 그래프 만들기

가장 간단한 형태의 LangGraph 워크플로우를 만들어 보겠습니다.

```python
from langgraph.graph import StateGraph, START, END
from typing import TypedDict

# 1. State 정의
class State(TypedDict):
    text: str

# 2. 노드 함수 정의
def step_1(state: State):
    return {"text": state["text"] + " → Step 1 완료"}

def step_2(state: State):
    return {"text": state["text"] + " → Step 2 완료"}

def step_3(state: State):
    return {"text": state["text"] + " → Step 3 완료"}

# 3. 그래프 구성
graph = StateGraph(State)

graph.add_node("step_1", step_1)
graph.add_node("step_2", step_2)
graph.add_node("step_3", step_3)

graph.add_edge(START, "step_1")
graph.add_edge("step_1", "step_2")
graph.add_edge("step_2", "step_3")
graph.add_edge("step_3", END)

# 4. 컴파일 및 실행
app = graph.compile()
result = app.invoke({"text": "시작"})

print(result["text"])
# 출력: 시작 → Step 1 완료 → Step 2 완료 → Step 3 완료
```

---

## 5. 조건부 분기 예제

조건에 따라 다른 경로를 선택하는 워크플로우를 구현합니다.

```python
from langgraph.graph import StateGraph, START, END
from typing import TypedDict, Literal

class State(TypedDict):
    query: str
    category: str
    response: str

def classify(state: State):
    """쿼리를 분류하는 노드"""
    query = state["query"].lower()
    if "가격" in query or "비용" in query:
        category = "pricing"
    elif "기술" in query or "오류" in query:
        category = "technical"
    else:
        category = "general"
    return {"category": category}

def handle_pricing(state: State):
    return {"response": "가격 관련 문의를 처리합니다."}

def handle_technical(state: State):
    return {"response": "기술 지원 팀으로 연결합니다."}

def handle_general(state: State):
    return {"response": "일반 문의를 처리합니다."}

def router(state: State) -> Literal["pricing", "technical", "general"]:
    """분류 결과에 따라 라우팅"""
    return state["category"]

# 그래프 구성
graph = StateGraph(State)

graph.add_node("classify", classify)
graph.add_node("pricing", handle_pricing)
graph.add_node("technical", handle_technical)
graph.add_node("general", handle_general)

graph.add_edge(START, "classify")
graph.add_conditional_edges("classify", router)
graph.add_edge("pricing", END)
graph.add_edge("technical", END)
graph.add_edge("general", END)

app = graph.compile()

# 테스트
result = app.invoke({"query": "제품 가격이 궁금합니다", "category": "", "response": ""})
print(result["response"])
# 출력: 가격 관련 문의를 처리합니다.
```

---

## 6. 챗봇 with 도구 호출 (Tool Calling)

LLM이 외부 도구를 사용할 수 있는 ReAct 패턴의 에이전트를 구현합니다.

```python
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from langgraph.prebuilt import ToolNode, tools_condition
from langchain_openai import ChatOpenAI
from langchain_core.tools import tool
from typing import TypedDict, Annotated
from langchain_core.messages import AnyMessage

# State 정의
class AgentState(TypedDict):
    messages: Annotated[list[AnyMessage], add_messages]

# 도구 정의
@tool
def search_web(query: str) -> str:
    """웹에서 정보를 검색합니다."""
    return f"'{query}'에 대한 검색 결과: 관련 정보를 찾았습니다."

@tool
def calculate(expression: str) -> str:
    """수학 계산을 수행합니다."""
    try:
        result = eval(expression)
        return f"계산 결과: {result}"
    except Exception as e:
        return f"계산 오류: {str(e)}"

# LLM에 도구 바인딩
tools = [search_web, calculate]
llm = ChatOpenAI(model="gpt-4o").bind_tools(tools)

# 노드 정의
def agent(state: AgentState):
    """LLM이 응답하거나 도구 호출을 결정하는 노드"""
    response = llm.invoke(state["messages"])
    return {"messages": [response]}

# 그래프 구성
graph = StateGraph(AgentState)

graph.add_node("agent", agent)
graph.add_node("tools", ToolNode(tools))

graph.add_edge(START, "agent")
graph.add_conditional_edges("agent", tools_condition)  # 도구 호출 필요 여부 판단
graph.add_edge("tools", "agent")  # 도구 실행 후 에이전트로 복귀

app = graph.compile()
```

이 패턴에서 `tools_condition`은 LLM 응답에 도구 호출이 포함되어 있으면 `"tools"` 노드로, 아니면 `END`로 라우팅합니다.

---

## 7. 메모리와 체크포인팅

LangGraph는 체크포인터를 통해 대화 상태를 영구적으로 저장할 수 있습니다.

```python
from langgraph.checkpoint.memory import MemorySaver

# 메모리 체크포인터 생성
memory = MemorySaver()

# 그래프 컴파일 시 체크포인터 추가
app = graph.compile(checkpointer=memory)

# thread_id를 사용하여 대화 스레드 관리
config = {"configurable": {"thread_id": "user-session-001"}}

# 첫 번째 메시지
result1 = app.invoke(
    {"messages": [("user", "안녕하세요, 저는 김철수입니다.")]},
    config=config
)

# 두 번째 메시지 (이전 대화 기억)
result2 = app.invoke(
    {"messages": [("user", "제 이름이 뭐였죠?")]},
    config=config
)
# LLM은 이전 대화를 기억하여 "김철수"라고 응답할 수 있습니다.
```

프로덕션 환경에서는 `MemorySaver` 대신 `SqliteSaver`나 `PostgresSaver` 등의 영구 저장소를 사용합니다.

---

## 8. Human-in-the-Loop

워크플로우 중간에 사람의 승인을 받아야 하는 경우, `interrupt` 기능을 사용합니다.

```python
from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import MemorySaver
from typing import TypedDict

class OrderState(TypedDict):
    order_details: str
    approved: bool
    result: str

def prepare_order(state: OrderState):
    return {"order_details": "주문: iPhone 16 Pro, 수량 1, 금액 1,500,000원"}

def process_order(state: OrderState):
    if state["approved"]:
        return {"result": "주문이 처리되었습니다."}
    return {"result": "주문이 취소되었습니다."}

graph = StateGraph(OrderState)
graph.add_node("prepare", prepare_order)
graph.add_node("process", process_order)

graph.add_edge(START, "prepare")
graph.add_edge("prepare", "process")  # interrupt_before 설정
graph.add_edge("process", END)

memory = MemorySaver()
app = graph.compile(
    checkpointer=memory,
    interrupt_before=["process"]  # process 노드 실행 전 중단
)

config = {"configurable": {"thread_id": "order-001"}}

# 1단계: prepare까지 실행 후 중단
result = app.invoke(
    {"order_details": "", "approved": False, "result": ""},
    config=config
)
print(result["order_details"])  # 주문 내용 확인

# 2단계: 사람이 승인 후 State 업데이트하여 재개
app.update_state(config, {"approved": True})
result = app.invoke(None, config=config)
print(result["result"])  # "주문이 처리되었습니다."
```

---

## 9. 서브그래프 (Subgraph)

복잡한 워크플로우를 모듈화하기 위해 서브그래프를 사용합니다.

```python
from langgraph.graph import StateGraph, START, END
from typing import TypedDict

class SubState(TypedDict):
    data: str

# 서브그래프 정의
def sub_step_1(state: SubState):
    return {"data": state["data"] + " > 서브처리1"}

def sub_step_2(state: SubState):
    return {"data": state["data"] + " > 서브처리2"}

sub_graph = StateGraph(SubState)
sub_graph.add_node("sub_1", sub_step_1)
sub_graph.add_node("sub_2", sub_step_2)
sub_graph.add_edge(START, "sub_1")
sub_graph.add_edge("sub_1", "sub_2")
sub_graph.add_edge("sub_2", END)

compiled_sub = sub_graph.compile()

# 메인 그래프에서 서브그래프를 노드로 사용
class MainState(TypedDict):
    data: str

def pre_process(state: MainState):
    return {"data": state["data"] + " > 전처리"}

def post_process(state: MainState):
    return {"data": state["data"] + " > 후처리"}

main_graph = StateGraph(MainState)
main_graph.add_node("pre", pre_process)
main_graph.add_node("sub", compiled_sub)  # 서브그래프를 노드로 추가
main_graph.add_node("post", post_process)

main_graph.add_edge(START, "pre")
main_graph.add_edge("pre", "sub")
main_graph.add_edge("sub", "post")
main_graph.add_edge("post", END)

app = main_graph.compile()
result = app.invoke({"data": "입력"})
print(result["data"])
# 출력: 입력 > 전처리 > 서브처리1 > 서브처리2 > 후처리
```

---

## 10. 멀티 에이전트 시스템

여러 에이전트가 협업하는 시스템을 구축할 수 있습니다.

```python
from langgraph.graph import StateGraph, START, END
from langchain_openai import ChatOpenAI
from typing import TypedDict, Annotated
from langgraph.graph.message import add_messages
from langchain_core.messages import AnyMessage, HumanMessage, AIMessage

class MultiAgentState(TypedDict):
    messages: Annotated[list[AnyMessage], add_messages]
    current_agent: str

llm = ChatOpenAI(model="gpt-4o")

def researcher(state: MultiAgentState):
    """리서치 에이전트: 정보를 조사합니다."""
    response = llm.invoke([
        {"role": "system", "content": "당신은 리서치 전문가입니다. 주어진 주제를 조사하세요."},
        *state["messages"]
    ])
    return {"messages": [response], "current_agent": "researcher"}

def writer(state: MultiAgentState):
    """작성 에이전트: 리서치 결과를 바탕으로 글을 작성합니다."""
    response = llm.invoke([
        {"role": "system", "content": "당신은 전문 작가입니다. 리서치 내용을 바탕으로 글을 작성하세요."},
        *state["messages"]
    ])
    return {"messages": [response], "current_agent": "writer"}

def reviewer(state: MultiAgentState):
    """검토 에이전트: 작성된 글을 검토합니다."""
    response = llm.invoke([
        {"role": "system", "content": "당신은 편집자입니다. 글을 검토하고 피드백을 제공하세요."},
        *state["messages"]
    ])
    return {"messages": [response], "current_agent": "reviewer"}

graph = StateGraph(MultiAgentState)
graph.add_node("researcher", researcher)
graph.add_node("writer", writer)
graph.add_node("reviewer", reviewer)

graph.add_edge(START, "researcher")
graph.add_edge("researcher", "writer")
graph.add_edge("writer", "reviewer")
graph.add_edge("reviewer", END)

app = graph.compile()
```

---

## 11. 스트리밍

LangGraph는 실행 과정을 실시간으로 스트리밍할 수 있습니다.

```python
# 노드 단위 스트리밍
for event in app.stream({"messages": [("user", "AI의 미래에 대해 알려주세요")]}):
    for node_name, output in event.items():
        print(f"[{node_name}] 실행 완료")
        if "messages" in output:
            last_msg = output["messages"][-1]
            print(f"  응답: {last_msg.content[:100]}...")

# 토큰 단위 스트리밍 (stream_mode="messages")
for msg, metadata in app.stream(
    {"messages": [("user", "짧은 시 하나 써줘")]},
    stream_mode="messages"
):
    if hasattr(msg, "content"):
        print(msg.content, end="", flush=True)
```

---

## 12. 시각화

그래프 구조를 Mermaid 다이어그램이나 PNG 이미지로 시각화할 수 있습니다.

```python
# Mermaid 문법으로 출력
print(app.get_graph().draw_mermaid())

# PNG 이미지로 저장 (Jupyter 환경)
from IPython.display import Image, display
png_data = app.get_graph().draw_mermaid_png()
display(Image(png_data))
```

---

## 13. 프로덕션 배포 팁

### LangGraph Platform

LangGraph Platform을 사용하면 에이전트를 서버로 배포할 수 있습니다. Docker 기반의 배포, 수평 확장, 모니터링 등을 지원합니다.

### 체크포인팅 전략

프로덕션에서는 인메모리 체크포인터 대신 PostgreSQL 기반의 영구 저장소를 사용하는 것이 권장됩니다.

```python
# PostgreSQL 체크포인터 예시
from langgraph.checkpoint.postgres import PostgresSaver

DB_URI = "postgresql://user:pass@localhost:5432/langgraph"
checkpointer = PostgresSaver.from_conn_string(DB_URI)
app = graph.compile(checkpointer=checkpointer)
```

### 에러 핸들링

재귀 제한(Recursion Limit)을 설정하여 무한 루프를 방지합니다.

```python
from langgraph.errors import GraphRecursionError

try:
    result = app.invoke(inputs, {"recursion_limit": 25})
except GraphRecursionError:
    print("최대 재귀 횟수에 도달했습니다.")
```

### LangSmith 연동

LangSmith를 사용하면 그래프 실행을 추적하고, 성능을 모니터링하며, 디버깅할 수 있습니다.

---

## 14. LangGraph vs 다른 프레임워크

| 항목                | LangGraph      | AutoGen     | CrewAI        |
| ----------------- | -------------- | ----------- | ------------- |
| 제어 수준             | 낮은 수준 (세밀한 제어) | 높은 수준 (추상화) | 높은 수준 (역할 기반) |
| 그래프 구조            | 명시적 그래프 정의     | 대화 기반       | 태스크 기반        |
| 상태 관리             | 내장 (체크포인팅)     | 제한적         | 제한적           |
| Human-in-the-Loop | 네이티브 지원        | 지원          | 지원            |
| 학습 곡선             | 중간~높음          | 낮음~중간       | 낮음            |
| 프로덕션 적합성          | 높음             | 중간          | 중간            |

---

## 15. 유용한 리소스

- **공식 문서**: https://langchain-ai.github.io/langgraph/
- **GitHub 저장소**: https://github.com/langchain-ai/langgraph
- **LangChain Academy**: 무료 LangGraph 학습 과정 제공
- **LangSmith**: 에이전트 디버깅 및 모니터링 도구
- **LangGraph Studio**: 시각적 그래프 디버깅 환경

---

## 부록: 자주 사용하는 패턴 요약

```python
# 1. 순차 실행 (add_sequence)
builder = StateGraph(State).add_sequence([step_1, step_2, step_3])
builder.add_edge(START, "step_1")

# 2. 조건부 라우팅
graph.add_conditional_edges("node", routing_function)

# 3. 도구 사용 에이전트
graph.add_conditional_edges("agent", tools_condition)
graph.add_edge("tools", "agent")

# 4. 중단 및 재개
app = graph.compile(checkpointer=memory, interrupt_before=["node"])

# 5. Command를 통한 제어 흐름 + 상태 업데이트 동시 처리
from langgraph.types import Command

def my_node(state):
    return Command(update={"key": "value"}, goto="next_node")
```

---

_이 가이드는 2026년 3월 기준으로 작성되었습니다. 최신 정보는 공식 문서를 참고하세요._