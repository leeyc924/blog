---
title: "[React] UnControlled Component"
pubDatetime: 2024-12-24
description: Controlled vs UnControlled Component 비교와 react-hook-form
tags: ["개인", "Frontend"]
category: "dev"
---

## input 값 변경 방법

input의 value를 변경하기 위한 두 가지 접근 방식:

```javascript
const ControlledComponent = () => {
  const [value, setValue] = useState('');

  const handleSubmit = () => {
    onSubmit(value);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type='text' value={value} onChange={e => setValue(e.target.value)} />
      <button type='submit'>Submit</button>
    </form>
  );
};

const UnControlledComponent = () => {
  const inputRef = useRef();

  const handleSubmit = () => {
    const value = inputRef.current.value;
    onSubmit(value);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type='text' ref={inputRef} />
      <button type='submit'>Submit</button>
    </form>
  );
}
```

ControlledComponent는 state를 사용하여 value를 관리하고, UnControlledComponent는 input tag의 기본 기능을 활용합니다.

## Controlled Component vs UnControlled Component 비교표

| 구분 | Controlled Component | UnControlled Component |
|------|---------------------|----------------------|
| 정의 | React에 의해 제어되는 컴포넌트 | DOM 자체에 의해 제어되는 컴포넌트 |
| 데이터 흐름 | 단방향 (부모 -> 자식) | 양방향 (DOM <-> React) |
| 장점 | 명확한 상태 관리, 즉시 유효성 검사, 높은 예측 가능성 | 간단한 설정, 외부 라이브러리 통합 용이 |
| 단점 | 복잡한 코드, 성능 영향 | 상태 추적 어려움, 유효성 검사 복잡 |
| 사용 예시 | 복잡한 폼 데이터, 즉각적 피드백 필요 | 간단한 폼, 초기값이 중요하지 않은 경우 |

## react-hook-form 사용 이유

UnControlled Component를 사용하면 React에 의해 제어되지 않아 데이터 관리가 어려울 수 있습니다. 폼 내 input, select, textarea 등의 값을 submit 시 가져오는 데 문제가 발생할 수 있으므로, [react-hook-form](https://react-hook-form.com/)과 같은 라이브러리를 활용하면 UnControlled Component를 더 효율적으로 다루고 폼 최적화를 할 수 있습니다.

## 참고 자료

- https://react.dev/learn/sharing-state-between-components#controlled-and-uncontrolled-components
- https://react-hook-form.com/
