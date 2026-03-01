/**
 * FOGSIFT TERMINAL DEMO
 * Pre-programmed CRT exhibit player for wiki and documentation pages.
 *
 * Usage:
 *   <div class="terminal-crt">...</div>            — shows all exhibits
 *   <div class="terminal-crt" data-exhibits="store,l1">...</div>  — filtered
 *
 * Exhibit IDs: boot | store | l1 | l2 | link | stats
 */
(function () {
  'use strict';

  // ── Timing ────────────────────────────────────────────────────────
  const TIMING = {
    CHAR_DELAY: 18,
    LINE_DELAY: 75,
    BOOT_CHAR_DELAY: 12,
    RESPONSE_DELAY: 300,
    AUTO_ADVANCE: 14_000,
  };

  // ── Exhibit registry ──────────────────────────────────────────────
  const EXHIBIT_REGISTRY = {

    boot: {
      label: 'BOOT SEQUENCE',
      lines: [
        { text: 'FOGSIFT MEMORY SYSTEMS  v2.0.0', type: 'system' },
        { text: 'Cognitive Architecture / SQLite Edition', type: 'dim' },
        { text: '', type: 'blank' },
        { text: 'INITIALIZING...', type: 'system' },
        { text: '[####################] 100%', type: 'system', delay: 280 },
        { text: '', type: 'blank' },
        { text: '> SCHEMA v2.0 LOADED.................[OK]', type: 'request' },
        { text: '> FOREIGN KEYS ENABLED...............[OK]', type: 'request' },
        { text: '> WAL JOURNAL MODE...................[OK]', type: 'request' },
        { text: '> KEYWORD INDEX (L1).................[READY]', type: 'request' },
        { text: '> METADATA FILTER (L2)...............[READY]', type: 'request' },
        { text: '> FRAGMENT COUNT: 0', type: 'request' },
        { text: '', type: 'blank' },
        { text: 'SYSTEM ONLINE. SELECT EXHIBIT TO BEGIN.', type: 'success' },
      ],
    },

    store: {
      label: 'STORE A MEMORY',
      lines: [
        { text: '// POST /api/memory/remember', type: 'comment' },
        { text: '// Stores one fragment. ERROR type defaults to importance 0.9.', type: 'comment' },
        { text: '', type: 'blank' },
        { text: '> POST /api/memory/remember', type: 'request' },
        { text: '> Content-Type: application/json', type: 'dim' },
        { text: '> {', type: 'request' },
        { text: '>   "content": "Redis cluster failed at peak load. All 3 nodes', type: 'request' },
        { text: '>              went down. Root cause: no maxmemory limit set.",', type: 'request' },
        { text: '>   "topic": "infrastructure",', type: 'request' },
        { text: '>   "type": "error",', type: 'request' },
        { text: '>   "keywords": ["redis", "cluster", "maxmemory", "oom"]', type: 'request' },
        { text: '> }', type: 'request' },
        { text: '', type: 'blank' },
        { text: '< HTTP 200 OK  (11ms)', type: 'response', delay: TIMING.RESPONSE_DELAY },
        { text: '< {', type: 'response' },
        { text: '<   "id": "frag_a1b2c3d4e5f6",', type: 'response' },
        { text: '<   "topic": "infrastructure",', type: 'response' },
        { text: '<   "type": "error",', type: 'response' },
        { text: '<   "importance": 0.9,', type: 'response' },
        { text: '<   "ttl_tier": "hot",', type: 'response' },
        { text: '<   "keywords": ["redis", "cluster", "maxmemory", "oom"],', type: 'response' },
        { text: '<   "reference_count": 0', type: 'response' },
        { text: '< }', type: 'response' },
        { text: '', type: 'blank' },
        { text: 'STORED.  ID: frag_a1b2c3d4e5f6  IMPORTANCE: 0.9  TIER: HOT', type: 'success' },
      ],
    },

    l1: {
      label: 'L1 KEYWORD RECALL',
      lines: [
        { text: '// POST /api/memory/recall — keyword path', type: 'comment' },
        { text: '// Hits the keyword index directly. Fastest retrieval.', type: 'comment' },
        { text: '', type: 'blank' },
        { text: '> POST /api/memory/recall', type: 'request' },
        { text: '> {', type: 'request' },
        { text: '>   "keywords": ["redis", "cluster"],', type: 'request' },
        { text: '>   "token_budget": 1000', type: 'request' },
        { text: '> }', type: 'request' },
        { text: '', type: 'blank' },
        { text: '// Query executed:', type: 'comment' },
        { text: '// SELECT DISTINCT f.* FROM fragments f', type: 'comment' },
        { text: '// JOIN keywords k ON f.id = k.fragment_id', type: 'comment' },
        { text: '// WHERE k.keyword IN (\'redis\', \'cluster\')', type: 'comment' },
        { text: '', type: 'blank' },
        { text: '< HTTP 200 OK  (4ms)', type: 'response', delay: TIMING.RESPONSE_DELAY },
        { text: '< {', type: 'response' },
        { text: '<   "success": true,', type: 'response' },
        { text: '<   "fragments": [{ "id": "frag_a1b2c3d4e5f6", ... }],', type: 'response' },
        { text: '<   "search_path": ["L1:1"],', type: 'response' },
        { text: '<   "total_tokens": 52,', type: 'response' },
        { text: '<   "query_time_ms": 3.8', type: 'response' },
        { text: '< }', type: 'response' },
        { text: '', type: 'blank' },
        { text: 'L1 HIT.  1 FRAGMENT  3.8ms  52 TOKENS', type: 'success' },
        { text: 'TIP: search_path shows which tier retrieved the result.', type: 'dim' },
      ],
    },

    l2: {
      label: 'L2 METADATA FALLBACK',
      lines: [
        { text: '// POST /api/memory/recall — metadata path', type: 'comment' },
        { text: '// No keywords given — falls back to topic/type filter.', type: 'comment' },
        { text: '', type: 'blank' },
        { text: '> POST /api/memory/recall', type: 'request' },
        { text: '> {', type: 'request' },
        { text: '>   "topic": "infrastructure",', type: 'request' },
        { text: '>   "type": "error",', type: 'request' },
        { text: '>   "token_budget": 2000', type: 'request' },
        { text: '> }', type: 'request' },
        { text: '', type: 'blank' },
        { text: '// L1 skipped (no keywords).', type: 'comment' },
        { text: '// L2 query executed:', type: 'comment' },
        { text: '// SELECT * FROM fragments', type: 'comment' },
        { text: '// WHERE topic = \'infrastructure\' AND type = \'error\'', type: 'comment' },
        { text: '// ORDER BY importance DESC, last_referenced DESC', type: 'comment' },
        { text: '', type: 'blank' },
        { text: '< HTTP 200 OK  (9ms)', type: 'response', delay: TIMING.RESPONSE_DELAY },
        { text: '< {', type: 'response' },
        { text: '<   "success": true,', type: 'response' },
        { text: '<   "fragments": [{ ... }],', type: 'response' },
        { text: '<   "search_path": ["L2:1"],', type: 'response' },
        { text: '<   "query_time_ms": 8.7', type: 'response' },
        { text: '< }', type: 'response' },
        { text: '', type: 'blank' },
        { text: 'L2 FALLBACK.  SEARCH PATH: [L2:1]', type: 'success' },
        { text: 'TIP: Add keywords to fragments to enable the faster L1 path.', type: 'dim' },
      ],
    },

    link: {
      label: 'LINK FRAGMENTS',
      lines: [
        { text: '// POST /api/memory/link', type: 'comment' },
        { text: '// Connects two fragments with a typed relationship.', type: 'comment' },
        { text: '', type: 'blank' },
        { text: '> POST /api/memory/link', type: 'request' },
        { text: '> {', type: 'request' },
        { text: '>   "from_id": "frag_a1b2c3d4e5f6",', type: 'request' },
        { text: '>   "to_id":   "frag_b7c8d9e0f1a2",', type: 'request' },
        { text: '>   "relation_type": "resolved_by"', type: 'request' },
        { text: '> }', type: 'request' },
        { text: '', type: 'blank' },
        { text: '// Relation types: related | caused_by | resolved_by', type: 'comment' },
        { text: '//                 part_of | contradicts | informs', type: 'comment' },
        { text: '', type: 'blank' },
        { text: '< HTTP 200 OK  (6ms)', type: 'response', delay: TIMING.RESPONSE_DELAY },
        { text: '< {', type: 'response' },
        { text: '<   "id": "link_x9y8z7",', type: 'response' },
        { text: '<   "from_id": "frag_a1b2c3d4e5f6",', type: 'response' },
        { text: '<   "to_id":   "frag_b7c8d9e0f1a2",', type: 'response' },
        { text: '<   "relation_type": "resolved_by"', type: 'response' },
        { text: '< }', type: 'response' },
        { text: '', type: 'blank' },
        { text: 'LINKED:  ERROR  →[resolved_by]→  SOLUTION_APPROACH', type: 'success' },
        { text: 'Deleting from_id also deletes this link (CASCADE).', type: 'dim' },
      ],
    },

    stats: {
      label: 'SYSTEM STATS',
      lines: [
        { text: '// GET /api/memory/stats', type: 'comment' },
        { text: '// Returns counts grouped by type, tier, and topic.', type: 'comment' },
        { text: '', type: 'blank' },
        { text: '> GET /api/memory/stats', type: 'request' },
        { text: '', type: 'blank' },
        { text: '< HTTP 200 OK  (2ms)', type: 'response', delay: TIMING.RESPONSE_DELAY },
        { text: '< {', type: 'response' },
        { text: '<   "total_fragments": 47,', type: 'response' },
        { text: '<   "by_type": {', type: 'response' },
        { text: '<     "error": 12,  "solution_approach": 15,', type: 'response' },
        { text: '<     "client_pattern": 8,  "decision": 7,', type: 'response' },
        { text: '<     "preference": 3,  "procedure": 2', type: 'response' },
        { text: '<   },', type: 'response' },
        { text: '<   "by_tier": { "hot": 18, "warm": 21, "cold": 8 },', type: 'response' },
        { text: '<   "by_topic": {', type: 'response' },
        { text: '<     "infrastructure": 14, "auth": 9,', type: 'response' },
        { text: '<     "frontend": 8, "data-pipeline": 16', type: 'response' },
        { text: '<   }', type: 'response' },
        { text: '< }', type: 'response' },
        { text: '', type: 'blank' },
        { text: '47 FRAGMENTS  /  4 TOPICS  /  6 TYPES', type: 'success' },
        { text: 'MEMORY TEMP:  38% HOT  45% WARM  17% COLD', type: 'dim' },
      ],
    },

  }; // end EXHIBIT_REGISTRY

  // Default order when no data-exhibits attribute is set
  const DEFAULT_ORDER = ['boot', 'store', 'l1', 'l2', 'link', 'stats'];

  // ── Rendering helpers ─────────────────────────────────────────────

  function createLine(text, type) {
    const el = document.createElement('span');
    el.className = 'terminal-line' + (type ? ' terminal-line--' + type : '');
    el.textContent = text;
    return el;
  }

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async function typeLine(output, text, type, charDelay, abortRef) {
    if (type === 'blank') {
      output.appendChild(createLine('', 'blank'));
      return;
    }
    const el = createLine('', type);
    output.appendChild(el);
    for (let i = 0; i < text.length; i++) {
      if (abortRef.aborted) return;
      el.textContent = text.slice(0, i + 1);
      output.scrollTop = output.scrollHeight;
      await sleep(charDelay);
    }
    output.scrollTop = output.scrollHeight;
  }

  // ── Terminal instance ─────────────────────────────────────────────

  function createTerminal(root) {
    const output = root.querySelector('.terminal-output');
    const btnPrev = root.querySelector('[data-dir="prev"]');
    const btnNext = root.querySelector('[data-dir="next"]');
    const exhibitLabel = root.querySelector('.terminal-exhibit-label');

    // Resolve exhibit list from data-exhibits attribute or default
    const rawFilter = (root.dataset.exhibits || '').trim();
    const ids = rawFilter
      ? rawFilter.split(',').map(s => s.trim()).filter(id => EXHIBIT_REGISTRY[id])
      : DEFAULT_ORDER;
    const exhibits = ids.map(id => Object.assign({ id }, EXHIBIT_REGISTRY[id]));

    if (!exhibits.length) return; // nothing to show

    let current = 0;
    let autoTimer = null;
    const abortRef = { aborted: false };

    function updateNav() {
      if (!exhibitLabel) return;
      const ex = exhibits[current];
      const total = exhibits.length;
      exhibitLabel.textContent =
        (current + 1) + ' / ' + total + '  ·  ' + ex.label;
    }

    async function runExhibit(idx) {
      abortRef.aborted = true;
      await sleep(50); // let any running loop check the flag
      abortRef.aborted = false;

      output.innerHTML = '';
      clearTimeout(autoTimer);

      const exhibit = exhibits[idx];
      const isFirst = idx === 0 && !rawFilter;
      const charDelay = isFirst ? TIMING.BOOT_CHAR_DELAY : TIMING.CHAR_DELAY;

      for (const lineSpec of exhibit.lines) {
        if (abortRef.aborted) break;
        if (lineSpec.delay) await sleep(lineSpec.delay);
        await typeLine(output, lineSpec.text, lineSpec.type, charDelay, abortRef);
        if (!abortRef.aborted && lineSpec.type !== 'blank') await sleep(TIMING.LINE_DELAY);
      }

      if (!abortRef.aborted && exhibits.length > 1) {
        // Blinking cursor
        const cursorLine = createLine('', null);
        const cursor = document.createElement('span');
        cursor.className = 'terminal-cursor';
        cursorLine.appendChild(cursor);
        output.appendChild(cursorLine);

        autoTimer = setTimeout(() => {
          current = (current + 1) % exhibits.length;
          updateNav();
          runExhibit(current);
        }, TIMING.AUTO_ADVANCE);
      }
    }

    function navigate(dir) {
      current = (current + exhibits.length + dir) % exhibits.length;
      updateNav();
      runExhibit(current);
    }

    // Hide navigation if only one exhibit
    if (exhibits.length <= 1) {
      const nav = root.querySelector('.terminal-nav');
      if (nav) nav.style.display = 'none';
    }

    if (btnPrev) btnPrev.addEventListener('click', () => navigate(-1));
    if (btnNext) btnNext.addEventListener('click', () => navigate(+1));

    root.setAttribute('tabindex', '0');
    root.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp')   { e.preventDefault(); navigate(-1); }
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); navigate(+1); }
    });

    // Defer start until terminal scrolls into view
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        observer.disconnect();
        updateNav();
        runExhibit(current);
      }
    }, { threshold: 0.15 });

    observer.observe(root);
  }

  // ── Boot ──────────────────────────────────────────────────────────

  function init() {
    document.querySelectorAll('.terminal-crt').forEach(el => {
      if (!el.dataset.terminalInit) {
        el.dataset.terminalInit = '1';
        createTerminal(el);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
