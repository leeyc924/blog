---
title: "Repomix - 코드베이스를 AI에게 먹이는 가장 빠른 방법"
pubDatetime: 2026-03-25
description: "리포지토리 전체를 하나의 AI 친화적 파일로 패킹하는 오픈소스 도구 Repomix 분석 - XML/Markdown/JSON 출력, Tree-sitter 기반 토큰 압축, Secretlint 보안 검사까지"
tags: ["AI", "Developer Tools", "LLM", "Productivity"]
category: "ai"
---

## Repomix란?

[Repomix](https://github.com/yamadashy/repomix)는 리포지토리 전체를 **하나의 AI 친화적 파일**로 패킹하는 오픈소스 도구다. Claude, ChatGPT, DeepSeek 등 LLM에 코드베이스를 넘길 때 사용한다.

```
리포지토리 → Repomix → 단일 파일(XML/MD/JSON) → LLM에 전달
```

GitHub 스타 **22.6K**, JSNation Open Source Awards 2025 "Powered by AI" 부문 후보에 오를 만큼 개발자 커뮤니티에서 검증된 도구다.

---

## 왜 필요한가?

LLM에게 코드를 이해시키려면 **컨텍스트가 핵심**이다. 파일 하나만 던져서는 아키텍처를 파악할 수 없다.

기존 방식의 문제점:

| 방식 | 한계 |
|---|---|
| 파일 하나씩 복붙 | 전체 구조 파악 불가, 반복 작업 |
| 디렉토리 구조만 전달 | 실제 코드 내용 부재 |
| README만 전달 | 구현 세부사항 누락 |
| 전체 소스 복붙 | 토큰 초과, 불필요한 파일 포함 |

Repomix는 이 문제를 **한 줄 명령어**로 해결한다.

---

## 설치 및 사용

### 설치 방법

```bash
# npx로 바로 실행 (설치 없이)
npx repomix@latest

# npm 글로벌 설치
npm install -g repomix

# Homebrew (macOS/Linux)
brew install repomix

# Docker
docker run -v .:/app ghcr.io/yamadashy/repomix
```

[repomix.com](https://repomix.com)에서 브라우저 기반으로도 사용할 수 있다.

### 기본 사용

```bash
# 현재 디렉토리 패킹
repomix

# 특정 디렉토리 패킹
repomix path/to/project

# 원격 저장소 패킹
repomix --remote yamadashy/repomix

# GitHub URL로 직접 지정
repomix --remote https://github.com/yamadashy/repomix
```

### 파일 필터링

```bash
# 특정 파일만 포함
repomix --include "src/**/*.ts,src/**/*.tsx"

# 특정 파일 제외
repomix --ignore "**/*.test.ts,dist/**"

# stdin 파이핑으로 동적 파일 선택
git diff --name-only HEAD~3 | repomix --stdin
```

마지막 예시가 특히 유용하다. **최근 변경된 파일만** 패킹해서 코드 리뷰를 요청할 수 있다.

---

## 출력 형식

### XML (기본값)

```xml
<file_summary>
  This file is a packed representation of the entire repository...
</file_summary>

<directory_structure>
  src/
    components/
      Button.tsx
      Header.tsx
    utils/
      helpers.ts
</directory_structure>

<files>
  <file path="src/components/Button.tsx">
    // 파일 내용
  </file>
</files>

<instruction>
  This repository contains...
</instruction>
```

XML은 LLM이 구조화된 데이터를 파싱하기에 가장 효율적이다. Claude가 XML을 특히 잘 처리한다.

### Markdown

```bash
repomix --style markdown
```

사람이 읽기에도 편하고 AI도 잘 파싱한다. 코드 블록과 헤딩 계층구조를 사용한다.

### JSON

```bash
repomix --style json
```

프로그래밍적으로 접근할 때 유용하다. 자동화 파이프라인에 적합하다.

---

## 핵심 기능 분석

### 1. Tree-sitter 기반 토큰 압축

Repomix는 [Tree-sitter](https://tree-sitter.github.io/tree-sitter/)를 사용해 코드의 **구조적 의미를 보존하면서** 토큰 수를 줄인다.

```
원본 코드 → AST 파싱 → 핵심 구조 추출 → 압축된 표현
```

함수 시그니처, 클래스 구조, import 관계는 유지하면서 구현 세부사항을 압축한다. 대규모 리포지토리에서 컨텍스트 윈도우 제한을 넘기지 않도록 도와준다.

### 2. 토큰 카운트 표시

패킹 결과에 **파일별, 전체 토큰 수**를 보여준다. LLM의 컨텍스트 윈도우 제한 내에서 작업할 수 있도록 사전에 확인 가능하다.

```
📊 Token count: 45,230 tokens
  src/index.ts: 1,200 tokens
  src/utils.ts: 890 tokens
  ...
```

### 3. Secretlint 보안 검사

[Secretlint](https://github.com/secretlint/secretlint)를 통합해 패킹 시 **민감 정보를 자동 감지**한다.

- API 키
- 비밀번호
- 토큰
- 인증 정보

실수로 `.env` 파일이나 하드코딩된 시크릿이 LLM에 전달되는 것을 방지한다.

### 4. Git-aware 기능

```bash
# .gitignore 자동 반영
# .repomixignore 파일 지원
# Git 히스토리 포함
repomix --include-git-history --git-history-count 5
```

`.gitignore`에 등록된 파일은 자동 제외된다. `node_modules`, `dist`, `.env` 같은 파일이 포함될 걱정이 없다.

---

## 설정 파일

프로젝트 루트에 `repomix.config.json`을 만들어 설정을 영구 저장할 수 있다.

```json
{
  "output": {
    "style": "xml",
    "filePath": "repomix-output.xml"
  },
  "ignore": {
    "customPatterns": ["**/*.test.ts", "docs/**"]
  },
  "include": ["src/**", "package.json", "tsconfig.json"]
}
```

팀원 간 일관된 패킹 설정을 공유할 수 있다.

---

## 실전 활용 사례

### 코드 리뷰

```bash
# 최근 PR 변경사항만 패킹
git diff main...feature-branch --name-only | repomix --stdin
```

패킹된 파일을 LLM에 전달하고 "이 변경사항을 리뷰해줘"라고 요청한다.

### 문서 생성

```bash
repomix --include "src/**/*.ts" --style markdown
```

"이 코드베이스의 API 문서를 생성해줘"라고 요청하면 전체 구조를 이해한 상태에서 문서를 만든다.

### 테스트 작성

```bash
repomix --include "src/utils/**" --style xml
```

"이 유틸리티 함수들의 테스트 코드를 작성해줘"라고 요청한다. 함수 간 의존성까지 파악한 테스트를 생성한다.

### 리팩토링

```bash
repomix --include "src/legacy/**,src/types/**"
```

레거시 코드와 타입 정의를 함께 전달해서 안전한 리팩토링 계획을 수립한다.

---

## 생태계

| 도구 | 설명 |
|---|---|
| [repomix.com](https://repomix.com) | 웹 기반 UI |
| Chrome/Firefox 확장 | GitHub 페이지에서 바로 패킹 |
| VSCode 확장 | "Repomix Runner"로 에디터에서 직접 실행 |
| Docker 이미지 | CI/CD 파이프라인 통합 |

---

## 한계와 고려사항

- **대규모 모노레포**: 파일 수가 수만 개인 경우 `--include`로 범위를 좁혀야 한다
- **바이너리 파일**: 이미지, 폰트 등은 자동 제외되지만 확인이 필요하다
- **토큰 제한**: 아무리 압축해도 LLM의 컨텍스트 윈도우를 넘으면 의미가 없다. 토큰 카운트를 확인하고 범위를 조절해야 한다

---

## 정리

Repomix는 "코드를 AI에게 어떻게 전달할 것인가"라는 근본적인 문제를 해결한다.

| 항목 | 내용 |
|---|---|
| GitHub | [yamadashy/repomix](https://github.com/yamadashy/repomix) |
| 스타 | 22.6K+ |
| 라이선스 | MIT |
| 출력 형식 | XML, Markdown, JSON |
| 보안 | Secretlint 내장 |
| 설치 | npx, npm, Homebrew, Docker |

한 줄 요약: **`npx repomix`만 치면 AI가 코드를 이해할 준비가 된다.**
