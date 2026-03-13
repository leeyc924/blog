import { describe, it, expect } from "vitest";
import { slugifyStr, slugifyAll } from "../slugify";

describe("slugifyStr", () => {
  it("should slugify Latin strings to lowercase kebab-case", () => {
    expect(slugifyStr("Hello World")).toBe("hello-world");
  });

  it("should handle strings with numbers", () => {
    expect(slugifyStr("TypeScript 5.0")).toBe("typescript-5.0");
  });

  it("should handle acronyms like E2E", () => {
    expect(slugifyStr("E2E Testing")).toBe("e2e-testing");
  });

  it("should handle non-Latin characters (Korean)", () => {
    const result = slugifyStr("한국어 테스트");
    expect(result).toBe("한국어-테스트");
  });

  it("should handle non-Latin characters (Chinese)", () => {
    const result = slugifyStr("中文测试");
    expect(result).toBe("中文测试");
  });

  it("should handle mixed Latin and non-Latin", () => {
    const result = slugifyStr("React 한국어");
    expect(result).toBe("react-한국어");
  });

  it("should handle empty string", () => {
    expect(slugifyStr("")).toBe("");
  });

  it("should handle single word", () => {
    expect(slugifyStr("hello")).toBe("hello");
  });
});

describe("slugifyAll", () => {
  it("should slugify an array of strings", () => {
    expect(slugifyAll(["Hello World", "Foo Bar"])).toEqual([
      "hello-world",
      "foo-bar",
    ]);
  });

  it("should return empty array for empty input", () => {
    expect(slugifyAll([])).toEqual([]);
  });
});
