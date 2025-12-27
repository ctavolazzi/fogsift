/* ============================================
   FOGSIFT THEME MODULE
   Light/dark mode toggle with persistence
   ============================================ */

const Theme = {
    STORAGE_KEY: 'theme',

    init() {
        const theme = localStorage.getItem(this.STORAGE_KEY) || 'light';
        this.set(theme, false);
    },

    get() {
        return document.documentElement.getAttribute('data-theme') || 'light';
    },

    set(theme, notify = true) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem(this.STORAGE_KEY, theme);
        if (notify && typeof Toast !== 'undefined') {
            Toast.show(`VISUAL MODE: ${theme.toUpperCase()}`);
        }
    },

    toggle() {
        const current = this.get();
        const next = current === 'dark' ? 'light' : 'dark';
        this.set(next);
    }
};

// Auto-init on load (for inline script in <head>)
if (typeof window !== 'undefined') {
    Theme.init();
}

