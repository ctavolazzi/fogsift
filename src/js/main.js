/* ============================================
   FOGSIFT MAIN
   Minimal app initialization
   ============================================ */

const App = {
    version: '0.0.4',

    // Configuration constants (milliseconds)
    TIMING: {
        CLOCK_UPDATE: 1000,          // UTC clock refresh rate
        WORD_ROTATION: 2500,         // Interval between word changes
        WORD_FADE: 300,              // Fade transition duration
    },

    init() {
        Nav.init();
        Modal.init();
        this.initClock();
        this.initAccessibility();
        this.initRotatingWords();
        this.logBoot();
        SleepMode.init();
    },

    initClock() {
        const clock = document.getElementById('utc-clock');
        if (!clock) return;

        const update = () => {
            const now = new Date();
            clock.textContent = now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
        };

        update();
        setInterval(update, this.TIMING.CLOCK_UPDATE);
    },

    initAccessibility() {
        // Update theme toggle aria-pressed state
        const themeToggle = document.querySelector('.theme-toggle');
        if (themeToggle) {
            const updateAriaPressed = () => {
                const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
                themeToggle.setAttribute('aria-pressed', isDark ? 'true' : 'false');
            };
            updateAriaPressed();

            const observer = new MutationObserver(updateAriaPressed);
            observer.observe(document.documentElement, {
                attributes: true,
                attributeFilter: ['data-theme']
            });
        }

        // Update menu toggle aria-expanded state
        const menuToggle = document.querySelector('.menu-toggle');
        const mobileDrawer = document.getElementById('mobile-drawer');
        if (menuToggle && mobileDrawer) {
            const updateAriaExpanded = () => {
                const isOpen = mobileDrawer.classList.contains('open');
                menuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            };

            const observer = new MutationObserver(updateAriaExpanded);
            observer.observe(mobileDrawer, {
                attributes: true,
                attributeFilter: ['class']
            });
        }

        // Escape key handlers
        if (mobileDrawer) {
            mobileDrawer.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') Nav.toggleMobile();
            });
        }

        const modal = document.getElementById('article-modal');
        if (modal) {
            modal.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') Modal.close();
            });
        }
    },

    initRotatingWords() {
        const elements = document.querySelectorAll('[data-words]');
        elements.forEach(el => {
            const words = JSON.parse(el.dataset.words);
            let index = 0;

            setInterval(() => {
                el.style.opacity = '0';
                setTimeout(() => {
                    index = (index + 1) % words.length;
                    el.textContent = words[index];
                    el.style.opacity = '1';
                }, this.TIMING.WORD_FADE);
            }, this.TIMING.WORD_ROTATION);
        });
    },

    logBoot() {
        console.log(
            '%c FOGSIFT v' + this.version + ' // SYSTEMS NOMINAL ',
            'background: #4a2c2a; color: #e07b3c; padding: 10px; font-family: monospace; font-weight: bold; border-left: 5px solid #0d9488;'
        );
    }
};

document.addEventListener('DOMContentLoaded', () => App.init());
