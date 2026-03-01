/* ==========================================================================
   experimental.js — FogSift Lab interactive tools
   Three tools: Fog Score Diagnostic, 5-Whys Tracer, Signal vs Noise Sorter
   ========================================================================== */

'use strict';

/* --------------------------------------------------------------------------
   TOOL 1 — FOG SCORE DIAGNOSTIC
   -------------------------------------------------------------------------- */
(function FogScore() {

  const QUESTIONS = [
    {
      q: 'When a problem surfaces, how long does it typically take your team to identify the root cause?',
      options: [
        { label: 'Usually same day',                    score: 0 },
        { label: 'A few days to a week',                score: 1 },
        { label: 'One to two weeks',                    score: 2 },
        { label: 'Weeks or longer — if ever',           score: 3 },
      ],
    },
    {
      q: 'How confident are you that the KPIs your team tracks actually measure what matters most?',
      options: [
        { label: 'Very confident — they\'re well-chosen', score: 0 },
        { label: 'Somewhat — a few gaps',                score: 1 },
        { label: 'Not very — they\'re incomplete or lagging', score: 2 },
        { label: 'Unsure — we track what\'s easy, not what\'s right', score: 3 },
      ],
    },
    {
      q: 'When you present a decision to leadership, how often does it get questioned due to missing or unclear data?',
      options: [
        { label: 'Rarely — data quality is high',       score: 0 },
        { label: 'Sometimes — minor gaps',               score: 1 },
        { label: 'Often — recurring data problems',      score: 2 },
        { label: 'Almost always — it\'s a real bottleneck', score: 3 },
      ],
    },
    {
      q: 'How well does institutional knowledge (processes, context, lessons learned) get documented and shared?',
      options: [
        { label: 'Very well — it\'s systematically captured', score: 0 },
        { label: 'Okay — key things are captured but not all', score: 1 },
        { label: 'Poorly — most lives in people\'s heads',    score: 2 },
        { label: 'We rely entirely on tribal knowledge',      score: 3 },
      ],
    },
    {
      q: 'How clearly are priorities communicated across teams?',
      options: [
        { label: 'Very clearly — everyone knows what\'s most important', score: 0 },
        { label: 'Fairly well — occasional misalignment',               score: 1 },
        { label: 'Inconsistently — teams often have different views',   score: 2 },
        { label: 'Poorly — frequent conflict over priorities',          score: 3 },
      ],
    },
    {
      q: 'When a major initiative underperforms, how quickly does the organization adapt?',
      options: [
        { label: 'Quickly — we course-correct within weeks', score: 0 },
        { label: 'Moderately — takes a quarter or so',       score: 1 },
        { label: 'Slowly — we stay the course too long',     score: 2 },
        { label: 'We rarely adapt until it\'s critical',      score: 3 },
      ],
    },
  ];

  const RESULTS = [
    {
      max: 4,
      title: 'Clear Visibility',
      color: '#10b981',
      desc: 'Your operation has strong clarity. Decision-making is grounded, knowledge is shared, and adaptation is fast. Stay vigilant — fog can creep back in.',
      findings: [
        { type: 'good', text: 'Root cause identification is fast and structured.' },
        { type: 'good', text: 'KPIs and priorities are well-calibrated.' },
      ],
    },
    {
      max: 9,
      title: 'Patchy Fog',
      color: '#f59e0b',
      desc: 'Some parts of your operation are clear, others aren\'t. Targeted work on your weakest areas could yield significant leverage.',
      findings: [
        { type: 'warn', text: 'You have clarity in some areas but meaningful blind spots elsewhere.' },
        { type: 'warn', text: 'Knowledge silos or data gaps may be slowing decisions without being fully visible.' },
      ],
    },
    {
      max: 13,
      title: 'Heavy Fog',
      color: '#f97316',
      desc: 'Significant fog is slowing your operation. Decisions are made on incomplete information, knowledge is fragmented, and adaptation is delayed.',
      findings: [
        { type: 'warn', text: 'Root cause analysis is likely reactive rather than systematic.' },
        { type: 'warn', text: 'Tribal knowledge and lagging metrics create compounding risk.' },
      ],
    },
    {
      max: 18,
      title: 'Dense Fog',
      color: '#ef4444',
      desc: 'Your operation is running in near-zero visibility. The systemic lack of clarity is actively undermining performance and exposing you to significant risk.',
      findings: [
        { type: 'warn', text: 'Decisions are frequently made without adequate data or shared context.' },
        { type: 'warn', text: 'Institutional knowledge is fragile — one departure could be devastating.' },
      ],
    },
  ];

  let currentQ = 0;
  let answers  = [];
  let container;

  function scoreColor(score) {
    if (score <= 4)  return '#10b981';
    if (score <= 9)  return '#f59e0b';
    if (score <= 13) return '#f97316';
    return '#ef4444';
  }

  function render() {
    if (!container) return;
    if (currentQ < QUESTIONS.length) {
      renderQuestion();
    } else {
      renderResult();
    }
  }

  function renderQuestion() {
    const q    = QUESTIONS[currentQ];
    const pct  = Math.round((currentQ / QUESTIONS.length) * 100);
    const sel  = answers[currentQ];

    container.innerHTML = `
      <div class="fog-progress-bar-track" role="progressbar" aria-valuenow="${currentQ}" aria-valuemin="0" aria-valuemax="${QUESTIONS.length}" aria-label="Question ${currentQ + 1} of ${QUESTIONS.length}">
        <div class="fog-progress-bar-fill" style="width:${pct}%"></div>
      </div>
      <p class="fog-progress-label">Question ${currentQ + 1} / ${QUESTIONS.length}</p>
      <p class="fog-question-text">${q.q}</p>
      <div class="fog-options" role="radiogroup" aria-label="Answer options">
        ${q.options.map((opt, i) => `
          <button type="button" class="fog-option${sel === i ? ' selected' : ''}"
                  data-idx="${i}" aria-pressed="${sel === i}">
            <span class="fog-option-dot" aria-hidden="true"></span>
            ${opt.label}
          </button>
        `).join('')}
      </div>
      <div class="fog-nav">
        ${currentQ > 0 ? '<button type="button" class="fog-btn ghost" id="fog-prev">← Back</button>' : ''}
        <button type="button" class="fog-btn primary" id="fog-next" ${sel === undefined ? 'disabled' : ''}>
          ${currentQ === QUESTIONS.length - 1 ? 'See My Score →' : 'Next →'}
        </button>
      </div>
    `;

    container.querySelectorAll('.fog-option').forEach(btn => {
      btn.addEventListener('click', () => {
        answers[currentQ] = parseInt(btn.dataset.idx, 10);
        render();
      });
    });

    container.querySelector('#fog-next')?.addEventListener('click', () => {
      if (answers[currentQ] !== undefined) {
        currentQ++;
        render();
      }
    });

    container.querySelector('#fog-prev')?.addEventListener('click', () => {
      currentQ = Math.max(0, currentQ - 1);
      render();
    });
  }

  function renderResult() {
    const total = answers.reduce((sum, ai, qi) => sum + (QUESTIONS[qi].options[ai]?.score ?? 0), 0);
    const maxTotal = QUESTIONS.length * 3;
    const pct   = Math.max(0, Math.min(100, Math.round((total / maxTotal) * 100)));
    const result = RESULTS.find(r => total <= r.max) || RESULTS[RESULTS.length - 1];
    const col    = scoreColor(total);

    // SVG ring: circumference of circle r=54 = ~339
    const circ = 2 * Math.PI * 54;
    const dash = circ - (pct / 100) * circ;

    container.innerHTML = `
      <div class="fog-result">
        <div class="fog-score-ring" aria-label="Fog score: ${total} out of ${maxTotal}">
          <svg viewBox="0 0 120 120" aria-hidden="true">
            <circle cx="60" cy="60" r="54" fill="none" stroke="var(--color-border,#e2e8f0)" stroke-width="8"/>
            <circle cx="60" cy="60" r="54" fill="none" stroke="${col}" stroke-width="8"
                    stroke-linecap="round" stroke-dasharray="${circ}" stroke-dashoffset="${dash}"
                    transform="rotate(-90 60 60)"/>
          </svg>
          <div class="fog-score-center">
            <div class="fog-score-number" style="color:${col}">${total}</div>
            <div class="fog-score-label">/ ${maxTotal}</div>
          </div>
        </div>

        <div>
          <div class="fog-result-title" style="color:${col}">${result.title}</div>
        </div>
        <p class="fog-result-desc">${result.desc}</p>

        <div class="fog-findings">
          ${result.findings.map(f => `
            <div class="fog-finding ${f.type}" role="note">
              <span class="fog-finding-icon" aria-hidden="true">
                ${f.type === 'good'
                  ? '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>'
                  : '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#f59e0b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>'}
              </span>
              ${f.text}
            </div>
          `).join('')}
        </div>

        <div class="fog-result-actions">
          <button type="button" class="fog-btn ghost" id="fog-restart">Retake Quiz</button>
          <a href="/contact" class="fog-btn primary" style="text-decoration:none; display:inline-flex; align-items:center; gap:0.4rem;">
            Talk to FogSift →
          </a>
        </div>
      </div>
    `;

    container.querySelector('#fog-restart')?.addEventListener('click', () => {
      currentQ = 0;
      answers  = [];
      render();
    });
  }

  function init() {
    container = document.getElementById('fog-quiz-container');
    if (!container) return;
    render();
  }

  document.addEventListener('DOMContentLoaded', init);
})();


