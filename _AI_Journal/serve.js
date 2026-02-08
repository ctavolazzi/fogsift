const http = require('http');
const fs = require('fs');
const path = require('path');
const { marked } = require(path.join(__dirname, '..', 'node_modules', 'marked'));

const PORT = 5001;
const JOURNAL_DIR = __dirname;
const AUTO_DIR = path.join(JOURNAL_DIR, 'auto');

function getEntries() {
  // Manual journal entries (numbered: 001-*.md, 002-*.md, etc.)
  const manual = fs.readdirSync(JOURNAL_DIR)
    .filter(f => f.endsWith('.md'))
    .sort()
    .map(f => {
      const content = fs.readFileSync(path.join(JOURNAL_DIR, f), 'utf8');
      const title = content.split('\n').find(l => l.startsWith('# '))?.replace('# ', '') || f;
      const date = content.match(/\*\*Date:\*\*\s*(.+)/)?.[1]
        || content.match(/\*\*Generated:\*\*\s*(.+)/)?.[1]
        || 'Unknown';
      return { file: f, title, date, content, section: 'journal' };
    });

  // Auto-generated reflections (_AI_Journal/auto/session-*.md)
  let auto = [];
  if (fs.existsSync(AUTO_DIR)) {
    auto = fs.readdirSync(AUTO_DIR)
      .filter(f => f.endsWith('.md'))
      .sort()
      .reverse() // newest first
      .map(f => {
        const content = fs.readFileSync(path.join(AUTO_DIR, f), 'utf8');
        const title = content.split('\n').find(l => l.startsWith('# '))?.replace('# ', '') || f;
        const date = content.match(/\*\*Generated:\*\*\s*(.+)/)?.[1] || 'Unknown';
        return { file: `auto/${f}`, title, date, content, section: 'auto' };
      });
  }

  return [...manual, ...auto];
}

function renderPage(entries, activeIdx) {
  const active = entries[activeIdx] || entries[0];
  const htmlContent = marked(active.content);
  const entryTitle = active.title.replace(/^Journal Entry \d+:\s*/, '');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${entryTitle} | The Keeper's Log</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Mono:wght@400;500&family=Outfit:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{
  --parchment:#f5f0e8;--ink:#1a1612;--sepia:#8b7355;--sepia-light:#c4a97d;
  --rust:#c2662d;--rust-hot:#e07a3a;--rust-dim:rgba(194,102,45,0.08);--cream:#faf7f2;
  --shadow:rgba(26,22,18,0.06);--border:#e4ddd0;
  --green:#059669;--green-dim:rgba(5,150,105,0.08);
}
html{font-size:17px}
body{background:var(--parchment);color:var(--ink);font-family:'Crimson Pro',serif;line-height:1.75;min-height:100vh}

