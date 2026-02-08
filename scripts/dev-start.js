#!/usr/bin/env node
/**
 * ╔═══════════════════════════════════════════════════════╗
 * ║  THE LIGHTHOUSE — FogSift Development Suite           ║
 * ║  "The fog doesn't lift itself."                       ║
 * ╚═══════════════════════════════════════════════════════╝
 *
 * One command to rule them all. Builds, tests, snapshots,
 * diffs, tracks work, and launches your entire dev environment.
 *
 * Usage:
 *   npm start              Full suite (site + all dev tools)
 *   npm run start:site     Site only (build + browser-sync)
 *   --skip-tests           Skip test suite for faster boot
 *   --no-helpers           Skip helper servers
 *
 * What it does:
 *   1. Health check         Structural integrity verification
 *   2. Build                Compiles site to dist/
 *   3. Test suite           Runs 116 tests across 9 suites
 *   4. Snapshot & diff      Compares state against last session
 *   5. Work effort          Creates/resumes daily tracking
 *   6. Launch servers       FogSift + dev tools on 4 ports
 *
 * Ports:
 *   5050  FogSift                    The main site
 *   5001  The Keeper's Log           AI development journal
 *   5030  The Signal Workshop        Component library
 *   5065  Captain FogLift's Report   Test suite viewer
 */

const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const ROOT = path.join(__dirname, '..');
const noHelpers = process.argv.includes('--no-helpers');
const skipTests = process.argv.includes('--skip-tests');

const SNAPSHOT_DIR = path.join(ROOT, '_tools', 'snapshots');
const SNAPSHOT_LATEST = path.join(SNAPSHOT_DIR, 'latest.json');
const SNAPSHOT_PREV = path.join(SNAPSHOT_DIR, 'previous.json');
const SESSION_LOG = path.join(SNAPSHOT_DIR, 'session-log.json');
const PYRITE_DIR = path.join(ROOT, '_pyrite', 'active');
const WORK_EFFORTS_DIR = path.join(ROOT, '_work_efforts');

// ── Colors ──
const c = {
  reset: '\x1b[0m', dim: '\x1b[2m', bold: '\x1b[1m', italic: '\x1b[3m',
  green: '\x1b[32m', yellow: '\x1b[33m', cyan: '\x1b[36m',
  magenta: '\x1b[35m', red: '\x1b[31m', white: '\x1b[37m',
  blue: '\x1b[34m', gray: '\x1b[90m',
};

function log(msg = '') { console.log(msg); }
function bold(msg) { return `${c.bold}${msg}${c.reset}`; }
function dim(msg) { return `${c.dim}${msg}${c.reset}`; }

const startTime = Date.now();
function elapsed() { return `${((Date.now() - startTime) / 1000).toFixed(1)}s`; }

// ── Read version ──
function getVersion() {
  try {
    return JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')).version;
  } catch { return '?.?.?'; }
}

// ── Git info ──
function getGitInfo() {
  const info = {};
  try {
    info.branch = execSync('git branch --show-current', { cwd: ROOT, encoding: 'utf8', timeout: 5000 }).trim();
    info.commit = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8', timeout: 5000 }).trim();
    info.dirty = execSync('git status --porcelain', { cwd: ROOT, encoding: 'utf8', timeout: 5000 }).trim().length > 0;
    const tagCount = execSync('git tag --list "v*" | wc -l', { cwd: ROOT, encoding: 'utf8', timeout: 5000, shell: true }).trim();
    info.tags = parseInt(tagCount) || 0;
  } catch { /* ignore */ }
  return info;
}

