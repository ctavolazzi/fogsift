#!/usr/bin/env node
/**
 * FOGSIFT DEV STARTUP
 *
 * Starts the full development environment with verification:
 *   1. Runs health check
 *   2. Builds the site
 *   3. Runs test suite
 *   4. Takes a snapshot and diffs against previous session
 *   5. Creates a pyrite work effort for this session
 *   6. Starts all dev servers in parallel
 *   7. Prints the dashboard
 *
 * Usage:
 *   npm start              — Full suite (site + all helpers)
 *   npm run start:site     — Site only (build + browser-sync)
 *   node scripts/dev-start.js --no-helpers  — Same as start:site
 *   node scripts/dev-start.js --skip-tests  — Skip test suite
 *
 * Ports:
 *   5001  The Keeper's Log (AI Journal)
 *   5030  The Signal Workshop (Component Library)
 *   5050  FogSift dev server
 *   5065  Captain FogLift's Quality Report (Test Viewer)
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

// ── Colors ──
const c = {
  reset: '\x1b[0m',
  dim: '\x1b[2m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  red: '\x1b[31m',
  white: '\x1b[37m',
};

function log(msg) { console.log(msg); }
function bold(msg) { return `${c.bold}${msg}${c.reset}`; }

// ── Banner ──
function printBanner() {
  log('');
  log(`${c.cyan}${c.bold}  ╔═══════════════════════════════════════════════╗${c.reset}`);
  log(`${c.cyan}${c.bold}  ║          FOGSIFT — THE LIGHTHOUSE             ║${c.reset}`);
  log(`${c.cyan}${c.bold}  ║     "The fog doesn't lift itself."            ║${c.reset}`);
  log(`${c.cyan}${c.bold}  ╚═══════════════════════════════════════════════╝${c.reset}`);
  log('');
}

// ── Health check ──
function runHealthCheck() {
  const healthScript = path.join(ROOT, '_tools', 'scripts', 'health-check.js');
  if (!fs.existsSync(healthScript)) {
    log(`  ${c.yellow}⚠${c.reset} Health check script not found, skipping`);
    return true;
  }

  log(`  ${c.dim}Running health check...${c.reset}`);
  try {
    execSync(`node "${healthScript}"`, { cwd: ROOT, stdio: 'pipe' });
    log(`  ${c.green}✓${c.reset} Health check passed`);
    return true;
  } catch (e) {
    log(`  ${c.yellow}⚠${c.reset} Health check found issues (non-blocking)`);
    if (e.stdout) {
      const lines = e.stdout.toString().split('\n').filter(l => l.includes('✗'));
      lines.forEach(l => log(`    ${l}`));
    }
    return true; // non-blocking
  }
}

// ── Build ──
function runBuild() {
  log(`  ${c.dim}Building site...${c.reset}`);
  try {
    execSync('node scripts/build.js', { cwd: ROOT, stdio: 'pipe' });
    log(`  ${c.green}✓${c.reset} Build complete`);
    return true;
  } catch (e) {
    log(`  ${c.red}✗ Build failed${c.reset}`);
    if (e.stderr) log(e.stderr.toString());
    return false;
  }
}

// ── Test suite ──
function runTests() {
  if (skipTests) {
    log(`  ${c.dim}Skipping tests (--skip-tests)${c.reset}`);
    return null;
  }

  const testScript = path.join(ROOT, 'tests', 'suite.js');
  if (!fs.existsSync(testScript)) {
    log(`  ${c.yellow}⚠${c.reset} Test suite not found, skipping`);
    return null;
  }

  log(`  ${c.dim}Running test suite...${c.reset}`);
  try {
    const output = execSync('node tests/suite.js', {
      cwd: ROOT,
      stdio: 'pipe',
      timeout: 120000,
    }).toString();

    // Parse results from report.json if it exists
    const reportPath = path.join(ROOT, 'tests', 'report.json');
    if (fs.existsSync(reportPath)) {
      const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
      const pass = report.summary?.pass || 0;
      const fail = report.summary?.fail || 0;
      const warn = report.summary?.warn || 0;
      const total = pass + fail + warn;

      if (fail > 0) {
        log(`  ${c.yellow}⚠${c.reset} Tests: ${c.green}${pass}${c.reset} pass, ${c.red}${fail} fail${c.reset}, ${c.yellow}${warn}${c.reset} warn (${total} total)`);
      } else {
        log(`  ${c.green}✓${c.reset} Tests: ${c.green}${pass}${c.reset} pass, ${c.yellow}${warn}${c.reset} warn (${total} total)`);
      }
      return report;
    }

    log(`  ${c.green}✓${c.reset} Tests completed`);
    return {};
  } catch (e) {
    log(`  ${c.yellow}⚠${c.reset} Tests ran with issues (non-blocking)`);
    // Still try to read report
    const reportPath = path.join(ROOT, 'tests', 'report.json');
    if (fs.existsSync(reportPath)) {
      try { return JSON.parse(fs.readFileSync(reportPath, 'utf8')); } catch { /* ignore */ }
    }
    return null;
  }
}

