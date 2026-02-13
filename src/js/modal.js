/* ============================================
   FOGSIFT MODAL MODULE
   Article modal system with content loading
   ============================================ */

const Modal = {
    elementId: 'article-modal',
    articles: null, // Cache for loaded articles
    articlesPath: '/content/articles.json',

    // Timing constants (TD-015: no magic numbers)
    TIMING: {
        FADE_IN_DELAY: 10,           // Delay before opacity transition
        CONTENT_LOAD_DELAY: 500,     // Delay before loading content (effect)
        FADE_OUT_DURATION: 300       // Close fade out duration
    },

    getElement() {
        return document.getElementById(this.elementId);
    },

    async loadArticles() {
        if (this.articles) return this.articles;

        try {
            const response = await fetch(this.articlesPath);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            const data = await response.json();
            // Convert array to object keyed by id for fast lookup
            this.articles = {};
            data.articles.forEach(article => {
                this.articles[article.id] = article;
            });
            return this.articles;
        } catch (error) {
            if (typeof Debug !== 'undefined') Debug.log('Modal', 'Failed to load articles:', error.message);
            if (typeof Toast !== 'undefined') {
                Toast.error('Could not load articles. Check connection.');
            }
            return {};
        }
    },

    open(id) {
        const modal = this.getElement();
        const title = document.getElementById('modal-title');
        const content = document.getElementById('modal-body');
        if (!modal || !title || !content) return;

        document.body.classList.add('scroll-locked');
        title.innerText = `RETRIEVING LOG ${id}...`;
        content.innerHTML = '<p>Decryption in progress...</p>';
        modal.style.display = 'block';

        setTimeout(() => { modal.style.opacity = 1; }, this.TIMING.FADE_IN_DELAY);
        setTimeout(() => this.loadContent(id, title, content), this.TIMING.CONTENT_LOAD_DELAY);
    },

    close() {
        const modal = this.getElement();
        if (!modal) return;
        modal.style.opacity = 0;
        document.body.classList.remove('scroll-locked');
        setTimeout(() => { modal.style.display = 'none'; }, this.TIMING.FADE_OUT_DURATION);
    },

    async loadContent(id, titleEl, contentEl) {
        const articles = await this.loadArticles();
        const article = articles[id];

        if (article) {
            const meta = `TIMESTAMP: ${article.date} // ${article.sector}`;
            titleEl.innerText = article.title;

            // Clear content safely
            contentEl.textContent = '';

            // Build DOM elements safely to prevent XSS
            const metaP = document.createElement('p');
            metaP.className = 'mono';
            metaP.style.color = 'var(--muted)';
            metaP.textContent = meta;

            const hr = document.createElement('hr');
            hr.style.cssText = 'border:0; border-top:1px solid var(--line); margin: 2rem 0;';

            const bodyP = document.createElement('p');
            bodyP.textContent = article.body;

            contentEl.appendChild(metaP);
            contentEl.appendChild(hr);
            contentEl.appendChild(bodyP);
        } else {
            titleEl.innerText = 'LOG NOT FOUND';
            contentEl.textContent = '';
            const errorP = document.createElement('p');
            errorP.textContent = 'The requested field note could not be retrieved.';
            contentEl.appendChild(errorP);
        }
    },

    init() {
        const modal = this.getElement();
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) this.close();
            });
            // Preload articles for faster first open
            this.loadArticles();
        }
    }
};

// Explicit global export for consistency with other modules
window.Modal = Modal;
