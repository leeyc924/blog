// Dark mode initialization — runs in <head> to prevent FOUC
// Full implementation in Task 10-11
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

    var theme = getPreferredTheme();
    document.documentElement.setAttribute("data-theme", theme);
})();
