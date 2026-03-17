---
title: "[React] ReactFiber와 렌더링 과정"
pubDatetime: 2024-12-24
description: React Fiber 아키텍처와 Virtual DOM 렌더링 과정
tags: ["개인", "Frontend"]
category: "dev"
---

## Virtual DOM

Virtual DOM은 UI의 이상적인 또는 "가상"적인 표현을 메모리에 저장하고 ReactDOM과 같은 라이브러리에 의해 "실제" DOM과 동기화하는 프로그래밍 개념입니다

## 리액트의 렌더링 과정

리액트의 렌더링 프로세스는 어플리케이션 트리 안에 있는 모든 컴포넌트들이 현재 자신들이 가지고 있는 props와 state의 값을 기반으로 어떻게 UI를 구성하고 이를 바탕으로 어떤 DOM 결과를 브라우저에 제공할 것인지 계산하는 일련의 과정을 의미하며 총 3 가지로 나뉩니다

1. 렌더링을 유발하는 단계로 createRoot의 실행 혹은 state를 업데이트하게 되면 발생한다.
2. 렌더링단계로 컴포넌트를 호출하는 단계이다. createRoot로 렌더링이 발생했다면 루트 컴포넌트를 호출하고 state의 업데이트로 인한 렌더링이라면 해당 state가 속해있는 컴포넌트를 호출한다.
3. 커밋 단계로 변경사항들을 실제 DOM에 적용하는 작업을 진행한다. 첫 커밋이라면 appendChild를 사용해서 스크린에 있는 모든 노드를 생성한다. 만약 첫 커밋이 아니라면 최소한의 작업을 통해 변경사항만을 실제 DOM에 적용한다. 그리고 이 변경사항은 렌더링 중에 계산된다.

## 렌더링이 일어나는 이유

1. 최초 렌더링
2. 리렌더링
   1. state가 변경되었을때
   2. props가 변경되었을때
   3. 컴포넌트의 key props가 변경되었을때

## JSX 문법이 해석 되는과정

### 1. 컴포넌트 작성

```javascript
function Component(){
  return(
    <div classname="title">
    	<h1>HELLO</h1>
    </div>
    );
}
```

### 2. 컴파일

```javascript
function Component(){
  return React.createElement("div", {
    className: 'title'
  }, React.createElement("h1", null, "HELLO"));
}

const element = {
  type: 'div',
  props: {
    className: 'title',
    children: [
      {
        type: 'h1',
       	children: 'HELLO',
      }
      ]
  }
};
```

### 3. Reconciliation (재조정)

### 4. 변경사항 커밋

```javascript
ReactDOM.render(element, document.getElementById('title'));
```

## Diffing Algorithm & Reconciliation (재조정)

기존의 DOM 트리를 새로운 트리로 변환하기 위하여 최소한의 연산을 하는 알고리즘을 사용합니다.

이때 알아낸 조작 방식은 알고리즘 O(n^3) 의 복잡도를 가지고 있다. 만약, 이 알고리즘을 React에 적용한다면, 1000개의 엘리먼트가 있다는 가정하에 실제 화면에 표시하기 위해 1000^3인 10억번의 비교 연산을 해야합니다.

이는 너무 비싼 연산이기에 React는 두 가지 가정을 가지고 시간 복잡도 O(n)의 새로운 Heuristic Algorithm을 구현했습니다

1. 각기 서로 다른 타입을 가진 두 요소는 다른 트리를 구축한다.
2. 개발자가 제공하는 key 프로퍼티를 통해 자식 요소의 변경 여부를 표시할 수 있다

=> 여러 번 렌더링을 거쳐도 변경되지 말아야 하는 자식 요소가 무엇인지 알아낼 수 있다.

렌더링 프로세스 단계에서 Diffing Algorithm을 통해 변경사항을 체크하고 Reconciliation(재조정)을 통해 DOM을 다시 업데이트 시켜주게 됩니다

## ReactFiber

React 16 이전에는 Stack Reconciler를 사용했으며 동작방식은 모든작업을 스택으로 처리하고 동기적으로 이루어져 작업이 오래걸린다면 메인 쓰레드에 과부하가 걸릴 정도의 고연산 작업이라면 유저 경험을 심각하게 저해시킬 정도의 렌더링 문제가 유발될 수 있었습니다.

그래서 ReactFiber가 도입되었고 이를 증분 렌더링 이라고 합니다.

주 역할은 다음과 같습니다:

- 연산을 멈추고 다시 수행할 수 있는 기능
- 각기 역할마다 다른 우선순위를 부여할 수 있는 기능
- 이전에 완료된 연산을 재사용할 수 있는 기능
- 필요가 없어진 연산을 중간에 취소하는 기능

## ReactFiber Tree

- `type`: 생성된 function Component
- `child`: 해당 Component의 가장 왼쪽에 있는 자식 노드
- `sibling`: 해당 Component의 형제 노드

Fiber Tree는 Fiber Tree, WorkInProgress Tree 총 두개로 구성되어있습니다

- **FiberTree**: 현재 모습을 담은 트리
- **WorkInProgressTree**: 작업 중인 상태를 나타내는 트리

리액트 파이버의 작업이 끝나면 리액트는 단순히 포인터만 변경해 현재 트리를 workInProgress트리로 바꿔버립니다. (이러한 기술을 더블 버퍼링이라고 하며 커밋 단계에서 수행됩니다.)

두 개의 트리가 존재하기 때문에 리액트는 미처 렌더가 끝나지 않은 모습을 노출시키지 않을 수 있고, 리액트 파이버 트리의 작업 단계는 다음과 같습니다:

1. 모든 작업은 현재 UI 렌더링을 위해 존재하는 current 트리를 기준으로 시작된다.
2. 만약 업데이트가 발생할 경우 리액트에서 새로 받은 데이터로 workInProgress 트리를 빌드하기 시작한다.
3. 이 workInProgress 트리를 빌드하는 작업이 마무리되면 다음 렌더링에 이 트리를 사용한다.
4. 이 workInProgress 트리가 UI에 최종적으로 렌더링되어 반영이 완료되면 current가 workInProgress 트리로 변경된다.

## React Fiber 도입 효과

1. 성능을 향상시켰습니다. 재조정하는 동안 다른 작업을 중지하지 않기 때문에 React는 필요할 때마다 작업을 일시 중지하거나 렌더링을 시작할 수 있게 됐습니다.
2. 훨씬 깔끔한 방식으로 오류를 처리할 수 있게 됐습니다. 자바스크립트 런타임 오류가 발생할 때마다 흰색 화면을 표시하는 대신 Error Boundary를 설정하여 문제가 발생할 경우 백업 화면을 표시할 수 있게 됐습니다.
3. 리액트 파이버의 도입으로 Error Boundary, Suspense, React.Lazy, Fragment 그리고 Concurrency Mode가 가능해졌습니다.
