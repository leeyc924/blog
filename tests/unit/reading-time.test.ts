import { describe, it, expect } from 'vitest';
import { getReadingTime } from '../../src/lib/reading-time';

describe('getReadingTime', () => {
  it('returns 1 min for empty string', () => {
    expect(getReadingTime('')).toBe('1 min read');
  });

  it('returns 1 min for short text (< 200 words)', () => {
    const text = 'hello world';
    expect(getReadingTime(text)).toBe('1 min read');
  });

  it('returns correct time for exact 200 words (1 min)', () => {
    const text = Array(200).fill('word').join(' ');
    expect(getReadingTime(text)).toBe('1 min read');
  });

  it('returns correct time for 400 words (2 min)', () => {
    const text = Array(400).fill('word').join(' ');
    expect(getReadingTime(text)).toBe('2 min read');
  });

  it('returns correct time for 201 words (2 min, ceiling)', () => {
    const text = Array(201).fill('word').join(' ');
    expect(getReadingTime(text)).toBe('2 min read');
  });

  it('handles text with extra whitespace', () => {
    const text = '  hello   world  ';
    expect(getReadingTime(text)).toBe('1 min read');
  });

  it('handles text with newlines', () => {
    const text = 'hello\nworld\nfoo\nbar';
    expect(getReadingTime(text)).toBe('1 min read');
  });
});
