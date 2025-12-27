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
   Mobile menu handling
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

    init() {
        // Navigation initialized
    }
};


/* ============================================
   FOGSIFT MAIN
   Minimal app initialization
   ============================================ */

const App = {
    version: '0.0.2',

    init() {
        Nav.init();
        Modal.init();
        this.initClock();
        this.initAccessibility();
        this.initRotatingWords();
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
                }, 300);
            }, 2500);
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
