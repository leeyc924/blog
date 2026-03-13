// Dark mode initialization -- runs in <head> to prevent FOUC
(function () {
  "use strict";

  var STORAGE_KEY = "theme";
  var DARK = "dark";
  var LIGHT = "light";

  function getPreferredTheme() {
    var stored = localStorage.getItem(STORAGE_KEY);
    if (stored === DARK || stored === LIGHT) {
      return stored;
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? DARK
      : LIGHT;
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    var sunIcon = document.getElementById("sun-icon");
    var moonIcon = document.getElementById("moon-icon");
    if (sunIcon && moonIcon) {
      sunIcon.style.display = theme === LIGHT ? "inline-block" : "none";
      moonIcon.style.display = theme === DARK ? "inline-block" : "none";
    }
  }

  // Apply theme immediately to prevent FOUC
  var theme = getPreferredTheme();
  applyTheme(theme);

  // Set up toggle button after DOM is ready
  document.addEventListener("DOMContentLoaded", function () {
    var toggleBtn = document.getElementById("theme-toggle");
    if (toggleBtn) {
      toggleBtn.addEventListener("click", function () {
        var current = document.documentElement.getAttribute("data-theme");
        var next = current === DARK ? LIGHT : DARK;
        applyTheme(next);
        localStorage.setItem(STORAGE_KEY, next);
      });
    }
  });

  // Export for testing (no-op in browser where module is undefined)
  /* istanbul ignore next -- browser environment guard */
  if (typeof module === "undefined") {
    return;
  }
  module.exports = {
    getPreferredTheme: getPreferredTheme,
    applyTheme: applyTheme,
  };
})();