// ── Snapshot & diff ──
function takeSnapshot() {
  const snapshotScript = path.join(ROOT, '_tools', 'scripts', 'project-snapshot.js');
  if (!fs.existsSync(snapshotScript)) {
    log(`  ${c.yellow}⚠${c.reset} Snapshot script not found, skipping`);
    return null;
  }

  // Archive current latest as previous
  if (fs.existsSync(SNAPSHOT_LATEST)) {
    try {
      fs.copyFileSync(SNAPSHOT_LATEST, SNAPSHOT_PREV);
    } catch { /* ignore */ }
  }

  log(`  ${c.dim}Taking project snapshot...${c.reset}`);
  try {
    execSync(`node "${snapshotScript}"`, { cwd: ROOT, stdio: 'pipe' });
    log(`  ${c.green}✓${c.reset} Snapshot saved`);

    if (fs.existsSync(SNAPSHOT_LATEST)) {
      return JSON.parse(fs.readFileSync(SNAPSHOT_LATEST, 'utf8'));
    }
  } catch (e) {
    log(`  ${c.yellow}⚠${c.reset} Snapshot failed (non-blocking)`);
  }
  return null;
}

function diffSnapshots(current) {
  if (!current || !fs.existsSync(SNAPSHOT_PREV)) {
    log(`  ${c.dim}No previous snapshot to compare (first run)${c.reset}`);
    return null;
  }

  let previous;
  try {
    previous = JSON.parse(fs.readFileSync(SNAPSHOT_PREV, 'utf8'));
  } catch {
    log(`  ${c.dim}Could not read previous snapshot${c.reset}`);
    return null;
  }

  const diffs = [];

  // Compare version
  if (current.package?.version !== previous.package?.version) {
    diffs.push(`  Version: ${previous.package?.version} → ${current.package?.version}`);
  }

  // Compare page counts
  const curPages = (current.pages?.html || 0) + (current.pages?.wiki || 0);
  const prevPages = (previous.pages?.html || 0) + (previous.pages?.wiki || 0);
  if (curPages !== prevPages) {
    diffs.push(`  Pages: ${prevPages} → ${curPages} (${curPages > prevPages ? '+' : ''}${curPages - prevPages})`);
  }

  // Compare CSS/JS sizes
  const curCSS = current.build?.cssSize || 0;
  const prevCSS = previous.build?.cssSize || 0;
  if (Math.abs(curCSS - prevCSS) > 500) {
    const delta = ((curCSS - prevCSS) / 1024).toFixed(1);
    diffs.push(`  CSS: ${(prevCSS / 1024).toFixed(1)}KB → ${(curCSS / 1024).toFixed(1)}KB (${delta > 0 ? '+' : ''}${delta}KB)`);
  }

  const curJS = current.build?.jsSize || 0;
  const prevJS = previous.build?.jsSize || 0;
  if (Math.abs(curJS - prevJS) > 500) {
    const delta = ((curJS - prevJS) / 1024).toFixed(1);
    diffs.push(`  JS: ${(prevJS / 1024).toFixed(1)}KB → ${(curJS / 1024).toFixed(1)}KB (${delta > 0 ? '+' : ''}${delta}KB)`);
  }

  // Compare test results
  const curTests = current.tests?.summary;
  const prevTests = previous.tests?.summary;
  if (curTests && prevTests) {
    if (curTests.pass !== prevTests.pass || curTests.fail !== prevTests.fail || curTests.warn !== prevTests.warn) {
      diffs.push(`  Tests: ${prevTests.pass}/${prevTests.fail}/${prevTests.warn} → ${curTests.pass}/${curTests.fail}/${curTests.warn} (pass/fail/warn)`);
    }
  }

  // Compare git commits
  const curCommit = current.git?.head;
  const prevCommit = previous.git?.head;
  if (curCommit && prevCommit && curCommit !== prevCommit) {
    let commitCount = '?';
    try {
      commitCount = execSync(`git rev-list --count ${prevCommit}..${curCommit}`, { cwd: ROOT, encoding: 'utf8', timeout: 5000 }).trim();
    } catch { /* ignore */ }
    diffs.push(`  Commits: ${commitCount} new since last session`);
  }

  // Compare source file count
  const curSrc = current.sourceFiles?.total || 0;
  const prevSrc = previous.sourceFiles?.total || 0;
  if (curSrc !== prevSrc) {
    diffs.push(`  Source files: ${prevSrc} → ${curSrc} (${curSrc > prevSrc ? '+' : ''}${curSrc - prevSrc})`);
  }

  if (diffs.length === 0) {
    log(`  ${c.green}✓${c.reset} No changes since last session`);
    return [];
  }

  log('');
  log(`  ${c.magenta}${c.bold}Changes since last session:${c.reset}`);
  diffs.forEach(d => log(`  ${c.magenta}│${c.reset}${d}`));
  log('');

  return diffs;
}

