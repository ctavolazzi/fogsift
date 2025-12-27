/* ============================================
   FOGSIFT TOAST MODULE
   Notification system with copyable errors
   ============================================ */

const Toast = {
    containerId: 'toast-container',
    defaultDuration: 2500,
    errorDuration: 5000,

    getContainer() {
        let container = document.getElementById(this.containerId);
        if (!container) {
            container = document.createElement('div');
            container.id = this.containerId;
            document.body.appendChild(container);
        }
        return container;
    },

    show(message, duration = this.defaultDuration) {
        this._create(message, 'success', duration);
    },

    error(message, duration = this.errorDuration) {
        this._create(message, 'error', duration, true);
    },

    info(message, duration = this.defaultDuration) {
        this._create(message, 'info', duration);
    },

    _create(message, type = 'success', duration, copyable = false) {
        const container = this.getContainer();
        const toast = document.createElement('div');
        toast.className = `toast toast--${type}`;

        // Message content
        const content = document.createElement('span');
        content.className = 'toast__message';
        content.innerText = message;
        toast.appendChild(content);

        // Copy button for errors
        if (copyable) {
            const copyBtn = document.createElement('button');
            copyBtn.className = 'toast__copy';
            copyBtn.innerHTML = '[COPY]';
            copyBtn.title = 'Copy error to clipboard';
            copyBtn.onclick = (e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(message).then(() => {
                    copyBtn.innerHTML = '[COPIED]';
                    setTimeout(() => copyBtn.innerHTML = '[COPY]', 1000);
                });
            };
            toast.appendChild(copyBtn);
        }

        container.appendChild(toast);

        // Auto-dismiss
        const dismissTimeout = setTimeout(() => {
            this._dismiss(toast);
        }, duration);

        // Click to dismiss (but not on copy button)
        toast.addEventListener('click', (e) => {
            if (!e.target.classList.contains('toast__copy')) {
                clearTimeout(dismissTimeout);
                this._dismiss(toast);
            }
        });
    },

    _dismiss(toast) {
        toast.style.animation = 'slideOut 0.2s ease forwards';
        setTimeout(() => toast.remove(), 200);
    }
};



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



/* ============================================
   FOGSIFT MODAL MODULE
   Article modal system with content loading
   ============================================ */

const Modal = {
    elementId: 'article-modal',
    articles: null, // Cache for loaded articles
    articlesPath: 'content/articles.json',

    getElement() {
        return document.getElementById(this.elementId);
    },

    async loadArticles() {
        if (this.articles) return this.articles;

        try {
            const response = await fetch(this.articlesPath);
            const data = await response.json();
            // Convert array to object keyed by id for fast lookup
            this.articles = {};
            data.articles.forEach(article => {
                this.articles[article.id] = article;
            });
            return this.articles;
        } catch (error) {
            console.warn('Failed to load articles:', error);
            return {};
        }
    },

    open(id) {
        const modal = this.getElement();
        const title = document.getElementById('modal-title');
        const content = document.getElementById('modal-body');

        document.body.classList.add('scroll-locked');
        title.innerText = `RETRIEVING LOG ${id}...`;
        content.innerHTML = '<p>Decryption in progress...</p>';
        modal.style.display = 'block';

        setTimeout(() => { modal.style.opacity = 1; }, 10);
        setTimeout(() => this.loadContent(id, title, content), 500);
    },

    close() {
        const modal = this.getElement();
        modal.style.opacity = 0;
        document.body.classList.remove('scroll-locked');
        setTimeout(() => { modal.style.display = 'none'; }, 300);
    },

    async loadContent(id, titleEl, contentEl) {
        const articles = await this.loadArticles();
        const article = articles[id];

        if (article) {
            const meta = `TIMESTAMP: ${article.date} // ${article.sector}`;
            titleEl.innerText = article.title;
            contentEl.innerHTML = `
                <p class="mono" style="color:var(--muted)">${meta}</p>
                <hr style="border:0; border-top:1px solid var(--line); margin: 2rem 0;">
                <p>${article.body}</p>
            `;
        } else {
            titleEl.innerText = 'LOG NOT FOUND';
            contentEl.innerHTML = '<p>The requested field note could not be retrieved.</p>';
        }
    },

    init() {
        const modal = this.getElement();
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) this.close();
            });
        }
        // Preload articles for faster first open
        this.loadArticles();
    }
};



/* ============================================
   FOGSIFT NAVIGATION MODULE
   Mobile menu + breadcrumb tracker
   ============================================ */

const Nav = {
    drawerId: 'mobile-drawer',

    toggleMobile() {
        const drawer = document.getElementById(this.drawerId);
        const isOpen = drawer.classList.contains('open');

        if (isOpen) {
            drawer.classList.remove('open');
            document.body.classList.remove('scroll-locked');
        } else {
            drawer.classList.add('open');
            document.body.classList.add('scroll-locked');
        }
    },

    initBreadcrumbs() {
        const pathCat = document.getElementById('crumb-category');
        const pathSec = document.getElementById('crumb-section');
        const sep1 = document.getElementById('sep-1');

        if (!pathCat || !pathSec) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;

                const crumbData = entry.target.getAttribute('data-crumb');
                if (!crumbData) return;

                if (crumbData.includes('/')) {
                    const [category, section] = crumbData.split('/').map(s => s.trim());
                    pathCat.innerHTML = `<a href="#${entry.target.id}" class="crumb-link">${category}</a>`;
                    pathCat.style.display = 'flex';
                    sep1.style.display = 'block';
                    pathSec.innerHTML = `<span class="crumb-current">${section}</span>`;
                } else {
                    pathCat.style.display = 'none';
                    sep1.style.display = 'none';
                    pathSec.innerHTML = `<span class="crumb-current">${crumbData}</span>`;
                }
            });
        }, { threshold: 0.3, rootMargin: '-10% 0px -50% 0px' });

        document.querySelectorAll('section, .card, .contact-box').forEach(el => {
            observer.observe(el);
        });
    },

    initProgressBar() {
        const bar = document.getElementById('progress-bar');
        if (!bar) return;

        window.addEventListener('scroll', () => {
            const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const progress = (scrollTop / scrollHeight) * 100;
            bar.style.width = `${progress}%`;
        });
    },

    init() {
        this.initBreadcrumbs();
        this.initProgressBar();
    }
};



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
