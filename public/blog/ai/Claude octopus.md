# Claude Octopus 사용 가이드

> **Claude Code를 위한 멀티 AI 오케스트레이터**
> Codex CLI, Gemini CLI, Claude를 병렬로 조율하여 연구, 개발, 리뷰, 토론을 수행합니다.

---

## 1. 소개

### Claude Octopus란?

Claude Octopus는 Claude Code 환경에서 여러 AI 프로바이더(OpenAI Codex, Google Gemini, Anthropic Claude)를 동시에 조율하는 멀티 프로바이더 오케스트레이션 플러그인입니다. 연구, PRD 작성, 코드 구현, 코드 리뷰, AI 간 토론 등 구조화된 워크플로우를 통해 품질 게이트를 적용하며 작업을 수행합니다.

### 왜 필요한가?

단일 AI 모델은 각자 강점과 약점이 있습니다. Claude Octopus는 세 AI의 장점을 결합합니다.

- **Codex (OpenAI)**: 코드 패턴, 기술 분석, 아키텍처 설계에 강점
- **Gemini (Google)**: 대안 탐색, 보안 리뷰, 리서치 종합에 강점
- **Claude (Anthropic)**: 오케스트레이션, 품질 게이트, 합의 도출, 최종 종합에 강점

### 요구사항

- Claude Code v2.1.34 이상
- Node.js 환경
- (선택) OpenAI 또는 Google AI 계정 — 외부 프로바이더 없이도 기본 기능 사용 가능

---

## 2. 설치 및 초기 설정

### 설치

Claude Code 터미널에서 다음 명령어를 실행합니다.

```bash
/plugin install claude-octopus@nyldn-plugins
```

### 초기 설정

설치 후 셋업 명령어를 실행하면 설치된 프로바이더를 자동 감지하고, 누락된 항목을 안내하며, 설정 과정을 안내합니다.

```bash
/octo:setup
```

셋업 과정에서 확인되는 항목은 다음과 같습니다.

- 현재 설치된 AI 프로바이더 감지
- 미설치 프로바이더 안내
- 인증 설정 안내

### 제거

플러그인을 깔끔하게 제거하려면 아래 명령어를 사용합니다. 잔여 설정이 남지 않습니다.

```bash
/plugin uninstall claude-octopus@nyldn-plugins
```

---

## 3. 핵심 개념

### 더블 다이아몬드 (Double Diamond) 프레임워크

영국 디자인 카운슬(UK Design Council)의 방법론을 적용한 4단계 구조화된 워크플로우입니다.

| 단계 | 명령어 | 설명 |
|------|--------|------|
| **Discover (발견)** | `/octo:discover` | 멀티 AI 리서치와 넓은 탐색 |
| **Define (정의)** | `/octo:define` | 합의 기반 요구사항 명확화 |
| **Develop (개발)** | `/octo:develop` | 품질 게이트를 적용한 구현 |
| **Deliver (전달)** | `/octo:deliver` | 적대적 리뷰와 Go/No-Go 점수 산정 |

각 단계를 개별로 실행할 수도 있고, `/octo:embrace`로 4단계를 한 번에 실행할 수도 있습니다.

### 자율성 모드

| 모드 | 설명 |
|------|------|
| **Supervised (감독)** | 각 단계마다 사용자 승인 필요 |
| **Semi-autonomous (반자율)** | 실패 시에만 개입 |
| **Autonomous (자율)** | 4단계 전체를 자동 실행 |

### 품질 게이트

75% 합의 품질 게이트가 적용되어, 세 프로바이더 중 충분한 합의가 이루어지지 않으면 결과물이 다음 단계로 넘어가지 않습니다.

### 스마트 라우터

명령어 이름을 정확히 기억하지 못해도 자연어로 의도를 설명하면 적절한 워크플로우로 자동 라우팅됩니다.

```bash
/octo research microservices patterns    → discover 단계로 라우팅
/octo build user authentication          → develop 단계로 라우팅
/octo compare Redis vs DynamoDB          → debate로 라우팅
```

---

## 4. 주요 명령어 레퍼런스

### 핵심 명령어 (Core Commands)

