---
title: Promptfoo
pubDatetime: 2026-03-19
description: LLM 평가 및 레드팀 테스트를 위한 오픈소스 프레임워크 Promptfoo 가이드 - 하네스 아키텍처부터 실전 활용까지
tags: ["AI", "LLM", "Testing"]
category: "ai"
---

# Promptfoo 가이드

> **LLM 애플리케이션을 체계적으로 평가하고 보안을 검증하는 오픈소스 프레임워크**
> 프롬프트 엔지니어링을 시행착오에서 데이터 기반 테스트로 전환합니다.

---

## 1. Promptfoo란?

Promptfoo는 LLM 출력을 **체계적으로 평가(eval)하고 보안을 검증(red team)** 하는 오픈소스 CLI 도구이자 Node.js 라이브러리입니다.

```
프롬프트 + 모델 + 테스트 케이스
         │
         ▼
   ┌─────────────┐
   │  Promptfoo   │
   │  평가 하네스  │
   └─────────────┘
         │
         ▼
  결과 비교 / 점수 / 리포트
```

### 핵심 특징

| 특징 | 설명 |
|------|------|
| **멀티 프로바이더** | OpenAI, Anthropic, Azure, Bedrock, Ollama 등 80+ 프로바이더 지원 |
| **자동 채점** | 문자열 매칭부터 LLM-as-Judge까지 다양한 assertion 타입 |
| **레드팀** | 40+ 공격 플러그인과 20+ 전달 전략으로 보안 취약점 탐지 |
| **로컬 실행** | 프롬프트가 외부로 전송되지 않는 프라이버시 우선 설계 |
| **CI/CD 통합** | GitHub Actions, GitLab CI 등과 자연스럽게 연동 |

### 설치

```bash
# npm
npm install -g promptfoo

# brew
brew install promptfoo

# npx (설치 없이 실행)
npx promptfoo@latest

# pip
pip install promptfoo
```

---

## 2. 하네스 아키텍처 (Harness Architecture)

Promptfoo의 핵심은 **매트릭스 실행 모델**입니다. 프롬프트, 프로바이더, 테스트 케이스 세 축의 교차곱(cross-product)으로 평가를 수행합니다.

### 2.1 세 개의 축

```
                    Provider A    Provider B    Provider C
                   ┌─────────────┬─────────────┬─────────────┐
  Prompt 1         │  (1,A,T1)   │  (1,B,T1)   │  (1,C,T1)   │  ← Test 1
                   │  (1,A,T2)   │  (1,B,T2)   │  (1,C,T2)   │  ← Test 2
                   ├─────────────┼─────────────┼─────────────┤
  Prompt 2         │  (2,A,T1)   │  (2,B,T1)   │  (2,C,T1)   │  ← Test 1
                   │  (2,A,T2)   │  (2,B,T2)   │  (2,C,T2)   │  ← Test 2
                   └─────────────┴─────────────┴─────────────┘
```

각 셀은 하나의 평가 단위(eval unit)로, 렌더링된 프롬프트를 특정 프로바이더에 전송하고 assertion으로 검증합니다.

### 2.2 5단계 평가 파이프라인

```
[1. 설정 로딩]
     │
     ▼
[2. 테스트 확장]  ← 변수 조합(cartesian product), CSV/JSONL 로딩
     │
     ▼
[3. 실행]         ← 프롬프트 렌더링 → API 호출 → 캐싱
     │
     ▼
[4. Assertion]    ← transform → assertion 평가 → 가중 점수 계산
     │
     ▼
[5. 집계]         ← EvaluateSummary 생성 → 리포트 출력
```

#### 1단계: 설정 로딩

YAML 설정 파일을 파싱하고, `file://` 참조를 해석하며, glob 패턴을 확장하고, 환경 변수를 로딩합니다. Nunjucks 템플릿 엔진으로 동적 설정이 가능합니다.

#### 2단계: 테스트 확장

변수에 배열이 포함되면 카르테시안 곱을 생성합니다. CSV, JSONL, Google Sheets, HuggingFace 데이터셋 등 외부 소스에서 테스트 데이터를 로딩할 수 있습니다. `defaultTest`의 설정이 모든 개별 테스트에 병합됩니다.

#### 3단계: 실행

각 (프롬프트, 프로바이더, 테스트) 트리플에 대해:

