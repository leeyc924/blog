/**
 * Tests for dark-mode.js
 *
 * The module is an IIFE that runs on load, so we need to carefully
 * set up the DOM and mocks before requiring it each time.
 */

var originalAddEventListener = document.addEventListener.bind(document);
var domContentLoadedHandlers = [];

function setupDOM() {
  document.documentElement.removeAttribute("data-theme");
  document.body.innerHTML = [
    '<button id="theme-toggle">',
    '  <svg id="sun-icon" class="icon" style="display:none"></svg>',
    '  <svg id="moon-icon" class="icon" style="display:none"></svg>',
    "</button>",
  ].join("");
}

function mockMatchMedia(prefersDark) {
  window.matchMedia = jest.fn().mockImplementation(function (query) {
    return {
      matches: prefersDark && query === "(prefers-color-scheme: dark)",
      media: query,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    };
  });
}

function loadDarkMode() {
  jest.resetModules();
  return require("../static/js/dark-mode.js");
}

beforeEach(function () {
  localStorage.clear();
  setupDOM();
  mockMatchMedia(false);

  // Intercept DOMContentLoaded registrations to isolate tests
  domContentLoadedHandlers = [];
  document.addEventListener = jest.fn().mockImplementation(function (type, handler, options) {
    if (type === "DOMContentLoaded") {
      domContentLoadedHandlers.push(handler);
    } else {
      originalAddEventListener(type, handler, options);
    }
  });
});

afterEach(function () {
  document.addEventListener = originalAddEventListener;
});

function fireDOMContentLoaded() {
  domContentLoadedHandlers.forEach(function (handler) {
    handler();
  });
}

// --- getPreferredTheme ---

describe("getPreferredTheme", function () {
  test("returns 'dark' when localStorage has 'dark'", function () {
    localStorage.setItem("theme", "dark");
    var mod = loadDarkMode();
    expect(mod.getPreferredTheme()).toBe("dark");
  });

  test("returns 'light' when localStorage has 'light'", function () {
    localStorage.setItem("theme", "light");
    var mod = loadDarkMode();
    expect(mod.getPreferredTheme()).toBe("light");
  });

  test("returns 'dark' when no localStorage and prefers-color-scheme is dark", function () {
    mockMatchMedia(true);
    var mod = loadDarkMode();
    expect(mod.getPreferredTheme()).toBe("dark");
  });

  test("returns 'light' when no localStorage and prefers-color-scheme is light", function () {
    mockMatchMedia(false);
    var mod = loadDarkMode();
    expect(mod.getPreferredTheme()).toBe("light");
  });
});

// --- applyTheme ---

describe("applyTheme", function () {
  test("sets data-theme='dark' on html element", function () {
    var mod = loadDarkMode();
    mod.applyTheme("dark");
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });

  test("sets data-theme='light' on html element", function () {
    var mod = loadDarkMode();
    mod.applyTheme("light");
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  });

  test("hides sun icon and shows moon icon when theme is dark", function () {
    var mod = loadDarkMode();
    mod.applyTheme("dark");
    var sun = document.getElementById("sun-icon");
    var moon = document.getElementById("moon-icon");
    expect(sun.style.display).toBe("none");
    expect(moon.style.display).toBe("inline-block");
  });

  test("shows sun icon and hides moon icon when theme is light", function () {
    var mod = loadDarkMode();
    mod.applyTheme("light");
    var sun = document.getElementById("sun-icon");
    var moon = document.getElementById("moon-icon");
    expect(sun.style.display).toBe("inline-block");
    expect(moon.style.display).toBe("none");
  });

  test("handles missing icon elements gracefully", function () {
    document.body.innerHTML = "";
    var mod = loadDarkMode();
    // Should not throw when icons are missing
    expect(function () {
      mod.applyTheme("dark");
    }).not.toThrow();
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });
});

// --- Toggle behavior ---

describe("toggle", function () {
  test("click changes from light to dark", function () {
    localStorage.setItem("theme", "light");
    loadDarkMode();
    fireDOMContentLoaded();
    var btn = document.getElementById("theme-toggle");
    btn.click();
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });

  test("click changes from dark to light", function () {
    localStorage.setItem("theme", "dark");
    loadDarkMode();
    fireDOMContentLoaded();
    var btn = document.getElementById("theme-toggle");
    btn.click();
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  });

  test("saves preference to localStorage", function () {
    localStorage.setItem("theme", "light");
    loadDarkMode();
    fireDOMContentLoaded();
    var btn = document.getElementById("theme-toggle");
    btn.click();
    expect(localStorage.getItem("theme")).toBe("dark");
  });

  test("handles missing toggle button gracefully", function () {
    document.body.innerHTML = "";
    loadDarkMode();
    // Should not throw when button is missing
    expect(function () {
      fireDOMContentLoaded();
    }).not.toThrow();
  });
});

// --- Immediate application on load ---

describe("immediate load behavior", function () {
  test("theme is applied immediately on script load (before DOMContentLoaded)", function () {
    localStorage.setItem("theme", "dark");
    document.documentElement.removeAttribute("data-theme");
    loadDarkMode();
    // data-theme should be set without DOMContentLoaded
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });
});
