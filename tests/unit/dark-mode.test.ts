import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getPreferredTheme,
  applyTheme,
  toggleTheme,
  initDarkModeToggle,
} from '../../src/scripts/dark-mode';

describe('dark-mode', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  describe('getPreferredTheme', () => {
    it('returns "dark" when localStorage has "dark"', () => {
      localStorage.setItem('theme', 'dark');
      expect(getPreferredTheme()).toBe('dark');
    });

    it('returns "light" when localStorage has "light"', () => {
      localStorage.setItem('theme', 'light');
      expect(getPreferredTheme()).toBe('light');
    });

    it('returns "dark" when system prefers dark (no stored)', () => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query: string) => ({
          matches: query === '(prefers-color-scheme: dark)',
          media: query,
        })),
      });
      expect(getPreferredTheme()).toBe('dark');
    });

    it('returns "light" when system prefers light (no stored)', () => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query: string) => ({
          matches: false,
          media: query,
        })),
      });
      expect(getPreferredTheme()).toBe('light');
    });
  });

  describe('applyTheme', () => {
    it('adds "dark" class to documentElement when theme is dark', () => {
      applyTheme('dark');
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    it('removes "dark" class from documentElement when theme is light', () => {
      document.documentElement.classList.add('dark');
      applyTheme('light');
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });
  });

  describe('toggleTheme', () => {
    it('toggles from light to dark and saves to localStorage', () => {
      const theme = toggleTheme();
      expect(theme).toBe('dark');
      expect(document.documentElement.classList.contains('dark')).toBe(true);
      expect(localStorage.getItem('theme')).toBe('dark');
    });

    it('toggles from dark to light and saves to localStorage', () => {
      document.documentElement.classList.add('dark');
      const theme = toggleTheme();
      expect(theme).toBe('light');
      expect(document.documentElement.classList.contains('dark')).toBe(false);
      expect(localStorage.getItem('theme')).toBe('light');
    });
  });

  describe('initDarkModeToggle', () => {
    it('does nothing when button not found', () => {
      initDarkModeToggle();
      // No error thrown
    });

    it('attaches click handler to toggle button', () => {
      const button = document.createElement('button');
      button.id = 'dark-mode-toggle';
      document.body.appendChild(button);

      initDarkModeToggle();
      button.click();

      expect(document.documentElement.classList.contains('dark')).toBe(true);
      expect(localStorage.getItem('theme')).toBe('dark');

      document.body.removeChild(button);
    });
  });
});