1. 템플릿 변수를 채워 프롬프트 렌더링
2. 프로바이더 API 호출
3. 응답 캐싱 (프롬프트 + 프로바이더 + 설정 해시 키)
4. `maxConcurrency`로 병렬 처리, `delay`로 호출 간격 제어

#### 4단계: Assertion 평가

3단계 transform 파이프라인을 적용합니다:

```
Provider transformResponse → Test options.transform → contextTransform
```

변환 후 각 assertion을 실행하고, 가중 점수를 계산하며, 임계값(threshold)을 확인합니다.

#### 5단계: 집계

`EvaluateSummary`에 테스트별 pass/fail, 점수, 명명된 메트릭, 파생 메트릭, 전체 통계를 수집합니다.

### 2.3 아키텍처 설계 원칙

| 원칙 | 설명 |
|------|------|
| **선언적 + 탈출구** | YAML 선언적 설정 기본, JS/Python 함수로 확장 가능 |
| **이중 assertion** | 결정적(regex, JSON 스키마)과 모델 기반(LLM-as-Judge)을 혼합 |
| **3단계 transform** | Provider → Test → Context 순서로 관심사 분리 |
| **프로바이더 추상화** | 80+ 프로바이더를 동일한 인터페이스로 통합 |
| **prefix 부정** | 모든 assertion에 `not-` 접두사로 반전 (예: `not-contains`) |

---

## 3. 설정 구조

### 3.1 기본 설정 파일

`promptfoo init`으로 프로젝트를 생성하면 `promptfooconfig.yaml`이 만들어집니다.

```bash
promptfoo init my-eval-project
```

```yaml
# promptfooconfig.yaml

# 프롬프트: LLM에 보낼 템플릿
prompts:
  - file://prompts/translate.txt     # 텍스트 파일
  - file://prompts/chat.json         # 채팅 형식 JSON

# 프로바이더: 테스트할 LLM 목록
providers:
  - openai:gpt-4o
  - anthropic:messages:claude-sonnet-4-5-20250929

# 기본 테스트 설정 (모든 테스트에 적용)
defaultTest:
  assert:
    - type: llm-rubric
      value: "응답이 정중하고 전문적이어야 한다"

# 테스트 케이스
tests:
  - vars:
      language: Korean
      input: Hello world
    assert:
      - type: contains
        value: "안녕"
      - type: similar
        value: "안녕하세요, 세계여"
        threshold: 0.6

  - vars:
      language: Japanese
      input: Good morning
    assert:
      - type: contains
        value: "おはよう"
```

### 3.2 프롬프트

프롬프트는 `{{variable}}` 플레이스홀더를 사용하는 템플릿입니다.

```text
# prompts/translate.txt
다음 텍스트를 {{language}}로 번역하세요.

입력: {{input}}
```

채팅 형식도 지원합니다:

```json
[
  {"role": "system", "content": "당신은 전문 번역가입니다."},
  {"role": "user", "content": "{{input}}을(를) {{language}}로 번역해주세요."}
]
```

### 3.3 프로바이더

간단한 문자열부터 상세 설정 객체까지 다양한 형태로 지정합니다.

```yaml
providers:
  # 간단 형태
  - openai:gpt-4o

  # 상세 설정
  - id: anthropic:messages:claude-sonnet-4-5-20250929
    config:
      temperature: 0.3
      max_tokens: 1024

  # 커스텀 프로바이더 (JS 함수)
  - file://providers/custom.js

  # 특정 프롬프트에만 연결
  - id: openai:gpt-4o
    prompts: [translate_prompt]
```

커스텀 프로바이더 예시:

```javascript
// providers/custom.js
module.exports = {
  id: () => 'my-custom-provider',
  callApi: async (prompt) => {
    const response = await fetch('https://my-llm-api.com/generate', {
      method: 'POST',
      body: JSON.stringify({ prompt }),
    });
    const data = await response.json();
    return { output: data.text };
  },
};
```

---

## 4. Assertion (검증)

Promptfoo의 assertion은 LLM 출력을 자동으로 검증하는 핵심 메커니즘입니다.

### 4.1 결정적 Assertion

LLM 없이 즉시 평가되는 assertion입니다.

