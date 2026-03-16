---
title: AI Code Review
pubDatetime: 2024-10-31
description: GitHub Action과 OpenAI API를 활용한 AI 코드 리뷰 POC
tags: ["개인", "Frontend"]
---

Code Review를 AI가 해주면 얼마나 좋을까라는 의문에서 여러 글을 서치하고 한번 POC를 진행해보았습니다

Github action을 활용하고 순서는 다음과 같습니다

## Openai api key 발급

https://openai.com/blog/openai-api 접속 하여 secret key를 발급받습니다

Dashboard > APIkeys > Create new secret key

Dashboard > Usage 에서 비용을 확인할수있습니다

## Secret key 등록

repository에 발급받은 secretkey를 등록해줍니다

Github > repository > settings > secrets and variables > actions > New repository secret

## Action설정

.github/workflows/main.yml 파일 생성

```yaml
name: AI Code Reviewer

on:
  pull_request:
    types:
      - opened
      - synchronize
permissions: write-all
jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repo
        uses: actions/checkout@v3

      - name: AI Code Reviewer
        uses: leeyc924/ai-codereviewer@main
        with:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
          OPENAI_API_MODEL: "gpt-4-1106-preview"
          exclude: "**/*.json, **/*.md"
```

간단한 poc를 위해 오픈소스인 https://github.com/freeedcom/ai-codereviewer 를 fork로 가져와 runner로 활용하였습니다

pr요청을 하면 다음과같이 AI가 review를 하게 됩니다