| 명령어 | 기능 |
|--------|------|
| `/octo:embrace` | 전체 4단계 워크플로우 (발견 → 정의 → 개발 → 전달) |
| `/octo:research` | 멀티 소스 심층 리서치 및 종합 |
| `/octo:review` | 멀티 관점 코드 리뷰 |
| `/octo:tdd` | 테스트 주도 개발 (Red-Green-Refactor) |
| `/octo:debug` | 체계적 4단계 디버깅 |
| `/octo:security` | OWASP 취약점 스캔 |
| `/octo:debate` | 구조화된 3자 AI 토론 |
| `/octo:prd` | AI 최적화 PRD, 100점 채점 체계 |
| `/octo:extract` | 코드 또는 URL에서 디자인 시스템 역공학 |
| `/octo:deck` | 슬라이드 덱 생성 (아웃라인 승인 게이트 포함) |
| `/octo:docs` | PPTX, DOCX, PDF 내보내기 |
| `/octo:brainstorm` | 창의적 사고 파트너 세션 |

> 전체 39개 명령어는 `docs/COMMAND-REFERENCE.md`에서 확인할 수 있습니다.

### 명령어 사용 형식

```bash
/octo:<명령어> <설명 또는 주제>
```

예시:

```bash
/octo:research OAuth 2.1 patterns
/octo:review
/octo:debate monorepo vs microservices
/octo:embrace build stripe integration
/octo:tdd create user auth
/octo:deck q3 product strategy
```

---

## 5. 워크플로우 가이드

### 5.1 전체 라이프사이클 (`/octo:embrace`)

가장 강력한 워크플로우로, 리서치부터 최종 전달까지 4단계를 순차적으로 실행합니다.

```bash
/octo:embrace build stripe integration
```

수행 과정:
1. **Discover**: Stripe 관련 멀티 AI 리서치
2. **Define**: 요구사항 합의 및 PRD 도출
3. **Develop**: 품질 게이트를 적용한 코드 구현
4. **Deliver**: 적대적 리뷰, 보안 분석, Go/No-Go 판단

### 5.2 리서치 (`/octo:research`)

세 AI 프로바이더가 각각 독립적으로 조사한 뒤, 결과를 종합합니다.

```bash
/octo:research htmx vs react in 2026
```

프로바이더별 역할:
- Codex → 기술적 구현 깊이 분석
- Gemini → 생태계 및 대안 폭넓게 탐색
- Claude → 최종 종합 및 합의 도출

### 5.3 코드 리뷰 (`/octo:review`)

현재 작업 중인 코드에 대해 멀티 관점 리뷰를 수행합니다. 보안 분석이 포함됩니다.

```bash
/octo:review
```

### 5.4 TDD (`/octo:tdd`)

엄격한 Red-Green-Refactor 사이클을 오케스트레이션합니다.

```bash
/octo:tdd create user auth
```

### 5.5 AI 토론 (`/octo:debate`)

세 AI가 각자 입장을 갖고 구조화된 형식으로 논쟁합니다.

```bash
/octo:debate monorepo vs microservices
```

### 5.6 슬라이드 덱 (`/octo:deck`)

브리프 → 리서치 → 아웃라인 승인 게이트 → PPTX 내보내기의 과정을 거칩니다.

```bash
/octo:deck q3 product strategy
```

---

## 6. 프로바이더 설정

### 인증 방법

| 방식 | Codex | Gemini | Claude |
|------|-------|--------|--------|
| **OAuth (권장)** | `codex login` — ChatGPT 구독에 포함 | Google 계정 — AI 구독에 포함 | Claude Code에 내장 |
| **API 키** | `OPENAI_API_KEY` 환경변수 — 토큰 과금 | `GEMINI_API_KEY` 환경변수 — 토큰 과금 | Claude Code에 내장 |

OAuth를 사용하면 기존 구독 외 추가 비용이 발생하지 않습니다.

### 외부 프로바이더 없이 사용하기

외부 프로바이더 없이도 다음 기능은 모두 사용 가능합니다.

- 29개 페르소나 전체
- 구조화된 워크플로우
- 스마트 라우팅
- 컨텍스트 감지
- 모든 스킬

멀티 AI 오케스트레이션(병렬 분석, 토론, 합의 도출)은 외부 프로바이더가 하나 이상 설정되었을 때 활성화됩니다.

---

## 7. 페르소나 시스템

