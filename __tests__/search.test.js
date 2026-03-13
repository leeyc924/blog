/**
 * Tests for search.js
 *
 * Tests debounce, initSearch, escapeHtml, and truncate functions.
 */

var originalAddEventListener = document.addEventListener.bind(document);
var domContentLoadedHandlers = [];

function setupSearchDOM() {
  document.body.innerHTML = [
    '<input id="search-input" type="text" />',
    '<div id="search-results"></div>',
  ].join("");
}

function mockElasticlunr(results) {
  var index = {
    search: jest.fn().mockReturnValue(
      results.map(function (r) {
        return { ref: r.ref };
      }),
    ),
    documentStore: {
      getDoc: jest.fn().mockImplementation(function (ref) {
        var found = results.find(function (r) {
          return r.ref === ref;
        });
        return found ? found.doc : null;
      }),
    },
  };

  window.elasticlunr = {
    Index: {
      load: jest.fn().mockReturnValue(index),
    },
  };
  window.searchIndex = {};
  return index;
}

function loadSearch() {
  jest.resetModules();
  return require("../static/js/search.js");
}

beforeEach(function () {
  jest.useFakeTimers();
  setupSearchDOM();
  delete window.elasticlunr;
  delete window.searchIndex;

  domContentLoadedHandlers = [];
  document.addEventListener = jest
    .fn()
    .mockImplementation(function (type, handler, options) {
      if (type === "DOMContentLoaded") {
        domContentLoadedHandlers.push(handler);
      } else {
        originalAddEventListener(type, handler, options);
      }
    });
});

afterEach(function () {
  jest.useRealTimers();
  document.addEventListener = originalAddEventListener;
});

function fireDOMContentLoaded() {
  domContentLoadedHandlers.forEach(function (handler) {
    handler();
  });
}

function typeInSearch(value) {
  var input = document.getElementById("search-input");
  input.value = value;
  input.dispatchEvent(new Event("input"));
}

// --- debounce ---

describe("debounce", function () {
  test("calls function after delay", function () {
    var mod = loadSearch();
    var fn = jest.fn();
    var debounced = mod.debounce(fn, 200);
    debounced();
    expect(fn).not.toHaveBeenCalled();
    jest.advanceTimersByTime(200);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test("resets timer on subsequent calls", function () {
    var mod = loadSearch();
    var fn = jest.fn();
    var debounced = mod.debounce(fn, 200);
    debounced();
    jest.advanceTimersByTime(100);
    debounced();
    jest.advanceTimersByTime(100);
    expect(fn).not.toHaveBeenCalled();
    jest.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);
  });
});

// --- escapeHtml ---

describe("escapeHtml", function () {
  test('escapes < > & " characters', function () {
    var mod = loadSearch();
    expect(mod.escapeHtml('<script>alert("xss")&</script>')).toBe(
      "&lt;script&gt;alert(&quot;xss&quot;)&amp;&lt;/script&gt;",
    );
  });
});

// --- truncate ---

describe("truncate", function () {
  test("adds '...' when string exceeds length", function () {
    var mod = loadSearch();
    expect(mod.truncate("hello world", 5)).toBe("hello...");
  });

  test("returns original when string is shorter", function () {
    var mod = loadSearch();
    expect(mod.truncate("hi", 10)).toBe("hi");
  });
});

// --- initSearch ---

describe("initSearch", function () {
  test("does nothing if search-input not found", function () {
    document.body.innerHTML = "";
    mockElasticlunr([]);
    loadSearch();
    expect(function () {
      fireDOMContentLoaded();
    }).not.toThrow();
  });

  test("does nothing if elasticlunr not available", function () {
    loadSearch();
    expect(function () {
      fireDOMContentLoaded();
    }).not.toThrow();
  });

  test("empty query clears results", function () {
    mockElasticlunr([]);
    loadSearch();
    fireDOMContentLoaded();
    typeInSearch("");
    jest.advanceTimersByTime(200);
    var results = document.getElementById("search-results");
    expect(results.innerHTML).toBe("");
  });

  test("query < 2 chars clears results", function () {
    mockElasticlunr([]);
    loadSearch();
    fireDOMContentLoaded();
    typeInSearch("a");
    jest.advanceTimersByTime(200);
    var results = document.getElementById("search-results");
    expect(results.innerHTML).toBe("");
  });

  test("search returns results with title and body", function () {
    var index = mockElasticlunr([
      {
        ref: "1",
        doc: {
          title: "Test Title",
          body: "This is the body text of the result.",
        },
      },
    ]);
    loadSearch();
    fireDOMContentLoaded();
    typeInSearch("test");
    jest.advanceTimersByTime(200);
    var results = document.getElementById("search-results");
    expect(results.innerHTML).toContain("Test Title");
    expect(results.innerHTML).toContain("This is the body text");
  });

  test("results limited to 10", function () {
    var manyResults = [];
    for (var i = 0; i < 15; i++) {
      manyResults.push({
        ref: String(i),
        doc: { title: "Title " + i, body: "Body " + i },
      });
    }
    var index = mockElasticlunr(manyResults);
    loadSearch();
    fireDOMContentLoaded();
    typeInSearch("test");
    jest.advanceTimersByTime(200);
    var results = document.getElementById("search-results");
    var items = results.querySelectorAll(".search-result-item");
    expect(items.length).toBe(10);
  });

  test("handles results with missing title and body", function () {
    mockElasticlunr([
      {
        ref: "1",
        doc: { title: "", body: "" },
      },
    ]);
    loadSearch();
    fireDOMContentLoaded();
    typeInSearch("test");
    jest.advanceTimersByTime(200);
    var results = document.getElementById("search-results");
    var items = results.querySelectorAll(".search-result-item");
    expect(items.length).toBe(1);
  });

  test("no results shows empty message", function () {
    mockElasticlunr([]);
    loadSearch();
    fireDOMContentLoaded();
    typeInSearch("nonexistent");
    jest.advanceTimersByTime(200);
    var results = document.getElementById("search-results");
    expect(results.textContent).toContain("검색 결과가 없습니다.");
  });
});