```yaml
tests:
  - vars:
      question: "한국의 수도는?"
    assert:
      # 문자열 검증
      - type: contains
        value: "서울"
      - type: icontains          # 대소문자 무시
        value: "seoul"
      - type: regex
        value: "서울|Seoul"
      - type: starts-with
        value: "한국의 수도는"

      # 구조 검증
      - type: is-json             # JSON 형식인지
      - type: contains-json       # JSON 스키마 검증
        value:
          type: object
          required: ["answer"]

      # 성능 검증
      - type: latency
        threshold: 3000           # 3초 이내
      - type: cost
        threshold: 0.05           # $0.05 이하

      # NLP 메트릭
      - type: rouge-n
        value: "서울은 한국의 수도입니다"
        threshold: 0.5
```

### 4.2 모델 기반 Assertion

별도의 LLM을 사용하여 출력 품질을 평가합니다.

```yaml
tests:
  - vars:
      topic: "기후 변화"
    assert:
      # LLM 루브릭 (가장 많이 사용)
      - type: llm-rubric
        value: "과학적 근거를 인용하며, 편향 없이 설명해야 한다"

      # 사실 확인
      - type: factuality
        value: "지구 평균 온도는 산업혁명 이후 약 1.1도 상승했다"

      # 의미 유사도
      - type: similar
        value: "기후 변화는 인간 활동으로 인한 지구 온난화를 말합니다"
        threshold: 0.7

      # RAG 평가
      - type: context-faithfulness  # 검색된 문서에 충실한지
      - type: context-relevance     # 검색된 문서가 관련 있는지
      - type: answer-relevance      # 답변이 질문에 관련 있는지
```

### 4.3 점수 체계

```yaml
tests:
  - vars:
      input: "고객 불만 처리"
    assert:
      - type: llm-rubric
        value: "공감적 어조"
        weight: 3                 # 가중치 (기본값 1)
        metric: tone              # 명명된 메트릭으로 그룹화

      - type: contains
        value: "죄송합니다"
        weight: 1
        metric: keywords

      - type: latency
        threshold: 2000
        weight: 0                 # 정보 제공용 (점수에 미반영)
    threshold: 0.7                # 테스트 전체 합산 점수 기준
```

assertion 부정은 `not-` 접두사로 간단하게 처리합니다:

```yaml
assert:
  - type: not-contains
    value: "확실합니다"           # "확실합니다"가 포함되면 실패
  - type: not-is-json            # JSON이면 실패
```

---

## 5. CLI 사용법

### 5.1 핵심 워크플로우

```bash
# 1. 프로젝트 초기화
promptfoo init

# 2. 평가 실행
promptfoo eval

# 3. 결과 확인 (웹 UI)
promptfoo view

# 4. 결과 공유
promptfoo share
```

### 5.2 eval 주요 옵션

```bash
# 설정 파일 지정
promptfoo eval -c my-config.yaml

# 병렬 실행
promptfoo eval -j 5

# 실패한 테스트만 재실행
promptfoo eval --filter-failing results.json

# 파일 변경 감시 모드
promptfoo eval --watch

# 결과 내보내기
promptfoo eval -o results.csv -o results.html

# 반복 실행 (안정성 테스트)
promptfoo eval --repeat 3

# 중단된 평가 재개
promptfoo eval --resume

# 특정 테스트만 실행
promptfoo eval --filter-pattern "번역.*한국어"
```

### 5.3 종료 코드

| 코드 | 의미 |
|------|------|
| 0 | 모든 테스트 통과 |
| 1 | 실행 오류 |
| 100 | 테스트 실패 존재 |

CI/CD에서 종료 코드를 활용하여 자동으로 빌드를 실패시킬 수 있습니다.

---

## 6. 레드팀 (Red Teaming)

Promptfoo의 레드팀 기능은 LLM 애플리케이션의 보안 취약점을 자동으로 탐지합니다.

### 6.1 기본 사용법

```bash
# 레드팀 프로젝트 초기화
promptfoo redteam init

# 공격 생성 및 평가 실행
promptfoo redteam run

# 취약점 리포트 확인
promptfoo redteam report
```

### 6.2 설정 예시