// ── Session log ──
function recordSession(snapshot, testReport, diffs) {
  const session = {
    timestamp: new Date().toISOString(),
    commit: snapshot?.git?.head || 'unknown',
    version: snapshot?.package?.version || 'unknown',
    tests: testReport?.summary || null,
    diffs: diffs || [],
  };

  // Append to session log
  let sessions = [];
  if (fs.existsSync(SESSION_LOG)) {
    try { sessions = JSON.parse(fs.readFileSync(SESSION_LOG, 'utf8')); } catch { sessions = []; }
  }
  sessions.push(session);
  // Keep last 50 sessions
  if (sessions.length > 50) sessions = sessions.slice(-50);

  try {
    fs.writeFileSync(SESSION_LOG, JSON.stringify(sessions, null, 2));
  } catch { /* ignore */ }

  return session;
}

// ── Pyrite work effort ──
function createWorkEffort() {
  if (!fs.existsSync(PYRITE_DIR)) {
    try { fs.mkdirSync(PYRITE_DIR, { recursive: true }); } catch { return null; }
  }

  const now = new Date();
  const dateStr = now.toISOString().slice(2, 10).replace(/-/g, '');
  const hash = Math.random().toString(36).slice(2, 6);
  const weId = `WE-${dateStr}-${hash}`;
  const weDir = path.join(PYRITE_DIR, `${weId}_dev_session`);

  // Check if there's already an active work effort from today
  const existing = fs.readdirSync(PYRITE_DIR).filter(f =>
    f.startsWith(`WE-${dateStr}`) && fs.statSync(path.join(PYRITE_DIR, f)).isDirectory()
  );

  if (existing.length > 0) {
    log(`  ${c.green}✓${c.reset} Active work effort: ${c.cyan}${existing[0]}${c.reset}`);
    return existing[0];
  }

  try {
    fs.mkdirSync(weDir, { recursive: true });
    const commitHash = (() => {
      try { return execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim(); }
      catch { return 'unknown'; }
    })();
    const branch = (() => {
      try { return execSync('git branch --show-current', { cwd: ROOT, encoding: 'utf8' }).trim(); }
      catch { return 'unknown'; }
    })();

    const indexContent = `# ${weId} — Dev Session

**Created**: ${now.toISOString()}
**Status**: open
**Priority**: MEDIUM
**Branch**: ${branch}
**Starting Commit**: ${commitHash}

---

## Objective

Development session starting from commit \`${commitHash}\`.

## Session Notes

_Add notes as you work..._

## Changes Made

_Track changes during this session..._

## Verification

- [ ] Build passes
- [ ] Tests pass
- [ ] No regressions from previous session
`;

    fs.writeFileSync(path.join(weDir, `${weId}_index.md`), indexContent);
    log(`  ${c.green}✓${c.reset} Work effort created: ${c.cyan}${weId}${c.reset}`);
    return weId;
  } catch (e) {
    log(`  ${c.yellow}⚠${c.reset} Could not create work effort: ${e.message}`);
    return null;
  }
}

// ── Server management ──
const children = [];

