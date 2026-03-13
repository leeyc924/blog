+++
title = "Rust 소유권(Ownership) 완전 정복"
date = 2026-03-13
description = "Rust의 핵심 개념인 소유권 시스템을 예제와 함께 깊이 있게 알아봅니다."
tags = ["rust", "study"]

[extra]
series = "Rust 기초"
series_order = 1
+++

Rust를 처음 접하면 가장 먼저 만나는 독특한 개념이 바로 **소유권(Ownership)**입니다.
가비지 컬렉터 없이도 메모리 안전성을 보장하는 Rust의 핵심 메커니즘을 살펴보겠습니다.

<!-- more -->

## 소유권이란?

소유권은 Rust 컴파일러가 메모리를 관리하는 방식입니다.
다른 언어에서는 가비지 컬렉터(GC)가 사용하지 않는 메모리를 자동으로 회수하거나,
프로그래머가 직접 메모리를 할당하고 해제해야 합니다.

Rust는 제3의 접근법을 사용합니다: **컴파일 타임에 소유권 규칙을 검사**하여
런타임 비용 없이 메모리 안전성을 보장합니다.

{% callout(type="info") %}
소유권 시스템은 런타임 성능에 영향을 주지 않습니다.
모든 검사는 컴파일 타임에 이루어집니다.
{% end %}

## 소유권 규칙

Rust의 소유권 규칙은 세 가지로 요약할 수 있습니다:

1. Rust의 각 값은 **소유자(owner)**라고 불리는 변수를 가진다.
2. 한 번에 하나의 소유자만 존재할 수 있다.
3. 소유자가 스코프를 벗어나면 값은 **drop**된다.

### 이동(Move) 시맨틱

```rust
fn main() {
    let s1 = String::from("hello");
    let s2 = s1; // s1의 소유권이 s2로 이동

    // println!("{}", s1); // 컴파일 에러! s1은 더 이상 유효하지 않음
    println!("{}", s2); // OK
}
```

### 클론(Clone)

값을 복사하고 싶다면 `clone()`을 명시적으로 호출해야 합니다:

```rust
fn main() {
    let s1 = String::from("hello");
    let s2 = s1.clone(); // 깊은 복사

    println!("s1 = {}, s2 = {}", s1, s2); // 둘 다 유효
}
```

{% callout(type="warning") %}
`clone()`은 힙 데이터의 깊은 복사를 수행하므로 비용이 클 수 있습니다.
성능이 중요한 코드에서는 참조를 사용하는 것이 좋습니다.
{% end %}

## 참조와 빌림

소유권을 이전하지 않고 값을 사용하려면 **참조(reference)**를 활용합니다.
이를 **빌림(borrowing)**이라고 합니다.

### 불변 참조

```rust
fn calculate_length(s: &String) -> usize {
    s.len()
} // s는 참조일 뿐이므로 drop되지 않음

fn main() {
    let s1 = String::from("hello");
    let len = calculate_length(&s1);

    println!("'{}'의 길이는 {}입니다.", s1, len);
}
```

### 가변 참조

```rust
fn add_world(s: &mut String) {
    s.push_str(", world");
}

fn main() {
    let mut s = String::from("hello");
    add_world(&mut s);

    println!("{}", s); // "hello, world"
}
```

{% callout(type="error") %}
같은 스코프에서 가변 참조는 하나만 존재할 수 있습니다.
이 규칙은 데이터 레이스를 컴파일 타임에 방지합니다.
{% end %}

```rust
fn main() {
    let mut s = String::from("hello");

    let r1 = &mut s;
    // let r2 = &mut s; // 컴파일 에러! 가변 참조는 하나만 가능

    println!("{}", r1);
}
```

## 슬라이스 타입

슬라이스는 컬렉션의 일부분에 대한 참조입니다.
소유권을 가지지 않으면서 연속된 요소들을 참조할 수 있습니다.

### 문자열 슬라이스

```rust
fn first_word(s: &str) -> &str {
    let bytes = s.as_bytes();

    for (i, &item) in bytes.iter().enumerate() {
        if item == b' ' {
            return &s[0..i];
        }
    }

    s
}

fn main() {
    let sentence = String::from("hello world");
    let word = first_word(&sentence);

    println!("첫 번째 단어: {}", word); // "hello"
}
```

### 배열 슬라이스

```rust
fn sum_slice(numbers: &[i32]) -> i32 {
    numbers.iter().sum()
}

fn main() {
    let arr = [1, 2, 3, 4, 5];
    let slice = &arr[1..4]; // [2, 3, 4]

    println!("합계: {}", sum_slice(slice)); // 9
}
```

{% callout(type="success") %}
슬라이스를 활용하면 불필요한 데이터 복사 없이 안전하게 데이터의 일부를 참조할 수 있습니다.
{% end %}

## 정리

소유권 시스템은 Rust가 메모리 안전성과 성능을 동시에 달성하는 핵심 메커니즘입니다.

| 개념 | 설명 |
|------|------|
| 소유권 이동 | 값의 소유자가 변경됨, 이전 소유자는 무효화 |
| 불변 참조 `&T` | 여러 개 동시 가능, 수정 불가 |
| 가변 참조 `&mut T` | 하나만 가능, 수정 가능 |
| 슬라이스 | 컬렉션의 일부에 대한 참조 |

다음 글에서는 소유권과 밀접한 관련이 있는 **라이프타임(Lifetime)**에 대해 알아보겠습니다.
