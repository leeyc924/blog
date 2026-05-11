---
name: blog-post-workflow
description: 한국어 기술 블로그 글을 작성·발행하는 전체 워크플로우를 오케스트레이션. 사용자가 "블로그 글 써줘", "블로그 포스트 작성", "블로그에 정리해줘", "{주제}에 대한 글 추가", "이 글 다시 써줘", "이 포스트 업데이트/수정/보완", "글 다듬어줘" 같은 요청을 하면 반드시 이 스킬을 사용. researcher(자료 수집) + writer(초안) + editor(humanizer) + code-validator(코드 검증) 팀을 구성하여 public/blog/{category}/{title}.md 산출. 단순 질문이나 코드 수정 요청에는 사용하지 않는다.
---

# Blog Post Workflow Orchestrator

## 목표
한국어 기술 블로그 글을 자료 수집부터 발행까지 일관된 품질로 생산한다. `public/blog/{ai|dev}/{title}.md` 형식으로 산출.

## 팀 구성 (에이전트 팀 모드)
- **researcher** — 자료 수집·사실 확인
- **writer** — 초안 작성·피드백 통합 (리더 역할)
- **editor** — humanizer 기반 문체 다듬기
- **code-validator** — 코드 스니펫 검증
- **publisher** — git 커밋·원격 푸시

## Phase 0: 컨텍스트 확인

워크플로우 시작 시 현재 상태를 판별한다:

1. `_workspace/` 디렉토리 존재 여부 확인
2. 분기:
   - **초기 실행**: `_workspace/` 없음 → Phase 1부터 진행
   - **부분 재실행**: `_workspace/` 있고 사용자가 부분 수정 요청 ("editor 피드백만 다시", "코드만 재검증") → 해당 에이전트만 재호출
   - **새 글 실행**: `_workspace/` 있고 사용자가 새 주제 제공 → 기존 `_workspace/`를 `_workspace_prev/`로 이동 후 Phase 1
3. `public/blog/{category}/{title}.md` 충돌 시 사용자에게 덮어쓰기 확인

## Phase 1: 주제 정의

사용자와 짧게 합의:
- 주제, 타겟 독자(초/중/상급), 카테고리(`ai`/`dev`), 목표 분량
- `_workspace/01_topic.md`에 저장

## Phase 2: 팀 구성 및 자료 수집

1. `TeamCreate`로 4인 팀 생성 (researcher, writer, editor, code-validator). 모든 에이전트는 `model: "opus"`.
2. `TaskCreate`로 researcher에게 조사 작업 할당, writer를 리더로 지정
3. researcher가 `_workspace/02_research.md` 생성 후 writer에게 알림

## Phase 3: 초안 작성

writer가 research를 읽고 `_workspace/03_draft.md` 작성.
- 자료 부족 시 researcher에게 `SendMessage`로 추가 조사 요청
- 완료 시 editor·code-validator에게 동시 알림

## Phase 4: 병렬 검토 (팬아웃)

editor와 code-validator가 동시에 초안 검토:
- editor → `_workspace/04_editor_feedback.md`
- code-validator → `_workspace/04_code_feedback.md`

두 결과를 모두 writer가 수신할 때까지 대기.

## Phase 5: 통합 및 발행 (팬인)

writer가 피드백을 통합:
1. 두 피드백을 읽고 반영/거절 결정 (충돌 시 writer 최종 판단)
2. `public/blog/{category}/{title}.md`로 최종본 출력 (frontmatter 포함)
3. `_workspace/05_integration.md`에 어떤 피드백을 어떻게 처리했는지 기록
4. 사용자에게 발행 경로 및 통합 노트 보고

## Phase 6: 발행 (커밋·푸시)

publisher가 git 작업 수행:
1. `public/blog/{category}/{title}.md`만 명시적으로 스테이징 (`_workspace/`, 무관 파일 제외)
2. 커밋 메시지: `docs: add {topic} blog post` (신규) / `docs: update {topic} blog post` (수정)
3. `git commit` → `git push`
4. 커밋 해시·메시지·푸시 결과를 사용자에게 보고
5. 훅 실패·푸시 거부 시 우회 금지, 즉시 보고

## Phase 7: 팀 정리 및 피드백 요청

1. `TeamDelete`로 팀 정리
2. 사용자에게 결과물 개선 의견 요청 (강요 X)
3. 피드백이 있으면 Phase 0으로 돌아가 부분 재실행

## 데이터 흐름

```
사용자 입력 → 01_topic.md
              ↓
         researcher → 02_research.md
                       ↓
                   writer → 03_draft.md
                              ↓ (병렬)
                  ┌──────────┴──────────┐
              editor                code-validator
              04_editor_feedback    04_code_feedback
                  └──────────┬──────────┘
                              ↓
                          writer → 05_integration.md
                                  → public/blog/{cat}/{title}.md
                                  ↓
                              publisher → git commit + push
```

## 에러 핸들링

| 상황 | 대응 |
|------|------|
| researcher 출처 미확보 | 해당 주장 제외 또는 "확인 필요" 표기 후 진행 |
| code-validator 코드 실패 | writer가 해당 예제 교체/제거, 1회 재시도 |
| editor·writer 톤 충돌 | writer가 최종 판단, 이유를 05_integration.md에 기록 |
| 팀원 1회 재시도 후 재실패 | 해당 산출물 없이 진행, 사용자에게 보고 |

## 산출물 체크리스트

- [ ] `public/blog/{category}/{title}.md` — frontmatter(`title`, `pubDatetime`, `description`, `tags`, `category`) 포함
- [ ] `_workspace/` 중간 산출물 보존 (감사 추적)
- [ ] writer의 통합 노트에 피드백 반영 내역 명시

## 테스트 시나리오

**정상 흐름:**
- 입력: "Server Components에 대한 한국어 블로그 글 써줘, dev 카테고리, 중급 독자"
- 기대: researcher 자료 → writer 초안 → editor/code-validator 병렬 검토 → 통합 → `public/blog/dev/server-components.md` 생성

**에러 흐름:**
- 입력: 매우 최신 라이브러리 주제, 1차 출처 부족
- 기대: researcher가 "출처 미확보" 항목 명시, writer가 해당 부분 제외하고 발행, 사용자에게 부족 항목 보고
