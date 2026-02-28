# Terminal Component

The FogSift CRT terminal renders in two modes: **playback** (scripted exhibits that run automatically) and **interactive** (a sandboxed prompt you type into). This page is the interactive mode demo.

One prompt. Three languages. One accepted command each. Anything else gets a response — sometimes a very specific one.

---

## The Sandbox

Select a language. Type the hello world statement for that language. Press Enter.

That is the full spec. The terminal tells you what it accepts, and it tells you exactly why everything else fails.

<div class="terminal-crt terminal-crt--interactive" role="region" aria-label="Interactive hello world terminal sandbox">
  <div class="terminal-header">
    <span class="terminal-brand">FOGSIFT SYSTEMS&#8482;</span>
    <span class="terminal-title">HELLO WORLD // INTERACTIVE SANDBOX v1.0</span>
    <span class="terminal-status">ONLINE</span>
  </div>
  <div class="terminal-screen">
    <div class="terminal-output" role="log" aria-live="polite" aria-label="Terminal output"></div>
    <div class="terminal-input-area">
      <nav class="terminal-lang-selector" aria-label="Language selection">
        <button class="terminal-lang-btn terminal-lang-btn--active" data-lang="python" type="button">PYTHON</button>
        <button class="terminal-lang-btn" data-lang="javascript" type="button">JAVASCRIPT</button>
        <button class="terminal-lang-btn" data-lang="bash" type="button">BASH</button>
      </nav>
      <div class="terminal-prompt-row">
        <span class="terminal-prompt-symbol" aria-hidden="true">&gt;&gt;&gt; </span>
        <input
          class="terminal-input"
          type="text"
          aria-label="Python command input"
          autocomplete="off"
          autocorrect="off"
          autocapitalize="off"
          spellcheck="false"
          maxlength="200"
          placeholder='print("Hello, World!")'
        >
      </div>
    </div>
  </div>
</div>

The terminal accepts exactly one command per language. Anything else — wrong syntax, close-but-not-quite, or deliberate attack — gets a specific response explaining what happened and why.

---

## What You Should Have Seen

**Happy path.** You typed `print("Hello, World!")`, pressed Enter, and got `Hello, World!` back. The sandbox matched your input against the allow-list and emitted the simulated output. No interpreter ran. No process started.

**Wrong input.** You typed something close — extra space, wrong quotes, wrong capitalisation. The terminal echoed `[ERROR] Command not recognised` and showed you the exact accepted form.

**Something creative.** You tried to break it. You got a `[BLOCKED]` message with the category of attack detected and two lines explaining exactly why that technique has no effect here.

**Nothing happened to your computer.** Correct. That's the point.

---

## How the Sandbox Works

There is no interpreter, no server call, no eval, no exec.

When you press Enter, your input string goes through two checks:

**Step 1 — Honey pot pattern matching.**
The sandbox tests your input against a table of regular expressions covering known attack categories: code execution (`eval`, `exec`, `__import__`), OS access, SQL injection, XSS, path traversal, shell chaining, network requests, browser storage, and null byte injection. A match produces a `[BLOCKED]` message that names the category and explains why the technique doesn't apply.

**Step 2 — Allow-list comparison.**
Your input is compared, case-insensitively, against a small set of exact strings for the selected language. Match → simulated output. No match → `[ERROR]` with a hint.

That's everything. Two steps. No runtime. No surface.

### The attack categories and why they fail

| Category | Example attempt | Why it fails here |
|---|---|---|
| Code execution | `eval(input())` | No interpreter. Input is compared, not executed. |
| Module import | `import os; os.system(...)` | No module loader. No Python runtime. |
| Shell injection | `echo hi && rm -rf /` | No shell. Each input is one string comparison. |
| SQL injection | `'; DROP TABLE fragments;--` | No database connection from the browser prompt. |
| XSS | `<script>alert(1)</script>` | Input goes through `textContent`, never `innerHTML`. |
| Event injection | `onerror="alert(1)"` | No HTML parsing. No attribute evaluation. |
| Path traversal | `../../etc/passwd` | No filesystem. No path resolution. |
| Network request | `fetch("https://...")` | No execution means no fetch call. |
| Browser storage | `localStorage.setItem(...)` | No access to browser globals from this prompt. |
| Null bytes | `\x00`, `%00` | String comparison is immune to null byte tricks. |

### Why this is safe even without the detection layer

The detection layer produces educational messages, but the sandbox is safe regardless.

The terminal appends text via `textContent`, never `innerHTML`. It never calls `eval()`, `Function()`, or `new Function()`. It never writes to the DOM in ways a script tag could exploit. It makes no server requests based on input. It has no privileged surface.

Even if a pattern slipped through the detection table, the worst outcome is an unstyled string in the output area. There is no escalation path.

### The allow-list is intentionally strict

`print("Hello, World!")` is accepted. `print( "Hello, World!" )` is not. The extra spaces are intentional friction. The sandbox is explicit about what it accepts rather than trying to be lenient. That strictness is the lesson: real input validation is specific and unforgiving. Leniency is where injection finds its foothold.

---

*See also: [Memory System](/wiki/architecture/memory-system.html) — [The Diagnostic Process](/wiki/diagnostic-process.html) — [Systems Thinking](/wiki/concepts/systems-thinking.html)*
