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
        if (typeof CookieConsent !== 'undefined' && CookieConsent.init) CookieConsent.init();
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

            // Measure the longest word and set min-width so text trails right
            const original = el.textContent;
            let maxW = 0;
            for (const w of words) {
                el.textContent = w;
                maxW = Math.max(maxW, el.scrollWidth);
            }
            el.style.minWidth = maxW + 'px';
            el.textContent = original;

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


// Example Modal System
const ExampleModal = {
    examples: {
        inventory: {
            title: 'Inventory Count Mismatch',
            category: 'Operations',
            problem: 'A distribution company noticed their inventory counts never matched between their warehouse system and accounting software. Every month, they spent days reconciling discrepancies.',
            process: 'We traced the data flow between systems and found two different rounding rules being applied. The warehouse system rounded to nearest unit, while accounting rounded down.',
            solution: 'Aligned the rounding rules in both systems and added a daily automated check. Problem solved in one session.',
            outcome: 'Diagnosis + fix'
        },
        tuesday: {
            title: 'Tuesday Crashes',
            category: 'Technical',
            problem: 'A SaaS company reported their app crashed every Tuesday around 2 PM. Support tickets spiked, and the team couldn\'t figure out why.',
            process: 'We looked at server logs and noticed a pattern: memory usage spiked right before crashes. Cross-referenced with scheduled tasks.',
            solution: 'A weekly report generation cron job ran at 2 PM Tuesday, coinciding with peak user traffic. Moving it to 3 AM eliminated the crashes.',
            outcome: 'Root cause + fix'
        },
        buildbuy: {
            title: 'Build vs. Buy Decision',
            category: 'Strategy',
            problem: 'A startup needed inventory management. The CTO wanted to build custom. The CEO wanted to buy off-the-shelf. They\'d been stuck for months.',
            process: 'We mapped out hidden costs: build time, maintenance burden, opportunity cost. Also mapped timing risk and team capacity.',
            solution: 'Recommendation: buy an existing solution now to move fast, plan migration to custom build in 18 months when you have more data on actual needs.',
            outcome: 'Decision framework'
        },
        signups: {
            title: 'Stalled Signups',
            category: 'Marketing',
            problem: 'A B2B SaaS saw signups plateau despite increased ad spend. Traffic was up, but conversions weren\'t following.',
            process: 'We walked through the signup flow live, clicking through like a real user. Found three major friction points.',
            solution: 'Fixed: confusing pricing toggle, broken mobile layout on signup form, and a required field that shouldn\'t have been required.',
            outcome: 'Funnel fixes + roadmap'
        }
    },

    open(id) {
        const example = this.examples[id];
        if (!example) return;

        const modal = document.getElementById('article-modal');
        const title = document.getElementById('modal-title');
        const body = document.getElementById('modal-body');

        if (!modal || !title || !body) return;

        title.textContent = example.title;
        body.innerHTML = `
            <p style="font-family: var(--font-mono); font-size: var(--text-xs); text-transform: uppercase; color: var(--muted); margin-bottom: var(--space-md);">${example.category}</p>
            <h3 style="font-size: var(--text-lg); margin-bottom: var(--space-sm);">The Problem</h3>
            <p style="margin-bottom: var(--space-md);">${example.problem}</p>
            <h3 style="font-size: var(--text-lg); margin-bottom: var(--space-sm);">The Process</h3>
            <p style="margin-bottom: var(--space-md);">${example.process}</p>
            <h3 style="font-size: var(--text-lg); margin-bottom: var(--space-sm);">The Solution</h3>
            <p style="margin-bottom: var(--space-md);">${example.solution}</p>
            <p style="font-family: var(--font-mono); font-size: var(--text-sm); color: var(--burnt-orange); margin-top: var(--space-lg);">Outcome: ${example.outcome}</p>
        `;

        Modal.open();
    }
};

document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

// Cleanup on page unload to prevent memory leaks
window.addEventListener('unload', () => {
    App._intervals.forEach(id => clearInterval(id));
});
