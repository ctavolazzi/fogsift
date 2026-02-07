#!/usr/bin/env node
/**
 * PROJECT SNAPSHOT — FogSift Lighthouse Utility
 *
 * Generates a comprehensive JSON snapshot of the entire project state.
 * Zero dependencies — uses only Node.js builtins.
 *
 * Usage: node _tools/scripts/project-snapshot.js
 * Output: _tools/snapshots/snapshot-<timestamp>.json (also prints to stdout)
 *
 * What it captures:
 *   - Git state (branch, status, recent commits, tags, unpushed)
 *   - Package info (version, dependencies, scripts)
 *   - File inventory (source files with sizes, organized by directory)
 *   - Page count (HTML, wiki, queue)
 *   - CSS/JS module inventory with line counts
 *   - Test results (if tests/report.json exists)
 *   - Build state (dist/ freshness, key file sizes)
 *   - Infrastructure (which _tools exist, which ports are assigned)
 *   - Open issues count from any cached data
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

function walkDir(dir, base = dir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (['node_modules', '.git', '.wrangler'].includes(entry.name)) continue;
      results.push(...walkDir(full, base));
    } else {
      const stat = fs.statSync(full);
      results.push({
        path: path.relative(base, full),
        size: stat.size,
        modified: stat.mtime.toISOString(),
      });
    }
  }
  return results;
}

function countLines(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8').split('\n').length;
  } catch { return 0; }
}

function getGitState() {
  return {
    branch: exec('git branch --show-current'),
    status: exec('git status --porcelain').split('\n').filter(Boolean),
    unpushed: parseInt(exec('git rev-list --count @{u}..HEAD', '0'), 10),
    recentCommits: exec('git log --oneline -10').split('\n').filter(Boolean),
    tags: exec('git tag --sort=-creatordate').split('\n').filter(Boolean).slice(0, 5),
    lastTag: exec('git describe --tags --abbrev=0', 'none'),
    commitsSinceTag: parseInt(exec('git rev-list --count $(git describe --tags --abbrev=0 2>/dev/null || echo HEAD)..HEAD', '0'), 10),
    remoteUrl: exec('git remote get-url origin', 'unknown'),
  };
}

function getPackageInfo() {
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
    return {
      name: pkg.name,
      version: pkg.version,
      description: pkg.description,
      scripts: Object.keys(pkg.scripts || {}),
      dependencies: Object.keys(pkg.dependencies || {}),
      devDependencies: Object.keys(pkg.devDependencies || {}),
    };
  } catch { return null; }
}

function getSourceInventory() {
  const srcDir = path.join(ROOT, 'src');
  const inventory = { css: [], js: [], html: [], other: [] };

  if (!fs.existsSync(srcDir)) return inventory;

  const files = walkDir(srcDir, srcDir);
  for (const f of files) {
    const ext = path.extname(f.path);
    const lines = countLines(path.join(srcDir, f.path));
    const entry = { ...f, lines };

    if (ext === '.css') inventory.css.push(entry);
    else if (ext === '.js') inventory.js.push(entry);
    else if (ext === '.html') inventory.html.push(entry);
    else inventory.other.push(entry);
  }

  return inventory;
}

function getBuildState() {
  const distDir = path.join(ROOT, 'dist');
  if (!fs.existsSync(distDir)) return { exists: false };

  const htmlFiles = [];
  const walkHtml = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walkHtml(full);
      else if (entry.name.endsWith('.html')) htmlFiles.push(path.relative(distDir, full));
    }
  };
  walkHtml(distDir);

  const keyFiles = ['styles.css', 'app.js', 'theme-init.js', 'search-index.json', 'index.html'];
  const fileSizes = {};
  for (const f of keyFiles) {
    const fp = path.join(distDir, f);
    if (fs.existsSync(fp)) fileSizes[f] = fs.statSync(fp).size;
  }

  return {
    exists: true,
    htmlPageCount: htmlFiles.length,
    keyFileSizes: fileSizes,
    totalFiles: walkDir(distDir, distDir).length,
  };
}

function getTestResults() {
  const reportPath = path.join(ROOT, 'tests', 'report.json');
  if (!fs.existsSync(reportPath)) return null;
  try {
    const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
    return {
      timestamp: report.timestamp,
      summary: report.summary,
      suiteNames: report.suites.map(s => ({
        name: s.name,
        passed: s.passed,
        failed: s.failed,
        warned: s.warned,
      })),
    };
  } catch { return null; }
}

function getInfrastructure() {
  const tools = [];
  const toolsDir = path.join(ROOT, '_tools');
  if (fs.existsSync(toolsDir)) {
    for (const entry of fs.readdirSync(toolsDir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        const hasServer = fs.existsSync(path.join(toolsDir, entry.name, 'serve.js'));
        tools.push({ name: entry.name, hasServer });
      }
    }
  }

  const journal = fs.existsSync(path.join(ROOT, '_AI_Journal'));
  const journalEntries = journal
    ? fs.readdirSync(path.join(ROOT, '_AI_Journal')).filter(f => f.endsWith('.md')).length
    : 0;

  return {
    tools,
    journalExists: journal,
    journalEntries,
    portMap: {
      5001: 'AI Journal (The Keeper\'s Log)',
      5030: 'Component Library (The Signal Workshop)',
      5050: 'FogSift dev server (The Lighthouse)',
      5065: 'Test Suite Viewer (Captain FogLift\'s Quality Report)',
      8788: 'Wrangler dev server (The Harbor)',
    },
  };
}

function getWikiStats() {
  const wikiDir = path.join(ROOT, 'src', 'wiki');
  if (!fs.existsSync(wikiDir)) return { exists: false };

  const mdFiles = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith('.md')) mdFiles.push(path.relative(wikiDir, full));
    }
  };
  walk(wikiDir);

  const categories = {};
  for (const f of mdFiles) {
    const cat = f.includes('/') ? f.split('/')[0] : 'root';
    categories[cat] = (categories[cat] || 0) + 1;
  }

  return { exists: true, totalPages: mdFiles.length, categories };
}

// === MAIN ===
const snapshot = {
  generated: new Date().toISOString(),
  generator: 'project-snapshot.js v1.0',
  git: getGitState(),
  package: getPackageInfo(),
  source: getSourceInventory(),
  build: getBuildState(),
  tests: getTestResults(),
  wiki: getWikiStats(),
  infrastructure: getInfrastructure(),
};

// Summary stats for quick reference
snapshot.summary = {
  version: snapshot.package?.version || 'unknown',
  branch: snapshot.git.branch,
  uncommittedFiles: snapshot.git.status.length,
  unpushedCommits: snapshot.git.unpushed,
  commitsSinceRelease: snapshot.git.commitsSinceTag,
  srcCssFiles: snapshot.source.css.length,
  srcJsFiles: snapshot.source.js.length,
  srcHtmlFiles: snapshot.source.html.length,
  srcTotalLines: [
    ...snapshot.source.css,
    ...snapshot.source.js,
    ...snapshot.source.html,
  ].reduce((sum, f) => sum + (f.lines || 0), 0),
  builtPages: snapshot.build.htmlPageCount || 0,
  wikiPages: snapshot.wiki.totalPages || 0,
  testsPassed: snapshot.tests?.summary?.passed || 0,
  testsFailed: snapshot.tests?.summary?.failed || 0,
  testsWarned: snapshot.tests?.summary?.warned || 0,
  toolsCount: snapshot.infrastructure.tools.length,
  journalEntries: snapshot.infrastructure.journalEntries,
};

// Save to snapshots directory
const snapshotsDir = path.join(ROOT, '_tools', 'snapshots');
if (!fs.existsSync(snapshotsDir)) fs.mkdirSync(snapshotsDir, { recursive: true });

const filename = `snapshot-${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}.json`;
fs.writeFileSync(path.join(snapshotsDir, filename), JSON.stringify(snapshot, null, 2));

// Also write as "latest"
fs.writeFileSync(path.join(snapshotsDir, 'latest.json'), JSON.stringify(snapshot, null, 2));

// Print summary to stdout
console.log(`FOGSIFT PROJECT SNAPSHOT — ${snapshot.generated}`);
console.log(`${'='.repeat(50)}`);
console.log(`Version:          ${snapshot.summary.version}`);
console.log(`Branch:           ${snapshot.summary.branch}`);
console.log(`Uncommitted:      ${snapshot.summary.uncommittedFiles} files`);
console.log(`Unpushed:         ${snapshot.summary.unpushedCommits} commits`);
console.log(`Since last tag:   ${snapshot.summary.commitsSinceRelease} commits`);
console.log(`Source files:     ${snapshot.summary.srcCssFiles} CSS, ${snapshot.summary.srcJsFiles} JS, ${snapshot.summary.srcHtmlFiles} HTML`);
console.log(`Total src lines:  ${snapshot.summary.srcTotalLines}`);
console.log(`Built pages:      ${snapshot.summary.builtPages}`);
console.log(`Wiki pages:       ${snapshot.summary.wikiPages}`);
console.log(`Tests:            ${snapshot.summary.testsPassed} pass, ${snapshot.summary.testsFailed} fail, ${snapshot.summary.testsWarned} warn`);
console.log(`Tools:            ${snapshot.summary.toolsCount}`);
console.log(`Journal entries:  ${snapshot.summary.journalEntries}`);
console.log(`${'='.repeat(50)}`);
console.log(`Saved: _tools/snapshots/${filename}`);
console.log(`Saved: _tools/snapshots/latest.json`);
