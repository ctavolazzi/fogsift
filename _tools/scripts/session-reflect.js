#!/usr/bin/env node
/**
 * FogSift Session Reflector
 *
 * Generates an automated journal entry at session start.
 * Compares current state against the last snapshot, identifies
 * what changed, what's pending, and what the project needs.
 *
 * Output: _AI_Journal/auto/session-YYYY-MM-DDTHH-MM-SS.md
 *
 * Designed to be called from the SessionStart hook.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..', '..');
const JOURNAL_DIR = path.join(ROOT, '_AI_Journal');
const AUTO_DIR = path.join(JOURNAL_DIR, 'auto');
const SNAPSHOTS_DIR = path.join(ROOT, '_tools', 'snapshots');
const PYRITE_DIR = path.join(ROOT, '_pyrite');

// Ensure auto directory exists
if (!fs.existsSync(AUTO_DIR)) fs.mkdirSync(AUTO_DIR, { recursive: true });

// ---------------------------------------------------------------------------
// Data gathering
// ---------------------------------------------------------------------------

function safe(fn, fallback) {
  try { return fn(); } catch { return fallback; }
}

function cmd(command) {
  return safe(() => execSync(command, { cwd: ROOT, encoding: 'utf8', timeout: 5000 }).trim(), '');
}

function readJSON(filepath) {
  return safe(() => JSON.parse(fs.readFileSync(filepath, 'utf8')), null);
}

function getGitState() {
  return {
    branch: cmd('git rev-parse --abbrev-ref HEAD'),
    commit: cmd('git rev-parse --short HEAD'),
    commitMsg: cmd('git log -1 --pretty=%s'),
    commitDate: cmd('git log -1 --pretty=%ci'),
    uncommittedCount: cmd('git status --porcelain').split('\n').filter(Boolean).length,
    uncommittedFiles: cmd('git status --porcelain').split('\n').filter(Boolean).map(l => l.trim()),
    unpushedCount: parseInt(cmd('git rev-list --count @{upstream}..HEAD 2>/dev/null') || '0', 10),
    recentCommits: cmd('git log --oneline -5').split('\n').filter(Boolean),
  };
}

function getTestResults() {
  const report = readJSON(path.join(ROOT, 'tests', 'report.json'));
  if (!report) return null;
  const s = report.summary;
  return {
    total: s.total,
    pass: s.passed ?? s.pass ?? 0,
    fail: s.failed ?? s.fail ?? 0,
    warn: s.warned ?? s.warn ?? 0,
    passRate: ((( s.passed ?? s.pass ?? 0) / s.total) * 100).toFixed(1),
    lighthouse: safe(() => {
      const lh = report.suites.find(s => s.name.includes('Lighthouse'));
      if (!lh) return null;
      const scores = {};
      for (const t of lh.tests) {
        // Format: "Performance: 62" or "Best Practices: 81"
        const m = t.test.match(/^(.+?):\s*(\d+)/);
        if (m) {
          const key = m[1].trim().toLowerCase().replace(/\s+/g, '');
          scores[key] = parseInt(m[2]);
        }
      }
      return scores;
    }, null),
  };
}

function getPreviousSnapshot() {
  return readJSON(path.join(SNAPSHOTS_DIR, 'previous.json'));
}

function getLatestSnapshot() {
  return readJSON(path.join(SNAPSHOTS_DIR, 'latest.json'));
}

function getPackageVersion() {
  const pkg = readJSON(path.join(ROOT, 'package.json'));
  return pkg ? pkg.version : 'unknown';
}

function getActiveWorkEffort() {
  const activeDir = path.join(PYRITE_DIR, 'active');
  if (!fs.existsSync(activeDir)) return null;
  const entries = fs.readdirSync(activeDir).filter(f => f.startsWith('WE-'));
  if (entries.length === 0) return null;
  const latest = entries.sort().pop();
  const indexFile = fs.readdirSync(path.join(activeDir, latest)).find(f => f.endsWith('_index.md'));
  if (!indexFile) return { id: latest, content: null };
  const content = fs.readFileSync(path.join(activeDir, latest, indexFile), 'utf8');
  return { id: latest, content };
}

function getJournalEntryCount() {
  return fs.readdirSync(JOURNAL_DIR).filter(f => f.endsWith('.md') && f.match(/^\d{3}-/)).length;
}

function getAutoEntryCount() {
  if (!fs.existsSync(AUTO_DIR)) return 0;
  return fs.readdirSync(AUTO_DIR).filter(f => f.endsWith('.md')).length;
}

function getTechDebtHighlights() {
  const tdPath = path.join(ROOT, 'TECH_DEBT.md');
  if (!fs.existsSync(tdPath)) return [];
  const content = fs.readFileSync(tdPath, 'utf8');
  const openItems = [];
  const lines = content.split('\n');
  for (const line of lines) {
    if (line.includes('| TD-') && !line.includes('~~')) {
      const match = line.match(/\|\s*(TD-\d+)\s*\|\s*\*\*([^*]+)\*\*/);
      if (match) openItems.push({ id: match[1], issue: match[2] });
    }
  }
  return openItems;
}