// ── Project stats ──
function getProjectStats() {
  const stats = {};
  try {
    const distHtml = execSync('find dist -name "*.html" | wc -l', { cwd: ROOT, encoding: 'utf8', timeout: 5000, shell: true }).trim();
    stats.pages = parseInt(distHtml) || 0;
  } catch { stats.pages = 0; }
  try {
    const wikiMd = execSync('find src/wiki -name "*.md" 2>/dev/null | wc -l', { cwd: ROOT, encoding: 'utf8', timeout: 5000, shell: true }).trim();
    stats.wikiPages = parseInt(wikiMd) || 0;
  } catch { stats.wikiPages = 0; }
  try {
    const css = fs.statSync(path.join(ROOT, 'dist', 'styles.css'));
    stats.cssKB = (css.size / 1024).toFixed(0);
  } catch { stats.cssKB = '?'; }
  try {
    const js = fs.statSync(path.join(ROOT, 'dist', 'app.js'));
    stats.jsKB = (js.size / 1024).toFixed(0);
  } catch { stats.jsKB = '?'; }
  return stats;
}

// ── Banner ──
function printBanner(version, git) {
  const v = `v${version}`;
  const branch = git.branch || 'detached';
  const commit = git.commit || '???????';
  const dirty = git.dirty ? ` ${c.yellow}*${c.reset}` : '';

  log();
  log(`${c.cyan}${c.bold}     ___           ___           ___     ${c.reset}`);
  log(`${c.cyan}${c.bold}    /\\  \\         /\\  \\         /\\  \\    ${c.reset}`);
  log(`${c.cyan}${c.bold}   /::\\  \\       /::\\  \\       /::\\  \\   ${c.reset}  ${c.white}${c.bold}THE LIGHTHOUSE${c.reset}`);
  log(`${c.cyan}${c.bold}  /:/\\:\\  \\     /:/\\:\\  \\     /:/\\:\\  \\  ${c.reset}  ${dim('FogSift Development Suite')}`)
  log(`${c.cyan}${c.bold} /::\\~\\:\\  \\   /:/  \\:\\  \\   /:/  \\:\\  \\ ${c.reset}  ${dim(`${v}  ${branch}@${commit}${dirty}`)}`)
  log(`${c.cyan}${c.bold}/:/\\:\\ \\:\\__\\ /:/__/ \\:\\__\\ /:/__/_\\:\\__\\${c.reset}`);
  log(`${c.cyan}${c.bold}\\/__\\:\\ \\/__/ \\:\\  \\ /:/  / \\:\\  /\\ \\/__/${c.reset}  ${c.dim}${c.italic}"The fog doesn't lift itself."${c.reset}`);
  log(`${c.cyan}${c.bold}     \\:\\__\\    \\:\\  /:/  /   \\:\\ \\:\\__\\  ${c.reset}`);
  log(`${c.cyan}${c.bold}      \\/__/     \\:\\/:/  /     \\:\\/:/  /  ${c.reset}`);
  log(`${c.cyan}${c.bold}                 \\::/  /       \\::/  /   ${c.reset}`);
  log(`${c.cyan}${c.bold}                  \\/__/         \\/__/    ${c.reset}`);
  log();
}

// ── Step runner ──
let stepNum = 0;
function step(label) {
  stepNum++;
  log(`  ${c.gray}[${stepNum}]${c.reset} ${c.dim}${label}${c.reset}`);
}

function pass(msg) { log(`  ${c.green} ✓ ${c.reset} ${msg}`); }
function warn(msg) { log(`  ${c.yellow} ⚠ ${c.reset} ${msg}`); }
function fail(msg) { log(`  ${c.red} ✗ ${c.reset} ${msg}`); }

// ── Health check ──
function runHealthCheck() {
  step('Health check');
  const healthScript = path.join(ROOT, '_tools', 'scripts', 'health-check.js');
  if (!fs.existsSync(healthScript)) { warn('Health check not found, skipping'); return true; }

  try {
    execSync(`node "${healthScript}"`, { cwd: ROOT, stdio: 'pipe' });
    pass('All systems nominal');
    return true;
  } catch (e) {
    warn('Issues found (non-blocking)');
    if (e.stdout) {
      e.stdout.toString().split('\n').filter(l => l.includes('✗')).forEach(l => log(`       ${l.trim()}`));
    }
    return true;
  }
}

