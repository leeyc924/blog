---
title: "Archon - AI 코딩을 결정론적으로 만드는 워크플로우 엔진"
pubDatetime: 2026-05-11
description: "AI 코딩 에이전트의 변덕을 YAML 워크플로우로 길들이는 오픈소스 하네스 빌더 Archon. DAG 노드, 루프, 격리된 worktree, 17개 기본 워크플로우까지"
tags: ["AI", "Developer Tools", "Workflow", "Claude Code"]
category: "ai"
---

[Archon](https://github.com/coleam00/Archon)은 AI 코딩 에이전트를 위한 **워크플로우 엔진**이다. 계획·구현·검증·리뷰·PR 생성 같은 개발 프로세스를 YAML로 정의해 두면, 어느 프로젝트에서든 같은 순서로 재현된다.

> Dockerfile이 인프라에, GitHub Actions가 CI/CD에 한 일을 — Archon은 AI 코딩 워크플로우에 한다. n8n의 소프트웨어 개발 버전이라 생각하면 된다.

GitHub 스타 **21.2K**, MIT 라이선스, TypeScript/Bun 기반.

---

## 왜 필요한가?

AI 에이전트에게 "이 버그 고쳐줘"라고 했을 때 결과는 모델 컨디션에 달려 있다. 어떤 날은 계획을 건너뛰고, 어떤 날은 테스트를 잊고, 어떤 날은 PR 템플릿을 무시한다. 매 실행이 다르다.

Archon은 이 문제를 다음 방식으로 푼다.

| 특성 | 의미 |
|------|------|
| 재현성 | 같은 워크플로우는 같은 순서로 실행 — 계획·구현·검증·리뷰·PR |
| 격리 | 실행마다 별도 git worktree, 병렬 5개 작업도 충돌 없음 |
| 비동기 | 워크플로우를 던지고 다른 일 하다가 완성된 PR을 받음 |
| 합성 | 결정론 노드(bash/test/git)와 AI 노드(계획/생성/리뷰)를 자유롭게 섞음 |
| 포터블 | `.archon/workflows/`에 정의 후 커밋, 팀 전원이 같은 프로세스 사용 |

핵심 아이디어는 단순하다. **구조는 사람이 소유하고, 지능은 AI가 채운다.**

---

## 워크플로우 예시

다음은 계획 → 테스트 통과까지 구현 루프 → 사람 승인 → PR 생성을 자동화하는 워크플로우다.

```yaml
# .archon/workflows/build-feature.yaml
nodes:
  - id: plan
    prompt: "Explore the codebase and create an implementation plan"

  - id: implement
    depends_on: [plan]
    loop:                          # AI 루프 - 끝날 때까지 반복
      prompt: "Read the plan. Implement the next task. Run validation."
      until: ALL_TASKS_COMPLETE
      fresh_context: true          # 매 반복 새 세션

  - id: run-tests
    depends_on: [implement]
    bash: "bun run validate"       # 결정론 - AI 없음

  - id: review
    depends_on: [run-tests]
    prompt: "Review all changes against the plan. Fix any issues."

  - id: approve
    depends_on: [review]
    loop:                          # 사람 승인 게이트
      prompt: "Present the changes for review. Address any feedback."
      until: APPROVED
      interactive: true            # 사람 입력 대기

  - id: create-pr
    depends_on: [approve]
    prompt: "Push changes and create a pull request"
```

노드 종류는 네 가지로 단순하다.

- **AI 노드** (`prompt`) — 에이전트가 자연어 지시 수행
- **결정론 노드** (`bash`) — 셸 스크립트 실행, AI 개입 없음
- **루프 노드** (`loop` + `until`) — 조건 만족까지 반복, `fresh_context: true`로 매 반복 컨텍스트 초기화 가능
- **인터랙티브 노드** (`interactive: true`) — 사람이 승인할 때까지 일시정지

`depends_on`으로 노드 간 의존성을 표현하므로 워크플로우는 사실상 DAG다.

---

## 실행 모습

```text
You: Use archon to add dark mode to the settings page

Agent: I'll run the archon-idea-to-pr workflow for this.
       → Creating isolated worktree on branch archon/task-dark-mode...
       → Planning...
       → Implementing (task 1/4)...
       → Implementing (task 2/4)...
       → Tests failing - iterating...
       → Tests passing after 2 iterations
       → Code review complete - 0 issues
       → PR ready: https://github.com/you/project/pull/47
```

에이전트가 워크플로우 선택, 브랜치 이름 지정, worktree 격리까지 알아서 처리한다.

---

## 기본 제공 워크플로우 17개

Archon은 자주 쓰는 개발 작업을 17개의 기본 워크플로우로 묶어 제공한다. 주요 항목만 추리면:

| 워크플로우 | 역할 |
|-----------|------|
| `archon-assist` | 일반 Q&A·디버깅·탐색 — 모든 도구를 가진 풀 에이전트 |
| `archon-fix-github-issue` | 이슈 분류 → 조사·계획 → 구현 → 검증 → PR → 리뷰 → 자체 수정 |
| `archon-idea-to-pr` | 아이디어 → 계획 → 구현 → 검증 → PR → 5명 병렬 리뷰 → 자체 수정 |
| `archon-comprehensive-pr-review` | 5명 병렬 리뷰어 동시 검토 후 자동 수정 |
| `archon-architect` | 아키텍처 스윕, 복잡도 감축 |
| `archon-refactor-safely` | 타입체크 훅과 동작 검증을 함께 도는 안전 리팩토링 |
| `archon-resolve-conflicts` | 머지 충돌 탐지·양측 분석·해결·검증·커밋 |

기본 워크플로우는 출발점이다. `.archon/workflows/defaults/`에서 복사해 수정하거나, 같은 이름 파일을 리포에 두면 기본값을 덮어쓴다. 워크플로우는 YAML, 커스텀 커맨드는 `.archon/commands/`의 마크다운 파일이다.

---

## 아키텍처

```
Platform Adapters (Web UI / CLI / Telegram / Slack / Discord / GitHub)
            ↓
Orchestrator (메시지 라우팅 · 컨텍스트 관리)
    ├─ Command Handler (슬래시 커맨드)
    ├─ Workflow Executor (YAML DAG)
    └─ AI Assistant Clients (Claude / Codex / Pi)
            ↓
SQLite / PostgreSQL (7개 테이블)
    Codebases · Conversations · Sessions · Workflow Runs ·
    Isolation Environments · Messages · Workflow Events
```

플랫폼 어댑터 계층 덕분에 CLI에서 시작한 작업이 Slack 메시지로 알림 오고, Web UI에서 진행 상황을 보다가, Telegram에서 승인할 수 있다. 모든 대화가 사이드바 한 곳에 모인다.

---

## 설치

### Full Setup (5분, 권장)

```bash
git clone https://github.com/coleam00/Archon
cd Archon
bun install
claude
```

Claude Code에서 `"Set up Archon"`이라고 말하면 자격증명 설정·플랫폼 선택·타깃 리포에 Archon 스킬 복사까지 마법사가 안내한다.

### Quick Install (30초, CLI만)

```bash
# macOS / Linux
curl -fsSL https://archon.diy/install | bash

# Homebrew
brew install coleam00/archon/archon
```

컴파일된 바이너리는 Claude Code를 번들하지 않는다는 점만 주의. 별도 설치 후 경로를 알려줘야 한다.

```bash
curl -fsSL https://claude.ai/install.sh | bash
export CLAUDE_BIN_PATH="$HOME/.local/bin/claude"
```

`~/.archon/config.yaml`의 `assistants.claude.claudeBinaryPath`로도 지정 가능하다.

### 사용 시작

```bash
cd /path/to/your/project
claude
```

```
Use archon to fix issue #42
```

> 항상 **타깃 리포**에서 `claude`를 실행해야 한다. Archon 리포가 아니다. 셋업 마법사가 스킬을 타깃 프로젝트에 복사해 두기 때문이다.

---

## v1과의 관계

원래의 Archon은 Python 기반 task management + RAG 도구였다. 현재 v2는 완전히 다른 방향 — TypeScript/Bun 기반 워크플로우 엔진이다. 이전 버전은 `archive/v1-task-management-rag` 브랜치에 보존되어 있다.

---

## 텔레메트리

워크플로우 시작 시 익명 이벤트 `workflow_invoked` 하나만 전송한다. 워크플로우 이름·설명·플랫폼·버전·랜덤 UUID가 전부다. 코드·프롬프트·메시지·경로·토큰 같은 건 일절 수집하지 않는다.

끄려면:

```bash
ARCHON_TELEMETRY_DISABLED=1
# 또는 업계 표준
DO_NOT_TRACK=1
```

`POSTHOG_API_KEY` / `POSTHOG_HOST`로 자체 호스팅한 PostHog를 가리키게도 할 수 있다.

---

## 어떨 때 쓸까

- 같은 종류의 작업을 반복하는데 매번 AI 결과가 달라서 검수 비용이 큰 경우
- 팀이 합의한 개발 프로세스(계획 → 구현 → 리뷰 → PR)를 강제하고 싶은 경우
- 여러 작업을 병렬로 돌려야 하는데 git 충돌이 부담스러운 경우
- Slack·Telegram에서 작업을 던지고 결과만 받고 싶은 경우

반대로 한 번 쓰고 버릴 일회성 작업이나 자유로운 탐색에는 그냥 Claude Code를 직접 쓰는 편이 빠르다.

---

## 참고

- 저장소: https://github.com/coleam00/Archon
- 문서: https://archon.diy
- 워크플로우 작성 가이드: https://archon.diy/guides/authoring-workflows/
- 라이선스: MIT
