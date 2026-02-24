/**
 * Theme initialization - runs synchronously to prevent FOUC
 * Must be loaded in <head> WITHOUT defer/async
 */
(function() {
    var THEME_KEY = 'theme';
    var DEFAULT_THEME = 'light';
    var savedTheme;

    try {
        savedTheme = localStorage.getItem(THEME_KEY);
    } catch (_e) {
        // localStorage not available
    }

    var theme = savedTheme || DEFAULT_THEME;
    document.documentElement.setAttribute('data-theme', theme);

    // Save if not already saved
    if (!savedTheme) {
        try {
            localStorage.setItem(THEME_KEY, theme);
        } catch (_e) {
            // localStorage not available
        }
    }
})();
