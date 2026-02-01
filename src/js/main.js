/* ============================================
   FOGSIFT MAIN
   Minimal app initialization
   ============================================ */

const App = {
    // Timing constants (TD-015: no magic numbers)
    TIMING: {
        WORD_ROTATE_INTERVAL: 2500,  // Time between word rotations
        WORD_FADE_DURATION: 300,     // Fade transition duration
        EASTER_EGG_EFFECT: 500,      // Hue-rotate effect duration
        CLOCK_UPDATE: 1000           // UTC clock update interval
    },

    _intervals: [], // Track intervals for cleanup
    _konamiCode: ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'],
    _konamiIndex: 0,

    init() {
        if (typeof Nav !== 'undefined' && Nav.init) Nav.init();
        if (typeof Modal !== 'undefined' && Modal.init) Modal.init();
        this.initClock();
        this.initAccessibility();
        this.initRotatingWords();
        this.initKonami();
        this.initHoneypot();
        this.logBoot();
        if (typeof SleepMode !== 'undefined' && SleepMode.init) SleepMode.init();
    },

    initHoneypot() {
        // Block mailto links if honeypot checkbox is checked (bot behavior)
        document.querySelectorAll('a[data-honeypot="true"]').forEach(link => {
            link.addEventListener('click', (e) => {
                const honeypot = link.parentElement?.querySelector('.hp-field input');
                if (honeypot && honeypot.checked) {
                    e.preventDefault();
                    console.log('%c 🤖 Bot detected ', 'background: #dc2626; color: white; padding: 5px;');
                }
            });
        });
    },

    initClock() {
        const clock = document.getElementById('utc-clock');
        if (!clock) return;

        const update = () => {
            const now = new Date();
            clock.textContent = now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
        };

        update();
        this._intervals.push(setInterval(update, this.TIMING.CLOCK_UPDATE));
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
            const rawWords = el.dataset.words;
            if (!rawWords) return;
            let words;
            try {
                words = JSON.parse(rawWords);
            } catch {
                return;
            }
            if (!Array.isArray(words) || words.length < 2) return;
            let index = 0;

            this._intervals.push(setInterval(() => {
                el.style.opacity = '0';
                setTimeout(() => {
                    index = (index + 1) % words.length;
                    el.textContent = words[index];
                    el.style.opacity = '1';
                }, this.TIMING.WORD_FADE_DURATION);
            }, this.TIMING.WORD_ROTATE_INTERVAL));
        });
    },

    initKonami() {
        document.addEventListener('keydown', (e) => {
            if (e.key === this._konamiCode[this._konamiIndex]) {
                this._konamiIndex++;
                if (this._konamiIndex === this._konamiCode.length) {
                    this._konamiIndex = 0;
                    this.triggerEasterEgg();
                }
            } else {
                this._konamiIndex = 0;
            }
        });
    },

    triggerEasterEgg() {
        const fog = `
    ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
    ░  ███████╗ ██████╗  ██████╗     ██╗     ██╗███████╗████████╗
    ░  ██╔════╝██╔═══██╗██╔════╝     ██║     ██║██╔════╝╚══██╔══╝
    ░  █████╗  ██║   ██║██║  ███╗    ██║     ██║█████╗     ██║
    ░  ██╔══╝  ██║   ██║██║   ██║    ██║     ██║██╔══╝     ██║
    ░  ██║     ╚██████╔╝╚██████╔╝    ███████╗██║██║        ██║
    ░  ╚═╝      ╚═════╝  ╚═════╝     ╚══════╝╚═╝╚═╝        ╚═╝
    ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
        `;
        console.log('%c' + fog, 'color: #e07b3c; font-family: monospace;');
        console.log('%c 🎮 KONAMI CODE ACTIVATED! ', 'background: #0d9488; color: white; padding: 10px; font-size: 16px; font-weight: bold;');
        console.log('%c You found the secret! Here\'s a fortune cookie: ', 'color: #4a2c2a; font-style: italic;');

        const fortunes = [
            '🔮 The fog will clear when you stop looking for the sun.',
            '🔮 Your next breakthrough is hiding in plain sight.',
            '🔮 Sometimes the answer is a better question.',
            '🔮 Complexity is easy. Simplicity takes courage.',
            '🔮 The bottleneck is rarely where you think it is.',
            '🔮 Ask "why" five times. The truth lives on the fifth floor.',
            '🔮 Your gut knows things your spreadsheet never will.',
            '🔮 The best documentation is the kind you wish existed.'
        ];
        console.log('%c ' + fortunes[Math.floor(Math.random() * fortunes.length)], 'color: #e07b3c; font-size: 14px; padding: 5px;');

        // Visual effect
        const effectDuration = this.TIMING.EASTER_EGG_EFFECT;
        document.body.style.transition = `filter ${effectDuration / 1000}s`;
        document.body.style.filter = 'hue-rotate(180deg)';
        setTimeout(() => {
            document.body.style.filter = 'hue-rotate(360deg)';
            setTimeout(() => {
                document.body.style.filter = 'none';
            }, effectDuration);
        }, effectDuration);
    },

    logBoot() {
        // Version is displayed in footer via build script ({{VERSION}})
        console.log(
            '%c FOGSIFT // SYSTEMS NOMINAL ',
            'background: #4a2c2a; color: #e07b3c; padding: 10px; font-family: monospace; font-weight: bold; border-left: 5px solid #0d9488;'
        );
        console.log(
            '%c ⌨️  Press "T" to cycle themes ',
            'color: #e07b3c; font-family: monospace; font-size: 10px;'
        );
        // Note: "Psst..." hint moved to SleepMode.init() to avoid duplication
        console.log(
            '%c 🎮 ...or try the old ways. ',
            'color: #999; font-family: monospace; font-size: 10px;'
        );
    }
};

document.addEventListener('DOMContentLoaded', () => App.init());

// Cleanup on page unload to prevent memory leaks
window.addEventListener('unload', () => {
    App._intervals.forEach(id => clearInterval(id));
});