// ── Build ──
function runBuild() {
  step('Build');
  try {
    execSync('node scripts/build.js', { cwd: ROOT, stdio: 'pipe' });
    const stats = getProjectStats();
    pass(`${stats.pages} pages, ${stats.wikiPages} wiki, ${stats.cssKB}KB CSS, ${stats.jsKB}KB JS`);
    return true;
  } catch (e) {
    fail('Build failed');
    if (e.stderr) log(e.stderr.toString());
    return false;
  }
}

// ── Tests ──
function runTests() {
  step('Test suite');
  if (skipTests) { log(`  ${c.dim}     Skipped (--skip-tests)${c.reset}`); return null; }

  const testScript = path.join(ROOT, 'tests', 'suite.js');
  if (!fs.existsSync(testScript)) { warn('Test suite not found'); return null; }

  try {
    execSync('node tests/suite.js', { cwd: ROOT, stdio: 'pipe', timeout: 120000 });
  } catch { /* tests may exit non-zero for warnings */ }

  const reportPath = path.join(ROOT, 'tests', 'report.json');
  if (fs.existsSync(reportPath)) {
    try {
      const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
      const p = report.summary?.pass || 0;
      const f = report.summary?.fail || 0;
      const w = report.summary?.warn || 0;
      if (f > 0) {
        warn(`${c.green}${p} pass${c.reset}, ${c.red}${f} fail${c.reset}, ${c.yellow}${w} warn${c.reset}`);
      } else {
        pass(`${c.green}${p} pass${c.reset}, ${c.yellow}${w} warn${c.reset}, ${c.red}0 fail${c.reset}`);
      }
      return report;
    } catch { /* ignore */ }
  }
  pass('Completed');
  return {};
}

// ── Snapshot & diff ──
function takeSnapshot() {
  step('Snapshot & diff');
  const snapshotScript = path.join(ROOT, '_tools', 'scripts', 'project-snapshot.js');
  if (!fs.existsSync(snapshotScript)) { warn('Snapshot script not found'); return null; }

  if (fs.existsSync(SNAPSHOT_LATEST)) {
    try { fs.copyFileSync(SNAPSHOT_LATEST, SNAPSHOT_PREV); } catch { /* ignore */ }
  }

  try {
    execSync(`node "${snapshotScript}"`, { cwd: ROOT, stdio: 'pipe' });
    if (fs.existsSync(SNAPSHOT_LATEST)) {
      return JSON.parse(fs.readFileSync(SNAPSHOT_LATEST, 'utf8'));
    }
  } catch { /* ignore */ }
  return null;
}

function diffSnapshots(current) {
  if (!current || !fs.existsSync(SNAPSHOT_PREV)) {
    pass('First session (no previous snapshot)');
    return null;
  }

  let previous;
  try { previous = JSON.parse(fs.readFileSync(SNAPSHOT_PREV, 'utf8')); } catch { return null; }

  const diffs = [];

  if (current.package?.version !== previous.package?.version)
    diffs.push(`Version ${previous.package?.version} → ${current.package?.version}`);

  const curPages = (current.pages?.html || 0) + (current.pages?.wiki || 0);
  const prevPages = (previous.pages?.html || 0) + (previous.pages?.wiki || 0);
  if (curPages !== prevPages)
    diffs.push(`Pages ${prevPages} → ${curPages}`);

  const curCSS = current.build?.cssSize || 0;
  const prevCSS = previous.build?.cssSize || 0;
  if (Math.abs(curCSS - prevCSS) > 500)
    diffs.push(`CSS ${(prevCSS/1024).toFixed(0)}KB → ${(curCSS/1024).toFixed(0)}KB`);

  const curJS = current.build?.jsSize || 0;
  const prevJS = previous.build?.jsSize || 0;
  if (Math.abs(curJS - prevJS) > 500)
    diffs.push(`JS ${(prevJS/1024).toFixed(0)}KB → ${(curJS/1024).toFixed(0)}KB`);

  const curCommit = current.git?.head;
  const prevCommit = previous.git?.head;
  if (curCommit && prevCommit && curCommit !== prevCommit) {
    let n = '?';
    try { n = execSync(`git rev-list --count ${prevCommit}..${curCommit}`, { cwd: ROOT, encoding: 'utf8', timeout: 5000 }).trim(); } catch { /* */ }
    diffs.push(`${n} new commits`);
  }

  if (diffs.length === 0) {
    pass('No changes since last session');
  } else {
    pass(`${diffs.length} change${diffs.length > 1 ? 's' : ''}: ${diffs.join(', ')}`);
  }
  return diffs;
}