/* grain */
body::after{content:'';position:fixed;inset:0;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.025'/%3E%3C/svg%3E");pointer-events:none;z-index:9999}

/* === TOP NAVBAR === */
.topnav{
  position:sticky;top:0;z-index:100;
  background:var(--ink);color:var(--parchment);
  display:flex;align-items:center;justify-content:space-between;
  padding:0 24px;height:48px;
  border-bottom:2px solid var(--rust);
  font-family:'Outfit',sans-serif;
}
.topnav-brand{
  display:flex;align-items:center;gap:10px;
  font-weight:600;font-size:0.82rem;letter-spacing:0.04em;
}
.topnav-brand svg{flex-shrink:0}
.topnav-brand span{color:var(--rust-hot)}
.topnav-links{display:flex;align-items:center;gap:4px}
.topnav-link{
  color:var(--sepia-light);text-decoration:none;font-size:0.72rem;font-weight:500;
  padding:6px 12px;border-radius:6px;transition:all 0.15s ease;letter-spacing:0.02em;
}
.topnav-link:hover{color:var(--parchment);background:rgba(255,255,255,0.06)}
.topnav-link.active{color:var(--rust-hot);background:var(--rust-dim)}

/* copy button */
.btn-copy{
  display:flex;align-items:center;gap:6px;
  background:none;border:1px solid rgba(255,255,255,0.12);color:var(--sepia-light);
  padding:5px 12px;border-radius:6px;cursor:pointer;
  font-family:'DM Mono',monospace;font-size:0.6rem;letter-spacing:0.04em;
  transition:all 0.2s ease;
}
.btn-copy:hover{border-color:var(--rust);color:var(--rust-hot)}
.btn-copy.copied{border-color:var(--green);color:var(--green);background:var(--green-dim)}
.btn-copy svg{width:14px;height:14px}

/* toast */
.toast-bar{
  position:fixed;bottom:24px;left:50%;transform:translateX(-50%) translateY(80px);
  background:var(--ink);color:var(--parchment);
  font-family:'DM Mono',monospace;font-size:0.72rem;
  padding:10px 20px;border-radius:8px;
  border:1px solid var(--rust);
  box-shadow:0 8px 32px rgba(0,0,0,0.2);
  transition:transform 0.35s cubic-bezier(0.34,1.56,0.64,1);
  z-index:200;pointer-events:none;
}
.toast-bar.show{transform:translateX(-50%) translateY(0)}

/* === LAYOUT === */
.layout{display:grid;grid-template-columns:260px 1fr;min-height:calc(100vh - 48px)}

/* sidebar */
.sidebar{
  background:var(--cream);border-right:1px solid var(--border);padding:20px 0;
  position:sticky;top:48px;height:calc(100vh - 48px);overflow-y:auto;
}
.sidebar-label{
  font-family:'DM Mono',monospace;font-size:0.55rem;color:var(--sepia-light);
  text-transform:uppercase;letter-spacing:0.1em;padding:8px 20px;
}
.entry-link{
  display:block;padding:10px 20px;cursor:pointer;
  border-left:3px solid transparent;transition:all 0.2s ease;text-decoration:none;color:inherit;
}
.entry-link:hover{background:var(--rust-dim);border-left-color:var(--sepia-light)}
.entry-link.active{background:var(--rust-dim);border-left-color:var(--rust)}
.entry-link .entry-num{font-family:'DM Mono',monospace;font-size:0.58rem;color:var(--sepia-light);text-transform:uppercase;letter-spacing:0.08em}
.entry-link .entry-title{font-family:'Outfit',sans-serif;font-size:0.78rem;font-weight:500;color:var(--ink);margin-top:2px;line-height:1.3}
.entry-link .entry-date{font-family:'DM Mono',monospace;font-size:0.58rem;color:var(--sepia-light);margin-top:2px}

/* content */
.content{padding:40px 56px 80px;max-width:740px}
.content h1{font-family:'Crimson Pro',serif;font-weight:600;font-size:1.8rem;color:var(--ink);margin-bottom:8px;line-height:1.25}
.content h2{font-family:'Outfit',sans-serif;font-weight:600;font-size:1rem;color:var(--rust);margin-top:36px;margin-bottom:12px;text-transform:uppercase;letter-spacing:0.05em}
.content h3{font-family:'Outfit',sans-serif;font-weight:500;font-size:0.9rem;margin-top:24px;margin-bottom:8px}
.content p{margin-bottom:14px}
.content strong{color:var(--ink);font-weight:600}
.content em{font-style:italic;color:var(--sepia)}
.content ul,.content ol{margin:12px 0 16px 24px}
.content li{margin-bottom:6px}
.content blockquote{border-left:3px solid var(--rust);padding:12px 20px;margin:20px 0;background:var(--rust-dim);font-style:italic;border-radius:0 6px 6px 0}
.content code{font-family:'DM Mono',monospace;font-size:0.82rem;background:rgba(139,115,85,0.08);padding:2px 6px;border-radius:3px}
.content pre{background:var(--ink);color:var(--parchment);padding:20px;border-radius:8px;overflow-x:auto;margin:16px 0;font-family:'DM Mono',monospace;font-size:0.78rem;line-height:1.6}
.content pre code{background:none;padding:0;color:inherit}
.content hr{border:none;height:1px;background:var(--border);margin:32px 0}
.content table{width:100%;border-collapse:collapse;margin:16px 0;font-size:0.88rem}
.content th{font-family:'Outfit',sans-serif;font-weight:600;text-align:left;padding:8px 12px;border-bottom:2px solid var(--border);font-size:0.75rem;text-transform:uppercase;letter-spacing:0.06em;color:var(--sepia)}
.content td{padding:8px 12px;border-bottom:1px solid var(--border)}

.footer-stamp{
  margin-top:48px;padding-top:24px;border-top:1px solid var(--border);
  font-family:'DM Mono',monospace;font-size:0.6rem;color:var(--sepia-light);
  text-align:center;letter-spacing:0.08em;text-transform:uppercase;
}

@media(max-width:768px){
  .layout{grid-template-columns:1fr}
  .sidebar{position:relative;height:auto;top:0;border-right:none;border-bottom:1px solid var(--border);padding:12px 0}
  .content{padding:28px 20px 60px}
  .sidebar-label{padding:6px 16px}
  .entry-link{padding:8px 16px}
  .topnav{padding:0 16px}
  .topnav-links{gap:2px}
  .topnav-link{padding:6px 8px;font-size:0.65rem}
}
</style>
</head>
<body>

<!-- === TOP NAVBAR (data-no-copy: never included in copy) === -->
<nav class="topnav" data-no-copy>
  <div class="topnav-brand">
    <svg width="18" height="18" viewBox="0 0 64 64" fill="none">
      <rect x="24" y="24" width="16" height="34" rx="2" fill="#3d4456" stroke="#6b7590" stroke-width="1.5"/>
      <rect x="22" y="54" width="20" height="6" rx="1" fill="#3d4456" stroke="#6b7590" stroke-width="1.5"/>
      <rect x="26" y="18" width="12" height="8" rx="1" fill="#252a35" stroke="#6b7590" stroke-width="1.5"/>
      <polygon points="28,18 32,10 36,18" fill="#252a35" stroke="#6b7590" stroke-width="1.5" stroke-linejoin="round"/>
      <circle cx="32" cy="14" r="4" fill="#c2662d" opacity="0.8"/>
    </svg>
    The <span>Keeper's Log</span>
  </div>
  <div class="topnav-links">
    <a href="http://localhost:5050" class="topnav-link">Lighthouse :5050</a>
    <a href="http://localhost:5030" class="topnav-link">Workshop :5030</a>
    <a href="http://localhost:5065" class="topnav-link">Quality :5065</a>
    <a href="/" class="topnav-link active">Journal :5001</a>
    <button class="btn-copy" id="copy-btn" title="Copy page text to clipboard">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
      COPY
    </button>
  </div>
</nav>

<div class="layout">
  <!-- === SIDEBAR (data-no-copy: navigation chrome) === -->
  <nav class="sidebar" data-no-copy>
    <div class="sidebar-label">Journal Entries</div>
    ${entries.filter(e => e.section === 'journal').map((e, _, arr) => {
      const i = entries.indexOf(e);
      return `
      <a href="/?entry=${i}" class="entry-link ${i === activeIdx ? 'active' : ''}">
        <div class="entry-num">Entry ${e.file.match(/\\d+/)?.[0] || i}</div>
        <div class="entry-title">${e.title.replace(/^Journal Entry \\d+:\\s*/, '')}</div>
        <div class="entry-date">${e.date}</div>
      </a>`;
    }).join('')}
    ${entries.some(e => e.section === 'auto') ? `
    <div class="sidebar-label" style="margin-top:16px">Auto Reflections</div>
    ${entries.filter(e => e.section === 'auto').map(e => {
      const i = entries.indexOf(e);
      const dateMatch = e.file.match(/session-(\d{4}-\d{2}-\d{2})T(\d{2})-(\d{2})/);
      const shortDate = dateMatch ? dateMatch[1] : '';
      const shortTime = dateMatch ? dateMatch[2] + ':' + dateMatch[3] : '';
      return `
      <a href="/?entry=${i}" class="entry-link ${i === activeIdx ? 'active' : ''}">
        <div class="entry-num">Session ${shortDate}</div>
        <div class="entry-title">${e.title.replace(/^Session Reflection —\\s*/, '').substring(0, 30)}</div>
        <div class="entry-date">${shortTime || e.date}</div>
      </a>`;
    }).join('')}` : ''}
  </nav>

  <!-- === MAIN CONTENT (data-copyable: this is what gets copied) === -->
  <main class="content" data-copyable>
    ${htmlContent}
    <div class="footer-stamp" data-no-copy>The Keeper's Log // FogSift Lighthouse System // WSFT Broadcasting</div>
  </main>
</div>

<!-- Toast notification -->
<div class="toast-bar" id="toast"></div>

<script>
/**
 * FogSift Copy Algorithm (Tag-Based)
 *
 * How it works:
 *   1. Find all elements with [data-copyable] — these are "yes, copy me" sections
 *   2. Within each, clone the subtree
 *   3. Remove any descendants with [data-no-copy] — these are "but not this"
 *   4. Extract the cleaned text
 *
 * To use on any page:
 *   - Add data-copyable to sections that should be copyable
 *   - Add data-no-copy to anything that should be excluded (nav, footer, UI chrome, private data)
 *   - That's it. No config objects, no selector lists.
 */
const FogCopy = {
  extract() {
    const sections = document.querySelectorAll('[data-copyable]');
    if (!sections.length) return '';

    const parts = [];
    sections.forEach(section => {
      const clone = section.cloneNode(true);
      // Remove all data-no-copy descendants
      clone.querySelectorAll('[data-no-copy]').forEach(el => el.remove());
      // Remove hidden elements
      clone.querySelectorAll('[hidden], [aria-hidden="true"]').forEach(el => el.remove());

      // Extract text, preserving block structure as line breaks
      const text = this._extractText(clone);
      if (text.trim()) parts.push(text.trim());
    });

    return parts.join('\\n\\n');
  },

  _extractText(node) {
    // Walk the DOM tree and convert to readable text
    // Block elements get line breaks, inline elements get spaces
    const BLOCK = new Set(['P','DIV','H1','H2','H3','H4','H5','H6','LI','TR','BLOCKQUOTE','PRE','HR','TABLE','UL','OL','SECTION','ARTICLE','HEADER','FOOTER','DT','DD']);
    let result = '';

    for (const child of node.childNodes) {
      if (child.nodeType === 3) { // Text node
        result += child.textContent;
      } else if (child.nodeType === 1) { // Element
        const tag = child.tagName;
        if (tag === 'BR') { result += '\\n'; continue; }
        if (tag === 'HR') { result += '\\n---\\n'; continue; }

        const isBlock = BLOCK.has(tag);
        if (isBlock) result += '\\n';

        if (tag === 'LI') result += '- ';
        if (/^H[1-6]$/.test(tag)) result += '#'.repeat(parseInt(tag[1])) + ' ';

        result += this._extractText(child);
        if (isBlock) result += '\\n';
      }
    }
    // Clean up excessive newlines
    return result.replace(/\\n{3,}/g, '\\n\\n');
  },

  async copy() {
    const text = this.extract();
    if (!text) { this._toast('No copyable content found'); return; }
    try {
      await navigator.clipboard.writeText(text);
      this._toast('Copied to clipboard');
      const btn = document.getElementById('copy-btn');
      if (btn) {
        btn.classList.add('copied');
        btn.querySelector('svg').style.display = 'none';
        btn.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> COPIED';
        setTimeout(() => {
          btn.classList.remove('copied');
          btn.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> COPY';
        }, 2000);
      }
    } catch(e) {
      this._toast('Copy failed: ' + e.message);
    }
  },

  _toast(msg) {
    const el = document.getElementById('toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), 2500);
  }
};

// Bind copy button
document.getElementById('copy-btn')?.addEventListener('click', () => FogCopy.copy());

// Keyboard shortcut: Ctrl/Cmd+Shift+C
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C') {
    e.preventDefault();
    FogCopy.copy();
  }
});
</script>
</body>
</html>`;
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const entries = getEntries();
  const idx = parseInt(url.searchParams.get('entry') || '0', 10);

  res.writeHead(200, { 'Content-Type': 'text/html', 'Cache-Control': 'no-cache' });
  res.end(renderPage(entries, idx));
});

server.listen(PORT, () => {
  console.log(`The Keeper's Log (AI Journal): http://localhost:${PORT}`);
});