function startServer(name, command, args, cwd, port) {
  const label = `${c.dim}[${name}]${c.reset}`;

  const child = spawn(command, args, {
    cwd: cwd || ROOT,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env },
  });

  child.stdout.on('data', () => {});

  child.stderr.on('data', (data) => {
    const msg = data.toString().trim();
    if (msg && !msg.includes('ExperimentalWarning')) {
      log(`  ${label} ${c.yellow}${msg}${c.reset}`);
    }
  });

  child.on('error', (err) => {
    log(`  ${label} ${c.red}Failed to start: ${err.message}${c.reset}`);
  });

  child.on('exit', (code) => {
    if (code !== null && code !== 0) {
      log(`  ${label} ${c.yellow}Exited with code ${code}${c.reset}`);
    }
  });

  children.push({ name, child, port });
  return child;
}

function cleanup() {
  log('');
  log(`  ${c.dim}Shutting down...${c.reset}`);
  children.forEach(({ child }) => {
    try { child.kill('SIGTERM'); } catch { /* already dead */ }
  });
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

// ── Port check ──
function isPortFree(port) {
  try {
    execSync(`lsof -i :${port} -t`, { stdio: 'pipe' });
    return false;
  } catch {
    return true;
  }
}

// ── Dashboard ──
function printDashboard() {
  log('');
  log(`  ${c.bold}${c.white}Dev servers running:${c.reset}`);
  log(`  ${'─'.repeat(45)}`);
  log(`  ${c.green}●${c.reset} ${bold('FogSift')}              ${c.cyan}http://localhost:5050${c.reset}`);

  if (!noHelpers) {
    log(`  ${c.green}●${c.reset} ${bold("Keeper's Log")}         ${c.cyan}http://localhost:5001${c.reset}`);
    log(`  ${c.green}●${c.reset} ${bold('Signal Workshop')}      ${c.cyan}http://localhost:5030${c.reset}`);
    log(`  ${c.green}●${c.reset} ${bold('Quality Report')}       ${c.cyan}http://localhost:5065${c.reset}`);
  }

  log(`  ${'─'.repeat(45)}`);
  log('');
  log(`  ${c.dim}Watching src/ for changes (auto-rebuild)${c.reset}`);
  log(`  ${c.dim}Press Ctrl+C to stop all servers${c.reset}`);
  log('');
}

// ── Main ──
async function main() {
  printBanner();

  // Step 1: Health check
  runHealthCheck();

  // Step 2: Build
  if (!runBuild()) {
    log(`\n  ${c.red}Cannot start — fix build errors first.${c.reset}\n`);
    process.exit(1);
  }

  // Step 3: Run tests
  const testReport = runTests();

  // Step 4: Snapshot & diff
  const snapshot = takeSnapshot();
  const diffs = diffSnapshots(snapshot);
  recordSession(snapshot, testReport, diffs);

  // Step 5: Pyrite work effort
  log('');
  createWorkEffort();

  log('');
  log(`  ${c.dim}Starting servers...${c.reset}`);

  // Step 6: Start main site (browser-sync + watcher)
  if (isPortFree(5050)) {
    startServer('site', 'npx', ['browser-sync', 'start', '--config', 'bs-config.js'], ROOT, 5050);
  } else {
    log(`  ${c.yellow}⚠${c.reset} Port 5050 in use — skipping site server`);
  }

  // File watcher for auto-rebuild
  startServer('watch', 'npx', ['chokidar', 'src/**/*', '-c', 'node scripts/build.js'], ROOT, null);

  // Step 7: Start helper servers (unless --no-helpers)
  if (!noHelpers) {
    const helpers = [
      { name: 'journal', script: '_AI_Journal/serve.js', port: 5001 },
      { name: 'components', script: '_tools/component-library/serve.js', port: 5030 },
      { name: 'tests', script: '_tools/test-viewer/serve.js', port: 5065 },
    ];

    helpers.forEach(({ name, script, port }) => {
      const scriptPath = path.join(ROOT, script);
      if (!fs.existsSync(scriptPath)) {
        log(`  ${c.yellow}⚠${c.reset} ${name} server not found at ${script}, skipping`);
        return;
      }
      if (isPortFree(port)) {
        startServer(name, 'node', [scriptPath], ROOT, port);
      } else {
        log(`  ${c.yellow}⚠${c.reset} Port ${port} in use — skipping ${name}`);
      }
    });
  }

  // Brief pause for servers to bind
  await new Promise(r => setTimeout(r, 1000));

  // Step 8: Dashboard
  printDashboard();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
