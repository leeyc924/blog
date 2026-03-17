---
title: "[React] Polymorphic component"
pubDatetime: 2024-01-28
description: React에서 Polymorphic 컴포넌트 패턴 구현하기
tags: ["개인", "Frontend"]
category: "dev"
---

## Polymorphic component란?

- 다양한 Semantic을 표현할 수 있는 UI 컴포넌트
- 다양한 속성을 가질 수 있는 UI 컴포넌트
- TypeScript를 사용하면 정적 유형 지정을 활용하여 강력한 유형의 다형성 구성 요소를 생성하고 유형 안전성을 제공하고 잠재적인 런타임 오류를 방지

## 개발

버튼 컴포넌트를 만든다고하면 다음과 같이 구성될수 있고 anchor 태그와 button 태그가 사용될 수 있습니다

```typescript
interface ButtonProps {
    children: ReactNode;
    onClick(e: HTMLButtonElement | HTMLAnchorElement)?: void;
    href?: string;
    target?: HTMLAttributeAnchorTarget;
    className?: string;
    size?: 'xlarge' | 'large' | 'medium' | 'small';
    color?: 'primary' | 'secondary';
}

const Button = ({ children, onClick, href, target, className, size, color }: ButtonProps) => {
    const StyledButton = (
        <span className={`button__box--${size} button__box--${color}`}>
            <Typography>{children}</Typography>
        </span>
    );

    if (href) {
        return (
            <a className="button" href={href} target={target}>
                {StyledButton}
            </a>
        );
    }
    return (
        <button className="button" onClick={onClick}>
            {StyledButton}
        </button>
    );
};
```

위와 같은 방식으로 제작시 다음과 같은 문제가 발생합니다

1. anchor 태그 또는 button 태그에 필요한 attr이 생길때마다 ButtonProps를 정의해주어야 하고 추가 해주어야한다.
2. Next에서 사용시 anchor태그 대신 Link 컴포넌트를 사용해야한다.
3. props에 href를 미사용하였을때는 onClick props는 필수값이지만 현재는 무조건 optional로 되어있다.

따라서 사용성이 더 용이할수있게 컴포넌트를 설계하여야합니다

[generic](https://www.typescriptlang.org/docs/handbook/2/generics.html#handbook-content)을 활용하여 다형성 컴포넌트를 개발할수있습니다

```typescript
type PolymorphicComponentProps<T extends React.ElementType, PropsType = Record<string, unknown>> =
  { component?: T; } & PropsType &
    React.ComponentPropsWithoutRef<T> & { ref?: React.ComponentPropsWithRef<T>['ref']; };

interface ButtonProps {
  children: React.ReactNode;
  size?: 'xlarge' | 'large' | 'medium' | 'small';
  color?: 'primary' | 'secondary' | 'black';
}

const Button = <T extends React.ElementType = 'button'>({ component, children, size, color, ...props }: PolymorphicComponentProps<T, ButtonProps>) => {
  const Component = component ?? 'button';

  return (
    <Component className="button" {...props}>
        <span className={`button__box--${size} button__box--${color}`}>
            <Typography>{children}</Typography>
        </span>
    </Component>
  )
};
```

## 사용예시 및 타입추론

PolymorphicComponentProps type은 component props에 element를 받아 React.ElementType과 PropsType을 제네릭으로 해당 element의 attr 타입 및 PropsType을 합쳐 [Intersection type](https://www.typescriptlang.org/docs/handbook/2/objects.html#intersection-types)으로 추론하게 됩니다

사용 예시는 다음과 같습니다

```typescript
// Next에서 사용
<Button component={Link} href="https://leeyc924.tistory.com" prefetch={false}>버튼</Button>
// React, react-router에서 사용
<Button component={Link} to="https://leeyc924.tistory.com">버튼</Button>
// button으로 사용
<Button onClick={handleClick} color="secondary">버튼</Button>
```

component props에 anchor를 넣었을때 onClick의 타입은 React.MouseEventHandler<HTMLAnchorElement>로 추론되는것을 확인할수 있습니다

component props에 button을 넣었을때 href 타입은 에러가 발생합니다

component props에 Nextjs의 Link를 넣으면 prefetch와 같은 props가 추론되는것을 확인할수있습니다

## 참고자료

- [https://kciter.so/posts/polymorphic-react-component](https://kciter.so/posts/polymorphic-react-component)
