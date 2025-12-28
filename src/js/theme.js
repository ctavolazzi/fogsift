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
    SCROLL_KEY: 'theme-scroll-position',
    EVENT_NAME: 'themechange',

    // Available themes - order matters for cycle()
    THEMES: ['light', 'dark', 'industrial-punchcard', 'matrix', 'sky', 'synthwave', 'pipboy', 'rivendell', 'camo', 'barbie', 'ocean'],

    // Human-readable theme names for UI
    THEME_LABELS: {
        'light': 'Light',
        'dark': 'Dark',
        'industrial-punchcard': 'Industrial',
        'matrix': 'Matrix',
        'sky': 'Sky',
        'synthwave': 'Synthwave',
        'pipboy': 'Pip-Boy',
        'rivendell': 'Rivendell',
        'camo': 'Camo',
        'barbie': 'Barbie',
        'ocean': 'Ocean',
        'demo': 'Demo'
    },

    _initialized: false,
    _observer: null,
    _demoInterval: null,
    _demoActive: false,

    /**
     * Initialize theme system
     * - Sets theme from localStorage or system preference
     * - Hydrates all dropdowns
     * - Sets up event listeners for cross-tab sync
     * - Sets up MutationObserver for dynamic dropdowns
     * - Sets up keyboard shortcut
     */
    init() {
        if (this._initialized) return;
        this._initialized = true;

        // Get stored theme, or detect system preference, or default to light
        let theme = 'light';
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            if (this.THEMES.includes(stored)) {
                theme = stored;
            } else {
                // First visit: detect system preference
                theme = this._detectSystemTheme();
            }
        } catch {
            theme = this._detectSystemTheme();
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

        // Setup keyboard shortcut (T to cycle themes)
        this._setupKeyboardShortcut();

        // Listen for system theme changes
        this._setupSystemThemeListener();
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
        const { notify = true, broadcast = true, preserveScroll = true, fromDemo = false } = options;

        // Handle demo mode
        if (theme === 'demo') {
            this.startDemo();
            return;
        }

        // Stop demo if switching to a specific theme (but not if called from demo cycle itself)
        if (this._demoActive && !fromDemo) {
            this.stopDemo();
        }

        // Validate theme
        if (!this.THEMES.includes(theme)) {
            console.warn(`Theme: Invalid theme "${theme}", falling back to light`);
            theme = 'light';
        }

        const previousTheme = this.get();
        if (previousTheme === theme) return; // No change

        // Save scroll position before theme change
        if (preserveScroll) {
            this._saveScrollPosition();
        }

        // Apply the theme
        this._applyTheme(theme);

        // Restore scroll position after theme change (with tiny delay for CSS to settle)
        if (preserveScroll) {
            requestAnimationFrame(() => {
                this._restoreScrollPosition();
            });
        }

        // Persist to storage (only if not in demo mode)
        if (!this._demoActive) {
            try {
                localStorage.setItem(this.STORAGE_KEY, theme);
            } catch (e) {
                console.warn('Theme: Could not persist preference:', e.message);
            }
        }

        // Broadcast change event for all listeners
        if (broadcast) {
            this._dispatchChange(theme, previousTheme);
        }

        // Show toast notification
        if (notify && typeof Toast !== 'undefined') {
            const label = this._demoActive ? `DEMO: ${this.THEME_LABELS[theme].toUpperCase()}` : `VISUAL MODE: ${this.THEME_LABELS[theme].toUpperCase()}`;
            Toast.show(label);
        }
    },

    DEMO_INTERVAL: 4000, // 4 seconds per theme (faster pacing)
    _demoCountdown: 0,
    _demoCountdownInterval: null,

    /**
     * Start demo mode - auto-cycle through themes every 6 seconds
     */
    startDemo() {
        if (this._demoActive) return;
        this._demoActive = true;

        // Save original theme to restore later
        this._demoOriginalTheme = this.get();
        this._demoIndex = 0;

        if (typeof Toast !== 'undefined') {
            Toast.show('🎬 DEMO MODE: Press T to exit');
        }

        // Create countdown display
        this._createCountdownDisplay();

        // Start cycling
        this._demoTick();
        this._demoInterval = setInterval(() => this._demoTick(), this.DEMO_INTERVAL);

        // Start countdown timer (updates every second)
        this._demoCountdown = Math.floor(this.DEMO_INTERVAL / 1000);
        this._updateCountdownDisplay();
        this._demoCountdownInterval = setInterval(() => {
            this._demoCountdown--;
            if (this._demoCountdown <= 0) {
                this._demoCountdown = Math.floor(this.DEMO_INTERVAL / 1000);
            }
            this._updateCountdownDisplay();
        }, 1000);
    },

    /**
     * Stop demo mode
     */
    stopDemo() {
        if (!this._demoActive) return;
        this._demoActive = false;

        // Remove channel switch effect if present
        document.documentElement.classList.remove('demo-channel-switch');

        if (this._demoInterval) {
            clearInterval(this._demoInterval);
            this._demoInterval = null;
        }

        // Stop countdown timer
        if (this._demoCountdownInterval) {
            clearInterval(this._demoCountdownInterval);
            this._demoCountdownInterval = null;
        }

        // Remove countdown display
        this._removeCountdownDisplay();

        // Restore original theme
        if (this._demoOriginalTheme && this.THEMES.includes(this._demoOriginalTheme)) {
            this.set(this._demoOriginalTheme, { notify: true });
        }

        if (typeof Toast !== 'undefined') {
            Toast.show('Demo ended');
        }
    },

    /**
     * Demo tick - switch to next theme with smooth transition
     */
    _demoTick() {
        const theme = this.THEMES[this._demoIndex];

        // Add transition class for GPU acceleration
        document.documentElement.classList.add('theme-transitioning');
        document.documentElement.classList.add('demo-channel-switch');

        // Switch theme after brief visual effect
        setTimeout(() => {
            this.set(theme, { notify: true, preserveScroll: true, fromDemo: true });
        }, 100);

        // Remove effect classes after animation completes
        setTimeout(() => {
            document.documentElement.classList.remove('demo-channel-switch');
            document.documentElement.classList.remove('theme-transitioning');
        }, 350);

        this._demoIndex = (this._demoIndex + 1) % this.THEMES.length;
    },

    /**
     * Check if demo mode is active
     */
    isDemoActive() {
        return this._demoActive;
    },

    /**
     * Create countdown display element
     */
    _createCountdownDisplay() {
        // Remove existing if present
        this._removeCountdownDisplay();

        const display = document.createElement('div');
        display.id = 'demo-countdown';
        display.setAttribute('role', 'timer');
        display.setAttribute('aria-live', 'off'); // Don't announce every tick
        document.body.appendChild(display);
    },

    /**
     * Update countdown display
     */
    _updateCountdownDisplay() {
        const display = document.getElementById('demo-countdown');
        if (!display) return;

        const currentTheme = this.THEME_LABELS[this.get()] || this.get();
        const nextIndex = this._demoIndex;
        const nextTheme = this.THEME_LABELS[this.THEMES[nextIndex]] || this.THEMES[nextIndex];

        // Create progress bar
        const progress = ((Math.floor(this.DEMO_INTERVAL / 1000) - this._demoCountdown) / Math.floor(this.DEMO_INTERVAL / 1000)) * 100;

        display.innerHTML = `
            <div class="demo-countdown-content">
                <span class="demo-countdown-label">DEMO</span>
                <span class="demo-countdown-theme">${currentTheme}</span>
                <div class="demo-countdown-bar">
                    <div class="demo-countdown-progress" style="width: ${progress}%"></div>
                </div>
                <span class="demo-countdown-next">Next: ${nextTheme} in ${this._demoCountdown}s</span>
            </div>
        `;
    },

    /**
     * Remove countdown display
     */
    _removeCountdownDisplay() {
        const display = document.getElementById('demo-countdown');
        if (display) {
            display.remove();
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
        // Add smooth transition class
        document.documentElement.classList.add('theme-transitioning');
        document.documentElement.setAttribute('data-theme', theme);
        this._hydrateDropdowns();

        // Remove transition class after animation
        setTimeout(() => {
            document.documentElement.classList.remove('theme-transitioning');
        }, 300);
    },

    /**
     * Save current scroll position
     */
    _saveScrollPosition() {
        try {
            const scrollData = {
                x: window.scrollX || window.pageXOffset,
                y: window.scrollY || window.pageYOffset,
                path: window.location.pathname
            };
            sessionStorage.setItem(this.SCROLL_KEY, JSON.stringify(scrollData));
        } catch (e) {
            // Storage unavailable
        }
    },

    /**
     * Restore scroll position
     */
    _restoreScrollPosition() {
        try {
            const data = sessionStorage.getItem(this.SCROLL_KEY);
            if (!data) return;

            const scrollData = JSON.parse(data);
            // Only restore if on same page
            if (scrollData.path === window.location.pathname) {
                window.scrollTo({
                    top: scrollData.y,
                    left: scrollData.x,
                    behavior: 'instant' // No smooth scroll - instant restore
                });
            }
        } catch (e) {
            // Storage unavailable or invalid data
        }
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
     * Detect system color scheme preference
     */
    _detectSystemTheme() {
        if (typeof window === 'undefined' || !window.matchMedia) return 'light';
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    },

    /**
     * Listen for system theme changes (OS dark/light mode toggle)
     */
    _setupSystemThemeListener() {
        if (typeof window === 'undefined' || !window.matchMedia) return;

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.addEventListener('change', (e) => {
            // Only auto-switch if user hasn't manually chosen a theme
            try {
                const hasStoredPreference = localStorage.getItem(this.STORAGE_KEY);
                if (!hasStoredPreference) {
                    this.set(e.matches ? 'dark' : 'light');
                }
            } catch {
                // Storage unavailable, follow system
                this.set(e.matches ? 'dark' : 'light');
            }
        });
    },

    /**
     * Setup keyboard shortcut: Press "T" to cycle themes, "D" for demo mode
     */
    _setupKeyboardShortcut() {
        document.addEventListener('keydown', (e) => {
            // Don't trigger if typing in an input/textarea
            const tag = e.target.tagName.toLowerCase();
            if (tag === 'input' || tag === 'textarea' || e.target.isContentEditable) return;

            // Don't trigger with modifier keys
            if (e.ctrlKey || e.altKey || e.metaKey) return;

            if (e.key === 't' || e.key === 'T') {
                // If demo is active, stop it
                if (this._demoActive) {
                    this.stopDemo();
                } else {
                    this.cycle();
                }
                e.preventDefault();
            }

            // Press "D" to start/stop demo mode
            if (e.key === 'd' || e.key === 'D') {
                if (this._demoActive) {
                    this.stopDemo();
                } else {
                    this.startDemo();
                }
                e.preventDefault();
            }
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

/* ============================================
   THEME PICKER - Custom Dropdown Component
   ============================================ */

const ThemePicker = {
    _isOpen: false,
    _picker: null,
    _toggle: null,
    _menu: null,

    /**
     * Initialize the theme picker
     */
    init() {
        this._picker = document.querySelector('.theme-picker');
        if (!this._picker) return;

        this._toggle = this._picker.querySelector('.theme-picker-toggle');
        this._menu = this._picker.querySelector('.theme-picker-menu');

        // Set initial state
        this._updateSelection();

        // Click outside to close
        document.addEventListener('click', (e) => {
            if (this._isOpen && !this._picker.contains(e.target)) {
                this.close();
            }
        });

        // Keyboard navigation
        this._picker.addEventListener('keydown', (e) => this._handleKeydown(e));

        // Listen for theme changes from other sources
        Theme.subscribe(() => this._updateSelection());
    },

    /**
     * Toggle the dropdown
     */
    toggle() {
        if (this._isOpen) {
            this.close();
        } else {
            this.open();
        }
    },

    /**
     * Open the dropdown
     */
    open() {
        if (!this._picker) return;
        this._isOpen = true;
        this._picker.setAttribute('aria-expanded', 'true');
        this._toggle.setAttribute('aria-expanded', 'true');

        // Focus first option
        const firstOption = this._menu.querySelector('.theme-picker-option');
        if (firstOption) firstOption.focus();
    },

    /**
     * Close the dropdown
     */
    close() {
        if (!this._picker) return;
        this._isOpen = false;
        this._picker.setAttribute('aria-expanded', 'false');
        this._toggle.setAttribute('aria-expanded', 'false');
    },

    /**
     * Select a theme
     */
    select(theme) {
        Theme.set(theme);
        this.close();
        this._toggle.focus();
    },

    /**
     * Update the visual selection state
     */
    _updateSelection() {
        if (!this._menu) return;
        const current = Theme.get();

        this._menu.querySelectorAll('.theme-picker-option').forEach(option => {
            const isSelected = option.dataset.theme === current;
            option.setAttribute('aria-selected', isSelected ? 'true' : 'false');
        });
    },

    /**
     * Handle keyboard navigation
     */
    _handleKeydown(e) {
        const options = Array.from(this._menu.querySelectorAll('.theme-picker-option'));
        const currentIndex = options.findIndex(opt => opt === document.activeElement);

        switch (e.key) {
            case 'Escape':
                this.close();
                this._toggle.focus();
                e.preventDefault();
                break;

            case 'ArrowDown':
                if (!this._isOpen) {
                    this.open();
                } else {
                    const nextIndex = currentIndex < options.length - 1 ? currentIndex + 1 : 0;
                    options[nextIndex].focus();
                }
                e.preventDefault();
                break;

            case 'ArrowUp':
                if (this._isOpen) {
                    const prevIndex = currentIndex > 0 ? currentIndex - 1 : options.length - 1;
                    options[prevIndex].focus();
                }
                e.preventDefault();
                break;

            case 'Enter':
            case ' ':
                if (this._isOpen && document.activeElement.classList.contains('theme-picker-option')) {
                    this.select(document.activeElement.dataset.theme);
                } else if (!this._isOpen) {
                    this.open();
                }
                e.preventDefault();
                break;

            case 'Tab':
                if (this._isOpen) {
                    this.close();
                }
                break;
        }
    }
};

// Auto-init when DOM is ready
if (typeof window !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            Theme.init();
            ThemePicker.init();
        });
    } else {
        Theme.init();
        ThemePicker.init();
    }
}

