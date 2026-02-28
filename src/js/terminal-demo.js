/**
 * FOGSIFT TERMINAL DEMO
 * Pre-programmed CRT exhibit player for the Architecture wiki page.
 * Simulates the Fogsift Memory System API with typing animations.
 */
(function () {
  'use strict';

  // ── Timing constants ──────────────────────────────────────────────
  const TIMING = {
    CHAR_DELAY: 18,          // ms between typed characters
    LINE_DELAY: 80,          // ms between lines
    SECTION_PAUSE: 400,      // ms pause between logical sections
    BOOT_CHAR_DELAY: 12,
    RESPONSE_DELAY: 320,     // ms simulated API latency
    AUTO_ADVANCE: 12_000,    // ms before auto-advancing to next exhibit
  };

  // ── Exhibit definitions ───────────────────────────────────────────
  const EXHIBITS = [
    {
      label: 'BOOT SEQUENCE',
      lines: [
        { text: 'FOGSIFT MEMORY SYSTEMS  v2.0.0', type: 'system' },
        { text: 'Inspired by Memento-MCP / SQLite Edition', type: 'dim' },
        { text: '', type: 'blank' },
        { text: 'INITIALIZING...', type: 'system' },
        { text: '[####################] 100%', type: 'system', delay: 300 },
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
    {
      label: 'STORE A MEMORY',
      lines: [
        { text: '// EXHIBIT 1: STORING A MEMORY FRAGMENT', type: 'comment' },
        { text: '// ERROR type carries highest default importance (0.9)', type: 'comment' },
        { text: '', type: 'blank' },
        { text: '> POST /api/memory/remember', type: 'request' },
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
        { text: 'FRAGMENT STORED.  ID: frag_a1b2c3d4e5f6', type: 'success' },
        { text: 'TIER: HOT  IMPORTANCE: 0.9  KEYWORDS: 4', type: 'dim' },
      ],
    },
    {
      label: 'L1 KEYWORD RECALL',
      lines: [
        { text: '// EXHIBIT 2: L1 KEYWORD SEARCH', type: 'comment' },
        { text: '// Exact keyword index — fastest path, <5ms typical', type: 'comment' },
        { text: '', type: 'blank' },
        { text: '> POST /api/memory/recall', type: 'request' },
        { text: '> {', type: 'request' },
        { text: '>   "keywords": ["redis", "cluster"],', type: 'request' },
        { text: '>   "token_budget": 1000', type: 'request' },
        { text: '> }', type: 'request' },
        { text: '', type: 'blank' },
        { text: '// ROUTING: L1 keyword index', type: 'comment' },
        { text: '// SELECT DISTINCT f.* FROM fragments f', type: 'comment' },
        { text: '// JOIN keywords k ON f.id = k.fragment_id', type: 'comment' },
        { text: '// WHERE k.keyword IN (\'redis\', \'cluster\')', type: 'comment' },
        { text: '', type: 'blank' },
        { text: '< HTTP 200 OK  (4ms)', type: 'response', delay: TIMING.RESPONSE_DELAY },
        { text: '< {', type: 'response' },
        { text: '<   "success": true,', type: 'response' },
        { text: '<   "fragments": [ { "id": "frag_a1b2c3d4e5f6", ... } ],', type: 'response' },
        { text: '<   "search_path": ["L1:1"],', type: 'response' },
        { text: '<   "total_tokens": 52,', type: 'response' },
        { text: '<   "query_time_ms": 3.8', type: 'response' },
        { text: '< }', type: 'response' },
        { text: '', type: 'blank' },
        { text: 'L1 HIT.  1 FRAGMENT  /  3.8ms  /  52 TOKENS USED', type: 'success' },
        { text: 'SEARCH PATH: [L1:1]', type: 'dim' },
      ],
    },
    {
      label: 'L2 METADATA FALLBACK',
      lines: [
        { text: '// EXHIBIT 3: L2 METADATA SEARCH', type: 'comment' },
        { text: '// No keywords? Fall back to topic/type filter.', type: 'comment' },
        { text: '', type: 'blank' },
        { text: '> POST /api/memory/recall', type: 'request' },
        { text: '> {', type: 'request' },
        { text: '>   "topic": "infrastructure",', type: 'request' },
        { text: '>   "type": "error",', type: 'request' },
        { text: '>   "token_budget": 2000', type: 'request' },
        { text: '> }', type: 'request' },
        { text: '', type: 'blank' },
        { text: '// ROUTING: L1 skipped (no keywords provided)', type: 'comment' },
        { text: '// FALLBACK: L2 metadata filter', type: 'comment' },
        { text: '// SELECT * FROM fragments', type: 'comment' },
        { text: '// WHERE topic = \'infrastructure\' AND type = \'error\'', type: 'comment' },
        { text: '// ORDER BY importance DESC, last_referenced DESC', type: 'comment' },
        { text: '', type: 'blank' },
        { text: '< HTTP 200 OK  (9ms)', type: 'response', delay: TIMING.RESPONSE_DELAY },
        { text: '< {', type: 'response' },
        { text: '<   "success": true,', type: 'response' },
        { text: '<   "fragments": [ ... ],', type: 'response' },
        { text: '<   "search_path": ["L2:1"],', type: 'response' },
        { text: '<   "query_time_ms": 8.7', type: 'response' },
        { text: '< }', type: 'response' },
        { text: '', type: 'blank' },
        { text: 'L2 FALLBACK.  SEARCH PATH: [L2:1]', type: 'success' },
        { text: 'TIP: Add keywords to fragments for faster L1 retrieval.', type: 'dim' },
      ],
    },
    {
      label: 'LINK FRAGMENTS',
      lines: [
        { text: '// EXHIBIT 4: GRAPH RELATIONSHIPS', type: 'comment' },
        { text: '// Link fragments to build a typed knowledge graph.', type: 'comment' },
        { text: '', type: 'blank' },
        { text: '> POST /api/memory/link', type: 'request' },
        { text: '> {', type: 'request' },
        { text: '>   "from_id": "frag_a1b2c3d4e5f6",', type: 'request' },
        { text: '>   "to_id":   "frag_b7c8d9e0f1a2",', type: 'request' },
        { text: '>   "relation_type": "resolved_by"', type: 'request' },
        { text: '> }', type: 'request' },
        { text: '', type: 'blank' },
        { text: '// Available relation types:', type: 'comment' },
        { text: '// related | caused_by | resolved_by | part_of', type: 'comment' },
        { text: '// contradicts | informs', type: 'comment' },
        { text: '', type: 'blank' },
        { text: '< HTTP 200 OK  (6ms)', type: 'response', delay: TIMING.RESPONSE_DELAY },
        { text: '< {', type: 'response' },
        { text: '<   "id": "link_x9y8z7",', type: 'response' },
        { text: '<   "from_id": "frag_a1b2c3d4e5f6",', type: 'response' },
        { text: '<   "to_id":   "frag_b7c8d9e0f1a2",', type: 'response' },
        { text: '<   "relation_type": "resolved_by"', type: 'response' },
        { text: '< }', type: 'response' },
        { text: '', type: 'blank' },
        { text: 'LINK CREATED:  ERROR  →[resolved_by]→  SOLUTION', type: 'success' },
        { text: 'CASCADE DELETE maintains graph integrity on removal.', type: 'dim' },
      ],
    },
    {
      label: 'SYSTEM STATS',
      lines: [
        { text: '// EXHIBIT 5: SYSTEM STATISTICS', type: 'comment' },
        { text: '// Introspect your knowledge base shape.', type: 'comment' },
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
        { text: '47 FRAGMENTS  /  4 TOPICS  /  6 FRAGMENT TYPES', type: 'success' },
        { text: 'MEMORY TEMP:  38% HOT  /  45% WARM  /  17% COLD', type: 'dim' },
      ],
    },
  ];

  // ── Core rendering helpers ────────────────────────────────────────

  function createLine(text, type) {
    const el = document.createElement('span');
    el.className = 'terminal-line' + (type ? ' terminal-line--' + type : '');
    el.textContent = text;
    return el;
  }

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async function typeLine(output, text, type, charDelay) {
    if (type === 'blank') {
      output.appendChild(createLine('', 'blank'));
      return;
    }
    const el = createLine('', type);
    output.appendChild(el);

    // Reveal characters one by one
    for (let i = 0; i < text.length; i++) {
      el.textContent = text.slice(0, i + 1);
      output.scrollTop = output.scrollHeight;
      await sleep(charDelay);
    }
    output.scrollTop = output.scrollHeight;
  }

  // ── Instance controller ───────────────────────────────────────────

  function createTerminal(root) {
    const output = root.querySelector('.terminal-output');
    const btnPrev = root.querySelector('[data-dir="prev"]');
    const btnNext = root.querySelector('[data-dir="next"]');
    const exhibitLabel = root.querySelector('.terminal-exhibit-label');

    let current = 0;
    let running = false;
    let autoTimer = null;
    let aborted = false;

    function updateNav() {
      const idx = current % EXHIBITS.length;
      const total = EXHIBITS.length;
      if (exhibitLabel) {
        exhibitLabel.textContent =
          'EXHIBIT ' + (idx + 1) + ' OF ' + total +
          '  //  ' + EXHIBITS[idx].label;
      }
    }

    async function runExhibit(idx) {
      if (running) { aborted = true; await sleep(60); }
      aborted = false;
      running = true;

      output.innerHTML = '';

      const exhibit = EXHIBITS[idx % EXHIBITS.length];
      const charDelay = idx === 0 ? TIMING.BOOT_CHAR_DELAY : TIMING.CHAR_DELAY;

      for (const lineSpec of exhibit.lines) {
        if (aborted) break;
        if (lineSpec.delay) await sleep(lineSpec.delay);
        await typeLine(output, lineSpec.text, lineSpec.type, charDelay);
        if (lineSpec.type !== 'blank') await sleep(TIMING.LINE_DELAY);
      }

      // Blinking cursor at end
      if (!aborted) {
        const cursorLine = createLine('', null);
        const cursor = document.createElement('span');
        cursor.className = 'terminal-cursor';
        cursorLine.appendChild(cursor);
        output.appendChild(cursorLine);
      }

      running = false;
      scheduleAutoAdvance();
    }

    function scheduleAutoAdvance() {
      clearTimeout(autoTimer);
      autoTimer = setTimeout(() => {
        current = (current + 1) % EXHIBITS.length;
        updateNav();
        runExhibit(current);
      }, TIMING.AUTO_ADVANCE);
    }

    function navigate(dir) {
      clearTimeout(autoTimer);
      current = (current + EXHIBITS.length + dir) % EXHIBITS.length;
      updateNav();
      runExhibit(current);
    }

    // Wire buttons
    if (btnPrev) btnPrev.addEventListener('click', () => navigate(-1));
    if (btnNext) btnNext.addEventListener('click', () => navigate(+1));

    // Keyboard navigation when terminal is focused
    root.setAttribute('tabindex', '0');
    root.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); navigate(-1); }
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); navigate(+1); }
    });

    // Boot on load — use IntersectionObserver to defer until visible
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        observer.disconnect();
        updateNav();
        runExhibit(current);
      }
    }, { threshold: 0.2 });

    observer.observe(root);
  }

  // ── Init ──────────────────────────────────────────────────────────

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