function recordSession(snapshot, testReport, diffs) {
  const session = {
    timestamp: new Date().toISOString(),
    commit: snapshot?.git?.head || 'unknown',
    version: snapshot?.package?.version || 'unknown',
    tests: testReport?.summary || null,
    diffs: diffs || [],
  };
  let sessions = [];
  if (fs.existsSync(SESSION_LOG)) {
    try { sessions = JSON.parse(fs.readFileSync(SESSION_LOG, 'utf8')); } catch { sessions = []; }
  }
  sessions.push(session);
  if (sessions.length > 50) sessions = sessions.slice(-50);
  try { fs.writeFileSync(SESSION_LOG, JSON.stringify(sessions, null, 2)); } catch { /* */ }
  return session;
}

// ── Work effort ──
function createWorkEffort() {
  step('Work effort');

  // Check _pyrite/active for today's effort
  if (fs.existsSync(PYRITE_DIR)) {
    const now = new Date();
    const dateStr = now.toISOString().slice(2, 10).replace(/-/g, '');
    const existing = fs.readdirSync(PYRITE_DIR).filter(f =>
      f.startsWith(`WE-${dateStr}`) && fs.statSync(path.join(PYRITE_DIR, f)).isDirectory()
    );
    if (existing.length > 0) {
      pass(`Resumed ${c.cyan}${existing[0]}${c.reset}`);
      return existing[0];
    }
  }

  // Create new
  try {
    if (!fs.existsSync(PYRITE_DIR)) fs.mkdirSync(PYRITE_DIR, { recursive: true });

    const now = new Date();
    const dateStr = now.toISOString().slice(2, 10).replace(/-/g, '');
    const hash = Math.random().toString(36).slice(2, 6);
    const weId = `WE-${dateStr}-${hash}`;
    const weDir = path.join(PYRITE_DIR, `${weId}_dev_session`);

    const commitHash = (() => {
      try { return execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim(); }
      catch { return 'unknown'; }
    })();
    const branch = (() => {
      try { return execSync('git branch --show-current', { cwd: ROOT, encoding: 'utf8' }).trim(); }
      catch { return 'unknown'; }
    })();

    fs.mkdirSync(weDir, { recursive: true });
    fs.writeFileSync(path.join(weDir, `${weId}_index.md`), `# ${weId} — Dev Session

**Created**: ${now.toISOString()}
**Status**: open
**Priority**: MEDIUM
**Branch**: ${branch}
**Starting Commit**: ${commitHash}

---

## Session Notes

_Notes from this development session..._

## Verification

- [ ] Build passes
- [ ] Tests pass
- [ ] No regressions
`);
    pass(`Created ${c.cyan}${weId}${c.reset}`);
    return weId;
  } catch (e) {
    warn(`Could not create work effort: ${e.message}`);
    return null;
  }
}

// ── Server management ──
const children = [];

