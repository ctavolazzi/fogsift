/* ============================================
   FOGSIFT MAIN
   App initialization and event bindings
   ============================================ */

const App = {
    version: '0.0.1',

    init() {
        // Initialize modules
        Nav.init();
        Modal.init();
        this.initClock();
        this.initDiagnostic();
        this.initFloatingCTA();
        this.initEventBindings();
        this.initAccessibility();
        this.logBoot();
    },

    initClock() {
        const clock = document.getElementById('utc-clock');
        if (!clock) return;

        const update = () => {
            const now = new Date();
            clock.textContent = now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
        };

        update();
        setInterval(update, 1000);
    },

    initDiagnostic() {
        const checkboxes = document.querySelectorAll('.check-item input[type="checkbox"]');
        const qualifierNote = document.querySelector('.qualifier-note');
        let checkedCount = 0;

        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                // Count checked items
                checkedCount = document.querySelectorAll('.check-item input[type="checkbox"]:checked').length;

                // Show toast on check
                if (checkbox.checked) {
                    Toast.show('CRITERION VERIFIED');
                }

                // Update qualifier note based on count
                if (qualifierNote) {
                    if (checkedCount === 0) {
                        qualifierNote.textContent = 'If any of these sound like you, we should talk.';
                    } else if (checkedCount === 1) {
                        qualifierNote.textContent = '1 match. Interesting...';
                    } else if (checkedCount === 2) {
                        qualifierNote.textContent = '2 matches. We should probably talk.';
                    } else if (checkedCount === 3) {
                        qualifierNote.textContent = '3/3 matches. You found the right place.';
                        Toast.show('PROFILE MATCH: HIGH PROBABILITY');
                    }
                }

                // Pulse effect on hotline button when all checked
                const hotline = document.querySelector('.hotline-button');
                if (checkedCount === 3) {
                    hotline?.classList.add('pulse');
                } else {
                    hotline?.classList.remove('pulse');
                }
            });
        });
    },

    initFloatingCTA() {
        const floatingCTA = document.getElementById('floating-cta');
        const hero = document.getElementById('hero');
        const contact = document.getElementById('contact');

        if (!floatingCTA || !hero) return;

        // Show floating CTA after scrolling past hero section
        const heroObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Hero is visible - hide floating CTA
                    floatingCTA.classList.remove('visible');
                } else {
                    // Hero is not visible - show floating CTA (unless contact visible)
                    if (!contact || !contact.classList.contains('in-view')) {
                        floatingCTA.classList.add('visible');
                    }
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '-100px 0px 0px 0px'
        });

        heroObserver.observe(hero);

        // Hide floating CTA when contact section is visible
        if (contact) {
            const contactObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        contact.classList.add('in-view');
                        floatingCTA.classList.remove('visible');
                    } else {
                        contact.classList.remove('in-view');
                    }
                });
            }, {
                threshold: 0.3
            });

            contactObserver.observe(contact);
        }
    },

    initEventBindings() {
        // Copy button
        const copyBtn = document.getElementById('copy-btn');
        copyBtn?.addEventListener('click', () => {
            navigator.clipboard.writeText(document.body.innerText)
                .then(() => Toast.show('TRANSCRIPT COPIED TO CLIPBOARD'));
        });

        // Hotline hover (only on desktop)
        const hotline = document.querySelector('.hotline-button');
        if (hotline && window.matchMedia('(min-width: 800px)').matches) {
            let hasShownToast = false;
            hotline.addEventListener('mouseenter', () => {
                if (!hasShownToast) {
                    Toast.show('CHANNEL: DIRECT / PRIORITY');
                    hasShownToast = true;
                }
            });
        }
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

            // Observer for theme changes
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

            // Observer for drawer state changes
            const observer = new MutationObserver(updateAriaExpanded);
            observer.observe(mobileDrawer, {
                attributes: true,
                attributeFilter: ['class']
            });
        }

        // Focus trap for mobile drawer
        if (mobileDrawer) {
            mobileDrawer.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    Nav.toggleMobile();
                }
            });
        }

        // Focus trap for modal
        const modal = document.getElementById('article-modal');
        if (modal) {
            modal.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    Modal.close();
                }
            });
        }
    },

    logBoot() {
        console.log(
            '%c FOGSIFT v' + this.version + ' // SYSTEMS NOMINAL ',
            'background: #18181b; color: #c2410c; padding: 10px; font-family: monospace; font-weight: bold; border-left: 5px solid #0d9488;'
        );
    }
};

// Boot on DOM ready
document.addEventListener('DOMContentLoaded', () => App.init());
