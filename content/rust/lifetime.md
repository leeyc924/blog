+++
title = "Rust 라이프타임(Lifetime) 이해하기"
date = 2026-03-14
description = "Rust의 라이프타임 개념과 빌림 검사기의 동작 원리를 알아봅니다."

[taxonomies]
tags = ["rust", "study"]

[extra]
series = "Rust 기초"
series_order = 2
+++

라이프타임은 참조가 유효한 범위를 나타내는 Rust의 핵심 개념입니다.
소유권과 함께 Rust의 메모리 안전성을 보장하는 중요한 메커니즘을 살펴보겠습니다.

<!-- more -->

## 라이프타임이란?

모든 참조는 **라이프타임(lifetime)**을 가집니다.
라이프타임은 해당 참조가 유효한 스코프를 의미합니다.
대부분의 경우 컴파일러가 자동으로 라이프타임을 추론하지만,
때로는 명시적으로 지정해야 합니다.

{% callout(type="info") %}
라이프타임의 주된 목적은 **댕글링 참조(dangling reference)**를 방지하는 것입니다.
이미 해제된 메모리를 참조하는 상황을 컴파일 타임에 차단합니다.
{% end %}

## 댕글링 참조 방지

```rust
// 컴파일 에러 예시
fn main() {
    let r;
    {
        let x = 5;
        r = &x; // x는 이 스코프가 끝나면 drop됨
    }
    // println!("{}", r); // 댕글링 참조! 컴파일 에러
}
```

컴파일러의 **빌림 검사기(borrow checker)**가 참조의 라이프타임이
참조 대상보다 오래 지속되지 않도록 보장합니다.

## 함수에서의 라이프타임 명시

두 참조 중 더 긴 문자열을 반환하는 함수를 생각해 보겠습니다:

```rust
fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() > y.len() {
        x
    } else {
        y
    }
}

fn main() {
    let string1 = String::from("long string");
    let result;
    {
        let string2 = String::from("xyz");
        result = longest(string1.as_str(), string2.as_str());
        println!("더 긴 문자열: {}", result);
    }
}
```

`'a`는 라이프타임 매개변수로, 두 입력 참조와 반환 참조가
같은 라이프타임을 공유한다는 것을 의미합니다.

{% callout(type="warning") %}
라이프타임 명시는 참조의 실제 수명을 변경하지 않습니다.
여러 참조 간의 관계를 컴파일러에게 알려줄 뿐입니다.
{% end %}

## 구조체에서의 라이프타임

참조를 필드로 가지는 구조체에는 라이프타임 명시가 필수입니다:

```rust
struct Excerpt<'a> {
    part: &'a str,
}

impl<'a> Excerpt<'a> {
    fn level(&self) -> i32 {
        3
    }

    fn announce(&self, announcement: &str) -> &str {
        println!("알림: {}", announcement);
        self.part
    }
}

fn main() {
    let novel = String::from("Call me Ishmael. Some years ago...");
    let first_sentence = novel
        .split('.')
        .next()
        .expect("문장을 찾을 수 없음");

    let excerpt = Excerpt {
        part: first_sentence,
    };

    println!("발췌: {}", excerpt.part);
}
```

## 라이프타임 생략 규칙

컴파일러는 세 가지 규칙으로 라이프타임을 자동 추론합니다:

1. 각 참조 매개변수에 고유한 라이프타임이 부여됨
2. 입력 라이프타임이 하나뿐이면 출력에도 동일하게 적용
3. 메서드에서 `&self`가 있으면 그 라이프타임이 출력에 적용

```rust
// 라이프타임 생략 가능 (규칙 2 적용)
fn first_word(s: &str) -> &str {
    let bytes = s.as_bytes();
    for (i, &item) in bytes.iter().enumerate() {
        if item == b' ' {
            return &s[0..i];
        }
    }
    s
}
```

## 정적 라이프타임

`'static`은 프로그램 전체 기간 동안 유효한 참조를 나타냅니다:

```rust
let s: &'static str = "이 문자열은 프로그램 전체에서 유효합니다";
```

{% callout(type="warning") %}
`'static` 라이프타임을 남용하지 마세요.
컴파일러가 라이프타임 에러를 낼 때 `'static`으로 해결하려는 유혹이 있지만,
대부분의 경우 더 나은 해결 방법이 있습니다.
{% end %}

## 정리

라이프타임은 Rust의 안전성 보장에 핵심적인 역할을 합니다.
처음에는 어렵게 느껴질 수 있지만, 소유권과 빌림의 연장선에서 이해하면
자연스럽게 익숙해집니다.

| 개념 | 설명 |
|------|------|
| `'a` | 라이프타임 매개변수, 참조 간 관계 명시 |
| `'static` | 프로그램 전체 기간 유효 |
| 빌림 검사기 | 라이프타임 유효성을 컴파일 타임에 검증 |
| 생략 규칙 | 컴파일러의 자동 라이프타임 추론 |
