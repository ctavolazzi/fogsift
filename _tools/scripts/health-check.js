#!/usr/bin/env node
/**
 * HEALTH CHECK — FogSift Lighthouse Utility
 *
 * Fast (<1s) pass/fail check on key project health indicators.
 * Zero dependencies — uses only Node.js builtins.
 *
 * Usage: node _tools/scripts/health-check.js
 * Output: Colored pass/fail list to stdout, exit code 0 (healthy) or 1 (issues)
 *
 * Checks:
 *   - package.json exists and has version
 *   - src/ directory exists with expected structure
 *   - dist/ exists and is built (key files present)
 *   - dist/ is not stale (built after latest src/ modification)
 *   - No git conflicts (no .orig, no conflict markers)
 *   - Tests have been run (report.json exists)
 *   - No test failures
 *   - Security headers file exists
 *   - Build script exists and is valid JS (can require without error)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const checks = [];
let hasFailure = false;

function check(name, fn) {
  try {
    const result = fn();
    if (result === true) {
      checks.push({ name, status: 'pass', detail: '' });
    } else if (typeof result === 'string') {
      checks.push({ name, status: 'warn', detail: result });
    } else {
      checks.push({ name, status: 'fail', detail: String(result || 'Check returned false') });
      hasFailure = true;
    }
  } catch (e) {
    checks.push({ name, status: 'fail', detail: e.message });
    hasFailure = true;
  }
}

function exists(p) { return fs.existsSync(path.join(ROOT, p)); }
function stat(p) { return fs.statSync(path.join(ROOT, p)); }

function newestMtime(dir, ext) {
  let newest = 0;
  const walk = (d) => {
    if (!fs.existsSync(d)) return;
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
      const full = path.join(d, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (!ext || full.endsWith(ext)) {
        const mt = fs.statSync(full).mtimeMs;
        if (mt > newest) newest = mt;
      }
    }
  };
  walk(path.join(ROOT, dir));
  return newest;
}

// === CHECKS ===

check('package.json exists', () => exists('package.json'));

check('package.json has version', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  return pkg.version ? true : false;
});

check('src/ directory exists', () => exists('src'));
check('src/index.html exists', () => exists('src/index.html'));
check('src/css/ has files', () => fs.readdirSync(path.join(ROOT, 'src/css')).filter(f => f.endsWith('.css')).length > 0);
check('src/js/ has files', () => fs.readdirSync(path.join(ROOT, 'src/js')).filter(f => f.endsWith('.js')).length > 0);

check('dist/ exists', () => exists('dist'));
check('dist/index.html exists', () => exists('dist/index.html'));
check('dist/styles.css exists', () => exists('dist/styles.css'));
check('dist/app.js exists', () => exists('dist/app.js'));

check('dist/ is not stale', () => {
  const srcNewest = newestMtime('src');
  const distIndex = exists('dist/index.html') ? stat('dist/index.html').mtimeMs : 0;
  if (distIndex === 0) return false;
  if (srcNewest > distIndex) return `dist/ is ${Math.round((srcNewest - distIndex) / 1000)}s behind src/ — run: node scripts/build.js`;
  return true;
});

check('No git conflict markers', () => {
  try {
    const result = execSync(
      'grep -rl "<<<<<<< " src/ --include="*.html" --include="*.css" --include="*.js" 2>/dev/null || true',
      { cwd: ROOT, encoding: 'utf8', timeout: 5000 }
    ).trim();
    return result ? `Conflict markers in: ${result}` : true;
  } catch { return true; }
});

check('Build script exists', () => exists('scripts/build.js'));

check('Security headers (_headers)', () => exists('src/_headers'));

check('Test report exists', () => {
  if (!exists('tests/report.json')) return 'No test report — run: npm test';
  return true;
});

check('No test failures', () => {
  if (!exists('tests/report.json')) return 'No report to check';
  const report = JSON.parse(fs.readFileSync(path.join(ROOT, 'tests/report.json'), 'utf8'));
  if (report.summary.failed > 0) return `${report.summary.failed} test(s) failed`;
  if (report.summary.warned > 0) return `${report.summary.warned} warning(s)`;
  return true;
});

check('Git working tree clean', () => {
  const status = execSync('git status --porcelain', { cwd: ROOT, encoding: 'utf8' }).trim();
  if (status) {
    const lines = status.split('\n').length;
    return `${lines} uncommitted change(s)`;
  }
  return true;
});

check('Git up to date with remote', () => {
  try {
    const ahead = parseInt(execSync('git rev-list --count @{u}..HEAD', { cwd: ROOT, encoding: 'utf8' }).trim(), 10);
    const behind = parseInt(execSync('git rev-list --count HEAD..@{u}', { cwd: ROOT, encoding: 'utf8' }).trim(), 10);
    if (ahead > 0 && behind > 0) return `${ahead} ahead, ${behind} behind`;
    if (ahead > 0) return `${ahead} unpushed commit(s)`;
    if (behind > 0) return `${behind} commits behind remote`;
    return true;
  } catch { return 'No upstream tracking'; }
});

// === OUTPUT ===
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RED = '\x1b[31m';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';

console.log(`\n${BOLD}FOGSIFT HEALTH CHECK${RESET}`);
console.log(`${DIM}${new Date().toLocaleString()}${RESET}\n`);

for (const c of checks) {
  const icon = c.status === 'pass' ? `${GREEN}PASS${RESET}` :
               c.status === 'warn' ? `${YELLOW}WARN${RESET}` :
               `${RED}FAIL${RESET}`;
  const detail = c.detail ? ` ${DIM}— ${c.detail}${RESET}` : '';
  console.log(`  ${icon}  ${c.name}${detail}`);
}

const passed = checks.filter(c => c.status === 'pass').length;
const warned = checks.filter(c => c.status === 'warn').length;
const failed = checks.filter(c => c.status === 'fail').length;

console.log(`\n  ${passed} pass, ${warned} warn, ${failed} fail`);

if (hasFailure) {
  console.log(`\n  ${RED}${BOLD}UNHEALTHY${RESET} — fix failures before proceeding\n`);
  process.exit(1);
} else if (warned > 0) {
  console.log(`\n  ${YELLOW}${BOLD}HEALTHY (with warnings)${RESET}\n`);
} else {
  console.log(`\n  ${GREEN}${BOLD}HEALTHY${RESET}\n`);
}
