const WikiNav = {
    sidebar: null,
    toggleBtn: null,
    navPanel: null,

    init() {
        this.sidebar = document.getElementById('wiki-sidebar');
        this.toggleBtn = document.querySelector('.wiki-sidebar__toggle');
        this.navPanel = document.getElementById('wiki-sidebar-nav');
        this.highlightActivePage();

        if (this.sidebar) {
            this.sidebar.addEventListener('click', (e) => {
                if (e.target.closest('.wiki-nav-list a')) {
                    setTimeout(() => this.close(), 150);
                }
            });
        }
    },

    toggle() {
        if (!this.toggleBtn) {
            this.toggleBtn = document.querySelector('.wiki-sidebar__toggle');
            this.navPanel = document.getElementById('wiki-sidebar-nav');
        }
        if (!this.sidebar) this.sidebar = document.getElementById('wiki-sidebar');
        if (!this.toggleBtn) return;

        const expanded = this.toggleBtn.getAttribute('aria-expanded') === 'true';
        this.toggleBtn.setAttribute('aria-expanded', String(!expanded));
        this.sidebar.classList.toggle('wiki-sidebar--open');

        const icon = this.toggleBtn.querySelector('.wiki-sidebar__toggle-icon');
        if (icon) icon.textContent = expanded ? '+' : '\u2212';
    },

    close() {
        if (!this.sidebar || !this.toggleBtn) return;
        this.toggleBtn.setAttribute('aria-expanded', 'false');
        this.sidebar.classList.remove('wiki-sidebar--open');
        const icon = this.toggleBtn.querySelector('.wiki-sidebar__toggle-icon');
        if (icon) icon.textContent = '+';
    },

    highlightActivePage() {
        const currentPage = window.location.pathname.split('/').pop();
        document.querySelectorAll('.wiki-nav-list a').forEach(link => {
            const href = link.getAttribute('href');
            if (href && (href === currentPage || href.endsWith(currentPage))) {
                link.setAttribute('aria-current', 'page');
                link.closest('li')?.classList.add('active');
            }
        });
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => WikiNav.init());
} else {
    WikiNav.init();
}
