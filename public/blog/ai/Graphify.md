---
title: "Graphify - 코드·문서·영상을 하나의 지식 그래프로 엮는 AI 코딩 스킬"
pubDatetime: 2026-04-20
description: "Graphify 분석 - tree-sitter AST·Whisper·Claude 서브에이전트 3패스 파이프라인과 Leiden 커뮤니티 클러스터링으로 폴더 하나를 질의 가능한 지식 그래프로 변환, 쿼리당 토큰 71.5배 절감"
tags: ["AI", "KnowledgeGraph", "ClaudeCode", "tree-sitter", "Skill"]
category: "ai"
---

## Graphify란?

[Graphify](https://github.com/safishamsi/graphify)는 **코드, 문서, 논문, 이미지, 영상이 섞인 폴더를 하나의 질의 가능한 지식 그래프로 변환하는 AI 코딩 어시스턴트용 스킬**이다. Claude Code, Codex, OpenCode, Cursor, Gemini CLI, GitHub Copilot CLI, Aider, OpenClaw, Factory Droid, Trae, Google Antigravity 등에서 `/graphify` 한 줄로 실행된다.

문제의식은 Andrej Karpathy가 언급한 `/raw` 폴더 패턴에서 출발한다. **논문 PDF, 트윗 스크린샷, 화이트보드 사진, 코드 조각, 회의 녹음이 한 디렉토리에 쌓이지만 나중에 다시 꺼내 쓰려면 원본을 전부 LLM에 로드해야 한다.** 토큰이 폭증하고, 세션이 바뀌면 맥락이 사라진다.

Graphify의 해법은 **"폴더 전체를 한 번 읽어서 그래프로 굳혀두고, 이후에는 그래프에만 질문한다"**는 것이다. 쿼리당 **원본을 다시 읽을 때보다 71.5배 적은 토큰**으로 답을 얻는다.

```
폴더 → AST 파싱 + Whisper + Claude 서브에이전트 → NetworkX 그래프 → HTML/JSON/리포트
                                                     (이후 질의는 그래프에만)
```

Python 3.10+ 기반이고, PyPI 패키지명은 `graphifyy`다(CLI와 스킬 명령은 `graphify`). MIT 라이선스로 공개되어 있다.

---

## 왜 주목할 만한가?

장기 프로젝트에서 AI와 협업하다 보면 결국 부딪히는 문제가 있다.

| 상황 | 전통적 방식의 한계 |
|---|---|
| 낯선 레포 이해 | 파일 전체를 Claude에 붙여 넣어야 하고, 컨텍스트 창을 초과 |
| 논문·이미지·코드 섞인 자료 | 포맷별로 따로 처리해야 하고 상호 연결 불가 |
| "왜 이 결정을 했지?" 추적 | 커밋 히스토리·주석·문서를 사람이 엮어봐야 함 |
| 반복 질의 | 매번 같은 원본을 다시 토큰화 |

Graphify는 이 틈을 **토폴로지 기반 지식 그래프**로 채운다. 벡터 임베딩이 아니라 **Leiden 커뮤니티 검출**로 클러스터링하고, 모든 엣지에 출처 태그(EXTRACTED/INFERRED/AMBIGUOUS)를 붙여 **발견한 것과 추측한 것을 구분**한다.

| 항목 | 내용 |
|---|---|
| 라이선스 | MIT |
| 언어 | Python 3.10+ |
| 코드 파싱 | tree-sitter (25개 언어) |
| 영상·음성 | faster-whisper (로컬) |
| 시맨틱 추출 | Claude 서브에이전트 병렬 |
| 클러스터링 | Leiden (그래프 토폴로지, 임베딩 없음) |
| 출력 | 인터랙티브 HTML, JSON, Markdown 리포트 |
| 토큰 효율 | 쿼리당 **71.5× 절감** (혼합 코퍼스 기준) |

---

## 3패스 아키텍처

Graphify의 파이프라인은 단계마다 도구를 분리한다. **LLM이 필요 없는 부분은 절대 LLM을 쓰지 않는다.**

```
Pass 1: tree-sitter AST       → 클래스/함수/임포트/콜그래프 (결정적, LLM 없음)
Pass 2: faster-whisper        → 영상/음성 트랜스크립션 (로컬, 캐시됨)
Pass 3: Claude 서브에이전트   → 문서·논문·이미지·트랜스크립트에서 개념·관계 추출 (병렬)
                                 ↓
                            NetworkX 그래프 병합 → Leiden 클러스터링 → 출력
```

### Pass 1 — 결정적 AST 파싱

Python, JS, TS, Go, Rust, Java, C, C++, Ruby, C#, Kotlin, Scala, PHP, Swift, Lua, Zig, PowerShell, Elixir, Objective-C, Julia, Verilog, SystemVerilog, Vue, Svelte, Dart까지 25개 언어를 tree-sitter로 파싱한다. 클래스·함수·임포트·콜그래프·독스트링·근거(rationale) 주석을 추출한다. LLM을 거치지 않으므로 **코드만 바뀌었을 때는 LLM 호출 없이 즉시 재빌드**된다.

### Pass 2 — 로컬 트랜스크립션

영상·음성 파일은 faster-whisper로 로컬에서 전사한다. 중요한 디테일은 **코퍼스의 "신(god) 노드"에서 도메인 프롬프트를 추출해 Whisper에 주입**한다는 점이다. 도메인 어휘를 Whisper가 미리 알고 있는 상태로 전사하기 때문에 정확도가 올라간다. 전사 결과는 캐시되어 재실행 시 즉시 반환된다.

### Pass 3 — Claude 서브에이전트 병렬 추출

문서, 논문, 이미지, 트랜스크립트에 대해 Claude 서브에이전트가 병렬로 개념·관계·설계 근거를 추출한다. 각 결과는 NetworkX 그래프로 병합된다.

---

## 클러스터링: 임베딩 없이 토폴로지로

Graphify에서 눈에 띄는 설계 결정은 **"임베딩과 벡터 DB를 쓰지 않는다"**는 것이다.

```
일반적 접근:
텍스트 → 임베딩 → 벡터 DB → 코사인 유사도 클러스터링

Graphify:
텍스트 → 개념·관계 추출 → 그래프 엣지 → Leiden(엣지 밀도로 커뮤니티 검출)
```

시맨틱 유사도 자체는 Claude가 `semantically_similar_to` 엣지로 직접 그래프에 넣어준다(INFERRED 태그 포함). 이 엣지들이 이미 그래프 안에 존재하므로 Leiden이 커뮤니티를 찾을 때 자연스럽게 반영된다. **그래프 구조 자체가 유사도 신호**가 되는 셈이라, 별도의 임베딩 스텝이나 벡터 스토어가 필요 없다.

운영상 이점은 분명하다. 의존성이 줄고, 임베딩 API 비용이 없고, 결정성이 올라간다.

---

## 엣지 태깅: 찾은 것 vs 추측한 것

Graphify의 모든 관계에는 세 가지 태그 중 하나가 붙는다.

| 태그 | 의미 |
|---|---|
| `EXTRACTED` | 원본에서 직접 발견됨 (AST, 명시적 문서화 등) |
| `INFERRED` | 합리적 추론, 0.0~1.0 신뢰도 점수 동반 |
| `AMBIGUOUS` | 수동 검토가 필요하다고 플래그됨 |

이 태깅 덕분에 **"Claude가 지어낸 관계인가, 진짜 코드에 있는 관계인가"**를 그래프를 보며 바로 구분할 수 있다. LLM이 낸 결과를 그대로 신뢰하는 구조가 아니다.

---

## 출력물

```
graphify-out/
├── graph.html        # 인터랙티브 그래프 (브라우저에서 노드 클릭, 검색, 커뮤니티 필터)
├── GRAPH_REPORT.md   # 신 노드, 의외의 연결, 추천 질문
├── graph.json        # 지속 저장 그래프 (주 단위로 나중에 쿼리 가능)
└── cache/            # SHA256 캐시, 변경된 파일만 재처리
```

`GRAPH_REPORT.md`가 특히 흥미롭다. **가장 연결이 많은 "신 노드"**, **의외의 크로스 커뮤니티 연결**, 그리고 **"이런 질문을 해보라"는 추천 쿼리**를 자동 생성한다. 처음 보는 코드베이스를 파악할 때 진입점이 된다.

---

## 사용 예시

```bash
# 설치
pip install graphifyy && graphify install
# 혹은 CLI 격리용
pipx install graphifyy && graphify install

# 기본 실행 (어떤 폴더든 가능 — 코드, 노트, 논문 무관)
/graphify .

# 적극적 추론 모드
/graphify ./raw --mode deep

# 변경된 파일만 재처리
/graphify ./raw --update

# 파일 변화 자동 감지
/graphify ./raw --watch

# 에이전트가 읽을 수 있는 위키 생성
/graphify ./raw --wiki

# 외부 리소스 추가 (논문, 트윗, 영상)
/graphify add <url>
```

### 질의 명령

```bash
# 자연어 질의
/graphify query "attention과 optimizer를 연결하는 건 뭐지?"

# 두 노드 사이의 경로 찾기
/graphify path "DigestAuth" "Response"

# 특정 개념의 맥락 설명
/graphify explain "SwinTransformer"
```

---

## 캐싱과 증분 빌드

SHA256 해시 기반 캐시로 **변경된 파일만** 재처리한다.

| 변경 유형 | 동작 |
|---|---|
| 코드만 수정 | AST만 재빌드, LLM 호출 0회 (즉시 완료) |
| 문서·이미지 수정 | `--update`로 시맨틱 재추출 안내 |
| 영상·음성 유지 | Whisper 재실행 없음 (캐시 히트) |

여기서 앞서 언급된 **71.5× 토큰 절감**이 의미를 갖는다. Karpathy 레포·논문·이미지가 혼합된 52개 파일 코퍼스 기준으로, 초기 추출은 한 번만 비용이 들고 **이후의 반복 질의는 압축된 그래프 위에서만 동작**한다.

---

## `.graphifyignore`

`.gitignore`와 동일 문법으로 제외 경로를 지정한다.

```
# .graphifyignore
vendor/
node_modules/
dist/
*.generated.py
```

레포 루트에 하나만 둬도 서브폴더에서 실행 시 패턴이 올바르게 적용된다.

---

## 프라이버시 모델

- **코드**: tree-sitter AST로 로컬 처리. 코드 파일 내용은 머신을 떠나지 않는다.
- **영상·음성**: faster-whisper로 로컬 전사. 오디오는 외부로 나가지 않는다.
- **문서·이미지**: 시맨틱 추출을 위해 사용자 자격증명으로 호스트 플랫폼(Claude, GPT-4 등)의 API를 호출한다.

즉, **가장 민감한 코드와 음성은 로컬에만 머무르고**, 공개 성격이 강한 문서·이미지만 LLM으로 보내는 구조다.

---

## 포지셔닝

Graphify의 위치를 비슷한 도구와 비교하면 차이가 분명해진다.

| 도구 | 지향 |
|---|---|
| Repomix | 코드베이스를 LLM 친화적 단일 파일로 패킹 (그래프 없음) |
| MemPalace | 세션 간 대화·결정 저장 (계층 구조 + 시맨틱 검색) |
| QMD | 로컬 파일 시맨틱 검색 (그래프 구조 없음) |
| **Graphify** | **폴더의 구조 자체를 그래프로 추출, 질의 가능** |

Repomix가 "LLM에 어떻게 먹일까"의 문제를 푼다면, Graphify는 **"LLM을 한 번만 써서 지식을 굳히고, 이후에는 굳은 지식만 본다"**는 반대 방향으로 간다.

---

## 마무리

Graphify의 핵심 판단은 두 가지다. 첫째, **코드는 LLM을 쓸 필요가 없다** — tree-sitter로 결정적으로 파싱하면 된다. 둘째, **시맨틱 유사도는 별도의 임베딩이 아니라 그래프 엣지에 녹여 넣는다** — Leiden이 토폴로지로 커뮤니티를 잡아낸다. 이 두 선택 덕분에 의존성·비용·결정성 측면에서 상당히 깔끔한 도구가 나왔다.

엣지마다 `EXTRACTED/INFERRED/AMBIGUOUS` 태그를 붙이는 설계는 특히 실무적으로 신뢰할 만하다. LLM이 추측한 관계를 그래프가 숨기지 않고 드러내기 때문에, 결과를 리뷰할 때 어디에 눈을 둬야 할지가 명확하다.

낯선 레포 파악, `/raw` 스타일의 잡다한 자료 관리, 장기 프로젝트의 아키텍처 메모리가 필요한 상황이라면 지금 당장 시도해볼 만하다. `pip install graphifyy && graphify install` 한 줄이면 Claude Code에서 `/graphify .`로 쓸 수 있다.
