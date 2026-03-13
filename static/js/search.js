// Search functionality for Zola blog
(function () {
  "use strict";

  var MAX_RESULTS = 10;
  var DEBOUNCE_DELAY = 200;
  var MIN_QUERY_LENGTH = 2;
  var TRUNCATE_LENGTH = 150;

  function debounce(fn, delay) {
    var timer = null;
    return function () {
      var args = arguments;
      var context = this;
      clearTimeout(timer);
      timer = setTimeout(function () {
        fn.apply(context, args);
      }, delay);
    };
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function truncate(str, len) {
    if (str.length <= len) {
      return str;
    }
    return str.slice(0, len) + "...";
  }

  function initSearch() {
    var searchInput = document.getElementById("search-input");
    var searchResults = document.getElementById("search-results");

    if (!searchInput || !searchResults) {
      return;
    }

    if (typeof window.elasticlunr === "undefined" || !window.searchIndex) {
      return;
    }

    var index = window.elasticlunr.Index.load(window.searchIndex);

    searchInput.addEventListener(
      "input",
      debounce(function () {
        var query = searchInput.value.trim();

        if (query.length < MIN_QUERY_LENGTH) {
          searchResults.innerHTML = "";
          return;
        }

        var results = index.search(query).slice(0, MAX_RESULTS);

        if (results.length === 0) {
          searchResults.innerHTML =
            '<p class="search-empty">검색 결과가 없습니다.</p>';
          return;
        }

        var html = results
          .map(function (result) {
            var doc = index.documentStore.getDoc(result.ref);
            var title = escapeHtml(doc.title || "");
            var body = escapeHtml(truncate(doc.body || "", TRUNCATE_LENGTH));
            return (
              '<div class="search-result-item">' +
              '<h3 class="search-result-title">' +
              title +
              "</h3>" +
              '<p class="search-result-body">' +
              body +
              "</p>" +
              "</div>"
            );
          })
          .join("");

        searchResults.innerHTML = html;
      }, DEBOUNCE_DELAY)
    );
  }

  document.addEventListener("DOMContentLoaded", initSearch);

  // Export for testing (no-op in browser where module is undefined)
  /* istanbul ignore next -- browser environment guard */
  if (typeof module === "undefined") { return; }
  module.exports = {
    debounce: debounce,
    escapeHtml: escapeHtml,
    truncate: truncate,
    initSearch: initSearch,
  };
})();
