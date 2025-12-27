/* ============================================
   FOGSIFT TOAST MODULE
   Notification system
   ============================================ */

const Toast = {
    containerId: 'toast-container',
    defaultDuration: 2500,

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
        const container = this.getContainer();
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerText = message;
        container.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideOut 0.2s ease forwards';
            setTimeout(() => toast.remove(), 200);
        }, duration);
    }
};



/* ============================================
   FOGSIFT THEME MODULE
   Light/dark mode toggle with persistence
   ============================================ */

const Theme = {
    STORAGE_KEY: 'theme',

    init() {
        const saved = localStorage.getItem(this.STORAGE_KEY);
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const theme = saved || (prefersDark ? 'dark' : 'light');
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

    getElement() {
        return document.getElementById(this.elementId);
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

    loadContent(id, titleEl, contentEl) {
        // TODO: Replace with fetch from articles.json
        const articles = {
            '001': {
                title: 'FIELD NOTE: THE MAP IS NOT THE TERRITORY',
                meta: 'TIMESTAMP: 2025-01-14 // SECTOR: STRATEGY',
                body: 'Most organizations confuse their organizational chart with their actual communication network. When we deploy the Trace protocol, we find the critical node is often a Scheduler in a basement office.'
            },
            '002': {
                title: 'FIELD NOTE: PRECISION VS ACCURACY',
                meta: 'TIMESTAMP: 2025-01-08 // FABRICATION',
                body: 'In CNC, precision is repeatability. Accuracy is hitting the mark. You can be precise (hitting the same wrong spot every time) without being accurate. Strategy works the same way.'
            },
            '003': {
                title: 'FIELD NOTE: ENTROPY',
                meta: 'TIMESTAMP: 2024-12-22 // SYSTEMS',
                body: 'Chaos is the default state. Order requires energy injection. If you stop pushing, the system decays.'
            }
        };

        const article = articles[id];
        if (article) {
            titleEl.innerText = article.title;
            contentEl.innerHTML = `
                <p class="mono" style="color:var(--muted)">${article.meta}</p>
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
        this.initEventBindings();
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
        const checkboxes = document.querySelectorAll('.check-item');
        let checkedCount = 0;

        checkboxes.forEach(item => {
            item.addEventListener('click', () => {
                const box = item.querySelector('.check-box');
                if (!box) return;

                if (box.innerText === '[x]') {
                    box.innerText = '[ ]';
                    box.classList.remove('checked');
                    checkedCount--;
                } else {
                    box.innerText = '[x]';
                    box.classList.add('checked');
                    checkedCount++;
                    Toast.show('CRITERION VERIFIED');
                }

                const hotline = document.querySelector('.hotline-button');
                if (checkedCount === 3) {
                    Toast.show('PROFILE MATCH: HIGH PROBABILITY');
                    hotline?.classList.add('pulse');
                } else {
                    hotline?.classList.remove('pulse');
                }
            });
        });
    },

    initEventBindings() {
        // Copy button
        const copyBtn = document.getElementById('copy-btn');
        copyBtn?.addEventListener('click', () => {
            navigator.clipboard.writeText(document.body.innerText)
                .then(() => Toast.show('SYSTEM LOG: TRANSCRIPT EXTRACTED'));
        });

        // Hotline hover
        const hotline = document.querySelector('.hotline-button');
        hotline?.addEventListener('mouseenter', () => {
            Toast.show('CHANNEL: DIRECT / PRIORITY');
        });

        // Subscribe button
        const subBtn = document.getElementById('sub-btn');
        subBtn?.addEventListener('click', () => {
            Toast.show('SUBSCRIPTION PROTOCOL: COMING SOON');
        });
    },

    logBoot() {
        console.log(
            '%c FOGSIFT v' + this.version + ' // SYSTEMS NOMINAL ',
            'background: #18181b; color: #d97706; padding: 10px; font-family: monospace; font-weight: bold; border-left: 5px solid #06b6d4;'
        );
    }
};

// Boot on DOM ready
document.addEventListener('DOMContentLoaded', () => App.init());