```yaml
redteam:
  purpose: "고객 지원 챗봇 — 주문 조회, 반품 처리를 담당"
  numTests: 5
  injectVar: user_input

  # 테스트할 취약점 카테고리
  plugins:
    - harmful                  # 유해 콘텐츠 생성 시도
    - pii                      # 개인정보 유출 시도
    - id: policy               # 커스텀 정책 위반 시도
      config:
        policy: "절대로 환불 금액을 임의로 변경하지 않는다"

  # 공격 전달 전략
  strategies:
    - jailbreak                # 탈옥 시도
    - prompt-injection         # 프롬프트 주입
    - crescendo                # 점진적 에스컬레이션

  # 다국어 테스트
  language: ["ko", "en", "zh"]
```

### 6.3 공격 플러그인 카테고리

| 카테고리 | 예시 플러그인 | 설명 |
|----------|--------------|------|
| **Criminal** | cybercrime, exploitation | 범죄 관련 콘텐츠 생성 시도 |
| **Harmful** | hate, harassment, toxic | 유해 콘텐츠 생성 시도 |
| **Misinformation** | hallucination, specialized-advice | 허위 정보 및 부적절한 전문 조언 |
| **Privacy** | PII exposure, COPPA, FERPA | 개인정보 유출 시도 |
| **Security** | SQL injection, prompt extraction | 시스템 보안 취약점 탐지 |

### 6.4 공격 전략

```
[단순 전략]
  Base64, ROT13, leetspeak, 이모지 스머글링, 호모글리프

[탈옥 전략]
  Template, Composite, Iterative (LLM-as-Judge), TAP (Tree-based)

[멀티턴 전략]
  Crescendo (점진적 에스컬레이션)
  GOAT (생성형 에이전트)
  Hydra (적응형 피봇)
```

### 6.5 컴플라이언스 프레임워크

Promptfoo 레드팀은 주요 보안/규제 프레임워크에 매핑됩니다:

- OWASP LLM Top 10
- NIST AI RMF
- MITRE ATLAS
- EU AI Act
- ISO 42001

---

## 7. CI/CD 통합

### 7.1 GitHub Actions 예시

```yaml
# .github/workflows/llm-eval.yml
name: LLM Evaluation

on:
  pull_request:
    paths:
      - 'prompts/**'
      - 'promptfooconfig.yaml'

jobs:
  eval:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install promptfoo
        run: npm install -g promptfoo

      - name: Cache promptfoo
        uses: actions/cache@v4
        with:
          path: ~/.cache/promptfoo
          key: promptfoo-cache-${{ hashFiles('promptfooconfig.yaml') }}

      - name: Run evaluation
        run: promptfoo eval -o results.json
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}

      - name: Check results
        run: |
          PASS_RATE=$(jq '.results.stats.successes / .results.stats.total' results.json)
          echo "Pass rate: $PASS_RATE"
          if (( $(echo "$PASS_RATE < 0.9" | bc -l) )); then
            echo "Pass rate below 90%"
            exit 1
          fi
```

### 7.2 프로그래매틱 API

```typescript
import promptfoo from 'promptfoo';

const results = await promptfoo.evaluate({
  prompts: ['{{question}}에 대해 설명하세요'],
  providers: ['openai:gpt-4o'],
  tests: [
    {
      vars: { question: 'TypeScript 제네릭' },
      assert: [
        { type: 'contains', value: 'generic' },
        { type: 'llm-rubric', value: '기술적으로 정확해야 한다' },
      ],
    },
  ],
}, {
  maxConcurrency: 5,
});

console.log(`통과율: ${results.stats.successes}/${results.stats.total}`);
```

---

## 8. 실전 활용 패턴

### 8.1 프롬프트 A/B 테스트

```yaml
prompts:
  - file://prompts/v1_concise.txt
  - file://prompts/v2_detailed.txt

providers:
  - openai:gpt-4o

tests:
  - vars: { query: "React와 Vue 비교" }
    assert:
      - type: llm-rubric
        value: "두 프레임워크의 장단점을 균형 있게 설명해야 한다"
        metric: balance
      - type: latency
        threshold: 5000
        metric: speed
```

두 프롬프트 버전의 품질을 동일한 테스트 세트로 비교하여 어떤 버전이 더 나은지 데이터로 판단합니다.

### 8.2 모델 마이그레이션 검증

```yaml
prompts:
  - file://prompts/main.txt

providers:
  - id: openai:gpt-4o
    label: current
  - id: anthropic:messages:claude-sonnet-4-5-20250929
    label: candidate

defaultTest:
  assert:
    - type: similar
      threshold: 0.8
      provider: openai:gpt-4o    # 기존 모델 출력과 유사도 비교
```

