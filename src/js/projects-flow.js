/* ============================================
   PROJECTS FLOW
   Card click -> modal -> project detail page
   ============================================ */

const ProjectsFlow = {
    modalId: 'project-modal',
    detailPagePath: 'project.html',

    init() {
        this.initPortfolioCards();
        this.initModalControls();
        this.initProjectPage();
    },

    normalizeTitle(value) {
        return (value || '')
            .toLowerCase()
            .replace(/['"’]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    },

    getProjectById(id) {
        return (window.PROJECTS_DATA || []).find(project => project.id === id) || null;
    },

    getProjectByTitle(title) {
        const normalized = this.normalizeTitle(title);
        return (window.PROJECTS_DATA || []).find(project => this.normalizeTitle(project.title) === normalized) || null;
    },

    getCardTitle(card) {
        const titleEl = card.querySelector('.project-name, .portfolio-title, .now-card-title');
        return titleEl ? titleEl.textContent.trim() : '';
    },

    getCardProject(card) {
        const explicitId = card.getAttribute('data-project-id');
        if (explicitId) {
            return this.getProjectById(explicitId);
        }
        return this.getProjectByTitle(this.getCardTitle(card));
    },

    initPortfolioCards() {
        const cards = document.querySelectorAll('.project-card, .portfolio-card, .now-card');
        if (!cards.length) return;

        cards.forEach(card => {
            const project = this.getCardProject(card);
            if (!project) return;

            card.classList.add('project-clickable');
            card.setAttribute('role', 'button');
            card.setAttribute('tabindex', '0');
            card.setAttribute('aria-label', `Open project details for ${project.title}`);

            card.addEventListener('click', event => {
                event.preventDefault();
                this.openModal(project.id);
            });

            card.addEventListener('keydown', event => {
                if (event.key !== 'Enter' && event.key !== ' ') return;
                event.preventDefault();
                this.openModal(project.id);
            });

            card.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', event => {
                    event.preventDefault();
                    event.stopPropagation();
                    this.openModal(project.id);
                });
            });
        });
    },

    initModalControls() {
        const modal = document.getElementById(this.modalId);
        if (!modal) return;

        modal.addEventListener('click', event => {
            if (event.target === modal || event.target.closest('[data-close-project-modal]')) {
                this.closeModal();
            }
        });

        document.addEventListener('keydown', event => {
            if (event.key === 'Escape' && modal.classList.contains('open')) {
                this.closeModal();
            }
        });
    },

    openModal(projectId) {
        const modal = document.getElementById(this.modalId);
        const project = this.getProjectById(projectId);
        if (!modal || !project) return;

        const title = modal.querySelector('[data-project-modal-title]');
        const tag = modal.querySelector('[data-project-modal-tag]');
        const status = modal.querySelector('[data-project-modal-status]');
        const summary = modal.querySelector('[data-project-modal-summary]');
        const deepDive = modal.querySelector('[data-project-modal-deep-dive]');
        const highlights = modal.querySelector('[data-project-modal-highlights]');
        const visual = modal.querySelector('[data-project-modal-image]');
        const readMore = modal.querySelector('[data-project-read-more]');

        title.textContent = project.title;
        tag.textContent = `${project.category} · ${project.time}`;
        status.textContent = project.status;
        summary.textContent = project.summary;
        deepDive.textContent = project.deepDive;
        visual.src = project.image;
        visual.alt = `${project.title} project visual`;
        readMore.href = `${this.detailPagePath}?id=${encodeURIComponent(project.id)}`;

        highlights.innerHTML = '';
        project.highlights.forEach(item => {
            const li = document.createElement('li');
            li.textContent = item;
            highlights.appendChild(li);
        });

        modal.classList.add('open');
        document.body.classList.add('scroll-locked');
    },

    closeModal() {
        const modal = document.getElementById(this.modalId);
        if (!modal) return;
        modal.classList.remove('open');
        document.body.classList.remove('scroll-locked');
    },

    initProjectPage() {
        const root = document.getElementById('project-detail-root');
        if (!root) return;

        const params = new URLSearchParams(window.location.search);
        const project = this.getProjectById(params.get('id'));

        if (!project) {
            root.innerHTML = `
                <section class="section">
                    <h1 class="section-label">PROJECT NOT FOUND</h1>
                    <p class="section-intro">This project link is invalid or no longer available.</p>
                    <p><a href="portfolio.html" class="cta-button cta-secondary">Back to Projects</a></p>
                </section>
            `;
            return;
        }

        root.innerHTML = `
            <section class="section project-detail-hero">
                <p class="project-detail-kicker">${project.category} · ${project.time}</p>
                <h1 class="projects-hero-title">${project.title}</h1>
                <p class="section-intro centered">${project.summary}</p>
                <div class="project-detail-meta">
                    <span class="project-status ${project.status === 'Active' ? 'active' : 'done'}">${project.status}</span>
                    <a href="portfolio.html" class="project-card-link">← Back to Projects</a>
                </div>
            </section>
            <section class="section project-detail-layout">
                <div class="project-detail-visual">
                    <img src="${project.image}" alt="${project.title} project visual" loading="lazy">
                </div>
                <div class="project-detail-content">
                    <h2 class="section-label">DEEP DIVE</h2>
                    <p>${project.deepDive}</p>
                    <h2 class="section-label">HIGHLIGHTS</h2>
                    <ul class="project-detail-highlights">
                        ${project.highlights.map(item => `<li>${item}</li>`).join('')}
                    </ul>
                </div>
            </section>
        `;

        document.title = `${project.title} | Fogsift`;
    }
};

window.ProjectsFlow = ProjectsFlow;