요청 내용에 따라 29개의 전문 에이전트가 자동으로 활성화됩니다.

### 카테고리별 페르소나

| 카테고리 | 페르소나 수 | 예시 |
|----------|------------|------|
| 소프트웨어 엔지니어링 | 11 | 풀스택 개발자, API 설계자, DB 아키텍트 등 |
| 전문 개발 | 6 | 보안 감사자, 성능 엔지니어 등 |
| 문서화 및 커뮤니케이션 | 5 | 기술 문서 작성자, API 문서화 등 |
| 리서치 및 전략 | 4 | 기술 리서처, 전략 분석가 등 |
| 크리에이티브 및 디자인 | 3 | UI/UX 디자이너, 디자인 시스템 등 |

### 활성화 방식

자연어로 요청하면 적절한 페르소나가 자동 선택됩니다.

- "audit my API for vulnerabilities" → `security-auditor` 활성화
- "write a research paper" → `academic-writer` 활성화

> 전체 페르소나 목록은 `docs/AGENTS.md`에서 확인할 수 있습니다.

---

## 8. 실전 활용 예시

### 예시 1: 새 기능 개발 (전체 라이프사이클)

```bash
/octo:embrace build stripe integration
```

연구부터 코드 구현, 리뷰까지 한 번에 처리합니다. 각 단계에서 품질 게이트가 적용됩니다.

### 예시 2: 기술 스택 비교 조사

```bash
/octo:research htmx vs react in 2026
```

세 프로바이더가 각각 독립적으로 조사 후 종합 보고서를 생성합니다.

### 예시 3: 보안 점검

```bash
/octo:security
```

현재 프로젝트의 OWASP 기반 취약점을 스캔합니다.

### 예시 4: 아키텍처 토론

```bash
/octo:debate monorepo vs microservices
```

각 AI가 서로 다른 입장을 맡아 구조화된 형식으로 토론합니다.

### 예시 5: TDD 기반 개발

```bash
/octo:tdd create user auth
```

Red(실패 테스트 작성) → Green(테스트 통과 코드 작성) → Refactor(리팩토링) 순서로 진행됩니다.

### 예시 6: 발표 자료 생성

```bash
/octo:deck q3 product strategy
```

브리프 작성 → 리서치 → 아웃라인 승인 → PPTX 파일 내보내기까지 자동화됩니다.

---

## 9. 신뢰와 보안

### 네임스페이스 격리

`/octo:*` 명령어와 `octo` 자연어 접두사만 플러그인을 활성화합니다. 기존 Claude Code 환경에 영향을 주지 않습니다.

### 데이터 저장 위치

| 항목 | 경로 |
|------|------|
| 실행 결과 | `~/.claude-octopus/results/` |
| 로그 | `~/.claude-octopus/logs/` |
| 프로젝트 상태 | `.octo/` |

숨겨진 데이터 저장소는 없습니다.

### 텔레메트리

사용 데이터를 수집하지 않습니다. 외부로 데이터를 전송하지 않습니다. 완전한 오픈 소스(MIT 라이선스)입니다.

### 프로바이더 투명성

시각적 표시기(컬러 점)로 현재 어떤 프로바이더가 실행 중인지, 외부 API가 호출되는 시점이 언제인지 명확히 보여줍니다.

---

## 10. 에이전트 하네스 참고 패턴

Claude Octopus의 내부 구조에는 에이전트 오케스트레이션 시스템을 설계할 때 참고할 만한 패턴이 다수 포함되어 있습니다.

### 10.1 에이전트 라이프사이클 상태 머신

에이전트가 생성(spawn)부터 완료까지 거치는 13단계 상태를 추적합니다. 이 상태 머신은 PR 라이프사이클과 밀접하게 연동됩니다.

```
running → pr_open → ci_pending → review_pending → approved → mergeable → merged
                        ↓              ↓                                    
                    ci_failed    changes_requested                         
                        ↓              ↓                                    
                    retrying       retrying                                
                                                                           
(어디서든) → stuck (15분 무진행)                                            
(어디서든) → failed (프로세스 크래시)                                        
(PR 없이 완료) → done                                                      
```

