# CLAUDE.md

## 하네스: 한국어 기술 블로그 작성/발행

**목표:** 자료 수집부터 발행까지 일관된 품질로 한국어 기술 블로그 글을 생산한다.

**트리거:** 블로그 글 작성/수정/보완 관련 요청 시 `blog-post-workflow` 스킬을 사용하라. 단순 질문, 사이트 코드 수정, 단일 파일 편집 요청은 직접 응답 가능.

**블로그 글 형식:** `public/blog/{ai|dev}/{title}.md`. frontmatter 필수 필드: `title`, `pubDatetime`, `description`, `tags`, `category`.

**변경 이력:**
| 날짜 | 변경 내용 | 대상 | 사유 |
|------|----------|------|------|
| 2026-05-11 | 초기 구성 (researcher/writer/editor/code-validator 4인 팀 + blog-post-workflow 오케스트레이터) | 전체 | - |
| 2026-05-11 | publisher 에이전트 추가 (커밋·푸시 자동화), 오케스트레이터에 Phase 6 발행 단계 추가 | agents/publisher.md, skills/blog-post-workflow | 발행 마무리까지 하네스에 포함 요청 |