기존 모델에서 새 모델로 전환할 때 출력 품질이 유지되는지 검증합니다.

### 8.3 RAG 파이프라인 평가

```yaml
providers:
  - file://providers/rag-pipeline.js

tests:
  - vars:
      query: "반품 정책이 어떻게 되나요?"
    assert:
      - type: context-faithfulness
        threshold: 0.9
      - type: context-relevance
        threshold: 0.7
      - type: answer-relevance
        threshold: 0.8
      - type: not-contains
        value: "확실하지 않습니다"
```

---

## 9. 하네스 아키텍처 심화

### 9.1 캐싱 전략

Promptfoo는 동일한 (프롬프트, 프로바이더, 설정) 조합에 대해 자동으로 응답을 캐싱합니다.

```
캐시 키 = hash(렌더링된 프롬프트 + 프로바이더 ID + 설정 해시)
```

이를 통해:
- 반복 실행 시 API 호출 비용 절감
- assertion만 수정한 경우 재평가 가능
- `--no-cache`로 강제 새 호출
- `promptfoo cache clear`로 캐시 초기화

### 9.2 Transform 파이프라인

3단계 transform은 관심사를 분리합니다:

```
┌──────────────────────────┐
│ Provider transformResponse│  ← 프로바이더 수준 정규화
│ (JSON 파싱, 필드 추출)    │     (모든 테스트에 적용)
└────────────┬─────────────┘
             ▼
┌──────────────────────────┐
│ Test options.transform    │  ← 테스트 수준 변환
│ (출력 포맷 변환, 필터링)  │     (개별 테스트에 적용)
└────────────┬─────────────┘
             ▼
┌──────────────────────────┐
│ contextTransform          │  ← 컨텍스트 정제
│ (RAG 컨텍스트 후처리)     │     (assertion 실행 전 최종 조정)
└────────────┬─────────────┘
             ▼
        Assertion 실행
```

### 9.3 점수 집계 구조

```yaml
# 명명된 메트릭으로 그룹화
assert:
  - type: llm-rubric
    value: "정확해야 한다"
    metric: accuracy
    weight: 2

  - type: llm-rubric
    value: "친절해야 한다"
    metric: tone
    weight: 1

# 파생 메트릭으로 조합
derivedMetrics:
  - name: quality_index
    value: "(accuracy * 2 + tone) / 3"    # MathJS 표현식
```

파생 메트릭은 명명된 메트릭을 MathJS 표현식이나 JS 함수로 조합하여 복합 품질 지표를 만듭니다.

### 9.4 MCP 서버 모드

```bash
promptfoo mcp
```

Promptfoo를 Model Context Protocol 서버로 실행하면, AI 에이전트가 프로그래매틱하게 평가를 실행할 수 있습니다.

제공되는 도구:
- `run_evaluation` — 평가 실행
- `redteam_run` — 레드팀 테스트 실행
- `validate_promptfoo_config` — 설정 파일 검증

---

## 10. 요약

| 구성 요소 | 역할 |
|-----------|------|
| **Prompts** | `{{변수}}` 템플릿으로 LLM 입력 정의 |
| **Providers** | 테스트 대상 LLM 목록 (80+ 지원) |
| **Tests** | 변수 값 + assertion으로 입출력 검증 |
| **Harness** | 3축 매트릭스 실행 + 5단계 파이프라인 |
| **Assertions** | 결정적 + 모델 기반 이중 검증 |
| **Red Team** | 40+ 공격 플러그인으로 보안 검증 |
| **CI/CD** | 자동화된 품질 게이트 |

Promptfoo는 LLM 개발에서 **"동작하는 것 같다"를 "테스트를 통과했다"로** 전환하는 도구입니다. 프롬프트 변경, 모델 마이그레이션, 보안 검증을 체계적으로 수행할 수 있으며, 하네스 아키텍처의 매트릭스 실행 모델이 이를 효율적으로 가능하게 합니다.

---

## 참고 자료

- [Promptfoo GitHub](https://github.com/promptfoo/promptfoo)
- [Promptfoo 공식 문서](https://www.promptfoo.dev/docs/intro/)
- [OWASP LLM Top 10](https://owasp.org/www-project-top-10-for-large-language-model-applications/)