| 상태 | 분류 | 설명 |
|------|------|------|
| `running` | 활성 | 워크트리에서 실행 중, PR 미생성 |
| `retrying` | 활성 | 실패 후 재시도 중 |
| `pr_open` | PR 라이프사이클 | PR 생성됨, CI 또는 리뷰 대기 |
| `ci_pending` | PR 라이프사이클 | CI 검사 실행 중 |
| `ci_failed` | 오류 | CI 검사 실패 |
| `review_pending` | PR 라이프사이클 | CI 통과, 코드 리뷰 대기 |
| `changes_requested` | 오류 | 리뷰어가 변경 요청 |
| `approved` | PR 라이프사이클 | 리뷰어 승인 완료 |
| `mergeable` | PR 라이프사이클 | 승인 + CI 통과, 머지 가능 |
| `merged` | 종료 | PR 머지 완료 |
| `done` | 종료 | PR 없이 태스크 완료 |
| `failed` | 종료 | 에이전트 실패 (복구 불가) |
| `stuck` | 오류 | 15분 이상 진행 없음 |

종료 상태(`merged`, `done`, `failed`)에 도달한 에이전트는 더 이상 모니터링하지 않습니다.

**참고 포인트**: 상태 머신을 명시적으로 정의하고, 종료 상태를 분리함으로써 리소스 누수를 방지하는 패턴입니다.

### 10.2 에이전트 레지스트리

`~/.claude-octopus/agents/registry.json`에 에이전트 메타데이터를 영속적으로 저장합니다.

```json
{
  "id": "WP-1",
  "branch": "feature/auth",
  "worktree": "/path/to/isolated/worktree",
  "status": "running",
  "pr": null,
  "ci": null,
  "started_at": "2026-03-18T09:00:00Z",
  "updated_at": "2026-03-18T09:05:00Z",
  "completed_at": null,
  "project": "/path/to/project",
  "session": "claude-session-id",
  "retries": 0,
  "error": null
}
```

레지스트리 파일 쓰기에는 **원자적 쓰기**(tmp 파일에 쓴 뒤 move) 패턴을 적용하여 JSON 파손을 방지합니다.

**참고 포인트**: 에이전트 상태를 중앙 레지스트리로 관리하면, 여러 에이전트가 병렬로 실행될 때 전체 상황을 한 곳에서 파악할 수 있습니다.

### 10.3 리액션 엔진 (자동 이벤트 응답)

`scripts/reactions.sh`가 에이전트의 상태 변화를 감지하고 자동으로 대응합니다. 사람의 개입 없이 CI 실패 로그 전달, 리뷰 코멘트 전달, 에스컬레이션 등을 처리합니다.

| 이벤트 | 기본 액션 | 최대 재시도 | 에스컬레이션 시점 |
|--------|----------|------------|----------------|
| `ci_failed` | `forward_logs` (로그 수집 → inbox) | 3 | 30분 |
| `changes_requested` | `forward_comments` (코멘트 수집 → inbox) | 2 | 60분 |
| `approved` | `notify` (알림) | 0 | — |
| `stuck` | `escalate` (에스컬레이션) | 0 | 15분 |
| `review_pending` | `notify` (알림) | 0 | — |
| `merged` | `notify` (알림) | 0 | — |

리액션 설정은 `.octo/reactions.conf`로 프로젝트별 오버라이드가 가능합니다.

```
# EVENT|ACTION|MAX_RETRIES|ESCALATE_AFTER_MIN|ENABLED
ci_failed|forward_logs|3|30|true
changes_requested|forward_comments|2|60|true
stuck|escalate|0|15|true
```

**참고 포인트**: 이벤트-액션 매핑을 선언적 설정으로 분리하면, 프로젝트마다 다른 자동화 정책을 적용할 수 있습니다. 재시도 횟수와 에스컬레이션 타임아웃을 조합하여 사람의 개입이 필요한 시점을 정밀하게 제어합니다.

### 10.4 품질 게이트 시스템

Develop 단계 완료 후 PostToolUse 훅으로 실행되며, 4개 차원에서 검증합니다.

| 검증 차원 | 가중치 | 기준 |
|----------|--------|------|
| **보안** | 30% | OWASP 준수, 취약점 스캔, 인증/인가 패턴 |
| **코드 품질** | 30% | 베스트 프랙티스, 프레임워크 관례, 유지보수성 |
| **성능** | 20% | 효율성, 확장성, 리소스 최적화 |
| **엣지 케이스** | 20% | 에러 핸들링, 경계 조건, 입력 검증 |

