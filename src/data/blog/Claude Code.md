---
title: Claude Code
pubDatetime: 2026-03-14
description: Claude Code 설치 및 활용 가이드
tags: ["AI"]
---

## 공식 문서 및 리소스

공식 가이드 문서: [https://code.claude.com/docs/en/overview](https://code.claude.com/docs/en/overview)

- 영어 버전이 가장 최신 버전 (한국어 버전은 문서 업데이트가 늦음)
- 문서 내 "Ask AI" 버튼으로 어시스턴트에게 질문 가능 (답변 할루시네이션 주의)

## 설치하기

```bash
curl -fsSL https://claude.ai/install.sh | bash
```

> [https://code.claude.com/docs/ko/quickstart](https://code.claude.com/docs/ko/quickstart)

## 핵심 개념

### 에이전트 하네스(Agent Harness)

에이전트 하네스는 에이전트 프레임워크와 런타임을 감싸서 즉시 사용 가능한 상태로 제공하는 상위 수준의 시스템을 의미합니다. 단순히 에이전트의 논리를 정의하는 수준을 넘어, **기본 프롬프트, 도구 세트, 워크플로 등을 미리 설정해 두어 개발자가 에이전트를 빠르게 실행**할 수 있도록 돕습니다. 대표적인 사례로는 ClaudeCode와 랭체인의 DeepAgents가 있습니다.

> [blog.langchain.com/agent-frameworks-runtimes-and-harnesses-oh-my](https://www.blog.langchain.com/agent-frameworks-runtimes-and-harnesses-oh-my/)

### 대규모 언어 모델(LLM, Large Language Model)

Claude Code는 3가지 모델을 제공합니다. Opus가 성능이 가장 좋습니다.

- **Models**: Claude Haiku 4.5, Claude Sonnet 4.6, Claude Opus 4.6,
- **Context window(input + output)**: 200K tokens, (Sonnet 4.5와 Opus 4.6은 1M tokens(beta) 가능함)
- **Max output**: 64K tokens(Haiku, Sonnet), 128k tokens(Opus 4.6)
- **knowledge cutoff**: 2025년 2월, 2025년 8월, 2025년 5월

> https://artificialanalysis.ai/models
> [https://platform.claude.com/docs/ko/about-claude/models/overview](https://platform.claude.com/docs/ko/about-claude/models/overview)

### 컨텍스트 윈도우(Context window)

컨텍스트 윈도우(Context window)는 모델의 “작업 메모리(Working Memory)”를 의미합니다. 모델이 새로운 텍스트를 생성할 때 참조할 수 있는 텍스트의 전체 양과 생성하는 새로운 텍스트를 나타냅니다.

![[context-window.png]]

> [https://platform.claude.com/docs/ko/build-with-claude/context-windows](https://platform.claude.com/docs/ko/build-with-claude/context-windows)

### HITL(human-in-the-loop)

모델이 작업을 수행하는 과정 중에 **사람이 직접 개입**하여 의사결정을 내리거나 결과를 검토 및 수정하는 방식을 말합니다.

> [https://www.ibm.com/kr-ko/think/topics/human-in-the-loop*](https://www.ibm.com/kr-ko/think/topics/human-in-the-loop*)

### Planning

에이전트가 구조화된 작업 목록을 관리할 수 있도록 `TaskCreate`, `TaskUpdate` 도구를 제공합니다. To-do List는 에이전트가 복잡한 목표를 달성하기 위해 수행해야 할 단계들을 관리하는 **핵심 계획 메커니즘**입니다. `/todos` 명령으로 현재 작업중인 TODO 항목을 확인할 수 있습니다.

### 컨텍스트 오프로딩 (Context Offloading)

**Context Offloading**은 LLM의 **컨텍스트 윈도우 제한**을 극복하기 위한 기술입니다. 에이전트가 작업을 수행하면서 대화 히스토리와 중간 결과가 계속 쌓이면 컨텍스트 윈도우가 가득 차게 됩니다. 이때 현재 작업에 즉시 필요하지 않은 정보를 임시 저장소(FileSystem, 메모리 등)에 “오프로드”했다가 필요할 때 다시 불러오는 방식입니다.

![[context-offloading.png]]

**FileSystem**

ClaudeCode는 RAG가 아닌 파일 검색 기법을 사용합니다. (유닉스 명령어 사용 grep, glob)

> [RAG를 사용하지 않고 LangChain의 챗봇을 재구축한 이유와 그 과정에서 얻은 교훈 - 랭체인 블로그](https://www.blog.langchain.com/rebuilding-chat-langchain/)_

### 컨텍스트 격리 (Context Isolation)

**Context Isolation**은 여러 하위 에이전트나 작업이 **각각 독립적인 컨텍스트**를 갖도록 격리하는 기술입니다. Context Offloading와 함께 사용되어 에이전트 시스템의 확장성과 안정성을 높입니다

![[context-isolation.png]]

## 설정(Settings)

[*](https://code.claude.com/docs/ko/settings)[https://code.claude.com/docs/ko/settings*](https://code.claude.com/docs/ko/settings*)

### Settings 파일 계층 구조

우선순위:

1. `.claude/settings.local.json`
2. `.claude/settings.json`
3. `~/.claude/settings.json`

### MCP Servers 설정

> [https://modelcontextprotocol.io/docs/getting-started/intro](https://modelcontextprotocol.io/docs/getting-started/intro)

## 메모리 관리

Claude Code에서 세션 간 메모리를 관리하는 방법입니다.

[*](https://code.claude.com/docs/ko/memory)[https://code.claude.com/docs/ko/memory*](https://code.claude.com/docs/ko/memory*)

### 사용자 메모리

모든 프로젝트에 적용됨

- `~/.claude/CLAUDE.md`

### 프로젝트 메모리

- `./CLAUDE.md` (git을 통한 팀 멤버 공유)
- `./.claude/CLAUDE.md`
- `CLAUDE.local.md` (자동으로 .gitignore에 추가됨, 본인만 사용)

### 프로젝트 규칙

- `./.claude/rules/*.md`

## Statusline

Claude Code 인터페이스 하단에 상태 정보(모델, 컨텍스트, 리밋 등)를 표시

[*](https://code.claude.com/docs/ko/statusline)[https://code.claude.com/docs/ko/statusline*](https://code.claude.com/docs/ko/statusline*)

### Statusline 관련 오픈소스 도구

- [https://github.com/uppinote20/claude-dashboard](https://github.com/uppinote20/claude-dashboard)
- [https://github.com/jarrodwatts/claude-hud](https://github.com/jarrodwatts/claude-hud)
- [https://github.com/sirmalloc/ccstatusline](https://github.com/sirmalloc/ccstatusline)

## 출력 스타일 설정

출력(응답) 스타일에 대한 지침을 추가

[*](https://code.claude.com/docs/ko/output-styles)[https://code.claude.com/docs/ko/output-styles*](https://code.claude.com/docs/ko/output-styles*)

## 자주 사용하는 명령어

|명령|목적|
|---|---|
|`/clear`|대화 기록 지우기|
|`/plan`|plan mode 전환|
|`/rewind`|대화 및/또는 코드 되감기|
|`/compact [instructions]`|선택적 포커스 지침으로 대화 압축|
|`/context`|현재 컨텍스트 사용을 색상 그리드로 시각화|
|`/mcp`|MCP 서버 연결 및 OAuth 인증 관리|
|`/rename <name>`|더 쉬운 식별을 위해 현재 세션 이름 바꾸기|
|`/resume [session]`|ID 또는 이름으로 대화 재개하거나 세션 선택기 열기|

> [https://code.claude.com/docs/ko/interactive-mode#기본-제공-명령](https://code.claude.com/docs/ko/interactive-mode#%EA%B8%B0%EB%B3%B8-%EC%A0%9C%EA%B3%B5-%EB%AA%85%EB%A0%B9*)

## 자주 사용하는 단축키

### 일반 제어

| 단축키           | 기능명               | 상세 설명                                                                                                                             |
| ------------- | ----------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `Ctrl+Z`      | 잠깐 멈추고 터미널 쓰기     | Claude를 백그라운드로 보내고, 다른 터미널 작업 후 `fg`로 복귀. 즉시 작업 중단하고 다른 작업을 할 때 사용.                                                               |
| `Ctrl+G`      | 멀티라인 편집           | 긴 프롬프트 작성하거나 Plan 모드에서 중간 수정할 때 에디터 열고 수정 가능. `AskUserQuestion`에서 사용자의 반응도 받을 수 있음.                                               |
| `Ctrl+S`      | 프롬프트 임시 저장(Stash) | 쓰던 프롬프트 잠깐 저장하고 다른 명령 실행. 다시 `Ctrl+S` 누르면 복구됨.                                                                                    |
| `Esc+Esc`     | 되돌리기 + 대화 한계 풀 때  | Claude가 이상한 방향으로 갈 때 되돌리기. Git commit 없이도 `rewind` 가능.                                                                            |
| `Ctrl+R`      | 역방향 명령 기록 검색      | 이전 명령을 대화형으로 검색                                                                                                                   |
| `Shift+Enter` | 개행                | 줄바꿈 (메시지 전송하지 않고 다음 줄로 이동) [참고](https://code.claude.com/docs/ko/interactive-mode#%EC%97%AC%EB%9F%AC-%EC%A4%84-%EC%9E%85%EB%A0%A5) |

`Ctrl+G` 단축키로 열리는 기본 텍스트 편집기를 변경하려면 `EDITOR` 환경 변수를 설정해야 합니다. 셸 구성 파일(예: `~/.zshrc`)에 다음과 같이 추가합니다.

```bash
export EDITOR="vim" # vim 사용
export EDITOR="nano" # nano 사용
export EDITOR="code --wait" # VS Code 사용
```

### 텍스트 편집

|단축키|기능명|상세 설명|
|---|---|---|
|`Ctrl+W`|단어 단위 삭제|Backspace 대신 단어 단위로 삭제. 오타 수정, 파일명 바꿀 때 유용.|
|`Ctrl+A` / `Ctrl+E`|줄 처음/끝 점프|긴 프롬프트 앞부분 수정하거나 끝에 추가할 때, 화살표 없이 빠르게 이동 가능.|
|`Ctrl+U`|커서 이전까지 삭제|현재 행에서 커서 이전까지의 내용 전체 삭제|
|`Ctrl+K`|커서 이후 삭제|현재 행에서 커서 이후의 내용 전체 삭제|
||||

### 빠른 명령

|단축키|기능명|상세 설명|
|---|---|---|
|`!`|Bash 모드 전환|입력행에 `!`를 입력하면 터미널 명령어 실행 가능. Claude한테 시키기 어려운 간단한 명령어 처리에 사용.|
|`@`|파일 경로 자동 완성|해당 폴더 또는 파일을 컨텍스트에 추가.|
|`/`|슬래시 명령어|[기본 제공 명령](https://code.claude.com/docs/ko/interactive-mode#built-in-commands) 및 [skills](https://code.claude.com/docs/ko/skills) 참조|

> *참고: [https://code.claude.com/docs/ko/interactive-mode*](https://code.claude.com/docs/ko/interactive-mode*)

## 워크 플로우

[*](https://code.claude.com/docs/ko/common-workflows)[https://code.claude.com/docs/ko/common-workflows*](https://code.claude.com/docs/ko/common-workflows*)

- [https://code.claude.com/docs/ko/best-practices](https://code.claude.com/docs/ko/best-practices)
- 참고: [Claude Code 창시자 Boris Cherny가 Claude Code를 사용하는 방법](https://news.hada.io/topic?id=25570)
    - **Plan 모드 사용하기**
        - 관련 연구 논문: [https://arxiv.org/abs/2305.04091](https://arxiv.org/abs/2305.04091) _→ 계획(Plan을 세운 뒤, 그 계획에 따라 실행하면, 코딩뿐만 아니라 수학적, 상식적 추론이 필요한 프로그래밍 문제에서 성능 향상이 뚜렷하게 나타났다._
    - 모든 작업에 **Opus 4.6 with thinking** 사용
    - Git worktree 사용하여 작업을 병렬 수행
    - 서브에이전트와 스킬 적극 활용

### 확장 기능

- [**~~Commands**](https://code.claude.com/docs/ko/common-workflows#%EA%B0%9C%EC%9D%B8-%EC%8A%AC%EB%9E%98%EC%8B%9C-%EB%AA%85%EB%A0%B9%EC%96%B4-%EB%A7%8C%EB%93%A4%EA%B8%B0): 자주 사용하는 작업을 `/` 명령어로 만들어 빠르게 실행(Skills로 대체 가능함)~~
- [**Skills**](https://code.claude.com/docs/ko/skills): 에이전트가 특정 작업을 수행하기 위한 재사용 가능한 도구 및 워크플로우
    - 스킬 생성을 도와주는 스킬: [https://skills.sh/anthropics/skills/skill-creator](https://skills.sh/anthropics/skills/skill-creator)
    - Claude Skills 구축을 위한 공식 가이드: [https://claude.com/blog/complete-guide-to-building-skills-for-claude](https://claude.com/blog/complete-guide-to-building-skills-for-claude) ([한국어 번역](https://www.threads.com/@steady__study.dev/post/DUc9mSlAZGs?xmt=AQF0aBdcwYMzByC9WEAJMZKX05DonA0mdho0MUWqo6jWQw))
- [**SubAgents**](https://code.claude.com/docs/ko/sub-agents): 특정 역할과 전문성을 가진 하위 에이전트를 생성하여 복잡한 문제 해결
- [**Hooks**](https://code.claude.com/docs/ko/hooks-guide): 에이전트 실행 라이프사이클의 특정 시점에 자동으로 실행되는 커스텀 스크립트 ([참조](https://code.claude.com/docs/ko/hooks))
- [**Plugins**](https://code.claude.com/docs/ko/discover-plugins): Claude Code 기능을 확장하는 외부 통합 및 도구/스킬/서브에이전트 등을 패키징
- [**Agent Teams](https://code.claude.com/docs/en/agent-teams):** 하나의 리더 에이전트가 여러 팀원 에이전트(독립적인 Claude Code 인스턴스)를 생성하고 공유 태스크 리스트와 메시징을 통해 병렬로 협업시키는 실험적 기능*(26.2.6 공개)*
- 2.1.50에 worktree 기능 내장: [https://x.com/bcherny/status/2025007394967957720](https://x.com/bcherny/status/2025007394967957720)

---

### Skills와 SubAgents의 차이점

- **Skills**는 에이전트가 직접 코드를 읽고 수정하는 등의 일련의 작업을 수행하기 위한 ’레피시’이다. -> **‘무엇을 어떻게’** 작업할 것인가에 집중.
- **Sub-agents**는 복잡한 문제를 효율적으로 풀기 위해 특정 역할을 부여해 소환하는 ’전문가’라고 할 수 있다. -> 해당 **‘전문가’** 가 도구를 사용하여 복잡한 문제를 푸는 것에 집중.

### Sub Agent workflow 예시: 코드 리뷰 자동화

`skills` 필드를 사용하여 필요한 스킬을 미리 로드합니다. 에이전트가 해당 스킬들을 활용하여 순차적으로 작업을 수행할 수 있습니다.

```markdown
---
name: full-review
skills:
  - code-review
  - security-check
  - testing-patterns
---

Follow these steps in order:
1. First, review code using code-review skill
2. Then, check security using security-check skill
3. Finally, verify tests using testing-patterns skill
```

---

> **Sub-agent(에이전트)** 는 특정 작업을 수행하는 전문가이고, **agent-skill(스킬)** 은 여러 에이전트를 조율하여 워크플로우를 실행하는 오케스트레이터입니다. 스킬은 에이전트를 도구로 사용하여 복잡한 작업을 완료합니다. - 출처: [https://github.com/Yeachan-Heo/oh-my-claudecode/blob/main/docs/ARCHITECTURE.md](https://github.com/Yeachan-Heo/oh-my-claudecode/blob/main/docs/ARCHITECTURE.md)

---

## 추가 유용한 팁과 리소스

### 유용한 별칭(Alias) 설정

```bash
# Claude Code Aliases
alias cc='claude' # 대화형 모드
alias ccc='claude -c' # 최근 대화 계속 (continue)
alias ccr='claude -r' # 이전 대화 재개 (resume)
alias ccp='claude -p' # 일회성 쿼리 실행 (prompt)
alias cccm='claude commit' # Git 커밋 생성
alias ccplan='claude --permission-mode plan' # Plan Mode에서 새 세션 시작하기
alias ccd='claude --dangerously-skip-permissions' # 권한 검사 건너뛰기
```

> *CLI 명령어 참고: [https://code.claude.com/docs/ko/cli-reference*](https://code.claude.com/docs/ko/cli-reference*)

### 클로드 코드 하네스 관련 오픈소스

- [superpowers](https://github.com/obra/superpowers): TDD, YAGNI, DRY 원칙을 따르는 소프트웨어 개발 방법론 프레임워크.
    - 참고: [2025년 10월 현재 내가 코딩 에이전트를 사용하는 방법 - GeekNews](https://news.hada.io/topic?id=23620)
- [everything-claude-code](https://github.com/affaan-m/everything-claude-code): Anthropic 해커톤 우승자가 검증한 포괄적 설정 모음.
    - 참고: [Everything Claude Code 소개](https://discuss.pytorch.kr/t/everything-claude-code-anthropic-x-forum-ventures-claude-code/8740)
- [oh-my-claudecode](https://github.com/Yeachan-Heo/oh-my-claudecode): [OMO](https://github.com/code-yeongyu/oh-my-opencode)를 ClaudeCode용으로 재작성한 멀티 에이전트 오케스트레이션
    - 참고: [(유튜브) Oh my Claude Code 개발자 활용 가이드 세미나](https://www.youtube.com/live/3aJxJK19Tf8)
- [https://github.com/modu-ai/moai-adk:](https://github.com/modu-ai/moai-adk:) Claude Code 환경에서 28개의 전문 AI 에이전트와 52개의 Skill을 활용해 설계(SPEC)부터 구현(TDD/DDD) 및 검증까지 자동화하는 고성능 에이전틱(Agentic) AI 개발 도구 세트 / 모두의AI Goos
- [wshobson/agents](https://github.com/wshobson/agents): 인텔리전트 자동화 및 멀티에이전트 오케스트레이션 시스템. **108개의 전문 AI 에이전트** , **15개의 멀티 에이전트 워크플로우 오케스트레이터**, **129개의 에이전트 스킬**, 그리고 **72개의 개발 도구를** 결합한 포괄적인 시스템이며, Claude Code용으로 **특화된 72개의 단일 목적 플러그인**으로 구성.
- [vercel-labs-agent-skills](https://github.com/vercel-labs/agent-skills): Vercel 엔지니어링 팀의 공식 가이드라인 스킬셋

### **Skills 마켓**

- Vercel: [https://skills.sh/](https://skills.sh/)
- Manus: [https://skillsmp.com/](https://skillsmp.com/)
- [https://www.aitmpl.com/skills](https://www.aitmpl.com/skills)

### 기타 추가 리소스

- 클로드 코드 제작자 보리스 처니(Boris Cherny) X: [x.com/bcherny](https://x.com/bcherny)
- OpenClaw 제작자 페터 슈타인베르거(Peter Steinberger) X: [https://x.com/steipete](https://x.com/steipete)
- 바이브 코더 창시자 안드레아 카르파티(Andrej Karpathy) X: [https://x.com/karpathy](https://x.com/karpathy)
- [Andrej Karpathy의 최근 몇 주간 Claude 코딩 경험에 대한 단상 (news.hada.io)](https://news.hada.io/topic?id=26183)
- [https://news.hada.io/topic?id=26222](https://news.hada.io/topic?id=26222)
- [https://news.hada.io/topic?id=25570](https://news.hada.io/topic?id=25570)
- [https://news.hada.io/topic?id=26526](https://news.hada.io/topic?id=26526)
- [https://steipete.me/posts/2025/shipping-at-inference-speed](https://steipete.me/posts/2025/shipping-at-inference-speed)
- 맥북 상단바에서 사용량 체크: [https://github.com/steipete/CodexBar](https://github.com/steipete/CodexBar)
- ZAI의 GLM 5 모델 추천(월$3): [https://z.ai/subscribe](https://z.ai/subscribe)

### 추천 MCP

- **Exa 웹검색/코드검색:** [https://exa.ai/docs/reference/exa-mcp](https://exa.ai/docs/reference/exa-mcp)
- **프로젝트 코드 시멘틱 검색 MCP**: [https://github.com/oraios/serena](https://github.com/oraios/serena)
- **랭체인/랭그래프 doc MCP**: [`claude mcp add --transport http langchain-doc <https://docs.langchain.com/mcp`>](https://docs.langchain.com/mcp)
- **Grep MCP**: [https://aisparkup.com/posts/3615](https://aisparkup.com/posts/3615)
- **Figma MCP**: [https://help.figma.com/hc/ko/articles/32132100833559-Figma-MCP-서버-가이드](https://help.figma.com/hc/ko/articles/32132100833559-Figma-MCP-%EC%84%9C%EB%B2%84-%EA%B0%80%EC%9D%B4%EB%93%9C)

#### `.mcp.json` 예시

```JSON
{
	"mcpServers": {
		"figma": {
			"type": "http", "url": "https://mcp.figma.com/mcp"
		},
		"exa": {
			"type": "http",
			"url": "https://mcp.exa.ai/mcp?tools=web_search_exa,get_code_context_exa"
		},
		"grep": {
			"type": "http",
			"url": "https://mcp.grep.app"
		},
		"serena": {
			"command": "uvx",
			"args": [
				"--from",
				"git+https://github.com/oraios/serena",
				"serena",
				"start-mcp-server",
				"--context",
				"ide-assistant",
				"--open-web-dashboard",
				"False"
			]
		}
	}
}
  ```
