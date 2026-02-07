#!/usr/bin/env node
/**
 * CONTEXT BRIEF — FogSift Lighthouse Utility
 *
 * Generates a concise markdown brief optimized for LLM consumption.
 * Designed to be read by a future Claude session at the start of a conversation.
 * Zero dependencies — uses only Node.js builtins.
 *
 * Usage: node _tools/scripts/context-brief.js
 * Output: _tools/snapshots/context-brief.md (also prints to stdout)
 *
 * Design principles:
 *   - Under 200 lines of output (fits comfortably in context)
 *   - Actionable: tells you what to do, not just what exists
 *   - Temporal: shows what changed recently and what's next
 *   - Honest: flags problems, doesn't hide them
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');

function exec(cmd, fallback = '') {
  try {
    return execSync(cmd, { cwd: ROOT, encoding: 'utf8', timeout: 10000 }).trim();
  } catch { return fallback; }
}

function fileSize(p) {
  try { return fs.statSync(path.join(ROOT, p)).size; } catch { return 0; }
}

function fmtSize(bytes) {
  if (bytes > 1048576) return (bytes / 1048576).toFixed(1) + 'MB';
  if (bytes > 1024) return (bytes / 1024).toFixed(1) + 'KB';
  return bytes + 'B';
}

function countFiles(dir, ext) {
  let count = 0;
  const walk = (d) => {
    if (!fs.existsSync(d)) return;
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
      const full = path.join(d, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (!ext || full.endsWith(ext)) count++;
    }
  };
  walk(path.join(ROOT, dir));
  return count;
}

// === GATHER DATA ===
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
const branch = exec('git branch --show-current');
const status = exec('git status --porcelain').split('\n').filter(Boolean);
const unpushed = parseInt(exec('git rev-list --count @{u}..HEAD', '0'), 10);
const lastTag = exec('git describe --tags --abbrev=0', 'none');
const commitsSinceTag = exec('git rev-list --count ' + lastTag + '..HEAD', '0');
const recentCommits = exec('git log --oneline -5').split('\n').filter(Boolean);

let testSummary = null;
let lighthouse = null;
try {
  const report = JSON.parse(fs.readFileSync(path.join(ROOT, 'tests/report.json'), 'utf8'));
  testSummary = report.summary;
  const lh = report.suites.find(s => s.name === 'Lighthouse');
  if (lh) {
    lighthouse = {};
    lh.tests.forEach(t => {
      const m = t.test.match(/^(\w[\w\s-]+?):\s*(\d+)$/);
      if (m) lighthouse[m[1]] = parseInt(m[2]);
    });
  }
} catch {}

const htmlPages = countFiles('dist', '.html');
const wikiPages = countFiles('src/wiki', '.md');
const cssFiles = countFiles('src/css', '.css');
const jsFiles = countFiles('src/js', '.js');

// Detect what tools exist
const tools = [];
const toolsDir = path.join(ROOT, '_tools');
if (fs.existsSync(toolsDir)) {
  for (const entry of fs.readdirSync(toolsDir, { withFileTypes: true })) {
    if (entry.isDirectory() && entry.name !== 'snapshots') tools.push(entry.name);
  }
}

const journalCount = fs.existsSync(path.join(ROOT, '_AI_Journal'))
  ? fs.readdirSync(path.join(ROOT, '_AI_Journal')).filter(f => f.endsWith('.md')).length
  : 0;

// === GENERATE BRIEF ===
const lines = [];
const ln = (s = '') => lines.push(s);

ln(`# FogSift Context Brief`);
ln(`Generated: ${new Date().toISOString()}`);
ln();
ln(`## Quick Status`);
ln(`| Metric | Value |`);
ln(`|--------|-------|`);
ln(`| Version | ${pkg.version} |`);
ln(`| Branch | ${branch} |`);
ln(`| Last release | ${lastTag} |`);
ln(`| Commits since release | ${commitsSinceTag} |`);
ln(`| Uncommitted files | ${status.length} |`);
ln(`| Unpushed commits | ${unpushed} |`);
ln(`| Built pages | ${htmlPages} |`);
ln(`| Wiki pages | ${wikiPages} |`);
ln(`| Source: ${cssFiles} CSS, ${jsFiles} JS | dist: ${fmtSize(fileSize('dist/styles.css'))} CSS, ${fmtSize(fileSize('dist/app.js'))} JS |`);
ln();

if (testSummary) {
  ln(`## Test Results`);
  ln(`${testSummary.passed} pass / ${testSummary.failed} fail / ${testSummary.warned} warn (${((testSummary.passed / testSummary.total) * 100).toFixed(1)}%)`);
  if (lighthouse) {
    ln(`Lighthouse: Perf ${lighthouse['Performance'] || '?'} | A11y ${lighthouse['Accessibility'] || '?'} | BP ${lighthouse['Best Practices'] || '?'} | SEO ${lighthouse['SEO'] || '?'}`);
  }
  ln();
}

if (status.length > 0) {
  ln(`## Uncommitted Changes`);
  const modified = status.filter(s => s.startsWith(' M') || s.startsWith('M '));
  const untracked = status.filter(s => s.startsWith('??'));
  if (modified.length) ln(`Modified: ${modified.map(s => s.slice(3)).join(', ')}`);
  if (untracked.length) ln(`Untracked: ${untracked.map(s => s.slice(3)).join(', ')}`);
  ln();
}

ln(`## Recent Commits`);
recentCommits.forEach(c => ln(`- ${c}`));
ln();

if (tools.length > 0 || journalCount > 0) {
  ln(`## Development Infrastructure`);
  ln(`| Port | Tool | Status |`);
  ln(`|------|------|--------|`);
  ln(`| 5001 | AI Journal (${journalCount} entries) | ${journalCount > 0 ? 'Active' : 'Empty'} |`);
  if (tools.includes('component-library')) ln(`| 5030 | Component Library | Available |`);
  ln(`| 5050 | Dev Server | Default |`);
  if (tools.includes('test-viewer')) ln(`| 5065 | Test Suite Viewer | Available |`);
  ln();
}

ln(`## First Steps for a New Session`);
ln(`1. Read this brief: \`node _tools/scripts/context-brief.js\``);
ln(`2. Health check: \`node _tools/scripts/health-check.js\``);
ln(`3. Build: \`node scripts/build.js\``);
ln(`4. Dev server: \`npx browser-sync start --server dist --port 5050 --no-open\``);
ln(`5. Run tests: \`npm test\``);
ln(`6. Full snapshot: \`node _tools/scripts/project-snapshot.js\``);
ln();

ln(`## Key Files to Read First`);
ln(`- \`V0.1.0-RELEASE-PLAN.md\` — Current release plan`);
ln(`- \`TECH_DEBT.md\` — Known issues and priorities`);
ln(`- \`_AI_Journal/\` — AI development notes and reflections`);
ln(`- \`tests/report.json\` — Latest test results`);
ln(`- \`scripts/build.js\` — Build system (${Math.round(fileSize('scripts/build.js') / 1024)}KB)`);
ln();

ln(`## Architecture Cheat Sheet`);
ln(`- Build: \`node scripts/build.js\` → template replacement, CSS concat, JS minify via esbuild`);
ln(`- Deploy: \`wrangler pages deploy dist --project-name fogsift\``);
ln(`- Themes: 11 total, CSS custom property overrides, cross-tab sync`);
ln(`- Wiki: Markdown in \`src/wiki/\` → HTML via \`marked\` at build time`);
ln(`- Search: Full-text index built at compile time (\`search-index.json\`)`);
ln(`- Queue: Ko-fi webhook → Cloudflare KV → queue display`);
ln(`- CSP: theme-init.js loaded externally for compliance`);

const output = lines.join('\n');

// Save
const snapshotsDir = path.join(ROOT, '_tools', 'snapshots');
if (!fs.existsSync(snapshotsDir)) fs.mkdirSync(snapshotsDir, { recursive: true });
fs.writeFileSync(path.join(snapshotsDir, 'context-brief.md'), output);

// Print
console.log(output);
