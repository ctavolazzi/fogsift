/**
 * FOGSIFT TERMINAL — INTERACTIVE SANDBOX
 * Sandboxed command-line terminal for wiki pages.
 *
 * Usage: add class "terminal-crt--interactive" to a .terminal-crt element.
 * Include a .terminal-output, .terminal-input, .terminal-prompt-symbol, and
 * .terminal-lang-btn[data-lang] elements inside.
 *
 * Security model: no eval, no innerHTML, no exec, no server calls.
 * Input is validated against an allow-list and pattern-matched for honey pot
 * detection. Every block message is educational.
 */
(function () {
  'use strict';

  // ── Language configurations ──────────────────────────────────────────
  //
  // accepted: exact strings that produce a success output.
  // Comparison is case-insensitive and ignores leading/trailing whitespace.

  const LANGUAGES = {
    python: {
      label: 'PYTHON',
      prompt: '>>> ',
      accepted: [
        'print("Hello, World!")',
        "print('Hello, World!')",
        'print("hello, world!")',
        "print('hello, world!')",
        'print("Hello World")',
        "print('Hello World')",
      ],
      successOutput: 'Hello, World!',
      successNote: 'Python interpreter: stdout flushed.',
    },
    javascript: {
      label: 'JAVASCRIPT',
      prompt: '> ',
      accepted: [
        'console.log("Hello, World!")',
        "console.log('Hello, World!')",
        'console.log("hello, world!")',
        "console.log('hello, world!')",
        'console.log("Hello World")',
        "console.log('Hello World')",
        'console.log(`Hello, World!`)',
      ],
      successOutput: 'Hello, World!',
      successNote: 'Node.js: process.stdout.write called.',
    },
    bash: {
      label: 'BASH',
      prompt: '$ ',
      accepted: [
        'echo "Hello, World!"',
        "echo 'Hello, World!'",
        'echo Hello World',
        'echo hello world',
        'printf "Hello, World!\\n"',
        "printf 'Hello, World!\\n'",
      ],
      successOutput: 'Hello, World!',
      successNote: 'bash: stdout → /dev/fd/1.',
    },
  };

  // ── Honey pot pattern table ──────────────────────────────────────────
  //
  // Each entry: { test: RegExp, label: string, reply: string }
  // test against the raw trimmed input.
  // label is shown in the [BLOCKED] prefix.
  // reply explains WHY the technique doesn't apply here.

  const HONEYPOT_PATTERNS = [
    {
      test: /eval\s*\(|exec\s*\(|__import__\s*\(|compile\s*\(/i,
      label: 'CODE EXECUTION',
      reply: [
        'No interpreter. Your input is compared to a string list.',
        'eval() would require a live runtime. This terminal has none.',
      ],
    },
    {
      test: /import\s+os|import\s+sys|import\s+subprocess|from\s+os\s+import/i,
      label: 'MODULE IMPORT',
      reply: [
        'No module loader. There is no Python runtime here.',
        'import os would require CPython. This is a browser matching strings.',
      ],
    },
    {
      test: /require\s*\(|process\.env|process\.exit|__dirname|__filename/i,
      label: 'NODE.JS GLOBALS',
      reply: [
        'Node.js globals are not accessible from this prompt.',
        'This runs in a browser sandbox, not a Node.js process.',
      ],
    },
    {
      test: /rm\s+-rf|del\s+\/f|format\s+c:|mkfs|shred\s+/i,
      label: 'FILESYSTEM DESTROY',
      reply: [
        'No filesystem access. There is nothing to delete.',
        'This terminal appends text nodes to the DOM. No path resolves.',
      ],
    },
    {
      test: /DROP\s+TABLE|DELETE\s+FROM|INSERT\s+INTO|SELECT\s+\*\s+FROM|UNION\s+SELECT|OR\s+1\s*=\s*1/i,
      label: 'SQL INJECTION',
      reply: [
        'No database connection. SQL injection requires a database driver.',
        'Your input reached a string comparator, not a query executor.',
      ],
    },
    {
      test: /<script|<img\s|javascript:/i,
      label: 'XSS',
      reply: [
        'Input is set via textContent, never innerHTML.',
        'Your script tag is a string here. No parser sees it.',
      ],
    },
    {
      test: /onerror\s*=|onload\s*=|onfocus\s*=|onmouseover\s*=/i,
      label: 'EVENT INJECTION',
      reply: [
        'HTML event attributes require DOM insertion via innerHTML.',
        'This terminal uses textContent. No attribute parser runs.',
      ],
    },
    {
      test: /\.\.\//,
      label: 'PATH TRAVERSAL',
      reply: [
        'No filesystem. Path traversal has no surface here.',
        '../ is a substring. It does not resolve to a directory.',
      ],
    },
    {
      test: /\/etc\/passwd|\/proc\/self|C:\\Windows\\System32/i,
      label: 'PATH PROBE',
      reply: [
        'No filesystem access. No OS path resolution in this context.',
        'The browser sandbox does not expose /etc or C:\\Windows.',
      ],
    },
    {
      test: /fetch\s*\(|XMLHttpRequest|new\s+WebSocket|axios\./i,
      label: 'NETWORK REQUEST',
      reply: [
        'No network calls are initiated by this input.',
        'fetch() requires execution. Your string was compared, not executed.',
      ],
    },
    {
      test: /localStorage\.|sessionStorage\.|indexedDB\.|document\.cookie/i,
      label: 'STORAGE ACCESS',
      reply: [
        'Browser storage APIs are not accessible from this prompt.',
        'This terminal does not eval() input or expose browser globals.',
      ],
    },
    {
      test: /window\.|document\.|global\.|globalThis\./i,
      label: 'GLOBAL PROBE',
      reply: [
        'JavaScript globals are not accessible from the prompt.',
        'No eval means no global scope. Your dot-chain is a string.',
      ],
    },
    {
      test: /alert\s*\(|confirm\s*\(|prompt\s*\(/i,
      label: 'BROWSER DIALOG',
      reply: [
        'Browser dialog APIs require execution. None happens here.',
        'alert() is a string match, not a function call.',
      ],
    },
    {
      test: /\$\(|`[^`]*`.*\$\{|Function\s*\(/i,
      label: 'TEMPLATE EXEC',
      reply: [
        'Template literals and the Function constructor require a JS runtime.',
        'Your backtick is a literal character here.',
      ],
    },
    {
      test: /&&|\|\|/,
      label: 'SHELL CHAINING',
      reply: [
        'Shell chaining operators are evaluated as part of a single string.',
        'Only one command per submit. No chaining executes.',
      ],
    },
    {
      test: /;\s*\w+|`\w+`/,
      label: 'MULTI-COMMAND',
      reply: [
        'Semicolons do not separate commands here.',
        'Your full input is treated as one string, compared as-is.',
      ],
    },
    {
      test: /\x00|\\u0000|\\x00/i,
      label: 'NULL BYTE',
      reply: [
        'Null byte injection has no effect on string comparison.',
        'No parser or interpreter sees this input.',
      ],
    },
  ];

  // ── DOM helpers ──────────────────────────────────────────────────────

  function createLine(text, cls) {
    const el = document.createElement('span');
    el.className = 'terminal-line' + (cls ? ' terminal-line--' + cls : '');
    el.textContent = text;   // textContent only — never innerHTML
    return el;
  }

  function appendLine(output, text, cls) {
    output.appendChild(createLine(text, cls));
    output.scrollTop = output.scrollHeight;
  }

  // ── Interactive instance ─────────────────────────────────────────────

  function initInteractive(root) {
    const output       = root.querySelector('.terminal-output');
    const input        = root.querySelector('.terminal-input');
    const promptSymbol = root.querySelector('.terminal-prompt-symbol');
    const langBtns     = root.querySelectorAll('.terminal-lang-btn');

    if (!output || !input) return;

    let lang = 'python';
    let cmdCount = 0;

    function cfg() { return LANGUAGES[lang]; }

    // ── Language switch ──
    function setLanguage(newLang) {
      if (!LANGUAGES[newLang]) return;
      lang = newLang;
      const c = cfg();
      if (promptSymbol) promptSymbol.textContent = c.prompt;
      langBtns.forEach(btn =>
        btn.classList.toggle('terminal-lang-btn--active', btn.dataset.lang === lang)
      );
      input.placeholder = c.accepted[0];
      input.setAttribute('aria-label', c.label + ' command input');
      input.focus();
    }

    // ── Command handler ──
    function handleSubmit() {
      const raw = input.value; // do NOT trim before echoing — show exactly what they typed
      input.value = '';
      const trimmed = raw.trim();
      if (!trimmed) return;

      cmdCount++;
      const c = cfg();

      // Echo input (textContent only — safe)
      appendLine(c.prompt + raw, 'request');

      // ── 1. Honey pot pattern check ──
      for (const pattern of HONEYPOT_PATTERNS) {
        if (pattern.test.test(trimmed)) {
          appendLine('[BLOCKED: ' + pattern.label + ']', 'error');
          pattern.reply.forEach(line => appendLine('  ' + line, 'dim'));
          appendLine('', 'blank');
          return;
        }
      }

      // ── 2. Allow-list check (case-insensitive, normalise internal spaces) ──
      const normalised = trimmed.replace(/\s+/g, ' ');
      const isAccepted = c.accepted.some(
        a => normalised.toLowerCase() === a.toLowerCase()
      );

      if (isAccepted) {
        appendLine(c.successOutput, 'success');
        appendLine('[sandbox] ' + c.successNote, 'dim');
        appendLine('[sandbox] Input matched allow-list. Command count: ' + cmdCount + '.', 'dim');
      } else {
        // Length check for near-miss hint
        const closest = c.accepted[0];
        appendLine('[ERROR] Command not recognised.', 'error');
        appendLine('[HINT]  ' + c.label + ' expects:  ' + closest, 'dim');
      }

      appendLine('', 'blank');
    }

    // ── Wire up events ──
    langBtns.forEach(btn => {
      btn.addEventListener('click', () => setLanguage(btn.dataset.lang));
    });

    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSubmit();
      }
    });

    // Clicking anywhere on the screen area focuses the input
    const screen = root.querySelector('.terminal-screen');
    if (screen) {
      screen.addEventListener('click', e => {
        if (e.target !== input) input.focus();
      });
    }

    // ── Boot message ──
    appendLine('FOGSIFT SANDBOX  //  HELLO WORLD TERMINAL  v1.0', 'system');
    appendLine('─────────────────────────────────────────────────────', 'dim');
    appendLine('Select a language above. Type the hello world statement.', 'dim');
    appendLine('Press Enter to run. Try to break it.', 'dim');
    appendLine('', 'blank');

    // Init with default language
    setLanguage('python');
  }

  // ── Bootstrap ────────────────────────────────────────────────────────

  function init() {
    document.querySelectorAll('.terminal-crt--interactive').forEach(el => {
      if (!el.dataset.iTermInit) {
        el.dataset.iTermInit = '1';
        initInteractive(el);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