/* --------------------------------------------------------------------------
   TOOL 2 — 5-WHYS ROOT CAUSE TRACER
   -------------------------------------------------------------------------- */
(function FiveWhys() {
  const MAX_WHYS = 5;
  let problem = '';
  let answers = [];

  function getChain() {
    return document.getElementById('whys-chain');
  }

  function renderChain() {
    const chain = getChain();
    if (!chain) return;

    let html = '';

    if (problem) {
      html += `
        <div class="whys-node">
          <div class="whys-spine">
            <div class="whys-num problem-num">P</div>
            ${answers.length > 0 || answers.length === 0 ? '<div class="whys-line"></div>' : ''}
          </div>
          <div class="whys-content">
            <div class="whys-why-label problem-label">Problem</div>
            <div class="whys-text-display">${escHtml(problem)}</div>
          </div>
        </div>
      `;

      answers.forEach((ans, i) => {
        const isLast = i === answers.length - 1;
        const isRoot = answers.length >= MAX_WHYS || (isLast && ans === '__root__');
        html += `
          <div class="whys-node">
            <div class="whys-spine">
              <div class="whys-num">W${i + 1}</div>
              ${!isRoot ? '<div class="whys-line"></div>' : ''}
            </div>
            <div class="whys-content">
              <div class="whys-why-label">Why ${i + 1}</div>
              <div class="whys-text-display">${escHtml(ans)}</div>
            </div>
          </div>
        `;
      });

      // Show root cause if done
      if (answers.length >= MAX_WHYS) {
        html += renderRootCause(answers[answers.length - 1]);
      } else {
        // Show next input
        const nextNum = answers.length + 1;
        const prevText = answers.length === 0 ? problem : answers[answers.length - 1];
        html += `
          <div class="whys-node">
            <div class="whys-spine">
              <div class="whys-num">W${nextNum}</div>
            </div>
            <div class="whys-content">
              <div class="whys-why-label">Why ${nextNum}</div>
              <div class="whys-why-label" style="opacity:0.6; font-size:0.58rem; margin-top:-0.15rem; margin-bottom:0.4rem;">
                Why did: "${escHtml(prevText.length > 60 ? prevText.slice(0, 60) + '…' : prevText)}"?
              </div>
              <div class="whys-answer-row">
                <input type="text" class="whys-answer-input" id="whys-answer-${nextNum}"
                       placeholder="Because…" maxlength="200"
                       aria-label="Answer for why ${nextNum}">
                <button type="button" class="whys-next-btn" id="whys-why-next-btn">
                  ${nextNum === MAX_WHYS ? 'Root Cause →' : 'Next Why →'}
                </button>
              </div>
              ${nextNum > 1 ? `<button type="button" class="whys-action-btn ghost" id="whys-root-now" style="margin-top:0.5rem; font-size:0.7rem;">This IS the root cause</button>` : ''}
            </div>
          </div>
        `;
      }
    }

    chain.innerHTML = html;

    // Bind events
    const nextBtn = chain.querySelector('#whys-why-next-btn');
    if (nextBtn) {
      const inp = chain.querySelector(`#whys-answer-${answers.length + 1}`);
      inp?.focus();
      nextBtn.addEventListener('click', () => submitAnswer(inp?.value?.trim()));
      inp?.addEventListener('keydown', e => { if (e.key === 'Enter') submitAnswer(inp.value.trim()); });
    }

    chain.querySelector('#whys-root-now')?.addEventListener('click', () => {
      const inp = chain.querySelector(`#whys-answer-${answers.length + 1}`);
      const val = inp?.value?.trim();
      if (val) {
        answers.push(val);
        answers.push('__root__');
        renderChain();
      }
    });

    chain.querySelector('#whys-restart')?.addEventListener('click', resetTool);
    chain.querySelector('#whys-copy')?.addEventListener('click', copyTrace);
  }

  function submitAnswer(val) {
    if (!val) return;
    answers.push(val);
    renderChain();
    // Scroll chain into view
    getChain()?.lastElementChild?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function renderRootCause(lastAns) {
    const rootText = lastAns === '__root__' ? answers[answers.length - 2] : lastAns;
    return `
      <div class="whys-root-cause">
        <div class="whys-root-label">Root Cause Identified</div>
        <div class="whys-root-text">${escHtml(rootText)}</div>
        <div class="whys-root-actions">
          <button type="button" class="whys-action-btn primary" id="whys-restart">Start Over</button>
          <button type="button" class="whys-action-btn ghost" id="whys-copy">Copy Trace</button>
        </div>
      </div>
    `;
  }

  function copyTrace() {
    const lines = [`Problem: ${problem}`];
    answers.forEach((a, i) => {
      if (a !== '__root__') lines.push(`Why ${i + 1}: ${a}`);
    });
    lines.push('');
    lines.push(`Root Cause: ${answers.find((_, i) => answers[i + 1] === '__root__') ?? answers[answers.length - 1]}`);
    navigator.clipboard?.writeText(lines.join('\n')).catch(() => {});
  }

  function resetTool() {
    problem = '';
    answers = [];
    const chain = getChain();
    if (chain) chain.innerHTML = '';
    const inp = document.getElementById('whys-problem-input');
    if (inp) { inp.value = ''; inp.focus(); }
  }

  function escHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function init() {
    const startBtn = document.getElementById('whys-start-btn');
    const problemInp = document.getElementById('whys-problem-input');
    if (!startBtn || !problemInp) return;

    function startTrace() {
      const val = problemInp.value.trim();
      if (!val) return;
      problem = val;
      answers = [];
      renderChain();
    }

    startBtn.addEventListener('click', startTrace);
    problemInp.addEventListener('keydown', e => { if (e.key === 'Enter') startTrace(); });
  }

  document.addEventListener('DOMContentLoaded', init);
})();


/* --------------------------------------------------------------------------
   TOOL 3 — SIGNAL VS NOISE SORTER (drag-and-drop)
   -------------------------------------------------------------------------- */
(function SignalNoiseSorter() {
  const DECK = [
    'Customer support tickets spiked 40% last quarter',
    'The VP mentioned something in passing about morale',
    'Three key engineers quit in 90 days',
    'Sales cycle is 15% longer than 12 months ago',
    'A competitor just launched a similar product',
    'The team worked late last Friday',
    'Gross margin dropped 4 points YoY',
    'Someone mentioned they hate the new meeting format',
    'Onboarding time for new hires doubled',
    'The CTO is "looking into" a new tool',
    'Revenue grew but headcount grew faster',
    'Office kitchen ran out of coffee twice this month',
  ];

  // Shuffle deterministically enough for variety each page load
  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  let deck    = [];
  let inbox   = [];
  let signals = [];
  let noise   = [];
  let dragSrc = null; // { card, fromZone }

  const VERDICTS = [
    { signalRatio: 0.7, type: 'good',
      msg: (s, n) => `Strong signal clarity. You identified ${s} signals and filtered ${n} noise items. That's a healthy ratio — you're not chasing ghosts.` },
    { signalRatio: 0.4, type: 'warn',
      msg: (s, n) => `Mixed picture. ${s} signals, ${n} noise. Some of your "signals" may be noise in disguise — check if they're actionable and measurable.` },
    { signalRatio: 0, type: 'info',
      msg: (s, n) => `Heavy noise filter. You flagged ${n} items as noise and only ${s} as signal. That could mean disciplined focus — or you're dismissing things prematurely.` },
  ];

  function getVerdictText(s, n) {
    if (s + n === 0) return null;
    const ratio = s / (s + n);
    const v = VERDICTS.find(v => ratio >= v.signalRatio) || VERDICTS[VERDICTS.length - 1];
    return { type: v.type, msg: v.msg(s, n) };
  }

  function renderInbox() {
    const zone = document.getElementById('sns-inbox');
    const hint = document.getElementById('sns-inbox-hint');
    if (!zone) return;
    // Remove existing cards
    zone.querySelectorAll('.sns-card').forEach(el => el.remove());
    if (inbox.length === 0) {
      if (hint) hint.style.display = '';
    } else {
      if (hint) hint.style.display = 'none';
      inbox.forEach(text => zone.appendChild(makeCard(text, 'inbox', null)));
    }
  }

  function renderSorted() {
    ['signal', 'noise'].forEach(col => {
      const zone = document.getElementById(`sns-${col}`);
      const hint = document.getElementById(`sns-${col}-hint`);
      if (!zone) return;
      zone.querySelectorAll('.sns-card').forEach(el => el.remove());
      const items = col === 'signal' ? signals : noise;
      if (items.length === 0) {
        if (hint) hint.style.display = '';
      } else {
        if (hint) hint.style.display = 'none';
        items.forEach(text => zone.appendChild(makeCard(text, col, col)));
      }
    });
    renderVerdict();
  }

  function renderVerdict() {
    const area = document.getElementById('sns-verdict-area');
    if (!area) return;
    const sorted = signals.length + noise.length;
    if (sorted === 0) { area.innerHTML = ''; return; }
    const v = getVerdictText(signals.length, noise.length);
    if (!v) { area.innerHTML = ''; return; }
    area.innerHTML = `<div class="sns-verdict ${v.type}" role="note">${v.msg}</div>`;
  }

  function makeCard(text, zone, cardClass) {
    const el = document.createElement('div');
    el.className = 'sns-card' + (cardClass ? ` ${cardClass}-card` : '');
    el.textContent = text;
    el.setAttribute('draggable', 'true');
    el.setAttribute('role', 'listitem');
    el.dataset.text  = text;
    el.dataset.zone  = zone;

    el.addEventListener('dragstart', e => {
      dragSrc = { text, fromZone: zone };
      el.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });
    el.addEventListener('dragend', () => el.classList.remove('dragging'));

    // Tap-to-cycle on mobile (tap to move to next bucket)
    el.addEventListener('click', () => cycleBucket(text, zone));

    return el;
  }

  function cycleBucket(text, fromZone) {
    removeFromAll(text);
    if (fromZone === 'inbox') {
      signals.push(text);
    } else if (fromZone === 'signal') {
      noise.push(text);
    } else {
      inbox.push(text);
    }
    renderInbox();
    renderSorted();
  }

  function removeFromAll(text) {
    inbox   = inbox.filter(t => t !== text);
    signals = signals.filter(t => t !== text);
    noise   = noise.filter(t => t !== text);
  }

  function bindDropZone(zoneId, bucket) {
    const el = document.getElementById(zoneId);
    if (!el) return;

    el.addEventListener('dragover', e => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      el.classList.add('over');
    });
    el.addEventListener('dragleave', () => el.classList.remove('over'));
    el.addEventListener('drop', e => {
      e.preventDefault();
      el.classList.remove('over');
      if (!dragSrc) return;
      const { text, fromZone } = dragSrc;
      if (fromZone === bucket) return; // same zone
      removeFromAll(text);
      if (bucket === 'inbox') inbox.push(text);
      else if (bucket === 'signal') signals.push(text);
      else noise.push(text);
      renderInbox();
      renderSorted();
      dragSrc = null;
    });
  }

  function reset() {
    deck    = shuffle(DECK);
    inbox   = [...deck];
    signals = [];
    noise   = [];
    renderInbox();
    renderSorted();
    const area = document.getElementById('sns-verdict-area');
    if (area) area.innerHTML = '';
  }

  function init() {
    const resetBtn = document.getElementById('sns-reset-btn');
    if (!document.getElementById('sns-inbox')) return;
    bindDropZone('sns-inbox',  'inbox');
    bindDropZone('sns-signal', 'signal');
    bindDropZone('sns-noise',  'noise');
    resetBtn?.addEventListener('click', reset);
    reset();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
