/* ============================================
   FOGSIFT THEME MODULE
   Event-driven multi-theme system with persistence
   
   Architecture:
   - Single source of truth (localStorage + data-theme attribute)
   - Event-driven updates via CustomEvent 'themechange'
   - Cross-tab sync via storage event listener
   - Auto-hydration of dropdowns via MutationObserver
   
   Note: The storage key 'theme' is also used in build.js
   for FOUC-prevention script injection (TD-010).
   ============================================ */

const Theme = {
    STORAGE_KEY: 'theme',
    EVENT_NAME: 'themechange',
    
    // Available themes - order matters for cycle()
    THEMES: ['light', 'dark', 'industrial-punchcard'],
    
    // Human-readable theme names for UI
    THEME_LABELS: {
        'light': 'Light',
        'dark': 'Dark',
        'industrial-punchcard': 'Industrial'
    },
    
    _initialized: false,
    _observer: null,

    /**
     * Initialize theme system
     * - Sets theme from localStorage or default
     * - Hydrates all dropdowns
     * - Sets up event listeners for cross-tab sync
     * - Sets up MutationObserver for dynamic dropdowns
     */
    init() {
        if (this._initialized) return;
        this._initialized = true;
        
        // Get stored theme or default
        let theme = 'light';
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            theme = this.THEMES.includes(stored) ? stored : 'light';
        } catch {
            // localStorage unavailable
        }
        
        // Apply theme without notification on init
        this._applyTheme(theme);
        
        // Hydrate all existing dropdowns
        this._hydrateDropdowns();
        
        // Listen for storage changes (cross-tab sync)
        this._setupStorageListener();
        
        // Watch for dynamically added dropdowns
        this._setupMutationObserver();
        
        // Listen for our own theme change events (for components)
        this._setupThemeListener();
    },

    /**
     * Get current theme
     */
    get() {
        return document.documentElement.getAttribute('data-theme') || 'light';
    },

    /**
     * Set theme with full event dispatching
     */
    set(theme, options = {}) {
        const { notify = true, broadcast = true } = options;
        
        // Validate theme
        if (!this.THEMES.includes(theme)) {
            console.warn(`Theme: Invalid theme "${theme}", falling back to light`);
            theme = 'light';
        }
        
        const previousTheme = this.get();
        if (previousTheme === theme) return; // No change
        
        // Apply the theme
        this._applyTheme(theme);
        
        // Persist to storage
        try {
            localStorage.setItem(this.STORAGE_KEY, theme);
        } catch (e) {
            console.warn('Theme: Could not persist preference:', e.message);
        }
        
        // Broadcast change event for all listeners
        if (broadcast) {
            this._dispatchChange(theme, previousTheme);
        }
        
        // Show toast notification
        if (notify && typeof Toast !== 'undefined') {
            Toast.show(`VISUAL MODE: ${this.THEME_LABELS[theme].toUpperCase()}`);
        }
    },

    /**
     * Cycle through themes (keyboard shortcut)
     */
    cycle() {
        const current = this.get();
        const idx = this.THEMES.indexOf(current);
        const next = this.THEMES[(idx + 1) % this.THEMES.length];
        this.set(next);
    },

    /**
     * Legacy toggle - now cycles
     */
    toggle() {
        this.cycle();
    },
    
    /**
     * Handle dropdown change event
     */
    onChange(event) {
        this.set(event.target.value);
    },
    
    /**
     * Subscribe to theme changes
     * @param {Function} callback - Called with (newTheme, previousTheme)
     * @returns {Function} Unsubscribe function
     */
    subscribe(callback) {
        const handler = (e) => callback(e.detail.theme, e.detail.previousTheme);
        window.addEventListener(this.EVENT_NAME, handler);
        return () => window.removeEventListener(this.EVENT_NAME, handler);
    },
    
    // ============ PRIVATE METHODS ============
    
    /**
     * Apply theme to DOM (no events)
     */
    _applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        this._hydrateDropdowns();
    },
    
    /**
     * Hydrate all theme dropdowns with current value
     */
    _hydrateDropdowns() {
        const current = this.get();
        document.querySelectorAll('.theme-dropdown').forEach(dropdown => {
            if (dropdown.value !== current) {
                dropdown.value = current;
            }
        });
    },
    
    /**
     * Dispatch theme change CustomEvent
     */
    _dispatchChange(theme, previousTheme) {
        const event = new CustomEvent(this.EVENT_NAME, {
            bubbles: true,
            detail: { theme, previousTheme }
        });
        window.dispatchEvent(event);
    },
    
    /**
     * Listen for localStorage changes (cross-tab sync)
     */
    _setupStorageListener() {
        window.addEventListener('storage', (e) => {
            if (e.key === this.STORAGE_KEY && e.newValue) {
                const newTheme = e.newValue;
                if (this.THEMES.includes(newTheme) && newTheme !== this.get()) {
                    // Apply without re-storing or broadcasting (came from another tab)
                    this._applyTheme(newTheme);
                    this._dispatchChange(newTheme, this.get());
                }
            }
        });
    },
    
    /**
     * Watch for dynamically added dropdowns
     */
    _setupMutationObserver() {
        if (typeof MutationObserver === 'undefined') return;
        
        this._observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                for (const node of mutation.addedNodes) {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        // Check if the added node is a dropdown or contains dropdowns
                        if (node.classList?.contains('theme-dropdown')) {
                            node.value = this.get();
                        } else if (node.querySelectorAll) {
                            node.querySelectorAll('.theme-dropdown').forEach(dropdown => {
                                dropdown.value = this.get();
                            });
                        }
                    }
                }
            }
        });
        
        this._observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    },
    
    /**
     * Listen for theme changes to update dropdowns
     */
    _setupThemeListener() {
        window.addEventListener(this.EVENT_NAME, () => {
            this._hydrateDropdowns();
        });
    },
    
    /**
     * Cleanup (for testing or SPA unmount)
     */
    destroy() {
        if (this._observer) {
            this._observer.disconnect();
            this._observer = null;
        }
        this._initialized = false;
    }
};

// Auto-init when DOM is ready
if (typeof window !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => Theme.init());
    } else {
        Theme.init();
    }
}