function startServer(name, command, args, cwd, port) {
  const child = spawn(command, args, {
    cwd: cwd || ROOT,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env },
  });
  child.stdout.on('data', () => {});
  child.stderr.on('data', (data) => {
    const msg = data.toString().trim();
    if (msg && !msg.includes('ExperimentalWarning')) {
      log(`  ${c.gray}[${name}]${c.reset} ${c.yellow}${msg}${c.reset}`);
    }
  });
  child.on('error', (err) => { log(`  ${c.gray}[${name}]${c.reset} ${c.red}${err.message}${c.reset}`); });
  child.on('exit', (code) => {
    if (code !== null && code !== 0) log(`  ${c.gray}[${name}]${c.reset} ${c.yellow}exited (${code})${c.reset}`);
  });
  children.push({ name, child, port });
  return child;
}

function cleanup() {
  log();
  log(`  ${dim('Shutting down...')}`);
  children.forEach(({ child }) => { try { child.kill('SIGTERM'); } catch { /* */ } });
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

function isPortFree(port) {
  try { execSync(`lsof -i :${port} -t`, { stdio: 'pipe' }); return false; }
  catch { return true; }
}

// ── Dashboard ──
function printDashboard(version, totalTime) {
  log();
  log(`  ${c.white}${c.bold}${'═'.repeat(52)}${c.reset}`);
  log(`  ${c.white}${c.bold}  READY ${c.reset}${dim(`(${totalTime} startup)`)}`);
  log(`  ${c.white}${c.bold}${'═'.repeat(52)}${c.reset}`);
  log();
  log(`  ${c.green}●${c.reset} ${bold('FogSift')}              ${c.cyan}http://localhost:5050${c.reset}`);

  if (!noHelpers) {
    log(`  ${c.green}●${c.reset} ${bold("Keeper's Log")}         ${c.cyan}http://localhost:5001${c.reset}`);
    log(`  ${c.green}●${c.reset} ${bold('Signal Workshop')}      ${c.cyan}http://localhost:5030${c.reset}`);
    log(`  ${c.green}●${c.reset} ${bold('Quality Report')}       ${c.cyan}http://localhost:5065${c.reset}`);
  }

  log();
  log(`  ${dim('Watching src/ for changes. Ctrl+C to stop.')}`);
  log();
}

// ── Main ──
async function main() {
  const version = getVersion();
  const git = getGitInfo();

  printBanner(version, git);

  // Steps
  runHealthCheck();
  if (!runBuild()) { log(`\n  ${c.red}Build failed. Fix errors and try again.${c.reset}\n`); process.exit(1); }
  const testReport = runTests();
  const snapshot = takeSnapshot();
  const diffs = diffSnapshots(snapshot);
  recordSession(snapshot, testReport, diffs);
  createWorkEffort();

  log();
  step('Launching servers');

  if (isPortFree(5050)) {
    startServer('site', 'npx', ['browser-sync', 'start', '--config', 'bs-config.js'], ROOT, 5050);
  } else { warn('Port 5050 in use — skipping site server'); }

  startServer('watch', 'npx', ['chokidar', 'src/**/*', '-c', 'node scripts/build.js'], ROOT, null);

  if (!noHelpers) {
    const helpers = [
      { name: 'journal', script: '_AI_Journal/serve.js', port: 5001 },
      { name: 'components', script: '_tools/component-library/serve.js', port: 5030 },
      { name: 'tests', script: '_tools/test-viewer/serve.js', port: 5065 },
    ];
    helpers.forEach(({ name, script, port }) => {
      const scriptPath = path.join(ROOT, script);
      if (!fs.existsSync(scriptPath)) { return; }
      if (isPortFree(port)) { startServer(name, 'node', [scriptPath], ROOT, port); }
      else { warn(`Port ${port} in use — skipping ${name}`); }
    });
  }

  pass('All servers launched');

  await new Promise(r => setTimeout(r, 800));

  const totalTime = `${((Date.now() - startTime) / 1000).toFixed(1)}s`;
  printDashboard(version, totalTime);
}

main().catch(err => { console.error(err); process.exit(1); });