function diffSnapshots(prev, curr) {
  if (!prev || !curr) return null;
  const changes = [];

  // Version change
  if (prev.version !== curr.version) {
    changes.push(`Version bumped: ${prev.version} → ${curr.version}`);
  }

  // Test result changes
  if (prev.tests && curr.tests) {
    const prevPass = prev.tests.pass || 0;
    const currPass = curr.tests.pass || 0;
    if (currPass !== prevPass) {
      changes.push(`Tests: ${prevPass} → ${currPass} passing (${currPass > prevPass ? '+' : ''}${currPass - prevPass})`);
    }
  }

  // Page count changes
  if (prev.pages && curr.pages) {
    const prevCount = prev.pages.total || 0;
    const currCount = curr.pages.total || 0;
    if (currCount !== prevCount) {
      changes.push(`Pages: ${prevCount} → ${currCount} (${currCount > prevCount ? '+' : ''}${currCount - prevCount})`);
    }
  }

  return changes.length > 0 ? changes : null;
}

// ---------------------------------------------------------------------------
// Entry generation
// ---------------------------------------------------------------------------

function generateEntry() {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const dateStr = now.toISOString().split('T')[0];
  const timeStr = now.toTimeString().slice(0, 5);

  const git = getGitState();
  const tests = getTestResults();
  const version = getPackageVersion();
  const workEffort = getActiveWorkEffort();
  const journalCount = getJournalEntryCount();
  const autoCount = getAutoEntryCount();
  const techDebt = getTechDebtHighlights();
  const prev = getPreviousSnapshot();
  const curr = getLatestSnapshot();
  const snapshotDiff = diffSnapshots(prev, curr);

  const lines = [];
  const ln = (s = '') => lines.push(s);

  // Header
  ln(`# Session Reflection — ${dateStr} ${timeStr}`);
  ln();
  ln(`**Generated:** ${now.toISOString()}`);
  ln(`**Type:** Automated session reflection`);
  ln(`**Version:** ${version}`);
  ln(`**Branch:** ${git.branch} @ ${git.commit}`);
  ln();
  ln('---');
  ln();

  // State summary
  ln('## Project State');
  ln();
  if (tests) {
    ln(`- **Tests:** ${tests.pass}/${tests.total} passing (${tests.passRate}%), ${tests.warn} warnings, ${tests.fail} failures`);
    if (tests.lighthouse) {
      const lh = tests.lighthouse;
      ln(`- **Lighthouse:** Perf ${lh.performance ?? '?'} | A11y ${lh.accessibility ?? '?'} | BP ${lh.bestpractices ?? '?'} | SEO ${lh.seo ?? '?'}`);
    }
  }
  ln(`- **Uncommitted:** ${git.uncommittedCount} file(s)`);
  if (git.uncommittedCount > 0) {
    for (const f of git.uncommittedFiles.slice(0, 5)) {
      ln(`  - ${f}`);
    }
    if (git.uncommittedFiles.length > 5) ln(`  - ...and ${git.uncommittedFiles.length - 5} more`);
  }
  ln(`- **Unpushed:** ${git.unpushedCount} commit(s)`);
  ln(`- **Open tech debt:** ${techDebt.length} item(s)`);
  ln();

  // Changes since last session
  if (snapshotDiff) {
    ln('## Changes Since Last Session');
    ln();
    for (const change of snapshotDiff) {
      ln(`- ${change}`);
    }
    ln();
  }

  // Recent commits
  ln('## Recent Commits');
  ln();
  for (const c of git.recentCommits) {
    ln(`- ${c}`);
  }
  ln();

  // Active work effort
  if (workEffort) {
    ln('## Active Work Effort');
    ln();
    ln(`- **ID:** ${workEffort.id}`);
    if (workEffort.content) {
      const titleMatch = workEffort.content.match(/^#\s+(.+)/m);
      if (titleMatch) ln(`- **Title:** ${titleMatch[1]}`);
      const statusMatch = workEffort.content.match(/\*\*Status\*\*:\s*(\w+)/);
      if (statusMatch) ln(`- **Status:** ${statusMatch[1]}`);
    }
    ln();
  }

  // Tech debt
  if (techDebt.length > 0) {
    ln('## Open Tech Debt');
    ln();
    for (const td of techDebt) {
      ln(`- **${td.id}:** ${td.issue}`);
    }
    ln();
  }

  // Journal stats
  ln('## Documentation State');
  ln();
  ln(`- **Manual journal entries:** ${journalCount}`);
  ln(`- **Auto reflections:** ${autoCount} (including this one)`);
  ln(`- **Total knowledge base:** ${journalCount + autoCount + 1} entries`);
  ln();

  // Observations (the reflective part)
  ln('## Observations');
  ln();

  if (git.uncommittedCount > 0) {
    ln('- There are uncommitted changes. Consider reviewing and committing before starting new work.');
  }
  if (git.unpushedCount > 0) {
    ln(`- ${git.unpushedCount} commit(s) haven't been pushed. The remote is behind.`);
  }
  if (tests && tests.fail > 0) {
    ln(`- **${tests.fail} test failure(s)** need attention before any new development.`);
  }
  if (tests && tests.warn > 0) {
    ln(`- ${tests.warn} test warnings persist. Most are likely a11y contrast issues.`);
  }
  if (tests && tests.lighthouse && (tests.lighthouse.performance ?? 100) < 70) {
    ln(`- Lighthouse performance is ${tests.lighthouse.performance}. Image compression and lazy loading would help.`);
  }
  if (techDebt.length > 3) {
    ln(`- ${techDebt.length} open tech debt items. Consider dedicating a session to cleanup.`);
  }
  if (git.uncommittedCount === 0 && git.unpushedCount === 0 && (!tests || tests.fail === 0)) {
    ln('- Clean state. Good time to start new feature work or address tech debt.');
  }
  ln();

  ln('---');
  ln();
  ln('*This reflection was generated automatically by `_tools/scripts/session-reflect.js` at session start.*');

  return { timestamp, content: lines.join('\n') };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  const { timestamp, content } = generateEntry();
  const filename = `session-${timestamp}.md`;
  const filepath = path.join(AUTO_DIR, filename);

  fs.writeFileSync(filepath, content);

  // Print a brief summary to stdout (for the hook output)
  const lineCount = content.split('\n').length;
  console.log(`Session reflection: ${filename} (${lineCount} lines)`);

  return 0;
}

process.exit(main());