합의 점수(Consensus Score) 기반으로 통과 여부를 결정합니다.

| 점수 | 게이트 상태 | 후속 조치 |
|------|-----------|----------|
| 75% 이상 | PASS | Deliver 단계로 진행 |
| 60~74% | CONDITIONAL FAIL | 리뷰 권장, 오버라이드 가능 |
| 60% 미만 | HARD FAIL | 반복 수정 필수, 오버라이드 불가 |

자율성 모드에 따라 실패 시 동작이 달라집니다.

| 모드 | 자동 반복 횟수 | 한도 초과 시 |
|------|-------------|-------------|
| Supervised | 0 | 즉시 사용자 프롬프트 |
| Semi-autonomous | 1 | 1회 실패 후 사용자 프롬프트 |
| Autonomous | 3 | 강제 사용자 리뷰 |

품질 게이트 결과는 `quality-gate-report-*.json`으로 영속 저장되어 감사 추적(audit trail)과 세션 재개에 활용됩니다.

**참고 포인트**: 단일 점수가 아닌 다차원 가중 평균 방식으로 품질을 평가하고, 자율성 수준별로 실패 핸들링 전략을 차별화하는 패턴입니다.

### 10.5 병렬 실행 및 워크트리 격리

`/octo:parallel` 명령은 각 작업을 독립된 git worktree에서 실행합니다. 에이전트 간 파일 시스템 충돌을 원천적으로 방지합니다.

```
프로젝트 루트/
├── .git/                      ← 공유 git 저장소
├── (메인 작업 디렉토리)
└── .worktrees/
    ├── WP-1-feature-auth/     ← 에이전트 1 격리 워크트리
    ├── WP-2-feature-payment/  ← 에이전트 2 격리 워크트리
    └── WP-3-feature-search/   ← 에이전트 3 격리 워크트리
```

모니터링 루프에서 리액션 엔진을 주기적으로 호출하여, 병렬 실행 중인 모든 에이전트의 상태 변화를 자동으로 처리합니다.

**참고 포인트**: git worktree를 활용한 에이전트 격리는 별도의 컨테이너나 VM 없이도 안전한 병렬 실행을 가능하게 하는 경량 패턴입니다.

### 10.6 스마트 라우팅 및 페르소나 자동 선택

`scripts/lib/routing.sh`에서 사용자의 자연어 입력을 파싱하여 의도(intent)에 따라 적절한 워크플로우와 페르소나를 자동 선택합니다.

```
"Build user authentication with OAuth"  → backend-architect + database-architect
"Review this code for security issues"  → security-auditor
"My API is slow"                        → performance-engineer
```

라우팅 결정은 `~/.claude-octopus/routing.log`에 기록되며, 세션 간 선호도 학습(routing memory)도 지원합니다.

**참고 포인트**: 의도 기반 라우팅 + 라우팅 로그 + 학습 피드백 루프의 조합은, 에이전트 하네스에서 사용자 경험을 점진적으로 개선하는 데 유용한 패턴입니다.

### 10.7 워크스페이스 상태 영속화

세션 상태와 결과물을 파일 시스템에 체계적으로 저장하여 세션 재개와 감사를 지원합니다.

```
~/.claude-octopus/
├── session.json                    ← 현재 단계, 진행 상황, 결정 사항
├── results/                        ← 워크플로우 결과 파일
│   ├── discover-TIMESTAMP.md
│   ├── define-TIMESTAMP.md
│   ├── develop-TIMESTAMP.md
│   └── deliver-TIMESTAMP.md
├── logs/                           ← 실행 로그
└── agents/                         ← 에이전트 레지스트리 및 상태
    ├── registry.json
    ├── archive/                    ← 7일 지난 종료 에이전트 아카이브
    └── reactions/
        ├── inbox/                  ← CI 로그, 리뷰 코멘트 전달
        │   └── {agent-id}/
        ├── {agent-id}.state        ← 재시도 카운터, 최초 감지 시각
        └── escalations.log
```

워크스페이스 경로 검증(`validate_workspace_path()`)은 경로 탈출(`..`), 셸 메타문자(`;`, `|`, `&`, `$` 등)를 차단하여 보안을 확보합니다.

