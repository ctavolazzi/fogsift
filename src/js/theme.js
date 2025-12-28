/* ============================================
   FOGSIFT THEME MODULE
   Light/dark mode toggle with persistence
   ============================================ */

const Theme = {
    STORAGE_KEY: 'theme',

    init() {
        let theme = 'light';
        try {
            theme = localStorage.getItem(this.STORAGE_KEY) || 'light';
        } catch {
            // localStorage unavailable
        }
        this.set(theme, false);
    },

    get() {
        return document.documentElement.getAttribute('data-theme') || 'light';
    },

    set(theme, notify = true) {
        document.documentElement.setAttribute('data-theme', theme);
        try {
            localStorage.setItem(this.STORAGE_KEY, theme);
        } catch (e) {
            // localStorage may be unavailable (private browsing, quota exceeded)
            console.warn('Theme: Could not persist preference:', e.message);
        }
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

