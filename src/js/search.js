/**
 * SiteSearch - Context-aware global site search for FogSift
 * Loads search-index.json and provides instant full-site search
 * with animated fold-out results panel.
 *
 * Context-aware: knows the current page and searches visible DOM content
 * first, then expands to the full site index.
 *
 * Search icon in nav triggers overlay; keyboard shortcut / to focus.
 */
const SiteSearch = {
    index: null,
    overlay: null,
    input: null,
    results: null,
    counter: null,
    isOpen: false,
    _loading: false,

    /** Get current page info */
    getCurrentPage() {
        const path = window.location.pathname.replace(/^\//, '').replace(/\/$/, '');
        const page = path || 'index.html';
        const pageFile = page.endsWith('.html') ? page : page + '.html';
        // Cloudflare strips .html, so also match clean URLs
        const clean = pageFile.replace('.html', '');
        return { pageFile, clean };
    },

    /** Scan current page DOM for searchable sections */
    scanCurrentPage() {
        const main = document.querySelector('main') || document.body;
        const sections = [];

        // Find all sections with headings
        const elements = main.querySelectorAll('section, .process-step, .pricing-card, details, .about-card, .testimonial-card');
        elements.forEach(el => {
            const heading = el.querySelector('h1, h2, h3, h4, summary');
            const headingText = heading ? heading.textContent.trim() : '';
            const bodyText = el.textContent.trim().substring(0, 300);
            const id = el.id || (heading && heading.id) || '';

            if (bodyText.length > 10) {
                sections.push({
                    heading: headingText,
                    text: bodyText,
                    id: id,
                    element: el
                });
            }
        });

        return sections;
    },

    /** Toggle search overlay open/closed */
    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    },

    /** Open the search overlay */
    open() {
        if (!this.overlay) this.buildOverlay();
        this.isOpen = true;
        this.overlay.classList.add('open');
        document.body.style.overflow = 'hidden';
        requestAnimationFrame(() => {
            this.input.focus();
        });
        this.loadIndex();
    },

    /** Close the search overlay */
    close() {
        if (!this.overlay) return;
        this.isOpen = false;
        this.overlay.classList.remove('open');
        document.body.style.overflow = '';
        this.input.value = '';
        this.results.innerHTML = '';
        this.counter.textContent = '';
    },

    /** Build the overlay DOM */
    buildOverlay() {
        this.overlay = document.createElement('div');
        this.overlay.className = 'search-overlay';
        this.overlay.setAttribute('role', 'dialog');
        this.overlay.setAttribute('aria-modal', 'true');
        this.overlay.setAttribute('aria-label', 'Site search');

        // Detect current page for display
        const pageTitle = document.title.replace(/\s*\|.*$/, '').trim();

        this.overlay.innerHTML = `
            <div class="search-overlay-backdrop"></div>
            <div class="search-panel">
                <div class="search-panel-header">
                    <div class="search-input-wrap">
                        <svg class="search-input-icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                            <circle cx="10" cy="10" r="7" fill="var(--burnt-orange, #e07b3c)" opacity="0.3"/>
                            <circle cx="10" cy="10" r="7" fill="none" stroke="currentColor" stroke-width="2"/>
                            <line x1="15.5" y1="15.5" x2="21" y2="21" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
                        </svg>
                        <input type="search" class="search-panel-input" placeholder="Search this page &amp; all of FogSift..." aria-label="Search" autocomplete="off" spellcheck="false">
                        <kbd class="search-kbd">/</kbd>
                        <button class="search-close-btn" aria-label="Close search">&times;</button>
                    </div>
                    <div class="search-context-bar">
                        <span class="search-context-page">
                            <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true"><circle cx="8" cy="8" r="4" fill="var(--burnt-orange, #e07b3c)"/></svg>
                            ${this.escapeHtml(pageTitle)}
                        </span>
                    </div>
                </div>
                <div class="search-panel-body">
                    <div class="search-results"></div>
                    <span class="search-counter" aria-live="polite"></span>
                </div>
            </div>
        `;

        document.body.appendChild(this.overlay);

        // Cache refs
        this.input = this.overlay.querySelector('.search-panel-input');
        this.results = this.overlay.querySelector('.search-results');
        this.counter = this.overlay.querySelector('.search-counter');

        // Events
        this.overlay.querySelector('.search-overlay-backdrop').addEventListener('click', () => this.close());
        this.overlay.querySelector('.search-close-btn').addEventListener('click', () => this.close());

        this.input.addEventListener('input', () => this.onSearch());
        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.close();
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                const first = this.results.querySelector('.search-result-card');
                if (first) first.focus();
            }
        });

        // Keyboard nav within results
        this.results.addEventListener('keydown', (e) => {
            const cards = [...this.results.querySelectorAll('.search-result-card')];
            const idx = cards.indexOf(document.activeElement);
            if (e.key === 'ArrowDown' && idx < cards.length - 1) {
                e.preventDefault();
                cards[idx + 1].focus();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (idx > 0) cards[idx - 1].focus();
                else this.input.focus();
            } else if (e.key === 'Escape') {
                this.close();
            }
        });

        // Hide kbd hint on input focus
        const kbd = this.overlay.querySelector('.search-kbd');
        this.input.addEventListener('focus', () => { kbd.style.display = 'none'; });
        this.input.addEventListener('blur', () => {
            if (!this.input.value) kbd.style.display = '';
        });
    },

    /** Load the search index (lazy, once) */
    async loadIndex() {
        if (this.index || this._loading) return;
        this._loading = true;
        try {
            // Try relative path, then root
            let resp = await fetch('search-index.json');
            if (!resp.ok) {
                resp = await fetch('/search-index.json');
            }
            if (resp.ok) {
                this.index = await resp.json();
            }
        } catch (e) {
            if (typeof Debug !== 'undefined') Debug.log('SiteSearch', 'Could not load search index:', e.message);
        }
        this._loading = false;
    },

    /** Run the search - current page first, then site-wide */
    onSearch() {
        const q = this.input.value.toLowerCase().trim();

        if (!q) {
            this.results.innerHTML = '';
            this.counter.textContent = '';
            return;
        }

        const terms = q.split(/\s+/).filter(Boolean);
        const currentPage = this.getCurrentPage();
        const localSections = this.scanCurrentPage();
        let html = '';
        let totalResults = 0;

        // ── Section 1: "On this page" results ──
        const localMatches = [];
        for (const section of localSections) {
            const textLower = section.text.toLowerCase();
            const headingLower = section.heading.toLowerCase();
            let score = 0;

            for (const term of terms) {
                if (headingLower.includes(term)) score += 10;
                if (textLower.includes(term)) score += 1;
            }

            if (score > 0) {
                localMatches.push({ section, score });
            }
        }

        localMatches.sort((a, b) => b.score - a.score);

        if (localMatches.length > 0) {
            html += '<div class="search-group">';
            html += '<div class="search-group-label">ON THIS PAGE</div>';
            html += localMatches.slice(0, 5).map((item, i) => {
                const s = item.section;
                const snippet = this.highlightSnippet(s.text, terms);
                const anchor = s.id ? '#' + s.id : '';

                return `<a href="${anchor}" class="search-result-card search-result-local" tabindex="0" style="animation-delay: ${i * 40}ms" onclick="SiteSearch.scrollToSection('${s.id}'); return false;">
                    <div class="search-result-top">
                        <span class="search-result-category">This page</span>
                        <span class="search-result-title">${this.highlightText(s.heading || 'Section', terms)}</span>
                    </div>
                    ${snippet ? `<p class="search-result-snippet">${snippet}</p>` : ''}
                </a>`;
            }).join('');
            html += '</div>';
            totalResults += localMatches.length;
        }

        // ── Section 2: Site-wide results ──
        if (this.index) {
            const scored = [];

            for (const entry of this.index) {
                // Check if this is the current page (lower priority in site results)
                const isCurrentPage =
                    entry.url === currentPage.pageFile ||
                    entry.url === currentPage.clean ||
                    entry.url === currentPage.clean + '/' ||
                    entry.url === currentPage.pageFile.replace('index.html', '');

                let score = 0;
                const titleLower = (entry.title || '').toLowerCase();
                const descLower = (entry.description || '').toLowerCase();
                const headingsLower = (entry.headings || []).join(' ').toLowerCase();
                const contentLower = (entry.content || '').toLowerCase();

                for (const term of terms) {
                    if (titleLower.includes(term)) score += 10;
                    if (descLower.includes(term)) score += 5;
                    if (headingsLower.includes(term)) score += 3;
                    if (contentLower.includes(term)) score += 1;
                }

                if (score > 0) {
                    // Deprioritize current page in site results since we show it above
                    if (isCurrentPage) score *= 0.3;
                    scored.push({ entry, score, isCurrentPage });
                }
            }

            scored.sort((a, b) => b.score - a.score);

            // Filter out current page if we already have local matches
            const siteResults = localMatches.length > 0
                ? scored.filter(s => !s.isCurrentPage)
                : scored;

            if (siteResults.length > 0) {
                const delay = localMatches.length > 0 ? localMatches.length * 40 : 0;
                html += '<div class="search-group">';
                html += '<div class="search-group-label">ALL PAGES</div>';
                html += siteResults.map((item, i) => {
                    const e = item.entry;
                    const snippet = this.highlightSnippet(e.description || e.content, terms);
                    const headingList = (e.headings || []).slice(0, 3)
                        .map(h => this.highlightText(h, terms))
                        .join(' &middot; ');

                    return `<a href="${e.url}" class="search-result-card" tabindex="0" style="animation-delay: ${delay + i * 40}ms">
                        <div class="search-result-top">
                            <span class="search-result-category">${e.category || ''}</span>
                            <span class="search-result-title">${this.highlightText(e.title, terms)}</span>
                        </div>
                        ${snippet ? `<p class="search-result-snippet">${snippet}</p>` : ''}
                        ${headingList ? `<div class="search-result-headings">${headingList}</div>` : ''}
                    </a>`;
                }).join('');
                html += '</div>';
                totalResults += siteResults.length;
            }
        } else {
            html += '<div class="search-empty">Loading site index...</div>';
        }

        if (totalResults === 0 && this.index) {
            html = '<div class="search-empty">No results found</div>';
        }

        this.results.innerHTML = html;
        this.counter.textContent = totalResults > 0
            ? totalResults + ' result' + (totalResults !== 1 ? 's' : '')
            : '';
    },

    /** Scroll to a section on the current page and close search */
    scrollToSection(id) {
        this.close();
        if (!id) return;
        const el = document.getElementById(id);
        if (el) {
            const navHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 70;
            const top = el.getBoundingClientRect().top + window.scrollY - navHeight - 20;
            window.scrollTo({ top, behavior: 'smooth' });
            // Brief highlight flash
            el.style.transition = 'outline 0.3s ease, outline-offset 0.3s ease';
            el.style.outline = '3px solid var(--burnt-orange)';
            el.style.outlineOffset = '8px';
            setTimeout(() => {
                el.style.outline = '';
                el.style.outlineOffset = '';
            }, 1500);
        }
    },

    /** Highlight matching terms in text */
    highlightText(text, terms) {
        if (!text) return '';
        let result = this.escapeHtml(text);
        for (const term of terms) {
            const regex = new RegExp('(' + term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
            result = result.replace(regex, '<mark class="search-hl">$1</mark>');
        }
        return result;
    },

    /** Get a snippet around the first match */
    highlightSnippet(text, terms) {
        if (!text) return '';
        const lower = text.toLowerCase();
        let bestIdx = -1;

        for (const term of terms) {
            const idx = lower.indexOf(term);
            if (idx !== -1 && (bestIdx === -1 || idx < bestIdx)) {
                bestIdx = idx;
            }
        }

        let snippet;
        if (bestIdx > 30) {
            snippet = '...' + text.substring(bestIdx - 30, bestIdx + 120);
        } else {
            snippet = text.substring(0, 150);
        }
        if (snippet.length < text.length) snippet += '...';

        return this.highlightText(snippet, terms);
    },

    escapeHtml(text) {
        const d = document.createElement('div');
        d.textContent = text;
        return d.innerHTML;
    },

    /** Global keyboard shortcut setup */
    initKeyboard() {
        document.addEventListener('keydown', (e) => {
            // / to open search (when not in an input)
            if (e.key === '/' && !e.ctrlKey && !e.metaKey &&
                !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {
                e.preventDefault();
                this.open();
            }
            // Cmd/Ctrl+K to toggle
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                this.toggle();
            }
            // Escape to close
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });
    }
};

// Auto-initialize keyboard shortcuts
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => SiteSearch.initKeyboard());
} else {
    SiteSearch.initKeyboard();
}