**참고 포인트**: 단계별 결과 파일을 타임스탬프 기반으로 분리 저장하면, 워크플로우 실패 시 특정 단계부터 재개할 수 있습니다.

### 10.8 에이전트 하네스 설계 시 핵심 교훈 요약

| 패턴 | Claude Octopus의 구현 | 설계 교훈 |
|------|----------------------|----------|
| 상태 머신 | 13단계 라이프사이클, 종료 상태 분리 | 에이전트 상태를 명시적으로 정의하고 종료 조건을 분명히 해야 리소스 누수를 방지할 수 있음 |
| 중앙 레지스트리 | JSON 기반 registry.json + 원자적 쓰기 | 다수 에이전트 병렬 실행 시 단일 진실 원천(single source of truth)이 필수 |
| 이벤트-리액션 | 선언적 설정 + 재시도/에스컬레이션 | 자동 응답 정책을 코드에서 분리하면 프로젝트별 맞춤 가능 |
| 품질 게이트 | 다차원 가중 평균 + 합의 임계값 | 단일 점수보다 여러 차원의 가중 합이 더 신뢰할 수 있는 품질 판단 제공 |
| 격리 실행 | git worktree 기반 | 컨테이너 없이도 파일 시스템 수준 격리 가능 |
| 의도 라우팅 | 키워드 파싱 + 라우팅 로그 + 학습 | 명시적 명령어와 자연어 라우팅 양쪽 지원이 사용성 향상에 핵심 |
| 상태 영속화 | 타임스탬프 기반 단계별 결과 저장 | 실패 복구와 감사 추적을 동시에 해결 |
| 자율성 단계 | 4단계 모드 (supervised → autonomous) | 사용자 신뢰 수준에 따라 자동화 범위를 조절할 수 있어야 함 |

---

## 11. FAQ 및 트러블슈팅

### 자주 묻는 질문

**Q: 세 AI 프로바이더를 모두 설정해야 하나요?**
A: 아닙니다. 외부 프로바이더 하나와 Claude만으로도 멀티 AI 기능을 사용할 수 있습니다. 외부 프로바이더가 없어도 페르소나, 워크플로우, 스킬은 모두 사용 가능합니다.

**Q: 기존 Claude Code 환경이 영향을 받나요?**
A: 아닙니다. `octo` 접두사가 있을 때만 활성화됩니다. 결과는 별도로 저장되며, 깔끔하게 제거됩니다.

**Q: 프로바이더가 타임아웃되면 어떻게 되나요?**
A: 사용 가능한 프로바이더로 워크플로우가 계속됩니다. 시각적 표시기에서 상태를 확인할 수 있습니다.

### 트러블슈팅

**플러그인이 인식되지 않는 경우:**
- Claude Code 버전이 v2.1.34 이상인지 확인
- `/octo:setup`을 재실행하여 설정 상태 확인

**외부 프로바이더 연결 실패:**
- OAuth 또는 API 키 설정이 올바른지 확인
- Codex: `codex login` 실행 여부
- Gemini: `GEMINI_API_KEY` 환경변수 설정 여부

**디버그 모드:**
- 문제 해결 시 `docs/DEBUG_MODE.md`를 참고하여 상세 로그를 확인할 수 있습니다.

---

## 참고 문서

| 문서 | 설명 |
|------|------|
| [Command Reference](https://github.com/nyldn/claude-octopus/blob/main/docs/COMMAND-REFERENCE.md) | 전체 39개 명령어 레퍼런스 |
| [Architecture](https://github.com/nyldn/claude-octopus/blob/main/docs/ARCHITECTURE.md) | 내부 아키텍처 |
| [Plugin Architecture](https://github.com/nyldn/claude-octopus/blob/main/docs/PLUGIN-ARCHITECTURE.md) | 플러그인 구조 |
| [Agents & Personas](https://github.com/nyldn/claude-octopus/blob/main/docs/AGENTS.md) | 29개 페르소나 전체 목록 |
| [Visual Indicators](https://github.com/nyldn/claude-octopus/blob/main/docs/VISUAL-INDICATORS.md) | 프로바이더 상태 표시기 |
| [Debug Mode](https://github.com/nyldn/claude-octopus/blob/main/docs/DEBUG_MODE.md) | 디버그 모드 안내 |