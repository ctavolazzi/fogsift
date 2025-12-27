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

