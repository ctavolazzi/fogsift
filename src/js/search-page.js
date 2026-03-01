/**
 * FogSift Search Page
 * Standalone client-side search for /search — separate from the SiteSearch nav overlay.
 */
(function () {
    'use strict';

    var INDEX_URL = 'search-index.json';
    var MIN_QUERY_LEN = 2;
    var MAX_RESULTS = 40;
    var DEBOUNCE_MS = 200;
    var CATEGORY_ORDER = ['Wiki', 'Home', 'About', 'Offers', 'FAQ', 'Portfolio', 'Queue', 'Contact', 'Vision', 'Privacy', 'Legal'];

    var index = null;
    var debounceTimer = null;

    var inputEl = document.getElementById('search-input');
    var clearEl = document.getElementById('search-clear');
    var statusEl = document.getElementById('search-status');
    var resultsEl = document.getElementById('search-results');
    var tipEl = document.getElementById('search-tip');

    if (!inputEl || !resultsEl) return;

    // --- Load index ---
    function loadIndex() {
        fetch(INDEX_URL)
            .then(function (r) {
                if (!r.ok) throw new Error('HTTP ' + r.status);
                return r.json();
            })
            .then(function (data) {
                index = data;
                var q = inputEl.value.trim();
                if (q.length >= MIN_QUERY_LEN) runSearch(q);
            })
            .catch(function () {
                if (statusEl) statusEl.textContent = 'Search index unavailable.';
            });
    }

    // --- Scoring ---
    function scoreItem(item, terms) {
        var score = 0;
        var title = (item.title || '').toLowerCase();
        var desc = (item.description || '').toLowerCase();
        var content = (item.content || '').toLowerCase();
        var headings = (item.headings || []).join(' ').toLowerCase();

        terms.forEach(function (term) {
            if (title === term) { score += 20; }
            else if (title.indexOf(term) === 0) { score += 12; }
            else if (title.includes(term)) { score += 8; }

            if (desc.includes(term)) { score += 4; }
            if (headings.includes(term)) { score += 3; }
            if (content.includes(term)) { score += 1; }
        });

        return score;
    }

    // --- Escape HTML ---
    function escapeHtml(str) {
        return (str || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

    // --- Escape regex special chars ---
    function escapeRe(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    // --- Highlight matching terms ---
    function highlight(text, terms) {
        var safe = escapeHtml(text);
        terms.forEach(function (term) {
            var re = new RegExp('(' + escapeRe(term) + ')', 'gi');
            safe = safe.replace(re, '<mark>$1</mark>');
        });
        return safe;
    }

    // --- Get text snippet near first match ---
    function snippet(text, terms, maxLen) {
        maxLen = maxLen || 160;
        if (!text) return '';
        var lower = text.toLowerCase();
        var bestPos = 0;
        terms.forEach(function (term) {
            var pos = lower.indexOf(term);
            if (pos !== -1) bestPos = Math.max(bestPos, pos);
        });
        var start = Math.max(0, bestPos - 60);
        var slice = text.slice(start, start + maxLen);
        if (start > 0) slice = '\u2026' + slice;
        if (start + maxLen < text.length) slice += '\u2026';
        return slice;
    }

    // --- Group by category ---
    function groupResults(results) {
        var groups = {};
        results.forEach(function (item) {
            var cat = item.category || 'Other';
            if (!groups[cat]) groups[cat] = [];
            groups[cat].push(item);
        });
        return groups;
    }

    // --- Render results ---
    function render(results, terms) {
        resultsEl.innerHTML = '';

        if (results.length === 0) {
            var empty = document.createElement('div');
            empty.className = 'search-empty';
            empty.innerHTML = '<strong>No results found.</strong><p>Try different keywords, or <a href="wiki/index.html">browse the wiki</a>.</p>';
            resultsEl.appendChild(empty);
            return;
        }

        var groups = groupResults(results);
        var ordered = [];
        CATEGORY_ORDER.forEach(function (cat) {
            if (groups[cat]) ordered.push([cat, groups[cat]]);
        });
        Object.keys(groups).forEach(function (cat) {
            if (CATEGORY_ORDER.indexOf(cat) === -1) ordered.push([cat, groups[cat]]);
        });

        ordered.forEach(function (pair) {
            var cat = pair[0];
            var items = pair[1];

            var groupEl = document.createElement('div');
            groupEl.className = 'search-group';

            var titleEl = document.createElement('div');
            titleEl.className = 'search-group-title';
            titleEl.textContent = cat + ' \u2014 ' + items.length + ' result' + (items.length !== 1 ? 's' : '');
            groupEl.appendChild(titleEl);

            items.forEach(function (item) {
                var a = document.createElement('a');
                a.className = 'search-result';
                a.href = item.url;

                var titleDiv = document.createElement('div');
                titleDiv.className = 'search-result-title';
                titleDiv.innerHTML = highlight(item.title, terms);

                var urlDiv = document.createElement('div');
                urlDiv.className = 'search-result-url';
                urlDiv.textContent = '/' + item.url.replace(/\.html$/, '').replace(/\/index$/, '');

                var descText = item.description || snippet(item.content, terms);
                var descDiv = document.createElement('div');
                descDiv.className = 'search-result-desc';
                descDiv.innerHTML = highlight(descText, terms);

                a.appendChild(titleDiv);
                a.appendChild(urlDiv);
                a.appendChild(descDiv);
                groupEl.appendChild(a);
            });

            resultsEl.appendChild(groupEl);
        });
    }

    // --- Run search ---
    function runSearch(query) {
        if (!index) {
            if (statusEl) statusEl.textContent = 'Loading\u2026';
            return;
        }

        var terms = query.toLowerCase().split(/\s+/).filter(function (t) { return t.length > 0; });
        if (terms.length === 0) {
            clearResults();
            return;
        }

        if (tipEl) tipEl.style.display = 'none';

        var scored = index
            .map(function (item) { return { item: item, score: scoreItem(item, terms) }; })
            .filter(function (x) { return x.score > 0; })
            .sort(function (a, b) { return b.score - a.score; })
            .slice(0, MAX_RESULTS)
            .map(function (x) { return x.item; });

        if (statusEl) {
            statusEl.textContent = scored.length === 0
                ? 'No results for \u201c' + query + '\u201d'
                : scored.length + ' result' + (scored.length !== 1 ? 's' : '') + ' for \u201c' + query + '\u201d';
        }

        render(scored, terms);
    }

    function clearResults() {
        resultsEl.innerHTML = '';
        if (statusEl) statusEl.textContent = '';
        if (tipEl) tipEl.style.display = '';
    }

    // --- Event handlers ---
    function onInput() {
        var q = inputEl.value.trim();
        if (clearEl) clearEl.classList.toggle('visible', q.length > 0);

        clearTimeout(debounceTimer);

        if (q.length < MIN_QUERY_LEN) {
            if (q.length === 1) {
                if (statusEl) statusEl.textContent = 'Keep typing\u2026';
            } else {
                clearResults();
            }
            return;
        }

        debounceTimer = setTimeout(function () { runSearch(q); }, DEBOUNCE_MS);
    }

    function onClear() {
        inputEl.value = '';
        inputEl.focus();
        if (clearEl) clearEl.classList.remove('visible');
        clearResults();
    }

    // --- Read ?q= from URL ---
    function getInitialQuery() {
        try {
            return new URLSearchParams(window.location.search).get('q') || '';
        } catch (_e) {
            return '';
        }
    }

    // --- Init ---
    var initialQuery = getInitialQuery();
    if (initialQuery) {
        inputEl.value = initialQuery;
        if (clearEl) clearEl.classList.add('visible');
    }

    inputEl.addEventListener('input', onInput);
    inputEl.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') onClear();
    });
    if (clearEl) clearEl.addEventListener('click', onClear);

    inputEl.focus();
    loadIndex();

}());
